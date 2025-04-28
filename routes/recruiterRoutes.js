const express = require("express");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const Recruiter = require("../models/Recruiter");
const { recruiterLoggedIn } = require("../middleware/recruiter"); // Middleware to check authentication


const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // Store in memory as buffer

// ✅ Recruiter Registration Route
router.post("/register", upload.single("profilePicture"), async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        // Check if recruiter already exists
        const existingRecruiter = await Recruiter.findOne({ email });
        if (existingRecruiter) {
            return res.status(400).send("Recruiter already registered");
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save recruiter data
        const newRecruiter = new Recruiter({
            fullName,
            email,
            password: hashedPassword,
            profilePicture: {
                data: req.file.buffer,   // Store image buffer
                contentType: req.file.mimetype, // Store MIME type
            }
        });

        await newRecruiter.save();
        res.redirect("/recruiter/login"); // Redirect after successful registration
    } catch (error) {
        res.status(500).send("Error registering recruiter");
    }
});

// ✅ Recruiter Login Route
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const recruiter = await Recruiter.findOne({ email });

        if (!recruiter) {
            return res.status(400).send("Recruiter not found");
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, recruiter.password);
        if (!isMatch) {
            return res.status(400).send("Invalid credentials");
        }

        // Store recruiter ID in session
        req.session.recruiterId = recruiter._id;

        res.redirect("/recruiter/profile"); // Redirect to recruiter dashboard
    } catch (error) {
        res.status(500).send("Error logging in");
    }
});

router.get("/profile", async (req, res) => {
  if (!req.session.recruiterId) {
      return res.redirect("/recruiter/login"); // Redirect if not logged in
  }

  try {
      const recruiter = await Recruiter.findById(req.session.recruiterId);
      if (!recruiter) {
          return res.redirect("/recruiter/login");
      }

      res.render("recruiter-profile", { recruiter });
  } catch (error) {
      res.status(500).send("Error loading profile");
  }
});
router.get("/complete-recruiterprofile", async (req, res) => {
  try {
      const recruiterId = req.session.recruiterId;
      if (!recruiterId) return res.redirect("/login");

      const recruiter = await Recruiter.findById(recruiterId);
      res.render("complete-recruiterprofile", { recruiter }); // Render form with existing details
  } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
  }
});

router.post("/complete-recruiterprofile", async (req, res) => {
  try {
      if (!req.session.recruiterId) {
          return res.status(401).json({ message: "Unauthorized. Please log in." });
      }

      const { 
          companyName, 
          companyWebsite, 
          companyAddress, 
          companyIndustry, 
          companyDescription, 
          companyRegistrationNumber, 
          linkedIn, 
          businessEmail 
      } = req.body;

      // Find the recruiter by session ID
      let recruiter = await Recruiter.findById(req.session.recruiterId);

      if (!recruiter) {
          return res.status(404).json({ message: "Recruiter not found" });
      }

      // Update the recruiter's profile
      recruiter.companyName = companyName || recruiter.companyName;
      recruiter.companyWebsite = companyWebsite || recruiter.companyWebsite;
      recruiter.companyAddress = companyAddress || recruiter.companyAddress;
      recruiter.companyIndustry = companyIndustry || recruiter.companyIndustry;
      recruiter.companyDescription = companyDescription || recruiter.companyDescription;
      recruiter.companyRegistrationNumber = companyRegistrationNumber || recruiter.companyRegistrationNumber;
      recruiter.linkedIn = linkedIn || recruiter.linkedIn;
      recruiter.businessEmail = businessEmail || recruiter.businessEmail;

      // Save updated profile
      await recruiter.save();

      res.render('recruiter-profile', {recruiter} );

  } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Server error" });
  }
});

router.get("/create", recruiterLoggedIn, (req, res) => {
  res.render("create-internship"); // Render the EJS file
});

router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
      if (err) return res.status(500).json({ message: "Logout failed" });
      res.redirect('/');
  });
});

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
      if (err) {
          console.error("Logout Error:", err);
          return res.status(500).send("Server Error");
      }
      res.redirect("/");  // Redirect to login page after logout
  });
});
module.exports = router;
