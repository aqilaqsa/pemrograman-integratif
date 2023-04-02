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

//dummy data
let contact = {
  contact: [
    {
      id: "1",
      nama: "Rudi",
      email: "capek@example.com",
      phone: "081234251827"
    },
    {
      id: "2",
      nama: "Budi",
      email: "abcde@example.com",
      phone: "085811292763"
    }
  ]
}

// Add service in proto
server.addService(contactProto.ContactService.service, {
  // Create
addContact: (call, callback) => {
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

      // Mengembalikan data kontak ke panggilan kembali
      return callback(null, { contacts });
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
    contactRef.get()
      .then(doc => {
        if (!doc.exists) {
          throw new Error('Kontak tidak ditemukan');
        }
  
        // Memperbarui data kontak dengan data baru dari permintaan
        const newData = {
          nama: call.request.nama,
          email: call.request.email,
          phone: call.request.phone
        };
        return contactRef.update(newData);
      })
      .then(() => {
        // Mengembalikan data kontak yang diperbarui ke panggilan kembali
        return callback(null, newData);
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