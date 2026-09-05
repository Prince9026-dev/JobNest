const express = require("express");
const router = express.Router();
const mysql = require("mysql2");

// establishing connection of mysql2 
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "jobnest_db",
    password: "prince.9090DEV",
})


// profile route
router.get("/authentication/:id/student", (req, res) => {
    let {id} = req.params;
    let q = "select * from candidate_data where user_id=? ";
    connection.query(q, id, (err, r) => {
        if(err){console.log(err);}
        // console.log(r);
        let result = r[0];
        res.render("candidate_data/profile.ejs", {result});
    })
})


// student job search
router.get("/studentjobsearch/:id", (req, res) => {
    let {id} = req.params;
    console.log(id);
    let q = "select * from jobs";
    connection.query(q, (err, r) => {
        if(err) {console.log(err);}

        // console.log(r);
        res.render("candidate_data/lookjob.ejs", {r, id});
        // res.send("jobs are");
    })
})


// applying job route
router.get("/apply/:job_id/:user_id", (req, res) => {
    let {job_id, user_id} = req.params;
    console.log(job_id, user_id);
    let q = "select * from candidate_data where user_id=?";
    connection.query(q, user_id, (err, r) => {
        if(err){console.log(err);}
        console.log(r);
        let result = r[0];
        console.log(result);
        res.render("candidate_data/apply.ejs", {result, job_id});
    })
})
router.post("/applyed/:job_id/:user_id", (req, res) => {
    let {job_id, user_id} = req.params;
    // console.log(user_id, job_id);
    let {name, email, phone, resume} = req.body;
    // console.log(job_id,name, email, phone, resume, user_id);
    let data = [job_id, user_id,  resume, phone]
    let q = "insert into applications(user_id, job_id, resume, phone) values(?,?,?,?)";
    connection.query(q, data, (err, r) => {
        if(err){console.log(err);}
        // Find which HR owns this job
        let q2 = `SELECT hr_id FROM jobs WHERE job_id = ?`;
        connection.query(q2, [job_id], (err, result) => {
            if (err) {console.log("JOB SEARCH ERROR:", err);return res.status(500).send("Could not find HR");}
            if (result.length === 0) {return res.status(404).send("Job not found");}
            let hr_id = result[0].hr_id;
            console.log("Application submitted");
            console.log("Job ID:", job_id);
            console.log("HR ID:", hr_id);
            let q2 = "SELECT * FROM skills";
            connection.query(q2, (err, skills) => {
                if (err) {console.log("SKILLS FETCH ERROR:", err); return res.status(500).send("Database error");}
                console.log(skills);
                res.render("candidate_data/skills.ejs", {candidate_id: user_id, skills: skills});
            });
            // res.render("candidate_data/skills", {user_id});
        })
        // res.send("your application has been submitted");
    })
})

router.post("/candidate/:id/skills", (req, res) => {
    let candidate_id = req.params.id;
    let skills = req.body.skills;
    if (!skills) {return res.send("Please select at least one skill");}
    if (!Array.isArray(skills)) {skills = [skills];}
    let values = skills.map(skill_id => [candidate_id,skill_id]);
    let q = `INSERT INTO candidate_skills (user_id, skill_id) VALUES ?`;
    connection.query(q, [values], (err, result) => {
        if (err) {console.log("CANDIDATE SKILLS INSERT ERROR:", err);return res.status(500).send("Database error");}
        console.log("Skills saved successfully");
        // res.redirect(`/candidate/${candidate_id}`);
    });
});


// Status route for job 
router.get("/myapplications/:user_id", (req, res) => {
    let { user_id } = req.params;
    let q = `SELECT  applications.*, jobs.title FROM applications JOIN jobs ON applications.job_id = jobs.job_id WHERE applications.user_id = ?`;
    connection.query(q, [user_id], (err, result) => {
        if (err) {console.log("ERROR:", err);return res.status(500).send("Database error");}
        console.log(result);
        res.render("candidate_data/myapplication.ejs", {applications: result});
    });
});

module.exports = router ;
