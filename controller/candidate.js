const connection = require("../db");
module.exports.filter = (req, res) => {
    let {skills} = req.query;
    let skillList = skills.split(",").map(skill => skill.trim());
    let q = `SELECT skill_id, skill_name FROM skills WHERE skill_name in (?)`;
    connection.query(q, [skillList], (err, result) => {
        if (err) {return res.send("Database error");}
        let skillIds = result.map(skill => skill.skill_id);
        // let jobQuery = `SELECT DISTINCT jobs.* FROM jobs JOIN job_skills ON jobs.job_id = job_skills.job_id WHERE job_skills.skill_id IN (?)`;
        // connection.query(jobQuery, [skillIds], (err, jobs) => {
        //     if (err) {console.log(err);return res.send("Database error");}
        //     console.log(jobs);
        //     res.render("candidate_data/lookjob.ejs", { r: jobs });
        // });
    });
}

// HR profile
module.exports.hrProfile = (req, res) => {
    const { id, role } = req.params;
    let q = "select * from hr_data where user_id=?";
    connection.query(q, [id], (err, reslt) => {
        console.log(reslt);
        if (err) {     return res.status(500).send("Database error");}
        let result = reslt[0];
        res.render("jobs/hr_profile.ejs", {result});
    })   
}

// profile
module.exports.profile = (req, res) => {
    let {id} = req.params;
    let q = "select * from candidate_data where user_id=? ";
    connection.query(q, id, (err, r) => {
        if(err){console.log(err);}
        let result = r[0];
        res.render("candidate_data/profile.ejs", {result});
    })
}
// search Job
module.exports.jobSearch = (req, res) => {
    let {id} = req.params;
    let q =  `SELECT jobs.job_id,jobs.title,jobs.description,jobs.location,jobs.salary,
    GROUP_CONCAT(skills.skill_name ORDER BY skills.skill_name ASC SEPARATOR ',') AS skill_names
    FROM jobs LEFT JOIN job_skills ON jobs.job_id = job_skills.job_id
    LEFT JOIN skills ON job_skills.skill_id = skills.skill_id GROUP BY jobs.job_id
`;
    connection.query(q, (err, r) => {
        if(err) {console.log(err);}
        let q2 = "select * from skills";
        connection.query(q2, (err, skills) => {
            if(err){res.send(err);}
            res.render("candidate_data/lookjob.ejs", {r, id, skills});
        })       
    })
}
// render apply job
module.exports.getApply = (req, res) => {
    let {job_id, user_id} = req.params;
    let q = "select * from candidate_data where user_id=?";
    connection.query(q, user_id, (err, r) => {
        if(err){console.log(err);}
        let result = r[0];
        res.render("candidate_data/apply.ejs", {result, job_id});
    })
}
// applyed job
module.exports.applyJob = (req, res) => {
    let {job_id, user_id} = req.params;
    let {phone} = req.body;
    // Uploaded resume comes from req.file 
    let resume = req.file ? req.file.path : null;
    let data = [job_id, user_id,  resume, phone]
    let q = "insert into applications(user_id, job_id, resume, phone) values(?,?,?,?)";
    connection.query(q, data, (err, r) => {
        if(err){console.log(err);}
        // Find which HR owns this job
        let q2 = `SELECT hr_id FROM jobs WHERE job_id = ?`;
        connection.query(q2, [user_id], (err, result) => {
            if (err) {return res.status(500).send("Could not find HR");}
            if (result.length === 0) {return res.status(404).send("Job not found");}
            let hr_id = result[0].hr_id;
            let q2 = "SELECT * FROM skills";
            connection.query(q2, (err, skills) => {
                if (err) {
                    return res.status(500).send("Database error");
                }
                res.render("candidate_data/skills.ejs", {candidate_id: job_id, skills: skills});
            });
        })
    })
}

// candidate skills
module.exports.candidateSkills = (req, res) => {
    let candidate_id = req.params.id;
    let skills = req.body.skills;
    if (!skills) {return res.send("Please select at least one skill");}
    if (!Array.isArray(skills)) {skills = [skills];}
    let values = skills.map(skill_id => [candidate_id,skill_id]);
    let q = `INSERT IGNORE INTO candidate_skills (user_id, skill_id) VALUES ?`;
    connection.query(q, [values], (err, result) => {
        if (err) {
            return res.status(500).send("Database error");
        }
        res.redirect("/studentjobsearch/:id");
    });
}

// application status
module.exports.applicationStatus = (req, res) => {
    let { user_id } = req.params;
    let q = `SELECT  applications.*, jobs.title FROM applications JOIN jobs ON applications.job_id = jobs.job_id WHERE applications.user_id = ?`;
    connection.query(q, [user_id], (err, result) => {
        if (err) {
            return res.status(500).send("Database error");
        }
        res.render("candidate_data/myapplication.ejs", {applications: result});
    });
}