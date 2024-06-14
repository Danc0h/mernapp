import bcrypt from "bcryptjs";

const data = {
  users: [
    {
      name: "Dancun Kipkorir",
      email: "info.dancoda@gmail.com",
      course: "Software Engineering",
      regNo: "IN16/00031/21",
      department: "",
      password: bcrypt.hashSync("345677"),
      isAdmin: false,
    },
    {
      name: "Nicholas Kirui",
      email: "nick@gmail.com",
      password: bcrypt.hashSync("765432"),
      isAdmin: true,
    },
  ],
};
export default data;
