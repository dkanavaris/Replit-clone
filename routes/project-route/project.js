const { name } = require('ejs');
const express = require('express');
const  project_controller = require('../../controllers/project/project_controller');
const router = express.Router();

router.get("/:username/:project_name/get_file/:path*", project_controller.get_file);

router.get("/:username/:project_name/get_project_files", project_controller.get_project_files);

router.post("/:username/:project_name/file_create/:filepath*", project_controller.project_file_create);

router.post("/:username/:project_name/folder_create/:folderpath*", project_controller.project_folder_create);

router.get("/:username/:project_name", project_controller.main_page_project);


module.exports = router;