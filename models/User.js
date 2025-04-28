const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: {
        data: Buffer,  // Store as Buffer
        contentType: String
    },
    resume: {  
        data: Buffer,  
        contentType: String  
    },
    completeProfile: {  
        phone: String,
        education: String,
        experience: String,
        activities: String,
        training: String,
        projects: String,
        skills: [String],  // Updated: Store skills as an array of strings
        portfolio: String,
        github: String,
        additional: String,
        updatedAt: { type: Date, default: Date.now }
    },
    internshipPreferences: {  // New: Store user preferences for internships
        preferredLocation: String,
        preferredStipendRange: {
            min: Number,
            max: Number
        },
        preferredDuration: String
    }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
module.exports = User;
