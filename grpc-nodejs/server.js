//running

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync('./contacts.proto', {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const contactProto = grpc.loadPackageDefinition(packageDefinition).contact;

var admin = require("firebase-admin");

var serviceAccount = require("./pi-contactgrpcprotobuf-firebase-adminsdk-1nq2s-ecf18d34cd.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://pi-contactgrpcprotobuf-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const server = new grpc.Server();

server.addService(contactProto.Contacts.service, {
  list: listContacts,
  insert: insertContact,
  get: getContact,
  update: updateContact,
  delete: deleteContact
});

server.bindAsync('localhost:50051', grpc.ServerCredentials.createInsecure(), () => {
  console.log('Server running at http://localhost:50051');
  server.start();
});

function listContacts(call, callback) {
  const database = admin.database();
  const ref = database.ref('contacts');

  ref.once('value', snapshot => {
    const contacts = [];

    snapshot.forEach(childSnapshot => {
      const contact = childSnapshot.val();
      contact.id = childSnapshot.key;
      contacts.push(contact);
    });

    callback(null, { contacts });
  }, error => {
    console.error(error);
    callback(error);
  });
}

function insertContact(call, callback) {
  const database = admin.database();
  const ref = database.ref('contacts');

  const contact = call.request;
  const id = ref.push().key;

  ref.child(id).set(contact, error => {
    if (error) {
      console.error(error);
      callback(error);
    } else {
      callback(null, { id });
    }
  });
}

function getContact(call, callback) {
  const database = admin.database();
  const ref = database.ref(`contacts/${call.request.id}`);

  ref.once('value', snapshot => {
    const contact = snapshot.val();

    if (contact) {
      contact.id = call.request.id;
      callback(null, contact);
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: 'Not found'
      });
    }
  }, error => {
    console.error(error);
    callback(error);
  });
}

function updateContact(call, callback) {
  const database = admin.database();
  const ref = database.ref(`contacts/${call.request.id}`);

  ref.update(call.request, error => {
    if (error) {
      console.error(error);
      callback(error);
    } else {
      callback(null, {});
    }
  });
}

function deleteContact(call, callback) {
  const database = admin.database();
  const ref = database.ref(`contacts/${call.request.id}`);

  ref.remove(error => {
    if (error) {
      console.error(error);
      callback(error);
    } else {
      callback(null, {});
    }
  });
}
