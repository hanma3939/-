
import { GoogleGenAI, Type } from "@google/genai";
import { VocalAnalysis } from "../types";

const GEN_AI_MODEL = "gemini-3-pro-preview";

export async function analyzeVocal(audioBase64: string, mimeType: string): Promise<VocalAnalysis> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `
    あなたは音声分析の専門家（ボイストレーナーおよび演技指導者）です。
    提供された音声を解析し、以下の2つの視点からプロフェッショナルなフィードバックを生成してください。

    1. 発声生理学の視点: 声帯の使い方、共鳴、滑舌、健康的側面を分析。
    2. 演技・表現の視点: 感情の込め方、キャラクター性、表現力を分析。

    【技術分析メトリクスの評価基準】
    - clarity（声の通り）: 雑味がなく、一音一音がはっきりと聴き手に届いているか。
    - resonance（声の響き）: 体の腔を使い、豊かな奥行きと倍音が含まれているか。
    - stability（発声の安定）: 息の支えが安定し、不要な震えや息漏れがないか。
    - diction（言葉のキレ）: 滑舌が良く、子音と母音が正確に発音されているか。

    【制約事項】
    - score: 0-100の総合評価。
    - genderRatio: 男性(masculine)と女性(feminine)の聞こえ方の比率（合計100になるように）。
    - 日本語で回答してください。
    - JSON以外のテキストは出力しないでください。
  `;

  const response = await ai.models.generateContent({
    model: GEN_AI_MODEL,
    contents: {
      parts: [
        { inlineData: { data: audioBase64, mimeType: mimeType } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          genderRatio: {
            type: Type.OBJECT,
            properties: {
              masculine: { type: Type.NUMBER },
              feminine: { type: Type.NUMBER }
            },
            required: ["masculine", "feminine"]
          },
          estimatedAge: { type: Type.STRING },
          technicalMetrics: {
            type: Type.OBJECT,
            properties: {
              clarity: { type: Type.NUMBER },
              resonance: { type: Type.NUMBER },
              stability: { type: Type.NUMBER },
              diction: { type: Type.NUMBER }
            },
            required: ["clarity", "resonance", "stability", "diction"]
          },
          vocalExpertFeedback: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              physiology: { type: Type.STRING },
              improvementPoints: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["summary", "physiology", "improvementPoints"]
          },
          actingExpertFeedback: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              expression: { type: Type.STRING },
              characterization: { type: Type.STRING }
            },
            required: ["summary", "expression", "characterization"]
          }
        },
        required: [
          "score", "genderRatio", "estimatedAge", "technicalMetrics", 
          "vocalExpertFeedback", "actingExpertFeedback"
        ]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("AI分析に失敗しました。");
  return JSON.parse(text) as VocalAnalysis;
}

export async function fileToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
