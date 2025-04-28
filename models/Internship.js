const mongoose = require("mongoose");

const InternshipSchema = new mongoose.Schema({
    companyName: { type: String, required: true },
    position: { type: String, required: true },
    location: { type: String, required: true },
    duration: { type: String, required: true },
    stipend: { type: String },
    requirements: { type: String, required: true },
    description: { type: String, required: true },
    applyLink: { type: String, required: true },
    recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: "Recruiter", required: true }, // Linking to recruiter
    createdAt: { type: Date, default: Date.now },
});

const Internship = mongoose.model("Internship", InternshipSchema);
module.exports = Internship;
