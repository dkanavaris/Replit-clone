const express = require('express');
const router = express.Router();

const login_controller = require("../controllers/login/login_controller.js");

/* GET login page. */
router.get('/', login_controller.login_controller_get);

module.exports = router;