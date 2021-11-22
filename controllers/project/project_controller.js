const Project = require("../../mongoose-models/project_model");
const fs = require("fs");

exports.project_file_create = function(req, res){
    console.log("Will create file: " + req.params.filename);
    res.redirect("back");
}

exports.project_folder_create = function(req, res){
    console.log("Will create folder: " + req.params.foldername);
    res.redirect("back");
}

exports.main_page_project = async function(req, res){

    /* If user is not logged in redirect him to log in */
    if(!req.isAuthenticated()){
        res.redirect("/login");
        return;
    }

    /* Check if project and username exist in DB*/
    const project_name = req.params.project_name
    const username = req.params.username.replace("@", "");
    const project_path = await Project.findOne({name: project_name, owner: username});

    /* If project does not exist redirect to main-page*/
    if(!project_path){
        res.redirect("/main-page");
        return;
    }

    /* Else store the current project path to a local 
     * variable and redirect to project page. */
    res.locals.curerntProjectPath = project_path.path;

    /* Read all the files from the project directory */

    const files = fs.readdirSync(project_path.path);
    console.log(files);
    console.log(req.url);
    res.render("project", {url: req.url, project_name: project_name, project_files: files});
}