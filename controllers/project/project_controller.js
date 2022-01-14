const Project = require("../../mongoose-models/project_model");
const fs = require("fs");
const path = require('path');
//TODO: add semaphores so multiple users cannot save,create,delete togethen

async function get_path(req){
    const project_name = req.params.project_name
    const username = req.params.username.replace("@", "");
    const project_path = await Project.findOne({name: project_name, owner: username});
    return project_path.path;
}
exports.file_create = async function(req, res){

    let path = await get_path(req);

    const filepath =  path + "\\" +
                    req.params.filepath + req.params[0];

    fs.writeFileSync(filepath, "");

    res.json({return:"success"});
}

exports.folder_create = async function(req, res){

    let path = await get_path(req);

    path = path + "\\" +
    req.params.folderpath + req.params[0];

    fs.mkdirSync(path);
    res.json({return:"success"});

}

exports.save_file = async function(req, res){

    let path = await get_path(req);

    const filepath =  path + "\\" +
        req.params.filepath + req.params[0];

    fs.writeFileSync(filepath, req.body.data);
    console.log("File saved! at " + filepath);
}

exports.get_file = async function(req, res){

    let path = await get_path(req);

    const filepath = path + "\\" +
                        req.params.path + req.params[0];

    let file_data = fs.readFileSync(filepath, 'utf-8');

    res.json({file_data: file_data});
}

exports.get_project_files = async function(req, res){

    let path = await get_path(req);
    res.json(dirTree(path));
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
    //req.app.locals.currentProjectPath = project_path.path;

    

    res.render("project", {url: req.url, project_name: project_name});
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