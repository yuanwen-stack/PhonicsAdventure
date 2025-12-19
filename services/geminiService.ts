
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Level, PhonicsItem } from "../types";
import { SYSTEM_INSTRUCTION } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getNextPhonicsItem(level: Level, previousWords: string[] = []): Promise<PhonicsItem> {
  const prompt = `Generate a new phonics target for Level ${level}. 
  Avoid these previous words: ${previousWords.join(', ')}.
  Level details:
  Level 1: Single letter sounds.
  Level 2: Word families like -at, -ip.
  Level 3: CVC words.
  Level 4: Blends/Digraphs.
  Level 5: Vowel teams/sentences.
  
  Return a JSON object with:
  - word (the target word or sound)
  - readingGuide (the whole word e.g. /kæt/)
  - phonemes (array of sounds, e.g. ["c", "a", "t"])
  - phonemeGuides (array of strings, one for each phoneme, e.g. ["/k/ as in kite", "/æ/ as in apple", "/t/ as in tiger"])
  - audioCue (instructions for the parent, e.g. "Say it like a sneaky mouse: /s/ /s/ /s/")
  - visualReward (description of a funny thing that happens)
  - congratulation (energetic praise)`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING },
          readingGuide: { type: Type.STRING },
          phonemes: { type: Type.ARRAY, items: { type: Type.STRING } },
          phonemeGuides: { type: Type.ARRAY, items: { type: Type.STRING } },
          audioCue: { type: Type.STRING },
          visualReward: { type: Type.STRING },
          congratulation: { type: Type.STRING },
        },
        required: ['word', 'readingGuide', 'phonemes', 'phonemeGuides', 'audioCue', 'visualReward', 'congratulation'],
      },
    },
  });

  return JSON.parse(response.text.trim());
}

export async function generateRewardImage(visualReward: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: `A vibrant, fun, high-energy, kid-friendly 3D cartoon illustration of: ${visualReward}. White background, professional character design, bright colors.`,
        },
      ],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
}

export async function generateTestQuestion(testIndex: number): Promise<{ word: string, guide: string, level: Level }> {
    const levels = [Level.LEVEL_1, Level.LEVEL_2, Level.LEVEL_3, Level.LEVEL_4, Level.LEVEL_5];
    const targetLevel = levels[Math.min(testIndex, levels.length - 1)];
    
    const prompt = `Generate a single word or sound to test if a child is at Level ${targetLevel}.
    Return JSON: { "word": "string", "guide": "/string/", "level": number }`;

    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
        },
    });

    return JSON.parse(response.text.trim());
}

export async function getSpeech(text: string, voice: string = 'Kore'): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voice },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("No audio data returned");
  return base64Audio;
}
