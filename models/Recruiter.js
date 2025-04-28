const mongoose = require("mongoose");

const recruiterSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: {
        data: Buffer,  // Store as Buffer
        contentType: String // Store MIME type (image/png, image/jpeg)
    },
    companyName: String,
    companyWebsite: String,
    companyAddress: String,
    companyIndustry: String,
    companyDescription: String,
    companyRegistrationNumber: String,
    linkedIn: String,
    businessEmail: String
}, { timestamps: true });

const Recruiter = mongoose.model("Recruiter", recruiterSchema);
module.exports = Recruiter;
