const Project = require("../../mongoose-models/project_model");
const fs = require("fs");

//TODO: change path delimiter to work on all systems
//TODO: Remove fs Sync functions.

exports.main_page_get = async function(req, res){
    
    if(!req.isAuthenticated()){
        res.redirect("login");
        return;
    }

    const json_path = res.locals.currentUser.directory + "\\" + "projects.json"
    let projects = [];

    if(fs.existsSync(json_path)){
        let json_file = require(json_path);
        projects = fs.readFileSync(json_path);
        projects = JSON.parse(projects);
    }

    res.render("main-page", {projects: projects});
}

exports.main_page_create_project = async function(req, res){

    /* Check if user alreay has a project with this name*/
    const exists = await Project.exists({owner: res.locals.currentUser.username,
                                    name : req.body.project_name});

    if(exists){
        console.log("Project already exists\n");
        res.redirect("/main-page");
        return;
    }    
    

    const project_path = res.locals.currentUser.directory + "\\" + req.body.project_name;


    const new_project = new Project({
        owner : res.locals.currentUser.username,
        path : project_path,
        name : req.body.project_name,
        files: JSON.stringify([])
    }).save(err =>{
        if(err){
            return next(err);
        }
    
        /* Create the directory for the project */
        fs.mkdirSync(project_path);
    
        /*Add the project to user's json file containing shared and owned projects */
        let obj = {
            project_name : req.body.project_name,
            project_owner : res.locals.currentUser.username,
            project_path : project_path
        };
    
        const json_path = res.locals.currentUser.directory + "\\" + "projects.json"

        if(!fs.existsSync(json_path)){
            fs.writeFileSync(json_path, "[]");
        }
    
        let json_file = require(json_path);
        json_file.push(obj);
        fs.writeFileSync(json_path, JSON.stringify(json_file));
    
        res.redirect("/main-page");
        });
}

exports.main_page_delete_project = async function(req, res){

    console.log(req.body)
   /* Check if user alreay has a project with this name*/
    const exists = await Project.exists({owner: res.locals.currentUser.username,
                                    name : req.body.delete_project_name});

    if(!exists){
        console.log("Project does not exists\n");
        res.redirect("/main-page");
        return;
    }    
    

    const project_path = res.locals.currentUser.directory + "\\" + req.body.delete_project_name;

    await Project.remove({owner: res.locals.currentUser.username, path: project_path, name:req.body.delete_project_name});
    
    fs.rmdirSync(project_path, { recursive: true, force: true });    

    let obj = {
        project_name : req.body.delete_project_name,
        project_owner : res.locals.currentUser.username,
        project_path : project_path
    };

    const json_path = res.locals.currentUser.directory + "\\" + "projects.json"
    let json_file = require(json_path);
    
    for (let i = 0; i < json_file.length; i++){
        let arr_obj = json_file[i];

        if(arr_obj.project_name == obj.project_name &&
            arr_obj.project_owner == obj.project_owner &&
            arr_obj.project_path == obj.project_path){
                
                json_file.splice(i, 1);
                fs.writeFileSync(json_path, JSON.stringify(json_file));
    
                return res.redirect("/main-page");            
        }
    }

}