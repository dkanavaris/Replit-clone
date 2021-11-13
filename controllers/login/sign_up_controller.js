const User_Model = require("../../mongoose-models/user_model");
const bcrypt = require("bcrypt");

exports.sign_up_controller_get = function(req, res){
    res.render("sign-up", {error : ""});
}

exports.sign_up_controller_post = async function(req, res){
    
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    const confirm_password = req.body.confirm_password;

    /* Check if email or username already exist */
    const email_exists = await User_Model.exists({email:email});
    if(email_exists){
        res.render("sign-up", {error : "Email already in use"});
        return;
    }

    /* Check if username already exists */
    const username_exists = await User_Model.exists({username: username});
    if(username_exists){
        res.render("sign-up", {error : "Username already exists"});
        return;
    }

    /* Make sure the passwords match each other */
    if(password !== confirm_password){
        console.log(password);
        console.log(confirm_password);

        res.render("sign-up", {error : "Passwords do not match"});
        return;
    }

    /* Generate a hashed password to store in DB */
    const hashed_password = bcrypt.hashSync(password, 10);

    const User = new User_Model({
        username: req.body.username,
        password: hashed_password,
        email : req.body.email
    }).save(err => {
        if (err) { 
            return next(err);
        }
        res.redirect("/");
    });
}