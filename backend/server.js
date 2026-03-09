import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import fs from "fs";
import PDFParser from "pdf2json";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());

const upload = multer({ dest: "uploads/" });

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

app.get("/", (req, res) => {
  res.send("AI Resume Analyzer API is running");
});

function extractTextFromPDF(filePath) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));

    pdfParser.on("pdfParser_dataReady", pdfData => {
      const pages = pdfData.Pages;
      let text = "";

      pages.forEach(page => {
        page.Texts.forEach(t => {
          t.R.forEach(r => {
            text += decodeURIComponent(r.T) + " ";
          });
        });
      });

      resolve(text);
    });

    pdfParser.loadPDF(filePath);
  });
}

app.post("/analyze", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const resumeText = await extractTextFromPDF(req.file.path);

    const prompt = `
You are a professional recruiter.

Analyze this resume and provide:
ATS Score:
1. Strengths
2. Weaknesses
3. Suggestions for improvement

Resume:
${resumeText.slice(0, 4000)}
`;

    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }]
    });

    res.json({
      result: response.choices[0].message.content
    });

    if (req.file) fs.unlink(req.file.path, () => {});

  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Resume analysis failed" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
