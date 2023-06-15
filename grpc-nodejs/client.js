const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Load the protobuf
const proto = protoLoader.loadSync('contacts.proto', {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const contactsProto = grpc.loadPackageDefinition(proto).Contacts;

// Initialize the client
const client = new contactsProto('localhost:50051', grpc.credentials.createInsecure());

// Define a callback function for handling the server response
const handleResponse = (err, response) => {
  if (err) {
    console.error(err);
  } else {
    console.log(response);
  }
};

// Call the server methods using the client
client.createContact({ id: '1', name: 'Alice', email: 'alice@example.com', phone_number: '123-456-7890' }, handleResponse);
client.readContact({ id: '1' }, handleResponse);
client.updateContact({ id: '1', name: 'Bob', email: 'bob@example.com', phone_number: '123-456-7890' }, handleResponse);
client.deleteContact({ id: '1' }, handleResponse);
