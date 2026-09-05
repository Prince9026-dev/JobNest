const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
// const flash = require("flash")

// establishing connection of mysql2 
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "jobnest_db",
    password: "prince.9090DEV",
})

// router.post("/login",(req, res) => {
//     console.log("in HR js file founding");
// })

router.get("/authentication/:id/hr", (req, res) => {
    const { id, role } = req.params;
    // console.log("ID:", id);
    // console.log("Role:", role);
    let q = "select * from hr_data where user_id=?";
    connection.query(q, [id], (err, reslt) => {

        console.log(reslt);
        if (err) {
            console.log("DATABASE ERROR:", err);
            return res.status(500).send("Database error");
        }
        let result = reslt[0];
        res.render("jobs/hr_profile.ejs", {result});
    })
    
})

// Accept application route
router.post("/application/:application_id/accept", (req, res) => {
    let { application_id } = req.params;
    let q = `UPDATE applications SET status = ? WHERE application_id = ?`;
    connection.query(q, ["Accepted", application_id], (err, result) => {
            if (err) {console.log("ACCEPT ERROR:", err);return res.status(500).send("Database error");}
            // res.redirect("back");
        }
    );
});

// Reject route
router.post("/application/:application_id/reject", (req, res) => {
    let { application_id } = req.params;
    let q = `UPDATE applications SET status = ? WHERE application_id = ?`;
    connection.query(q, ["Rejected", application_id], (err, result) => {
            if (err) {console.log("REJECT ERROR:", err); return res.status(500).send("Database error");}
            res.send("all done");
            // res.redirect("back");
        }
    );
});


// delete job route
router.delete("/authentication/:id", (req, res) => {
    let { id } = req.params;

    let q = "DELETE FROM jobs WHERE job_id = ?";

    connection.query(q, id, (err, result) => {
        if (err) {
            console.log("DELETE ERROR:", err);
            return res.status(500).send("Database error");
        }

        res.redirect("/authentication");
    });
});

// job edit route
router.get("/authentication/:id/edit", (req, res) => {
    // console.log("edit page");
    let {id} = req.params;
    let q = "select * from jobs where job_id=?";
    connection.query(q, id, (err, r) => {
        // console.log(r);
        if(err){console.log(err);}
        let result = r[0];
        res.render("jobs/editjob.ejs", {result});
    })
})
router.put("/authentication/:id", (req, res) => {
    let {id} = req.params;
    // console.log(id);
    let {title, description, skills, location, salary} = req.body;
    console.log(id, title, description, skills, location, salary);
    let q = `
    UPDATE jobs
    SET title = ?, description = ?, skills = ?, location = ?, salary = ? WHERE job_id = ? `;
    let data = [title, description, skills, location, salary, id];
    connection.query(q, data, (err, result) => {
        // console.log(result);
        if(err){console.log(err);}
        res.send("successfully updated");
    })  
})



// job posting route
router.get("/job/:id",(req, res) => {
    // console.log("job post page");
    let {id} = req.params;
    // console.log(id);

    let q = "SELECT * FROM skills";
    connection.query(q, (err, skills) => {
        if (err) {console.log("SKILLS FETCH ERROR:", err);return res.status(500).send("Database error");}
        res.render("jobs/jobposting.ejs", {id, skills});
    });
});

router.post("/job/:id",(req, res) => {
    let {id} =req.params;
    let {title, description,skills, location, salary} = req.body;
    console.log(title, description, location, salary, id);
     // If only one skill is selected
    if (!Array.isArray(skills)) {
        skills = [skills];
    }
    let data = [id, title, description, location, salary]
    let q = `insert into jobs(hr_id, title, description, location, salary) values(?,?,?,?,?)`;
    connection.query(q, data, (err, result) => {
        if(err){console.log(err);}
        // let job_id = result.insertId;
        // let job_id = Number(job_id);
        let job_id = result.insertId;
        console.log("New Job ID:", "j_id", job_id);
        let skillData = skills.map(skill_id => [job_id, skill_id]);
        // console.log(skillData);
        let q2 = `INSERT INTO job_skills (job_id, skill_id) VALUES ?`;
        connection.query(q2, [skillData], (err, result) => {
            if (err) {console.log("JOB SKILLS INSERT ERROR:", err);return res.status(500).send("Job skills insert error");}
            console.log("Job skills saved successfully");
            let q3 = "select * from jobs where hr_id=?";
            connection.query(q3, id, (err, job) => {
                if(err){console.log(err);}
                // console.log(job);
                res.render("jobs/showjobs.ejs", {job});
            })
        })
    })
})

