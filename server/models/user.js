const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  userId: String,
  account: String,
  nonce: String,
  signature: String,
});

const User = model("users", userSchema);

module.exports = User;
