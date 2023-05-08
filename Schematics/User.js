mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  password: { type: String, required: true },
  dateCreated: { type: String, required: true },
  roles: { type: Array, required: true },
});

module.exports = mongoose.model("User", UserSchema);
