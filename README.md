# pemrograman-integratif
- project individu --> membuat project CRUD dengan implementasi gRPC API dan Protobuf
- my project --> simple contact app with 5 functions --> read data, add data, update data, get data, delete data

# development steps
1. mkdir grpc-nodejs
2. cd grpc-nodejs
3. npm init
4. npm i @grpc/grpc-js
5. npm i @grpc/proto-loader
6. npm i firebase-admin
7. modify run.js as you like to run specific commands
8. node server.js
9. node run.js
10. buat 4 files: client.js, contact.proto, server.js, run.js

- client.js
```javascript
//untuk menyediakan client-side stub yang dapat digunakan untuk mengirim permintaan ke server-side melalui protokol gRPC.

const grpc = require("@grpc/grpc-js"); 
var protoLoader = require("@grpc/proto-loader");

const PROTO_PATH = "./contact.proto";

//konfigurasi protokol
const options = {
keepCase: true,
longs: String,
enums: String,
defaults: true,
oneofs: true, //hanya satu di antara fields yang dapat memiliki nilai pada saat yang sama.
};

var packageDefinition = protoLoader.loadSync(PROTO_PATH, options);

const ContactService = grpc.loadPackageDefinition(packageDefinition).ContactService;

const client = new ContactService( //objek klien gRPC yang terhubung ke alamat IP dan port tertentu, menggunakan kredensial tanpa enkripsi
"127.0.0.1:50051",
grpc.credentials.createInsecure()
);

module.exports = client;

//client-side stub adalah kode yang memungkinkan aplikasi klien untuk berkomunikasi dengan server menggunakan protokol gRPC dengan cara yang sudah didefinisikan di file .proto.
```

- contact.proto
```proto3
//file definisi protokol untuk layanan ContactService yang berisi beberapa message dan definisi services yang tersedia.

syntax = "proto3";

// Contact object
message Contact {
string id = 1;
string name = 2;
string phone = 3;
string email = 4;
}

//nomor digunakan untuk mengidentifikasi field tersebut pada pesan

message ContactList { //berisi list/array dari message Contact.
repeated Contact contact = 1; //Field contact di dalam message ContactList didefinisikan sebagai sebuah repeated field yang memungkinkan untuk menampung banyak nilai dari message Contact. Nomor field 1 pada field contact menandakan nomor urutan field tersebut dalam message ContactList.
}


message ContactId {
string id = 1; //digunakan sebagai payload untuk operasi-operasi CRUD (Create, Read, Update, Delete) yang membutuhkan hanya sebuah id dari message Contact. Dengan menggunakan message ini, pengguna hanya perlu mengirimkan id saja tanpa perlu mengirimkan semua data Contact ketika melakukan operasi yang membutuhkan hanya sebuah id.
}

message Empty {} //digunakan ketika tidak ada data yang perlu dikirimkan atau diterima oleh sebuah operasi pada service. Message Empty digunakan sebagai placeholder atau tanda bahwa sebuah operasi telah selesai dieksekusi atau sebagai pengganti data yang sebenarnya ketika sebuah operasi tidak memerlukan data apapun. Contoh penggunaannya adalah pada operasi DeleteContact pada service ContactService yang tidak memerlukan pengiriman data Contact, sehingga digunakan message Empty sebagai response-nya.

// Contact service
service ContactService {
// Create
rpc AddContact (Contact) returns (Contact) {}
// Read
rpc GetAll (Empty) returns (ContactList) {}
rpc GetContact (ContactId) returns (Contact) {}
// Update
rpc EditContact (Contact) returns (Contact) {}
// Delete
rpc DeleteContact (ContactId) returns (Empty) {}
}

//rpc [nama fungsi] [parameter input] [output]
```

