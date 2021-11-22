const { name } = require('ejs');
const express = require('express');
const  main_page_controller = require('../../controllers/main_page/main_page_controller');
const main_project_controller = require("../../controllers/main_page/main_page_project_controller");
const router = express.Router();


router.post("/:username/:project_name/file_create/:filename", main_project_controller.project_file_create);

router.post("/:username/:project_name/folder_create/:foldername", main_project_controller.project_folder_create);

router.get("/:username/:project_name", main_project_controller.main_page_project);

/* GET users listing. */
router.get('/', main_page_controller.main_page_get);


router.post('/', main_page_controller.main_page_create_project);

module.exports = router;