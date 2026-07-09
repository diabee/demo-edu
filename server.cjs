var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_url = require("url");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
var import_meta = {};
import_dotenv.default.config();
var __filename = (0, import_url.fileURLToPath)(import_meta.url);
var __dirname = import_path.default.dirname(__filename);
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
var aiInstance = null;
function getGeminiClient() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing. Please configure it in your Secrets settings.");
    }
    aiInstance = new import_genai.GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiInstance;
}
app.post("/api/gemini/analyze", async (req, res) => {
  try {
    const { question, answer } = req.body;
    if (!question || !answer) {
      res.status(400).json({ error: "Missing required fields: question, answer" });
      return;
    }
    const ai = getGeminiClient();
    const prompt = `\u8ACB\u5206\u6790\u4EE5\u4E0B\u5B78\u751F\u7684\u4F5C\u7B54\u5167\u5BB9\uFF0C\u63D0\u4F9B\u56DE\u994B\u8207\u5B78\u7FD2\u5EFA\u8B70\u3002\u8ACB\u52D9\u5FC5\u4F7F\u7528\u7E41\u9AD4\u4E2D\u6587(\u53F0\u7063\u62FC\u5BEB)\u56DE\u8986\u3002
\u984C\u76EE\uFF1A
${question}

\u5B78\u751F\u56DE\u7B54\uFF1A
${answer}

\u8ACB\u4EE5\u6E05\u6670\u7684\u7D50\u69CB\uFF08Markdown \u683C\u5F0F\uFF09\u63D0\u4F9B\uFF1A
1. \u3010\u7B54\u6848\u6B63\u78BA\u6027\u8A55\u4F30\u3011\uFF1A\u76F4\u63A5\u6307\u51FA\u56DE\u7B54\u662F\u5426\u6B63\u78BA\u6216\u7B26\u5408\u984C\u610F\u3002
2. \u3010\u6838\u5FC3\u6982\u5FF5\u89E3\u6790\u3011\uFF1A\u6307\u51FA\u5B78\u751F\u56DE\u7B54\u4E2D\u7684\u4EAE\u9EDE\u6216\u6982\u5FF5\u4E0A\u7684\u76F2\u9EDE\u3001\u8AA4\u89E3\u3002
3. \u3010AI \u5B78\u7FD2\u5EFA\u8B70\u8207\u52A0\u5F37\u3011\uFF1A\u7D66\u4E88\u5B78\u751F\u5177\u9AD4\u3001\u89AA\u5207\u7684\u5F15\u5C0E\uFF0C\u5982\u4F55\u88DC\u5F37\u6B64\u6982\u5FF5\u6216\u66F4\u5B8C\u6574\u5730\u89E3\u7B54\u9019\u985E\u984C\u76EE\u3002`;
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt
    });
    res.json({ analysis: response.text });
  } catch (error) {
    console.error("Error in /api/gemini/analyze:", error);
    res.status(500).json({ error: error.message || "Internal Server Error calling Gemini" });
  }
});
app.post("/api/gemini/generate-questions", async (req, res) => {
  try {
    const { subject, topic, difficulty, count } = req.body;
    if (!subject || !topic || !difficulty) {
      res.status(400).json({ error: "Missing required fields: subject, topic, difficulty" });
      return;
    }
    const questionCount = Math.min(Math.max(Number(count) || 3, 1), 10);
    const ai = getGeminiClient();
    const prompt = `\u4F60\u662F\u4E00\u4F4D\u5C08\u696D\u4E14\u89AA\u5207\u7684\u5B78\u6821\u6559\u5E2B\u3002\u8ACB\u6839\u64DA\u4EE5\u4E0B\u8A2D\u5B9A\u751F\u6210 ${questionCount} \u984C\u55AE\u9078\u64C7\u984C\uFF0C\u4E26\u63D0\u4F9B\u8A73\u7D30\u7684\u984C\u76EE\u89E3\u6790\u8207\u8AAA\u660E\u3002\u8ACB\u52D9\u5FC5\u4F7F\u7528\u7E41\u9AD4\u4E2D\u6587(\u53F0\u7063\u62FC\u5BEB)\u7DE8\u5BEB\u3002

\u8A2D\u5B9A\u689D\u4EF6\uFF1A
- \u79D1\u76EE\uFF1A${subject}
- \u5B78\u7FD2\u55AE\u5143/\u4E3B\u984C\uFF1A${topic}
- \u96E3\u6613\u5EA6\uFF1A${difficulty} (\u5982\uFF1A\u6613\u3001\u4E2D\u3001\u96E3)`;
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.ARRAY,
          items: {
            type: import_genai.Type.OBJECT,
            properties: {
              id: { type: import_genai.Type.INTEGER, description: "\u984C\u865F\uFF0C\u5F9E1\u958B\u59CB\u7D2F\u52A0" },
              question: { type: import_genai.Type.STRING, description: "\u984C\u76EE\u6558\u8FF0" },
              options: {
                type: import_genai.Type.ARRAY,
                items: { type: import_genai.Type.STRING },
                description: "4\u500B\u55AE\u9078\u984C\u9078\u9805\uFF0C\u683C\u5F0F\u70BA A.xx, B.xx, C.xx, D.xx"
              },
              answer: { type: import_genai.Type.STRING, description: "\u6B63\u78BA\u7B54\u6848\u9078\u9805\u6A19\u7C64\uFF0C\u5FC5\u9808\u70BA A, B, C \u6216 D" },
              explanation: { type: import_genai.Type.STRING, description: "\u8A73\u7D30\u7684\u984C\u76EE\u89C0\u5FF5\u89E3\u6790\u8207\u6B63\u78BA\u89E3\u7B54\u8AAA\u660E" }
            },
            required: ["id", "question", "options", "answer", "explanation"]
          }
        }
      }
    });
    const text = response.text || "[]";
    res.json({ questions: JSON.parse(text) });
  } catch (error) {
    console.error("Error in /api/gemini/generate-questions:", error);
    res.status(500).json({ error: error.message || "Internal Server Error calling Gemini" });
  }
});
async function initServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(__dirname, "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
initServer().catch((err) => {
  console.error("Server startup error:", err);
});
//# sourceMappingURL=server.cjs.map
