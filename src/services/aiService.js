const OpenAI = require("openai");

const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
});

class AIService {
    async generateResponse(userMessage, chatHistory = []) {
        try {
            const messages = [
                {
                    role: "system",
                    content: `Ти — лаконічний AI-ментор TechIndustry. 
                    Допомагай ТІЛЬКИ з IT (JS, Python, React). 
                    Відповіді мають бути короткими (до 3 речень) та структурованими. 
                    Використовуй українську мову.`
                },
                ...chatHistory.map(msg => ({
                    role: msg.role === 'model' ? 'assistant' : 'user',
                    content: msg.parts[0].text
                })),
                { role: "user", content: userMessage }
            ];

            const completion = await groq.chat.completions.create({
                messages: messages,
                model: "llama-3.3-70b-versatile",
                temperature: 0.5,
                max_tokens: 300
            });

            return completion.choices[0].message.content;
        } catch (error) {
            console.error("Groq Error:", error);
            throw error;
        }
    }
}

module.exports = new AIService();