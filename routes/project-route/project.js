const { name } = require('ejs');
const express = require('express');
const  project_controller = require('../../controllers/project/project_controller');
const router = express.Router();

router.get("/:username/:project_name/get_file/:path*", project_controller.get_file);

router.post("/:username/:project_name/close_file/:path*", project_controller.close_file);

router.get("/:username/:project_name/get_project_files", project_controller.get_project_files);

router.get("/:username/:project_name/get_terminal", project_controller.get_terminal);

router.post("/:username/:project_name/save_file/:filepath*", project_controller.save_file);

router.post("/:username/:project_name/file_create/:filepath*", project_controller.file_create);

router.post("/:username/:project_name/folder_create/:folderpath*", project_controller.folder_create);

router.post("/:username/:project_name/delete/:filepath*", project_controller.delete_file);

router.post("/:username/:project_name/rename/:filename/:filepath*", project_controller.rename_file);

router.get("/:username/:project_name", project_controller.main_page_project);


module.exports = router;