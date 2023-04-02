const grpc = require("@grpc/grpc-js");
var protoLoader = require("@grpc/proto-loader");

const PROTO_PATH = "./contact.proto";

const options = {
keepCase: true,
longs: String,
enums: String,
defaults: true,
oneofs: true,
};

var packageDefinition = protoLoader.loadSync(PROTO_PATH, options);

const ContactService = grpc.loadPackageDefinition(packageDefinition).ContactService;

const client = new ContactService(
"127.0.0.1:50051",
grpc.credentials.createInsecure()
);

module.exports = client;