- server.js
```javascript
const grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');
const admin = require('firebase-admin');

// Inisialisasi koneksi ke Firebase Admin SDK
const serviceAccount = require('./serviceAccount.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Mendapatkan referensi ke koleksi 'contacts' di Firestore
const db = admin.firestore();
const contactsRef = db.collection('contacts');

//proto path
const PROTO_PATH = './contact.proto';

const options = {
 keepCase: true,
 longs: String,
 enums: String,
 defaults: true,
 oneofs: true,
};

var packageDefinition = protoLoader.loadSync(PROTO_PATH, options);

//load proto
const contactProto = grpc.loadPackageDefinition(packageDefinition);

const server = new grpc.Server();

// Add service in proto
server.addService(contactProto.ContactService.service, {
  // Create
addContact: (call, callback) => { //Ketika ada panggilan RPC untuk layanan addContact, fungsi addContact akan dipanggil dan menerima parameter call dan callback. Parameter call berisi informasi terkait panggilan RPC, seperti request yang dikirim, sedangkan callback digunakan untuk memberikan respons ke klien.
  const newContact = { ...call.request };

  // Menambahkan data kontak baru ke Firestore
  contactsRef.add(newContact)
    .then(docRef => {
      // Mengambil ID dokumen yang baru ditambahkan
      const contactId = docRef.id;
      const createdContact = { ...newContact, id: contactId };

      // Mengembalikan data kontak yang baru ditambahkan ke panggilan kembali
      return callback(null, createdContact);
    })
    .catch(error => {
      console.error(error);
      return callback(error);
    });
},

  // Read
getAll: (call, callback) => {
  // Mengambil semua data kontak dari Firestore
  contactsRef.get()
    .then(querySnapshot => {
      // Mengambil data dokumen dan mengubahnya menjadi array
      const contacts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log(contacts)
      // Mengembalikan data kontak ke panggilan kembali
      return callback(null, { contact:contacts } );
    })
    .catch(error => {
      console.error(error);
      return callback(error);
    });
},

getContact: (call, callback) => {
  const contactId = call.request.id;

  // Mendapatkan data kontak dengan ID yang sesuai dari Firestore
  contactsRef.doc(contactId).get()
    .then(doc => {
      if (doc.exists) {
        // Mengembalikan data kontak yang ditemukan ke panggilan kembali
        const contactItem = {
          id: doc.id,
          ...doc.data()
        };
        return callback(null, contactItem);
      } else {
        // Mengembalikan kesalahan jika dokumen tidak ditemukan
        const error = new Error(`Kontak dengan ID '${contactId}' tidak ditemukan`);
        return callback(error);
      }
    })
    .catch(error => {
      console.error(error);
      return callback(error);
    });
},

// Update
  editContact: (call, callback) => {
    const contactId = call.request.id;
    const contactRef = contactsRef.doc(contactId);

    // Mengambil data kontak dari Firestore
    contactRef
      .get()
      .then((doc) => {
        if (!doc.exists) {
          throw new Error("Kontak tidak ditemukan");
        }

        // Memperbarui data kontak dengan data baru dari permintaan
        const newData = {
          name: call.request.name,
          email: call.request.email,
          phone: call.request.phone,
        };
        return contactRef.update(newData)
        .then(() => {
          // Mengembalikan data kontak yang diperbarui ke panggilan kembali
          return callback(null, newData);
        })
        .catch(error => {
          console.error(error);
          return callback(error);
        });
    })
    .catch(error => {
      console.error(error);
      return callback(error);
    });
  },

// Delete
deleteContact: (call, callback) => {
  const contactId = call.request.id;
  const contactRef = contactsRef.doc(contactId);

  // Menghapus data kontak dari Firestore
  contactRef.delete()
    .then(() => {
      // Mengembalikan konfirmasi penghapusan ke panggilan kembali
      return callback(null, { message: 'Kontak berhasil dihapus' });
    })
    .catch(error => {
      console.error(error);
      return callback(error);
    });
}
});

// Start server 
server.bindAsync(
  "127.0.0.1:50051",
  grpc.ServerCredentials.createInsecure(),
  (error, port) => {
    console.log("Server running at http://127.0.0.1:50051");
    server.start();
  }
)
```

- run.js
```javascript
//modify CRUD function to update data on database (firebase)

const client = require("./client"); //untuk menggunakan klien gRPC yg sudah didefinisi dalam client.js

// Add contact
const newContact = {
  id: "4",
  name: "demoPI",
  email: "grpc@example.com",
  phone: "999111777",
};
client.addContact(newContact, (error, response) => {
  if (!error) {
    console.log("Successfully created data");
    console.log(response);
  } else {
    console.error(error);
  }
});

// Get all contacts
client.getAll({}, (error, response) => {
  if (!error) {
    console.log("Successfully fetched data");
    console.log(response);
  } else {
    console.error(error);
  }
});

// Get a contact by ID
const contactId = "Il7nuYB3rUWY99ljKmBc";
client.getContact({ id: contactId }, (error, response) => {
  if (!error) {
    console.log(`Successfully fetched data for contact with ID ${contactId}`);
    console.log(response);
  } else {
    console.error(error);
  }
});

// Edit a contact
const updatedContact = {
  id: "h3yQRxX3nCvGY4VU2q9Y",
  name: "khalas",
  email: "alhamdlillah@example.com",
  phone: "081293784738",
};
client.editContact(updatedContact, (error, response) => {
  if (!error) {
    console.log(`Successfully edited data for contact with ID ${updatedContact.id}`);
    console.log(response);
  } else {
    console.error(error);
  }
});

// Delete a contact
const deletedContactId = "h3yQRxX3nCvGY4VU2q9Y";
client.deleteContact({ id: deletedContactId }, (error, response) => {
  if (!error) {
    console.log(`Successfully deleted data for contact with ID ${deletedContactId}`);
    console.log(response);
  } else {
    console.error(error);
  }
});
```

# fulfilled requirements
1. connect to database (firebase)
2. modify CRUD to update data on database

# documentation
- Add Contact
<a href='https://www.linkpicture.com/view.php?img=LPic642a5039aa851642274815'><img src='https://www.linkpicture.com/q/addContact.png' type='image'></a>

- Get All Contacts
<a href='https://www.linkpicture.com/view.php?img=LPic642ad6304575c1930324568'><img src='https://www.linkpicture.com/q/getAll.png' type='image'></a>

- Get Contact by ID
<a href='https://www.linkpicture.com/view.php?img=LPic642a5039aa851642274815'><img src='https://www.linkpicture.com/q/getContact.png' type='image'></a>

- Update Contact by ID
<a href='https://www.linkpicture.com/view.php?img=LPic642a5039aa851642274815'><img src='https://www.linkpicture.com/q/editContact.png' type='image'></a>

- Delete Contact by ID
<a href='https://www.linkpicture.com/view.php?img=LPic642a5039aa851642274815'><img src='https://www.linkpicture.com/q/deleteContact.png' type='image'></a>