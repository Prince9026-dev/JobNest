const express =  require("express");
const router = express.Router();
const mysql = require("mysql2");
// const candidate = require("./router/candidate.js");
const session = require("express-session");
const sessionOption = {secret: "jobnest-secret", resave: false, saveUninitialized: false};
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");


// establishing connection of mysql2 
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "jobnest_db",
    password: "prince.9090DEV",
})

// passport authentication definition
passport.use(new LocalStrategy({usernameField: "username",passwordField: "password",passReqToCallback: true},function (req, username, password, done) {
    let role = req.body.role;
    if (role.toLowerCase() === "student") {
        let q = "SELECT * FROM candidate_data WHERE name=? ";
        connection.query(q, [username], async(err, result) => {
            if (err) {return done(err);}
            if (result.length === 0) {return done(null, false);}
            let user = result[0];
            let match = await bcrypt.compare(password,user.password);
            if (!match) {return done(null, false);}
            return done(null, user);
        });  
    } 
    else if (role.toLowerCase() === "hr") {
        let q = "SELECT * FROM hr_data WHERE name=?";
        connection.query(q, [username], async(err, result) => {
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
    console.log("serialize",done);
    console.log("serialized", user, user.user_id);
    done(null, user.user_id);
});

passport.deserializeUser(function (id, done) {
    console.log("desirialize", done, id);
    let q = "SELECT * FROM candidate_data WHERE user_id = ?";

    connection.query(q, [id], function (err, result) {

        if (err) {
            return done(err);
        }

        if (result.length === 0) {
            return done(null, false);
        }

        return done(null, result[0]);
    });
});



// Authentication route
router.get("", (req, res) => {
    // res.send("authentication page");
    console.log("authentication page");
    res.render("autherrization/auth.ejs");
})

// registration route
router.get("/register", (req, res) => {
    res.render("autherrization/register.ejs");
})

router.post("/register", async(req, res) => {
    let { name, email, password, role, company} = req.body;
    if (role.toLowerCase() !== "student" && role.toLowerCase() !== "hr") {
        return res.status(400).send("Invalid role");
    }
    let hashedPassword = await bcrypt.hash(password, 12);
    if (role.toLowerCase() === "student"){
        let q = `SELECT email FROM candidate_data WHERE email=?`;
        connection.query(q, [email], (err, result) => {
            if (err) {console.log("SELECT ERROR:", err);return res.status(500).send("Database error");}
            if (result.length > 0) {console.log("Email already exists");return res.send("Email already exists");}
            // creating list of data to insert into sql2
            let data = [name, email, hashedPassword, role ];
            let q2 = `INSERT INTO candidate_data (name, email, password, role) VALUES (?, ?, ?, ?) `;
            connection.query(q2, data, (err, result) => {
                if (err) {console.log("INSERT ERROR:", err);return res.status(500).send("Registration failed");}
                console.log("INSERT SUCCESS:", result);
                console.log("Affected rows:", result.affectedRows);
                // res.send("Registration successful");
                let userId = data[0];
                console.log("Inserted ID:", result.insertId);
                res.redirect(`/authentication/${result.insertId}/${data[3]}`);
            });
        })
    }
    else if(role.toLowerCase() === "hr"){
        // alert("enter your company");
        let data = [name, email, hashedPassword, company, role ];
        let q = `SELECT email FROM hr_data WHERE email=?`;
        connection.query(q, [email], (err, result) => {
            if (err) {console.log("SELECT ERROR:", err);return res.status(500).send("Database error");}
            if (result.length > 0) {console.log("Email already exists");return res.send("Email already exists");}
            let q2 = `INSERT INTO hr_data (name, email, password, company, role) VALUES (?, ?, ?, ?, ?) `;
            connection.query(q2, data, (err, result) => {
                if (err) {console.log("INSERT ERROR:", err);return res.status(500).send("Registration failed");}
                console.log("INSERT SUCCESS:", result);
                console.log("Affected rows:", result.affectedRows);
                // res.send("Registration successful");
                let userId = data[0];
                let roll = data[4];
                console.log(roll);
                console.log("Inserted ID:", result.insertId);
                res.redirect(`/authentication/${result.insertId}/${roll}`);  
            });
        })
    }
});

// login route
router.get("/login",(req, res) => {
    console.log("get login");
    res.render("autherrization/login.ejs");
})
router.post("/login", passport.authenticate("local" ,{failureRedirect: "/authentication/login"}), (req, res) => {
    console.log("login")
    let position = req.user.role;
    // console.log("position", pos);
    console.log("session", req.user);
    if (position === "student"){res.render("candidate_data/profile.ejs", { result: req.user });}
    else{let result = req.user;
        console.log("in rendering page",result),res.render("jobs/hr_profile.ejs", {result: req.user})};
})


module.exports = router;



router.post("/register", async (req, res) => {

    let { name, email, password, role } = req.body;

    if (role.toLowerCase() !== "student" && role.toLowerCase() !== "hr") {
        return res.status(400).send("Invalid role");
    }

    if (role.toLowerCase() === "student") {

        let q = `SELECT email FROM candidate_data WHERE email=?`;

        connection.query(q, [email], async (err, result) => {

            if (err) {
                console.log("SELECT ERROR:", err);
                return res.status(500).send("Database error");
            }

            if (result.length > 0) {
                return res.send("Email already exists");
            }

            // Hash password
            let hashedPassword = await bcrypt.hash(password, 12);

            let data = [name, email, hashedPassword, role];

            let q2 = `
                INSERT INTO candidate_data
                (name, email, password, role)
                VALUES (?, ?, ?, ?)
            `;

            connection.query(q2, data, (err, result) => {

                if (err) {
                    console.log("INSERT ERROR:", err);
                    return res.status(500).send("Registration failed");
                }

                console.log("Registration successful");

                res.redirect("/authentication/login");
            });
        });
    }
});