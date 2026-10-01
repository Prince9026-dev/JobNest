const connection = require("../db");
// HR profile
module.exports.hrProfile = (req, res) => {
    const { id, role } = req.params;
    let q = "select * from hr_data where user_id=?";
    connection.query(q, [id], (err, reslt) => {
        if (err) {
            return res.status(500).send("Database error");
        }
        let result = reslt[0];
        res.render("jobs/hr_profile.ejs", {result});
    })   
}

// Accept application
module.exports.accept = (req, res) => {
    let { application_id } = req.params;
    let q = `UPDATE applications SET status = ? WHERE application_id = ?`;
    connection.query(q, ["Accepted", application_id], (err, result) => {
        if (err) {console.log("ACCEPT ERROR:", err);return res.status(500).send("Database error");}
        res.redirect("/hr/applications/:application_id");
    });
}

// Reject application
module.exports.reject = (req, res) => {
    let { application_id } = req.params;
    let q = `UPDATE applications SET status = ? WHERE application_id = ?`;
    connection.query(q, ["Rejected", application_id], (err, result) => {
        if (err) {console.log("REJECT ERROR:", err); return res.status(500).send("Database error");}
        res.redirect("/hr/applications/:application_id");
    });
}

// delete job
module.exports.destroy = (req, res) => {
    let { id } = req.params;
    let q = "DELETE FROM jobs WHERE job_id = ?";
    connection.query(q, id, (err, result) => {
        if (err) {
            return res.status(500).send("Database error");
        }
        res.redirect("/hrjob/id");
    });
}

// render Edit page
module.exports.editGet = (req, res) => {
    let {id} = req.params;
    let q = "select * from jobs where job_id=?";
    connection.query(q, id, (err, jobResult) => {
        let q2 = "select * from skills";
        connection.query(q2, (err, skills) => {
            if(err){console.log(err);}
            let jobSkillQuery = `SELECT skill_id FROM job_skills WHERE job_id = ?`;
            connection.query(jobSkillQuery, [id], (err, jobSkills) => {
                if (err) {console.log(err);return res.send("Database error");}
                let selectedSkills = jobSkills.map(skill => skill.skill_id);
                res.render("jobs/editjob.ejs", {result: jobResult[0],skills: skills,selectedSkills: selectedSkills});
            })
        })
    })
}

// Edited
module.exports.editPut = (req, res) => {
    let {id} = req.params;
    let {title, description, location, salary} = req.body;
    let q = `UPDATE jobs SET title = ?, description = ?, location = ?, salary = ? WHERE job_id = ? `;
    let data = [title, description, location, salary, id];
    connection.query(q, data, (err, result) => {
        if(err){console.log(err);}
        // res.send("edited");
        let skills = req.body.skills || [];
        if (!Array.isArray(skills)) {
            skills = [skills];
        }
        connection.query("DELETE FROM job_skills WHERE job_id=?",[id],(err) => {
            if (err) {console.log(err);return res.send("Error deleting old skills");}
            if (skills.length === 0) {return res.redirect(`/job/${id}`);}
            let skillData = skills.map(skill_id => [id, skill_id]);
            let q2 = `INSERT INTO job_skills (job_id, skill_id)VALUES ?`;
            connection.query(q2, [skillData], (err) => {
                if (err) {console.log(err);return res.send("Error updating skills");}
                res.redirect(`/job/${id}`);
            });
        });
    })  
}

// render job
module.exports.jobGet = (req, res) => {
    let {id} = req.params;
    let q = "SELECT * FROM skills";
    connection.query(q, (err, skills) => {
        if (err) {console.log("SKILLS FETCH ERROR:", err);return res.status(500).send("Database error");}
        res.render("jobs/jobposting.ejs", {id, skills});
    });
}

// post job
module.exports.jobPost = (req, res) => {
    let {id} =req.params;
    let {title, description,skills, location, salary} = req.body;
    // console.log(title, description, location, salary, id);
    if (!Array.isArray(skills)) {    skills = [skills];}
    let data = [id, title, description, location, salary]
    let q = `insert into jobs(hr_id, title, description, location, salary) values(?,?,?,?,?)`;
    connection.query(q, data, (err, result) => {
        if(err){console.log(err);}
        let job_id = result.insertId;
        // console.log("New Job ID:", "j_id", job_id);
        let skillData = skills.map(skill_id => [job_id, skill_id]);
        let q2 = `INSERT INTO job_skills (job_id, skill_id) VALUES ?`;
        connection.query(q2, [skillData], (err, result) => {
            if (err) {console.log("JOB SKILLS INSERT ERROR:", err);return res.status(500).send("Job skills insert error");}
            let q3 = "select * from jobs where hr_id=?";
            connection.query(q3, id, (err, r) => {
                if(err){console.log(err);}
                res.render("jobs/showjobs.ejs", {r});
            })
        })
    })
}

// render skill 
module.exports.skillsGet = (req, res) => {
    let {hr_id} = req.params;
    console.log("render skil add page");
    res.render("jobs/addskills.ejs", {hr_id});
}

// post skills
module.exports.postSkills = (req, res) => {
    let skill = req.body.skill_name;
    let q = "insert into skills(skill_name) value (?)";
    connection.query(q, [skill], (err, result) => {
        if(err){
            return res.status(500).send("skills");
        }
        res.redirect("/skills/add");
    })
}

// hr JOb
module.exports.hrJobs = (req, res) => {
    let {id} = req.params;
    let q2 = "select * from jobs where hr_id=?";
    connection.query(q2, id, (err, r) => {
        if(err){console.log(err);}
        res.render("jobs/showjobs.ejs", {r});
    })  
}

// application
module.exports.application = (req, res) => {
    let {hr_id} = req.params;
    let q = `SELECT applications.*, jobs.title FROM applications JOIN jobs ON applications.job_id = jobs.job_id WHERE jobs.hr_id = ?`;
    connection.query(q, [hr_id], (err, result) => {
        if (err) {console.log("ERROR:", err);return res.status(500).send("Database error");}
        res.render("jobs/applications", {applications: result})
    })
}

// skills analysis
module.exports.analysSkills = (req, res) => {
    let { application_id } = req.params;
    // STEP 1: Get candidate + job from application
    let q1 = ` SELECT user_id, job_id, status FROM applications WHERE application_id = ?`;
    connection.query(q1, application_id, (err, applicationResult) => {
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
}

// logout
module.exports.logout = (req, res, next) => {
    req.logOut((err) => {
        if(err){next(err);}
        res.redirect("/authentication/login");
    })
}