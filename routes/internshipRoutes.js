const express = require("express");
const Internship = require("../models/Internship");
const { recruiterLoggedIn } = require("../middleware/recruiter"); // Middleware to check authentication

const router = express.Router();

// POST route to create an internship (Recruiter must be logged in)
router.post("/upload", recruiterLoggedIn, async (req, res) => {
  try {
      const { companyName, position, location, duration, stipend, requirements, description, applyLink } = req.body;
      
      // The recruiterId comes from the authenticated recruiter
      const recruiterId = req.session.recruiterId; 

      if (!recruiterId) {
          return res.status(401).json({ message: "Unauthorized: Recruiter not logged in" });
      }

      const newInternship = new Internship({
          companyName,
          position,
          location,
          duration,
          stipend,
          requirements,
          description,
          applyLink,
          recruiterId, // Storing recruiter ID
      });

      await newInternship.save();
      
      // Redirect to fetch and display all internships
      res.redirect("/internship/view-internship");
  } catch (error) {
      console.error("Error uploading internship:", error);
      res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/view-internship", async (req, res) => {
  try {
      const internships = await Internship.find(); // Fetch all internships from MongoDB

      if (!Array.isArray(internships)) {
          console.error("Expected internships to be an array, but got:", typeof internships);
      }

      res.render("view-internship", { internships });
  } catch (error) {
      console.error("Error fetching internships:", error);
      res.status(500).send("Server Error");
  }
});
// GET route to fetch all internships
router.get("/", async (req, res) => {
    try {
        const internships = await Internship.find().populate("recruiterId", "name email companyName");
        res.status(200).json(internships);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// GET route to fetch internships posted by a specific recruiter
router.get("/my-internships", recruiterLoggedIn, async (req, res) => {
    try {
        const recruiterId = req.session.recruiterId;
        if (!recruiterId) {
            return res.status(401).json({ message: "Unauthorized: Recruiter not logged in" });
        }

        const internships = await Internship.find({ recruiterId });
        res.status(200).json(internships);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;
