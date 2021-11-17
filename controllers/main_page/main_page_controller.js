const Project = require("../../mongoose-models/project_model");
const fs = require("fs");

//TODO: change path delimiter to work on all systems

exports.main_page_get = function(req, res){
    
    if(!req.isAuthenticated()){
        res.redirect("login");
        return;
    }
    res.render("main-page");
}

exports.main_page_create_project = async function(req, res){
    console.log(req.body.project_name);
    console.log(res.locals.currentUser);

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
        fs.mkdirSync(project_path);
    });
    res.redirect("/main-page");
}