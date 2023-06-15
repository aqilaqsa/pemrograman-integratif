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