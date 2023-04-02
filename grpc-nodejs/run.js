const client = require("./client");

// read data
client.getAll({}, (error, contact) => {
  if (!error) {
    console.log("Successfully fetched data");
    console.log(contact);
  } else {
    console.error(error);
  }
});

// add contact
client.addContact(
  {
    id: "3",
    name: "John",
    email: "john@example.com",
    phone: "1234567890",
  },
  (error, contact) => {
    if (!error) {
      console.log("Successfully created data");
      console.log(contact);
    } else {
      console.error(error);
    }
  }
);

// edit contact
client.editContact(
  {
    id: "2",
    name: "Budi edited",
    email: "budi@example.com",
    phone: "9876543210",
  },
  (error, contact) => {
    if (!error) {
      console.log("Successfully edited data");
      console.log(contact);
    } else {
      console.error(error);
    }
  }
);

// delete contact
client.deleteContact(
  {
    id: "2",
  },
  (error, contact) => {
    if (!error) {
      console.log("Successfully deleted data");
      console.log(contact);
    } else {
      console.error(error);
    }
  }
);
