const express = require("express");
const path = require("path");
const multer = require("multer");
const bodyParser = require("body-parser");
const resumeRoutes = require("./routes/resumeRoutes");
const connectDB = require('./utils/mainDB');
const userRoutes = require("./routes/userRoutes");
const recruiterRoutes = require("./routes/recruiterRoutes");
const internshipRoutes = require("./routes/internshipRoutes");
const session = require("express-session");

const app = express();
app.use(express.urlencoded({ extended: true }));
const PORT = 5000;

connectDB();
// Set EJS as the template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));
// Route to render the homepage
app.get("/", (req, res) => {
    res.render("index");
});

app.get("/user/login", (req, res) => {
  res.render("user-login");
});

app.get("/recruiter/login", (req, res) => {
  res.render("recruiter-login");
});


app.use("/user", userRoutes);
app.use("/resume", resumeRoutes);
app.use("/recruiter", recruiterRoutes);
app.use("/internship", internshipRoutes);

// Start the server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
