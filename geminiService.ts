import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

/**
 * Parses a convention document (image) to extract training details and participant list.
 */
export const parseConventionDocument = async (base64Image: string, mimeType: string): Promise<AIAnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: "Analyse ce document de convention de formation. Extrait le nom de l'entreprise cliente : aide-toi du numéro de SIRET présent sur le document pour identifier la bonne société juridique et ne pas confondre avec l'organisme de formation (DFM). Extrait également le sujet/nom de la formation, les dates (format YYYY-MM-DD IMPERATIF, ex: 2023-10-27), et la liste des participants (nom, email fictif si absent, et role/poste si présent). Si la formation dure plusieurs jours, retourne toutes les dates dans le tableau.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            companyName: { type: Type.STRING },
            trainingName: { type: Type.STRING },
            dates: { 
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Liste des dates au format YYYY-MM-DD"
            },
            participants: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  email: { type: Type.STRING },
                  role: { type: Type.STRING },
                },
              },
            },
          },
          required: ["companyName", "trainingName", "dates", "participants"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as AIAnalysisResult;
    }
    throw new Error("No data returned from AI");
  } catch (error) {
    console.error("Error parsing convention:", error);
    throw error;
  }
};

/**
 * Generates learning objectives for the certificate based on the training topic.
 */
export const generateTrainingObjectives = async (trainingName: string): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Génère une liste de 4 objectifs pédagogiques concis (bullet points) pour une attestation de formation intitulée : "${trainingName}". Réponds uniquement avec un tableau JSON de chaînes de caractères.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    
    if (response.text) {
        return JSON.parse(response.text) as string[];
    }
    return [
        "Comprendre les fondamentaux du sujet",
        "Maîtriser les outils principaux",
        "Appliquer les connaissances en situation réelle",
        "Évaluer les risques et opportunités"
    ];
  } catch (error) {
    console.error("Error generating objectives:", error);
    return [
        "Acquérir les compétences clés liées à la formation",
        "Comprendre les enjeux théoriques et pratiques",
        "Mettre en œuvre les stratégies apprises",
        "Autonomie sur les outils présentés"
    ];
  }
};