const User_Model = require("../../mongoose-models/user_model");


exports.login_controller_get = function(req, res){
    res.render("login");
}