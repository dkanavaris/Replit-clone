const { name } = require('ejs');
const express = require('express');
const  main_page_controller = require('../../controllers/main_page/main_page_controller');
const router = express.Router();

router.get("/:username/:project_name", function(req, res){

    res.render("main-page-project", {project_name: req.params.project_name});
})


/* GET users listing. */
router.get('/', main_page_controller.main_page_get);


router.post('/', main_page_controller.main_page_create_project);

module.exports = router;