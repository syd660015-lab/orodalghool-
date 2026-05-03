
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
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `أنت خبير في العروض والشعر العربي. قم بتحليل البيت التالي عروضياً بدقة تامة: "${verse}". 
      المطلوب:
      1. الكتابة العروضية الصحيحة.
      2. التقطيع العروضي (التفعيلات).
      3. تحديد البحر الشعري.
      4. توفير الرموز العروضية (scansion) باستخدام | للحركة و 0 للسكون.
      
      يجب أن تكون النتيجة بتنسيق JSON مطابق للمخطط المحدد.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: ANALYSIS_SCHEMA
      }
    });

    if (!response.text) {
      throw new Error("لم يتم تلقي استجابة من الذكاء الاصطناعي");
    }

    return JSON.parse(response.text);
  } catch (error: any) {
    console.error("Error analyzing verse:", error);
    if (error.message?.includes("429")) {
      throw new Error("الخدمة مزدحمة حالياً، حاول مرة أخرى بعد قليل.");
    }
    throw new Error("حدث خطأ أثناء تحليل البيت. تأكد من إعداد المفتاح بشكل صحيح.");
  }
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
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `أنت شاعر خبير ومتمكن من علم العروض العربي. اكتب بيتاً شعرياً واحداً (صدر وعجز) عن موضوع: "${prompt}" على بحر "${meter}". 
      يجب أن يكون البيت موزوناً بدقة تامة على تفعيلات البحر المذكور، مع مراعاة القافية والجزالة اللغوية.
      أعد البيت الشعري فقط، بدون أي شرح، مقدمات، أو خاتمة.`,
    });

    if (!response.text) {
      throw new Error("لم يتم تلقي استجابة من الذكاء الاصطناعي");
    }

    return response.text.trim();
  } catch (error: any) {
    console.error("Error generating verse:", error);
    if (error.message?.includes("429")) {
      throw new Error("الخدمة مزدحمة حالياً، حاول مرة أخرى بعد قليل.");
    }
    throw new Error("فشل توليد البيت. تأكد من صحة الموضوع والبحر المختار.");
  }
};

export const findRhymes = async (word: string): Promise<string[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `أوجد 15 كلمة عربية تنتهي بنفس قافية الكلمة: "${word}". أعد الكلمات فقط كقائمة مفصولة بفواصل، بدون نص إضافي أو شرح.`,
  });
  return response.text.split(/[,،\n]/).map(w => w.replace(/[^\u0600-\u06FF]/g, '').trim()).filter(w => w.length > 1);
};
