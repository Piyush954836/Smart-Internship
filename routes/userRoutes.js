const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();
const User = require("../models/User"); 
const Internship = require("../models/Internship");  // Import Internship model
const bcrypt = require("bcryptjs");

// Register Route
router.post("/register", upload.single("profilePicture"), async (req, res) => {
  try {
      const { fullName, email, password } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
          return res.render("user-login", { errorMessage: "User already exists", successMessage: null });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      let profilePicture = null;
      if (req.file) {
          profilePicture = {
              data: req.file.buffer,
              contentType: req.file.mimetype
          };
      }

      const newUser = new User({ fullName, email, password: hashedPassword, profilePicture });
      await newUser.save();

      return res.render("user-login", { successMessage: "Registration successful. Please login.", errorMessage: null });
  } catch (error) {
      console.error("Registration Error:", error);
      return res.render("user-login", { errorMessage: "Server error. Try again.", successMessage: null });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
          return res.status(400).json({ message: "Invalid email or password" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          return res.status(400).json({ message: "Invalid email or password" });
      }

      req.session.userId = user._id;
      res.redirect("/user/profile");

  } catch (error) {
      console.error("Login Error:", error); 
      res.status(500).json({ message: "Server Error" });
  }
});

// Profile Route
router.get("/profile", async (req, res) => {
  try {
      if (!req.session.userId) return res.redirect("/login");

      const user = await User.findById(req.session.userId);
      if (!user) return res.redirect("/login");

      res.render("user-profile", { user });

  } catch (error) {
      res.status(500).json({ message: "Server Error" });
  }
});

// Get Complete Profile Form
router.get("/complete-userprofile", async (req, res) => {
    try {
        if (!req.session.userId) return res.redirect("/login");

        const user = await User.findById(req.session.userId);
        res.render("complete-userprofile", { user });

    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

// Handle Profile Update with Internship Preferences
router.post("/complete-userprofile", async (req, res) => {
    try {
        const { phone, education, experience, activities, training, projects, skills, portfolio, github, additional, preferredLocation, preferredStipendMin, preferredStipendMax, preferredDuration } = req.body;
        const userId = req.session.userId;

        if (!userId) return res.status(401).send("Unauthorized: Please log in.");

        await User.findByIdAndUpdate(userId, {
            completeProfile: {
                phone,
                education,
                experience,
                activities,
                training,
                projects,
                skills: skills.split(","), // Convert comma-separated string to array
                portfolio,
                github,
                additional,
                updatedAt: new Date()
            },
            internshipPreferences: {
                preferredLocation,
                preferredStipendRange: { min: preferredStipendMin, max: preferredStipendMax },
                preferredDuration
            }
        });

        res.send("Profile updated successfully!");
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

// Internship Recommendation Route
router.get("/recommended-internships", async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.redirect("/login");  // Ensure user is logged in
        }

        // Fetch user details
        const user = await User.findById(userId);
        if (!user || !user.completeProfile) {
            return res.status(400).send("Please complete your profile to get recommendations.");
        }

        const { skills, location } = user.completeProfile;
        
        // Ensure skills is a string before splitting
        const skillArray = typeof skills === "string" 
            ? skills.split(",").map(skill => skill.trim().toLowerCase()) 
            : [];  // If skills is not a string, return an empty array

        // Fetch all internships from the database
        const allInternships = await Internship.find();

        // Filter internships based on skills & location
        const recommendedInternships = allInternships.filter(internship => {
            const internshipSkills = typeof internship.requirements === "string" 
                ? internship.requirements.split(",").map(req => req.trim().toLowerCase()) 
                : []; // Convert requirements to an array

            return (
                (internship.location === location) || 
                (skillArray.some(skill => internshipSkills.includes(skill))) // Match skills
            );
        });

        res.render("recommended-internship", { internships: recommendedInternships });
    } catch (error) {
        console.error("Error fetching recommended internships:", error);
        res.status(500).send("Server Error");
    }
});



// Resume Upload
router.post("/upload-resume", upload.single("resume"), async (req, res) => {
    try {
        if (!req.session.userId) return res.status(401).send("Unauthorized: Please log in.");
        if (!req.file) return res.status(400).send("No file uploaded.");

        await User.findByIdAndUpdate(req.session.userId, {
            resume: {
                data: req.file.buffer,
                contentType: req.file.mimetype
            }
        });

        res.send("Resume uploaded successfully!");
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

// Route to Download Resume
router.get("/download-resume", async (req, res) => {
    try {
        if (!req.session.userId) return res.status(401).send("Unauthorized: Please log in.");

        const user = await User.findById(req.session.userId);
        if (!user || !user.resume) return res.status(404).send("Resume not found.");

        res.set("Content-Type", user.resume.contentType);
        res.send(user.resume.data);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
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
