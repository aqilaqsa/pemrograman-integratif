const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const firebaseAdmin = require('firebase-admin');

// Load the protobuf file
const packageDefinition = protoLoader.loadSync('contacts.proto');
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);

// Initialize Firebase
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.applicationDefault(),
  databaseURL: 'https://your-project-id.firebaseio.com'
});

// Define the service methods
const contactsService = {
  addContact: addContact,
  getContact: getContact,
  updateContact: updateContact,
  deleteContact: deleteContact,
  listContacts: listContacts
};

// Create the server
const server = new grpc.Server();
server.addService(protoDescriptor.ContactsService.service, contactsService);

// Start the server
server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
  console.log('Server running at http://0.0.0.0:50051');
  server.start();
});

// Service method implementations
function addContact(call, callback) {
  const contact = call.request;
  const id = firebaseAdmin.database().ref().child('contacts').push().key;
  firebaseAdmin.database().ref(`contacts/${id}`).set(contact, (err) => {
    if (err) {
      callback(err);
    } else {
      callback(null, { id: id });
    }
  });
}

function getContact(call, callback) {
  const id = call.request.id;
  firebaseAdmin.database().ref(`contacts/${id}`).once('value', (snapshot) => {
    const contact = snapshot.val();
    if (contact) {
      callback(null, contact);
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        message: `Contact with ID ${id} not found`
      });
    }
  }, (err) => {
    callback(err);
  });
}

function updateContact(call, callback) {
  const contact = call.request;
  firebaseAdmin.database().ref(`contacts/${contact.id}`).update(contact, (err) => {
    if (err) {
      callback(err);
    } else {
      callback(null, {});
    }
  });
}

function deleteContact(call, callback) {
  const id = call.request.id;
  firebaseAdmin.database().ref(`contacts/${id}`).remove((err) => {
    if (err) {
      callback(err);
    } else {
      callback(null, {});
    }
  });
}

function listContacts(call) {
  const contactsRef = firebaseAdmin.database().ref('contacts');
  const stream = contactsRef.once('value');
  stream.on('data', (snapshot) => {
    const contact = snapshot.val();
    call.write(contact);
  });
  stream.on('end', () => {
    call.end();
  });
  stream.on('error', (err) => {
    call.emit('error', err);
  });
}
