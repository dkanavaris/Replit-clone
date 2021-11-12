const User_Model = require("../../mongoose-models/user_model");

exports.sign_up_controller_get = function(req, res){
    res.render("sign-up", {error : ""});
}

exports.sign_up_controller_post = function(req, res){
    
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    const confirm_password = req.body.confirm_password;
    let error = false;

    const User = new User_Model({
        username: req.body.username,
        password: req.body.password,
        email : req.body.email
    }).save(err => {
        if (err) { 
            return next(err);
        }
        res.redirect("/");
    });
}