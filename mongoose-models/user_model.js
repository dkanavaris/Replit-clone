const mongoose = require("mongoose");
const Schema  = mongoose.Schema;

let User_Model = new Schema({
    username : String,
    password : String,
    email : String,
});

module.exports = mongoose.model("users", User_Model);