// hr jobs looking route
router.get("/hrjob/:id", (req, res) => {
    let {id} = req.params;
    console.log(id);
    let q2 = "select * from jobs where hr_id=?";
        connection.query(q2, id, (err, job) => {
            if(err){
                console.log(err);
            }
            res.render("jobs/showjobs.ejs", {job});
        })
        
})

router.get("/hr/applications/:hr_id",(req, res) => {
    let {hr_id} = req.params;
    let q = `SELECT applications.*, jobs.title FROM applications JOIN jobs ON applications.job_id = jobs.job_id WHERE jobs.hr_id = ?`;
    connection.query(q, [hr_id], (err, result) => {
        if (err) {console.log("ERROR:", err);return res.status(500).send("Database error");}
        console.log(result);
        res.render("jobs/applications", {applications: result})
    })
})

router.post("/application/:application_id/analysis", (req, res) => {
    let { application_id } = req.params;
    console.log(application_id);
    // STEP 1: Get candidate + job from application
    let q1 = ` SELECT user_id, job_id, status FROM applications WHERE application_id = ?`;
    connection.query(q1, application_id, (err, applicationResult) => {
        console.log(applicationResult);
        if (err) { console.log("APPLICATION ERROR:", err); return res.status(500).send("Database error");}
        if (applicationResult.length === 0) { return res.status(404).send("Application not found");}
        let user_id = applicationResult[0].user_id;
        let job_id = applicationResult[0].job_id;
        let status = applicationResult[0].status;
        // STEP 2: Get candidate skills
        let q2 = ` SELECT skill_id FROM candidate_skills WHERE user_id = ?`;
        connection.query(q2, user_id, (err, candidateSkills) => {
            if (err) {console.log("CANDIDATE SKILLS ERROR:", err); return res.status(500).send("Database error");}
            // STEP 3: Get job skills
            let q3 = `SELECT skill_id FROM job_skills WHERE job_id = ?`;
            connection.query(q3, [job_id], (err, jobSkills) => {
                if (err) {console.log("JOB SKILLS ERROR:", err); return res.status(500).send("Database error");}
                // Convert database rows into arrays
                let candidateSkillIds =candidateSkills.map(row => row.skill_id);
                let jobSkillIds = jobSkills.map(row => row.skill_id);
                // STEP 4: Find matched skills
                let matchedSkills = jobSkillIds.filter(skill_id =>candidateSkillIds.includes(skill_id));
                // STEP 5: Find missing skills
                let missingSkills = jobSkillIds.filter(skill_id =>!candidateSkillIds.includes(skill_id));
                // STEP 6: Calculate match percentage
                let matchPercentage = 0;
                if (jobSkillIds.length > 0) {
                    matchPercentage = (matchedSkills.length / jobSkillIds.length) * 100;
                }
                // STEP 7: Get skill names
                let allSkillIds = [...new Set([...matchedSkills, ...missingSkills])];
                if (allSkillIds.length === 0) {
                    return res.render("jobs/analysis.ejs", {application_id, status, matchPercentage, matchedSkills: [],missingSkills: []    });
                }
                let q4 = ` SELECT skill_id, skill_name FROM skills WHERE skill_id IN (?)`;
                connection.query(q4, [allSkillIds], (err, skillRows) => {
                    if (err) {console.log("SKILL NAME ERROR:", err);return res.status(500).send("Database error");}
                    // Convert IDs to names
                    let matchedSkillNames = skillRows.filter(skill =>matchedSkills.includes(skill.skill_id));
                    let missingSkillNames = skillRows.filter(skill =>missingSkills.includes(skill.skill_id));
                    // STEP 8: Send everything to EJS
                    res.render("jobs/analysis.ejs", {application_id,status,matchPercentage:Math.round(matchPercentage),matchedSkills:matchedSkillNames,missingSkills:missingSkillNames
                    });
                });
            });
        });
    });
});

// logout route
router.get("/logout", (req, res, next) => {
    req.logOut((err) => {
        if(err){next(err);}
        console.log("logout succussfully");
        res.redirect("/authentication/login");
    })
})


module.exports = router;