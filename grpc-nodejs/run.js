const client = require("./client");

// Add contact
const newContact = {
  id: "2",
  name: "ngantukbos",
  email: "turu@example.com",
  phone: "99999999",
};
client.addContact(newContact, (error, response) => {
  if (!error) {
    console.log("Successfully created data");
    console.log(response);
  } else {
    console.error(error);
  }
});

// // Get all contacts
// client.getAll({}, (error, response) => {
//   if (!error) {
//     console.log("Successfully fetched data");
//     console.log(response);
//   } else {
//     console.error(error);
//   }
// });

// // Get a contact by ID
// const contactId = "Il7nuYB3rUWY99ljKmBc";
// client.getContact({ id: contactId }, (error, response) => {
//   if (!error) {
//     console.log(`Successfully fetched data for contact with ID ${contactId}`);
//     console.log(response);
//   } else {
//     console.error(error);
//   }
// });

// // Edit a contact
// const updatedContact = {
//   id: "C6JeUyB8eF9XIFBgasOu",
//   name: "John edited",
//   email: "john@example.com",
//   phone: "9876543210",
// };
// client.editContact(updatedContact, (error, response) => {
//   if (!error) {
//     console.log(`Successfully edited data for contact with ID ${updatedContact.id}`);
//     console.log(response);
//   } else {
//     console.error(error);
//   }
// });

// // Delete a contact
// const deletedContactId = "C6JeUyB8eF9XIFBgasOu";
// client.deleteContact({ id: deletedContactId }, (error, response) => {
//   if (!error) {
//     console.log(`Successfully deleted data for contact with ID ${deletedContactId}`);
//     console.log(response);
//   } else {
//     console.error(error);
//   }
// });