const express =  require("express");
const router = express.Router();
// const mysql = require("mysql2");
const session = require("express-session");
const sessionOption = {secret: "jobnest-secret", resave: false, saveUninitialized: false};
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const connection = require("../db");

const loginController = require("../controller/loginRegister.js");

// passport authentication definition
passport.use(new LocalStrategy({usernameField: "username",passwordField: "password",passReqToCallback: true},function (req, username, password, done) {
    let role = req.body.role;
    console.log("USERNAME:", username); console.log("PASSWORD ENTERED:", password); console.log("ROLE:", role);
    if (role.toLowerCase() === "student") {
        let q = "SELECT * FROM candidate_data WHERE name=? or email=?";
        connection.query(q, [username, username], async(err, result) => {
            if (err) {return done(err);}
            if (result.length === 0) {return done(null, false);}
            let user = result[0];
            let match = await bcrypt.compare(password,user.password);
            if (!match) {return done(null, false);}
            return done(null, user);
        });  
    } 
    else if (role.toLowerCase() === "hr") {
        let q = "SELECT * FROM hr_data WHERE name=? or email=?";
        connection.query(q, [username, username], async(err, result) => {
            if (err) {return done(err);}
            if (result.length === 0) {return done(null, false);}
            let user = result[0];
            let match = await bcrypt.compare(password,user.password);
            if (!match) {return done(null, false);}
            return done(null, user);
        });
    } 
    else {
        return done(null, false);
    }
}))

passport.serializeUser(function (user, done) {
    done(null, user.user_id);
});

passport.deserializeUser(function (id, done) {
    let q = "SELECT * FROM candidate_data WHERE user_id = ?";
    connection.query(q, [id], function (err, result) {
        if (err) {return done(err);}
        if (result.length === 0) {return done(null, false);}
        return done(null, result[0]);
    });
});

// Authentication route
router.get("", loginController.authenticationHome);

// registration route
router.get("/register", (loginController.register));
router.post("/register", loginController.userEnter);

// login route
router.get("/login", loginController.loginRender);
router.post("/login", passport.authenticate("local" ,{failureRedirect: "/authentication/login"}), loginController.login);

module.exports = router;