const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = './contacts.proto';

const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const contactsProto = grpc.loadPackageDefinition(packageDefinition).contacts;

const client = new contactsProto.ContactsService('localhost:50051', grpc.credentials.createInsecure());

// Helper function to print a contact object
function printContact(contact) {
  console.log(`ID: ${contact.id}`);
  console.log(`Name: ${contact.name}`);
  console.log(`Email: ${contact.email}`);
  console.log(`Phone: ${contact.phone}`);
  console.log('-----------------------');
}

// Add a new contact
const newContact = {
  name: 'John Smith',
  email: 'john@example.com',
  phone: '555-1234',
};
client.addContact(newContact, (error, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log(`Added contact with ID ${response.id}`);
  }
});

// Get a contact by ID
const contactId = '<CONTACT-ID-HERE>';
client.getContact({ id: contactId }, (error, contact) => {
  if (error) {
    console.error(error);
  } else {
    console.log(`Retrieved contact with ID ${contact.id}:`);
    printContact(contact);
  }
});

// Update an existing contact
const existingContact = {
  id: '<EXISTING-CONTACT-ID>',
  name: 'Jane Doe',
  email: 'jane@example.com',
  phone: '555-5678',
};
client.updateContact(existingContact, (error) => {
  if (error) {
    console.error(error);
  } else {
    console.log(`Updated contact with ID ${existingContact.id}`);
  }
});

// Delete a contact by ID
const deleteContactId = '<CONTACT-ID-TO-DELETE>';
client.deleteContact({ id: deleteContactId }, (error) => {
  if (error) {
    console.error(error);
  } else {
    console.log(`Deleted contact with ID ${deleteContactId}`);
  }
});

// List all contacts
const call = client.listContacts();
call.on('data', (contact) => {
  console.log(`Retrieved contact with ID ${contact.id}:`);
  printContact(contact);
});
call.on('end', () => {
  console.log('Finished listing contacts');
});
