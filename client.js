const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const firebaseAdmin = require('firebase-admin');

const PROTO_PATH = './contacts.proto';

const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const contactsProto = grpc.loadPackageDefinition(packageDefinition).contacts;

const firebaseServiceAccount = require('./path/to/firebase/serviceAccountKey.json');
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(firebaseServiceAccount),
  databaseURL: 'https://<YOUR-FIREBASE-APP>.firebaseio.com',
});

const db = firebaseAdmin.database();
const contactsRef = db.ref('contacts');

function addContact(call, callback) {
  const contact = call.request;
  const id = contact.id || contactsRef.push().key;
  contact.id = id;
  contactsRef.child(id).set(contact, (error) => {
    if (error) {
      callback(error);
    } else {
      callback(null, { id });
    }
  });
}

function getContact(call, callback) {
  const id = call.request.id;
  contactsRef.child(id).once('value', (snapshot) => {
    const contact = snapshot.val();
    if (contact) {
      callback(null, contact);
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: 'Contact not found',
      });
    }
  });
}

function updateContact(call, callback) {
  const contact = call.request;
  const id = contact.id;
  contactsRef.child(id).update(contact, (error) => {
    if (error) {
      callback(error);
    } else {
      callback(null, {});
    }
  });
}

function deleteContact(call, callback) {
  const id = call.request.id;
  contactsRef.child(id).remove((error) => {
    if (error) {
      callback(error);
    } else {
      callback(null, {});
    }
  });
}

function listContacts(call) {
  const stream = contactsRef.on('child_added', (snapshot) => {
    const contact = snapshot.val();
    call.write(contact);
  });
  contactsRef.once('value', () => {
    call.end();
  });
  return stream;
}

function main() {
  const server = new grpc.Server();
  server.addService(contactsProto.ContactsService.service, {
    addContact,
    getContact,
    updateContact,
    deleteContact,
    listContacts,
  });
  server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), (error, port) => {
    if (error) {
      console.error(error);
      process.exit(1);
    }
    console.log(`Server running on port ${port}`);
    server.start();
  });
}

main();
