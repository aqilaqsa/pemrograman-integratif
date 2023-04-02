//import package
const grpc = require("@grpc/grpc-js");
var protoLoader = require("@grpc/proto-loader");

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

// Add service in proto, error?
server.addService(contactProto.ContactService.service, {
  // Create
  addContact: (call, callback) =>  {
    const _contact = { ...call.request };
    contact.contact.push(_contact);
    callback(null, _contact);
  },
  // Read 
  getAll: (call, callback) => {
    callback(null, contact);
  },
  getContact: (call, callback) => {
    const contactId = call.request.id;
    const contactItem = contact.contact.find(({ id }) => contactId == id);
    callback(null, contactItem);
  },
  // Update
  editContact: (call, callback) => {
    const contactId = call.request.id;
    const contactItem = contact.contact.find(({ id }) => contactId == id);
    contactItem.nama = call.request.nama;
    contactItem.email = call.request.email;
    contactItem.phone = call.request.phone;
    callback(null, contactItem)
  },
  // Delete 
  deleteContact: (call, callback) => {
    const contactId = call.request.id;
    contact = contact.contact.filter(({ id }) => id !== contactId);
    callback(null, {contact});
  },
})

// Start server 
server.bindAsync(
  "127.0.0.1:50051",
  grpc.ServerCredentials.createInsecure(),
  (error, port) => {
    console.log("Server running at http://127.0.0.1:50051");
    server.start();
  }
)