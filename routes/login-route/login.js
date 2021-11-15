const express = require('express');
const router = express.Router();
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../../mongoose-models/user_model");
const login_controller = require("../../controllers/login/login_controller.js");
const bcrypt = require("bcrypt");
const flash = require("connect-flash");

router.use(flash());


passport.use(
	new LocalStrategy((username, password, done) => {
    	User.findOne({ username: username }, (err, user) => {
        if (err) { 
          return done(err);
        }
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }
        bcrypt.compare(password, user.password, (err, res) => {
			if (res) {
			  // passwords match! log user in
			  return done(null, user)
			} else {
			  // passwords do not match!
			  return done(null, false, { message: "Incorrect password" })
			}
		});
      });
    })
);

passport.serializeUser(function(user, done) {
	done(null, user.id);
	}
);

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  }
);


router.use(function(req, res, next){
	res.locals.error = req.flash('error');
	next();	
});

router.use(flash());

/* GET login page. */
router.get('/', login_controller.login_controller_get);

router.post('/', passport.authenticate('local',  {
	successRedirect: '/main-page',
	failureRedirect: '/',
	failureFlash: true 
	})
);

module.exports = router;