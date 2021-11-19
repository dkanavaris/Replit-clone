const Project = require("../../mongoose-models/project_model");
const fs = require("fs");

//TODO: change path delimiter to work on all systems

exports.main_page_get = function(req, res){
    
    if(!req.isAuthenticated()){
        res.redirect("login");
        return;
    }

    const json_path = res.locals.currentUser.directory + "\\" + "projects.json"
    
    let json_file = require(json_path);
    let projects = fs.readFileSync(json_path);
    projects = JSON.parse(projects);

    console.log(projects);
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
        project_id : 5,
        path : project_path,
        name : req.body.project_name  
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