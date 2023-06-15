//modify CRUD function to update data on database (firebase)

const client = require("./client");

// // Add contact
// const newContact = {
//   id: "3",
//   name: "hai",
//   email: "halo@example.com",
//   phone: "8989898",
// };
// client.addContact(newContact, (error, response) => {
//   if (!error) {
//     console.log("Successfully created data");
//     console.log(response);
//   } else {
//     console.error(error);
//   }
// });

// Get all contacts
client.getAll({}, (error, response) => {
  if (!error) {
    console.log("Successfully fetched data");
    console.log(response);
  } else {
    console.error(error);
  }
});

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
//   id: "h3yQRxX3nCvGY4VU2q9Y",
//   name: "khalas",
//   email: "alhamdlillah@example.com",
//   phone: "081293784738",
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
// const deletedContactId = "h3yQRxX3nCvGY4VU2q9Y";
// client.deleteContact({ id: deletedContactId }, (error, response) => {
//   if (!error) {
//     console.log(`Successfully deleted data for contact with ID ${deletedContactId}`);
//     console.log(response);
//   } else {
//     console.error(error);
//   }
// });