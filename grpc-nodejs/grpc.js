const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync(
  './contacts.proto',
  { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true }
);

const contactsProto = grpc.loadPackageDefinition(packageDefinition).contacts;

module.exports = contactsProto;