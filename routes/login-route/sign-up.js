const express = require('express');
const  sign_up_controller = require('../../controllers/login/sign_up_controller');
const router = express.Router();

/* GET users listing. */
router.get('/', sign_up_controller.sign_up_controller_get);

router.post('/', sign_up_controller.sign_up_controller_post);
module.exports = router;