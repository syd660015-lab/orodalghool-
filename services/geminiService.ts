
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, QuizQuestion } from "../types";

let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    verse: { type: Type.STRING },
    arudiWriting: { type: Type.STRING },
    meterName: { type: Type.STRING },
    tafilat: { 
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    scansion: { type: Type.STRING, description: "Representation using | for haraka and 0 for sukun" },
    explanation: { type: Type.STRING },
    isCorrect: { type: Type.BOOLEAN },
    errors: { 
      type: Type.ARRAY,
      items: { type: Type.STRING }
    }
  },
  required: ["meterName", "tafilat", "scansion", "isCorrect"]
};

const QUIZ_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          correctIndex: { type: Type.INTEGER },
          explanation: { type: Type.STRING }
        },
        required: ["question", "options", "correctIndex", "explanation"]
      }
    },
    tips: { type: Type.STRING, description: "نصيحة تعليمية أو بيت شعري (مفتاح البحر) يساعد على تذكر الوزن" }
  },
  required: ["questions", "tips"]
};

export const analyzeVerse = async (verse: string): Promise<AnalysisResult> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: `حلل البيت الشعري التالي عروضياً بالتفصيل: "${verse}". 
    يجب أن يتضمن التحليل: الكتابة العروضية، اسم البحر، التفعيلات، والتقطيع (الرموز |0).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: ANALYSIS_SCHEMA
    }
  });

  return JSON.parse(response.text);
};

export const generateQuiz = async (level: string): Promise<{ questions: QuizQuestion[], tips: string }> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `أنشئ 5 أسئلة اختيار من متعدد عن علم العروض العربي للمستوى: ${level}. أضف أيضاً نصيحة تعليمية أو مفتاحاً لأحد البحور الشعرية لتسهيل الحفظ. الأسئلة والنصيحة يجب أن تكون باللغة العربية الفصحى.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: QUIZ_SCHEMA
    }
  });

  return JSON.parse(response.text);
};

export const generateVerseOnMeter = async (prompt: string, meter: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: `اكتب بيتاً شعرياً واحداً عن "${prompt}" على بحر "${meter}". تأكد من صحة الوزن والقافية.`,
  });

  return response.text || "عذراً، لم أتمكن من توليد البيت.";
};

export const findRhymes = async (word: string): Promise<string[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `أوجد 15 كلمة عربية تنتهي بنفس قافية الكلمة: "${word}". أعد الكلمات فقط كقائمة مفصولة بفواصل، بدون نص إضافي أو شرح.`,
  });
  return response.text.split(/[,،\n]/).map(w => w.replace(/[^\u0600-\u06FF]/g, '').trim()).filter(w => w.length > 1);
};
