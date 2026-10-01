const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const connection = require("../db.js");

// AUTHENtication home
module.exports.authenticationHome = (req, res) => {
    res.render("autherrization/auth.ejs");
} 

// render form for registration
module.exports.register = (req, res) => {
    res.render("autherrization/register.ejs");
}

// post registration
module.exports.userEnter = async(req, res) => {
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

            let data = [name, email, hashedPassword, role ];
            let q2 = `INSERT INTO candidate_data (name, email, password, role) VALUES (?, ?, ?, ?) `;
            connection.query(q2, data, (err, result) => {
                if (err) {console.log("INSERT ERROR:", err);return res.status(500).send("Registration failed");}
                console.log(result);
                let userId = data[0];
                console.log(userId);
                console.log(result.insertId);
                console.log(data[3]);
                res.redirect(`/authentication/${result.insertId}/${data[3]}`);
            });
        })
    }
    else if(role.toLowerCase() === "hr"){
        let data = [name, email, hashedPassword, company, role ];
        let q = `SELECT email FROM hr_data WHERE email=?`;
        connection.query(q, [email], (err, result) => {
            if (err) {console.log("SELECT ERROR:", err);return res.status(500).send("Database error");}
            if (result.length > 0) {console.log("Email already exists");return res.send("Email already exists");}
            let q2 = `INSERT INTO hr_data (name, email, password, company, role) VALUES (?, ?, ?, ?, ?) `;
            connection.query(q2, data, (err, result) => {
                if (err) {console.log("INSERT ERROR:", err);return res.status(500).send("Registration failed");}
                let userId = data[0];
                let roll = data[4];
                res.redirect(`/authentication/${result.insertId}/${roll}`);  
            });
        })
    }
}


// render login form
module.exports.loginRender = (req, res) => {
    res.render("autherrization/login.ejs");
}
// user login
module.exports.login = (req, res) => {
    let position = req.user.role;
    if (position === "student"){
        res.render("candidate_data/profile.ejs", { result: req.user });
    }
    else{let result = req.user;
        res.render("jobs/hr_profile.ejs", {result: req.user})
    };
}