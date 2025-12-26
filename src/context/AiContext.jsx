// context/AiContext.jsx
import React, { createContext, useState } from "react";
import axios from "axios";

export const AiContext = createContext();

export const AiProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [activePrompt, setActivePrompt] = useState("");

  // 🌿 Main Function to Generate Response
  const fetchPlantationGuide = async (prompt) => {
    if (!prompt.trim()) return;

    // 🧹 Clear previous response before fetching new one
    setResponse("");
    setActivePrompt(prompt);
    setLoading(true);

   const fullPrompt = `
You are a plant care assistant. The user will provide either:

1️⃣ A plant name (e.g., “Rose”, “Tulsi”, “Tomato”)
2️⃣ A planting or gardening-related query such as:
   • how to grow / how to plant / plantation method
   • how to care, water schedule, fertilizer guide
   • issues like pests, yellow leaves, soil problems
   • seasonal planting questions
   • any question containing keywords like "grow", "plant", "plantation", "garden", "soil", "watering", "fertilizer", "seed", "leaf issue", etc.

🌿 Response Rules

✔ First check if the user input is related to *plants, gardening, plantation, growing, care, pests, watering, soil, fertilizer, etc.*  
✔ If *YES*, generate a helpful plant care or plantation guide according to the context.  
✔ If the input is *just a plant name, provide a beginner friendly **step-by-step plantation guide* for that plant.  
✔ If user asks a plant-related question (contains grow/plant/care etc), answer in detail using the formatted steps.  

❌ If input is *not related to plants or gardening*, respond with:  
"Please ask plant related question. For example: how to grow this plant? how to care? Plantation guide etc. Other topics are outside my domain. Thank you 🌿 Happy Gardening!"

🌼 Response Format (Must Follow)

🌿 Plant/Topic: [Insert plant name or topic]

🌳 Step 1: Selecting the Right Location
• Short and clear points related to the plant/query.

🌱 Step 2: Preparing the Soil
• Soil type, compost, fertilization suggestions.

🌸 Step 3: Planting the Seeds or Seedlings
• Depth, spacing, planting technique.

💧 Step 4: Watering
• How much & how often to water.

🌞 Step 5: Initial Care After Planting
• First week care, shade/sun handling, early observations.

🌻 Step 6: Ongoing Maintenance
• Fertilizer interval, pruning, pest control, long-term care tips.

Here is the user input: "${prompt}"
`;
    try {
      const res = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "openai/gpt-3.5-turbo",
          messages: [{ role: "user", content: fullPrompt }],
        },
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      setResponse(res.data.choices[0].message.content);
    } catch (err) {
      console.error(err);
      setResponse("❌ Error fetching data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AiContext.Provider
      value={{
        fetchPlantationGuide,
        response,
        setResponse,
        loading,
        activePrompt,
        setActivePrompt,
      }}
    >
      {children}
    </AiContext.Provider>
  );
};