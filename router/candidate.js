const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});
const candidateController = require("../controller/candidate.js");
// establishing connection of mysql2 

router.get("/filter/job", candidateController.filter);
// profile route
router.get("/authentication/:id/student", candidateController.profile);

// student job search
router.get("/studentjobsearch/:id", candidateController.jobSearch);

// applying job route
router.get("/apply/:job_id/:user_id", candidateController.getApply);
router.post("/applyed/:job_id/:user_id", upload.single("resume"), candidateController.applyJob);

router.post("/candidate/:id/skills", candidateController.candidateSkills);

// Status route for job 
router.get("/myapplications/:user_id", candidateController.applicationStatus);

module.exports = router ;