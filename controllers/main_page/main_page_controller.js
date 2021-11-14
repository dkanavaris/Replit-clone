exports.main_page_get = function(req, res){
    
    if(!req.isAuthenticated()){
        res.redirect("login");
        return;
    }
    res.render("main-page");
}