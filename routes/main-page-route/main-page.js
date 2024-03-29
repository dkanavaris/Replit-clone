const { name } = require('ejs');
const express = require('express');
const  main_page_controller = require('../../controllers/main_page/main_page_controller');
const router = express.Router();


/* GET users listing. */
router.get('/', main_page_controller.main_page_get);

router.post('/', main_page_controller.main_page_create_project);

router.post('/delete', main_page_controller.main_page_delete_project);

module.exports = router;