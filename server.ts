/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Shared Gemini client
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }

  // API endpoint for Gemini site analysis
  app.post("/api/analyze-site", async (req, res) => {
    try {
      const { employees, activities, stockItems } = req.body;

      if (!ai) {
        return res.status(400).json({ 
          error: "Gemini API key is not configured in environment variables. Please configure GEMINI_API_KEY in the Secrets panel." 
        });
      }

      // Construct a detailed prompt for Gemini
      const prompt = `
You are an expert Construction Project Director and Safety Officer. Analyze the following real-time data from our construction site and provide a professional, highly actionable site assessment report.

### Live Worker Attendance
${JSON.stringify(employees, null, 2)}

### Daily Work Activities Log
${JSON.stringify(activities, null, 2)}

### Virtual Stock Room Inventory Status
${JSON.stringify(stockItems, null, 2)}

Your report MUST be concise, professional, and split into the following sections:
1. **Executive Summary**: A high-level overview of today's site performance, workforce utilization, and key focus areas.
2. **Operations & Productivity Assessment**: Identify which activities are progressing well, highlight the "Blocked" activities (especially the plumbing main riser block), and give clear, realistic suggestions on how the supervisor should re-route or coordinate trades to solve the bottleneck.
3. **Materials & Stock Alerts**: Note critical low-stock items that have fallen below their reorder level (e.g. Portland Cement, scaffold couplers, N95 masks) and warn of operational impacts if not replenished.
4. **Safety & Risk Mitigation**: Based on the active trades, weather, and tasks (welding, scaffold coupling, masonry facades), provide 3-4 specific on-site safety focus areas for the toolbox talk tomorrow.

Ensure the response is written in clean, engaging Markdown format. Avoid generic filler. Be direct and constructive.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      res.json({ analysis: response.text });
    } catch (error: any) {
      console.error("Error generating site analysis:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
