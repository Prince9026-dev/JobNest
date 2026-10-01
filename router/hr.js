const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
const fs = require("fs");
const { route } = require("./log-in");
// const flash = require("flash")
const connection = require("../db.js");
const hrController = require("../controller/hr.js");

router.get("/authentication/:id/hr", hrController.hrProfile);

// Accept application route
router.post("/application/:application_id/accept", hrController.accept);

// Reject route
router.post("/application/:application_id/reject", hrController.reject);

// delete job route
router.delete("/hrjob/:id", hrController.destroy);

// job edit route
router.get("/job/:id/edit", hrController.editGet);
router.put("/job/:id", hrController.editPut);

// job posting route
router.get("/job/:id", hrController.jobGet);
router.post("/job/:id", hrController.jobPost);

// add more skills 
router.get("/skills/add", hrController.skillsGet);
router.post("/skills/add", hrController.postSkills);

// hr jobs looking route
router.get("/hrjob/:id", hrController.hrJobs);

router.get("/hr/applications/:hr_id", hrController.application);

router.post("/application/:application_id/analysis", hrController.analysSkills);

// logout route
router.get("/logout", hrController.logout);


module.exports = router;