// requiring of packages
const express = require("express");
const mysql = require("mysql2");
const { connected } = require("process");
const app = express();
const path = require("path");
const {v4: uuidv4} = require("uuid");
const { queryObjects } = require("v8");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const candidate = require("./router/candidate.js");
const hr = require("./router/hr.js");
const sessionOption = {
    secret: "jobnest-secret",
    resave: false,
    saveUninitialized: false
};
const passport = require("passport");
// const localStratagy = require("passport-local");
// const passfortFile = require("./signin/passport.js");
const authentication = require("./router/log-in.js");

// using of packages
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.set("view engine","ejs");
app.set("views",path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

// establishing connection of mysql2 
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "jobnest_db",
    password: "prince.9090DEV",
})
connection.connect((err) => {
    if (err) {
        console.log(err);
    } else {
        console.log("connected");
    }
});

// routes
// root route
app.get("/", (req, res) => {
    console.log("I am root");
})

app.use(session(sessionOption))
app.use(passport.initialize());
console.log("Passport initialized");
app.use(passport.session());
console.log("Passport session initialized");
// passport.use(new localStratagy)



app.use("/authentication", authentication);
app.use("/", candidate);
app.use("/", hr);

// show route
app.get("/show", (req, res) => {
    let q = "select * from candidate_data";
    // let q = "select * from hr_data";
    connection.query(q, (err, result) => {
        // let r = result[0];
        if(err){console.log(err);}
        res.send(result);
    })
})


// set up server
app.listen(8080, () => {
    // res.send("Port Listening at 8080");
    console.log("Port Listening at 8080");
})

// logout route
// app.get("/authentication/logout", (req, res) => {
//     console.log("logout");
//     res.render("authentication/logout.ejs");
    
// })


