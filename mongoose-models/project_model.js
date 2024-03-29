const mongoose = require("mongoose");
const Schema  = mongoose.Schema;

let Project_Model = new Schema({
    name : String,
    path : String,       // Project's absolute path to the filesystem
    owner : String,      // Owner of the project - username of owner
    files : String       // JSON Stringified
});

module.exports = mongoose.model("project", Project_Model);