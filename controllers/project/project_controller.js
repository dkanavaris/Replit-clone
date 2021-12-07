const Project = require("../../mongoose-models/project_model");
const fs = require("fs");
const path = require('path');

exports.project_file_create = function(req, res){
    console.log("Will create file: " + req.params.filename);
    res.json({test: "test"});
}

exports.project_folder_create = function(req, res){
    console.log("Will create folder: " + req.params.foldername);
    res.json({test: "test"});
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
    let tree = dirTree(project_path.path);

    let total_contents = [];
    tree_contents(total_contents, tree);

    res.render("project", {url: req.url, project_name: project_name, project_files: total_contents});
}


function tree_contents(total_contents, tree){

    if(tree.children){
        for(let child = 0; child < tree.children.length; child++){
            
            console.log(tree.children[child]);
            total_contents.push(tree.children[child]);

            if(tree.children[child].children)
                tree_contents(total_contents, tree.children[child]);
        }
    }
}

/* Returns the contents of filename if filename is a directory ,or the
 * the info of the file otherwise */
function dirTree(filename) {
    var stats = fs.lstatSync(filename),
        info = {
            path: filename,
            name: path.basename(filename)
        };
 
    if (stats.isDirectory()) {
        info.type = "folder";
        info.children = fs.readdirSync(filename).map(function(child) {
            return dirTree(filename + '\\' + child);
        });
    } else {
        info.type = "file";
    }
 
    return info;
}