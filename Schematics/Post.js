mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  postBody: { type: String, required: true },
  username: { type: String, required: true },
  dateAdded: { type: String, required: true },
});

module.exports = mongoose.model("Post", PostSchema);
