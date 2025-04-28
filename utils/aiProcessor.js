const axios = require("axios");

async function generateEnhancedResume(data) {
    const prompt = `Enhance the resume:\nSummary: ${data.summary}\nSkills: ${data.skills}`;

    const response = await axios.post("https://api.openai.com/v1/completions", {
        model: "gpt-4",
        prompt: prompt,
        max_tokens: 300,
    }, { headers: { "Authorization": `Bearer ${process.env.OPENAI_API_KEY}` } });

    return {
        name: data.name,
        email: data.email,
        summary: response.data.choices[0].text.trim(),
        skills: data.skills
    };
}

module.exports = { generateEnhancedResume };
