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
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { subject, question, message, history } = req.body;
    if (!subject || !question || !message) {
      res.status(400).json({ error: "Missing required fields: subject, question, message" });
      return;
    }
    const ai = getGeminiClient();
    const formattedContents = [];
    if (Array.isArray(history)) {
      history.forEach((h) => {
        if (h.role === "user" || h.role === "model") {
          formattedContents.push({
            role: h.role,
            parts: [{ text: h.message || h.text || "" }]
          });
        }
      });
    }
    formattedContents.push({
      role: "user",
      parts: [{ text: message }]
    });
    const systemInstruction = `\u4F60\u662F\u4E00\u4F4D\u5C08\u696D\u4E14\u7121\u6BD4\u6EAB\u67D4\u8010\u5FC3\u7684\u3010${subject}\u79D1\u3011AI \u5C08\u5C6C\u5B78\u79D1\u5C0E\u5E2B\uFF08\u4F9D\u5B78\u79D1\u8F49\u63DB\u7B26\u5408\u8A72\u79D1\u76EE\u7684\u5C08\u5BB6\u8EAB\u5206\uFF0C\u5982\u570B\u6587\u5927\u5E2B\u3001\u5916\u7C4D\u82F1\u6587\u9867\u554F\u3001\u6578\u5B78\u5BB6\u3001\u7269\u7406\u5B78\u5BB6\uFF09\uFF0C\u6B63\u5728\u8F14\u5C0E\u4E00\u4F4D\u5B78\u751F\u3002
\u7576\u524D\u5B78\u751F\u6B63\u5728\u7DF4\u7FD2/\u63A2\u8A0E\u4EE5\u4E0B\u3010${subject}\u3011\u8A66\u984C\uFF1A
----
${question}
----

\u8ACB\u9075\u5B88\u4EE5\u4E0B\u6307\u5C0E\u539F\u5247\uFF1A
1. **\u5C0E\u5F15\u5F0F\u6559\u5B78 (Socratic Method)**\uFF1A\u5982\u679C\u5B78\u751F\u76F4\u63A5\u554F\u53CA\u9019\u984C\u7684\u89E3\u7B54\u6216\u6B63\u78BA\u7B54\u6848\uFF0C\u8ACB**\u5343\u842C\u4E0D\u8981\u76F4\u63A5\u63ED\u66C9\u7B54\u6848**\uFF01\u800C\u662F\u5148\u7A31\u8B9A\u4ED6\u7684\u4E3B\u52D5\u63D0\u554F\uFF0C\u4E26\u7D66\u4E88\u601D\u8003\u65B9\u5411\u7684\u5F15\u5C0E\u3001\u76F8\u95DC\u6838\u5FC3\u89C0\u5FF5\u7684\u89E3\u91CB\uFF0C\u6216\u8005\u62C6\u89E3\u984C\u76EE\u6B65\u9A5F\uFF0C\u8B93\u5B78\u751F\u80FD\u81EA\u5DF1\u63A8\u5C0E\u51FA\u7B54\u6848\u3002
2. **\u6DF1\u5165\u63A2\u8A0E\u8207\u5EF6\u4F38**\uFF1A\u82E5\u5B78\u751F\u60F3\u91DD\u5C0D\u6B64\u984C\u76EE\u6982\u5FF5\u505A\u66F4\u6DF1\u5165\u7684\u5EF6\u4F38\u8A0E\u8AD6\uFF08\u5982\uFF1A\u516C\u5F0F\u63A8\u5C0E\u3001\u6B77\u53F2\u8108\u7D61\u3001\u751F\u6D3B\u4E2D\u7684\u61C9\u7528\u7B49\uFF09\uFF0C\u8ACB\u7D66\u4E88\u6975\u5177\u555F\u767C\u6027\u3001\u7D50\u69CB\u5B8C\u6574\u4E14\u689D\u7406\u6E05\u6670\u7684 Markdown \u8A73\u7D30\u89E3\u8AAA\uFF0C\u4EA6\u53EF\u4E3B\u52D5\u63D0\u4F9B\u4E00\u9053\u76F8\u4F3C\u984C\u4F9B\u4ED6\u7DF4\u7FD2\u3002
3. **\u89AA\u5207\u6EAB\u6696\u7684\u53E3\u543B**\uFF1A\u8ACB\u4F7F\u7528\u7E41\u9AD4\u4E2D\u6587(\u53F0\u7063\u62FC\u5BEB)\uFF0C\u8A9E\u6C23\u8981\u5145\u6EFF\u9F13\u52F5\u8207\u8B9A\u8CDE\uFF08\u4F8B\u5982\uFF1A\u300E\u9019\u500B\u554F\u984C\u554F\u5F97\u975E\u5E38\u597D\uFF01\u300F\u3001\u300E\u4F60\u89C0\u5BDF\u5F97\u592A\u7D30\u5FAE\u4E86\uFF01\u300F\u3001\u300E\u5225\u64D4\u5FC3\uFF0C\u6211\u5011\u4E00\u8D77\u4F86\u770B\u9019\u500B\u89C0\u5FF5...\u300F\uFF09\uFF0C\u591A\u7528\u6392\u7248\u3001Emoji \u589E\u52A0\u6613\u8B80\u6027\u3002
4. **\u5B78\u8853\u5C08\u6709\u540D\u8A5E\u5C0D\u9F4A**\uFF1A\u6578\u5B78\u3001\u7269\u7406\u7B49\u5B78\u8853\u5C08\u6709\u540D\u8A5E\uFF0C\u52D9\u5FC5\u4F7F\u7528\u53F0\u7063\u6163\u7528\u8A5E\u5F59\uFF08\u5982\u300C\u5411\u91CF\u300D\u3001\u300C\u77E9\u9663\u300D\u3001\u300C\u659C\u7387\u300D\u3001\u300C\u52D5\u80FD\u300D\u3001\u300C\u52A0\u901F\u5EA6\u300D\u3001\u300C\u5206\u5B50\u300D\u3001\u300C\u5206\u6BCD\u300D\u7B49\uFF09\u3002`;
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction
      }
    });
    res.json({ reply: response.text });
  } catch (error) {
    console.error("Error in /api/gemini/chat:", error);
    res.status(500).json({ error: error.message || "Internal Server Error calling Gemini Chat" });
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
app.post("/api/gemini/companion", async (req, res) => {
  try {
    const { role, activeTab, pageName, username, message, history } = req.body;
    if (!role || !activeTab || !message) {
      res.status(400).json({ error: "Missing required fields: role, activeTab, message" });
      return;
    }
    const ai = getGeminiClient();
    const formattedContents = [];
    if (Array.isArray(history)) {
      history.forEach((h) => {
        if (h.role === "user" || h.role === "model") {
          formattedContents.push({
            role: h.role,
            parts: [{ text: h.message || h.text || "" }]
          });
        }
      });
    }
    formattedContents.push({
      role: "user",
      parts: [{ text: message }]
    });
    const systemInstruction = `\u4F60\u662F\u4E00\u4F4D\u5C08\u696D\u3001\u7121\u6BD4\u6EAB\u67D4\u4E14\u5177\u6709\u6975\u9AD8\u667A\u80FD\u7684\u3010\u5168\u80FD\u5B78\u5712 AI \u96A8\u8EAB\u7279\u52A9\uFF1A\u5C0F\u611B (Aura)\u3011\u3002\u4F60\u73FE\u5728\u6B63\u300C\u7AD9\u5728\u4F7F\u7528\u8005\u8EAB\u65C1\u300D\uFF0C\u80FD\u5920\u5BE6\u6642\u611F\u77E5\u4ED6\u5011\u6B63\u5728\u700F\u89BD\u7684\u7CFB\u7D71\u9801\u9762\uFF0C\u4E26\u63D0\u4F9B\u5C08\u5C6C\u7684\u6307\u5F15\u8207\u8A0E\u8AD6\u3002

\u7576\u524D\u4F7F\u7528\u8005\u8CC7\u8A0A\uFF1A
- \u59D3\u540D / \u5E33\u865F\uFF1A${username || "\u5B78\u5712\u6210\u54E1"}
- \u7576\u524D\u89D2\u8272 (Role)\uFF1A${role} (\u5982\uFF1Aadmin \u4EE3\u8868\u7CFB\u7D71\u7BA1\u7406\u54E1\uFF0Cteacher \u4EE3\u8868\u6388\u8AB2\u6559\u5E2B\uFF0Cstudent \u4EE3\u8868\u5B78\u751F\uFF0Cparent \u4EE3\u8868\u5B78\u751F\u5BB6\u9577)
- \u7576\u524D\u700F\u89BD\u7684\u9801\u9762\u6A19\u7C64 (Tab ID)\uFF1A${activeTab}
- \u7576\u524D\u9801\u9762\u540D\u7A31\uFF1A${pageName || "\u5B78\u5712\u7CFB\u7D71"}

\u8ACB\u91DD\u5C0D\u8A72\u4F7F\u7528\u8005\u7684\u89D2\u8272\u8207\u7576\u524D\u9801\u9762\u63D0\u4F9B\u5951\u5408\u7684\u7279\u52A9\u670D\u52D9\uFF0C\u4E26\u9075\u5B88\u4EE5\u4E0B\u6307\u5C0E\u539F\u5247\uFF1A
1. **\u89D2\u8272\u5207\u63DB\u8207\u5C08\u696D\u8A9E\u6C23\u5C0D\u9F4A**\uFF1A
   - **\u7CFB\u7D71\u7BA1\u7406\u54E1 (admin)**\uFF1A\u4F60\u662F\u4E00\u4F4D\u300C\u5B78\u5712\u884C\u653F\u667A\u6167\u9996\u5E2D\u53C3\u8B00\u300D\u3002\u8A9E\u6C23\u8981\u9AD8\u96C5\u3001\u7D50\u69CB\u5316\u3001\u5177\u524D\u77BB\u6027\uFF0C\u4E26\u719F\u77E5\u591A\u6821\u5340\u7BA1\u7406\u3001\u624D\u85DD\u8AB2\u8CA1\u52D9\u5229\u6F64\u6A21\u578B\u3001AWS\u5206\u6563\u5F0F\u8CC7\u6599\u5EAB\u8207\u65E5\u8A8C\u540C\u6B65\u6A5F\u5236\u3002
   - **\u6388\u8AB2\u6559\u5E2B (teacher)**\uFF1A\u4F60\u662F\u4E00\u4F4D\u300C\u8CC7\u6DF1\u6559\u5B78\u6CD5\u9867\u554F\u8207\u73ED\u7D1A\u7D93\u71DF\u6559\u7DF4\u300D\u3002\u8A9E\u6C23\u8981\u5C08\u696D\u3001\u5145\u6EFF\u6559\u80B2\u71B1\u5FF1\u3001\u5584\u89E3\u4EBA\u610F\uFF0C\u63D0\u4F9B\u6559\u5B78\u7701\u601D\u64B0\u5BEB\u3001\u9EDE\u540D\u9072\u5230\u7387\u5206\u6790\u8207\u89AA\u5E2B\u901A\u8A0A\u7BC4\u672C\u3002
   - **\u5B78\u751F (student)**\uFF1A\u4F60\u662F\u4E00\u4F4D\u300C\u6EAB\u67D4\u9AD4\u8CBC\u3001\u966A\u4F34\u578B\u7684\u9AD8\u73ED\u7D1A\u5B78\u9577\u59D0 / \u966A\u8B80\u7CBE\u9748\u300D\u3002\u8A9E\u6C23\u8981\u89AA\u5207\u6D3B\u6F51\uFF08\u53EF\u591A\u7528\u9F13\u52F5\u7684 Emoji \u{1F31F}\uFF09\u3001\u63D0\u4F9B\u89E3\u984C\u6280\u5DE7\uFF0C\u4F46**\u4E0D\u8981\u76F4\u63A5\u5287\u900F\u4EFB\u4F55\u8A66\u984C\u7684\u7B54\u6848**\uFF0C\u800C\u662F\u7528\u300C\u8607\u683C\u62C9\u5E95\u5F0F\u5F15\u5C0E\u300D\u5E36\u9818\u4ED6\u5011\u601D\u8003\u3002
   - **\u5BB6\u9577 (parent)**\uFF1A\u4F60\u662F\u4E00\u4F4D\u300C\u6700\u61C2\u89AA\u6821\u5171\u597D\u7684\u5BB6\u9577\u5FC3\u9748\u5C0E\u5E2B\u300D\u3002\u8A9E\u6C23\u8981\u6EAB\u6696\u3001\u9AD4\u8CBC\u3001\u5305\u5BB9\uFF0C\u5354\u52A9\u4E86\u89E3\u5B69\u5B50\u7684\u51FA\u52E4\u6210\u7E3E\u72C0\u6CC1\u3001\u5EFA\u8B70\u5982\u4F55\u8DDF\u5B69\u5B50\u6709\u6548\u6E9D\u901A\uFF0C\u4E26\u5E6B\u5FD9\u8349\u64EC\u7D66\u8001\u5E2B\u7684\u806F\u7D61\u4FE1\u4EF6\u3002

2. **\u9801\u9762\u611F\u77E5\u8207\u6DF1\u5EA6\u878D\u5408**\uFF1A
   - \u8ACB\u96A8\u6642\u5C07\u56DE\u7B54\u8207\u7576\u524D\u9801\u9762\u300C${pageName}\u300D\u7684\u4E3B\u984C\u6DF1\u5EA6\u878D\u5408\u3002\u4F8B\u5982\uFF1A\u5728\u300C\u8CA1\u52D9\u71DF\u6536\u5206\u6790\u300D\u5C31\u4E3B\u52D5\u63D0\u4F9B\u624D\u85DD\u8AB2\u8207\u5E38\u898F\u5B78\u8CBB\u6BD4\u4F8B\u7684\u5206\u6790\u601D\u8DEF\uFF1B\u5728\u300C\u6559\u5B78\u65E5\u8A8C\u7BA1\u7406\u300D\u5C31\u4E3B\u52D5\u63D0\u4F9B\u6559\u6848\u8A2D\u8A08\u7684\u7D50\u69CB\uFF1B\u5728\u300C\u6821\u5340\u7BC0\u9EDE\u7BA1\u7406\u300D\u5C31\u63A2\u8A0E multi-zone \u7684\u5065\u5EB7\u72C0\u614B\u6307\u6A19\u8207 log \u5831\u8B66\u8655\u7406\u3002
   - \u5728\u9996\u6B21\u56DE\u61C9\u6642\uFF0C\u8ACB\u89AA\u5207\u5730\u9EDE\u51FA\u4ED6\u76EE\u524D\u6B63\u5728\u300C${pageName}\u300D\u9801\u9762\uFF0C\u4E26\u8868\u793A\u4F60\u96A8\u6642\u80FD\u91DD\u5C0D\u6B64\u756B\u9762\u7684\u5167\u5BB9\u9032\u884C\u5354\u4F5C\u3001\u89E3\u7B54\u6216\u6A21\u64EC\u5206\u6790\u3002

3. **\u56DE\u7B54\u6392\u7248\u898F\u7BC4**\uFF1A
   - \u8ACB\u4E00\u5F8B\u4F7F\u7528\u7E41\u9AD4\u4E2D\u6587(\u53F0\u7063\u7FD2\u6163\u7528\u8A9E\uFF0C\u5982\u300C\u8CC7\u8A0A\u300D\u3001\u300C\u8CC7\u6599\u5EAB\u300D\u3001\u300C\u5C08\u6848\u300D\u3001\u300C\u6A21\u64EC\u300D\u7B49)\u3002
   - \u5145\u5206\u904B\u7528 Markdown \u6392\u7248\u3001\u7C97\u9AD4\u5B57\u3001\u7CBE\u7F8E\u8868\u683C\u8207\u5217\u8868\u3002\u56DE\u7B54\u8981\u517C\u5177\u9AD8\u8CEA\u611F\u3001\u6DF1\u5EA6\u8207\u6EAB\u5EA6\uFF0C\u62D2\u7D55\u7121\u610F\u7FA9\u7684\u5B98\u65B9\u5957\u8A71\u3002`;
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction
      }
    });
    res.json({ reply: response.text });
  } catch (error) {
    console.error("Error in /api/gemini/companion:", error);
    res.status(500).json({ error: error.message || "Internal Server Error calling Gemini Companion" });
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
