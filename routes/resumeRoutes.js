const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

// Google Gemini AI Configuration
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// AI Function to Generate Resume
async function generateAIResume(userInput) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // Structured AI Prompt for better JSON output
        const prompt = `
        Generate a professional resume in JSON format with these fields:
        {
          "fullName": "String",
          "professionalSummary": "String",
          "skills": ["String"],
          "experience": [
            {
              "position": "String",
              "company": "String",
              "years": "String",
              "description": "String"
            }
          ],
          "education": [
            {
              "degree": "String",
              "institution": "String",
              "year": "String"
            }
          ],
          "projects": [
            {
              "title": "String",
              "description": "String"
            }
          ],
          "certifications": [
            {
              "name": "String",
              "institution": "String",
              "year": "String"
            }
          ],
          "contact": {
            "email": "String",
            "phone": "String",
            "linkedin": "String",
            "github": "String",
            "portfolio": "String"
          }
        }
        Here is the candidate's information:
        ${JSON.stringify(userInput)}
        Please return only valid JSON, without any extra formatting or markdown syntax.
        `;

        const result = await model.generateContent(prompt);
        let responseText = result.response.text().trim();

        // Remove Markdown artifacts if present
        responseText = responseText.replace(/```json|```/g, "").trim();

        // Parse AI response as JSON
        let resumeData;
        try {
            resumeData = JSON.parse(responseText);
        } catch (error) {
            console.error("Error parsing AI response:", error);
            throw new Error("AI response is not in valid JSON format.");
        }

        return resumeData;
    } catch (error) {
        console.error("Error generating AI resume:", error);
        throw error;
    }
}

// Render Resume Builder Page
router.get('/build-resume', (req, res) => {
    res.render('build-resume');
});

// Resume Generation Route
router.post("/generate", async (req, res) => {
    try {
        const aiGeneratedResume = await generateAIResume(req.body);

        // Render the interactive resume page with AI-generated data
        res.render("view-resume", { resume: aiGeneratedResume });
    } catch (err) {
        console.error("Resume generation error:", err);
        res.status(500).send("Error generating resume. Please try again.");
    }
});

module.exports = router;
