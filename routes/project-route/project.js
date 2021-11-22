const { name } = require('ejs');
const express = require('express');
const  project_controller = require('../../controllers/project/project_controller');
const router = express.Router();

router.post("/:username/:project_name/file_create/:filename", project_controller.project_file_create);

router.post("/:username/:project_name/folder_create/:foldername", project_controller.project_folder_create);

router.get("/:username/:project_name", project_controller.main_page_project);


module.exports = router;