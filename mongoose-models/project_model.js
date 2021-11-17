const mongoose = require("mongoose");
const Schema  = mongoose.Schema;

let Project_Model = new Schema({
    project_id : String, // Unique id of the project
    path : String,       // Project's absolute path to the filesystem
    owner : String,      // Owner of the project - username of owner
});

module.exports = mongoose.model("project", Project_Model);