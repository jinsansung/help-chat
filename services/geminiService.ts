import { GoogleGenAI } from "@google/genai";
import { getMarkdown } from "./firebase";

// Ensure the API key is available. In a real app, this should be handled more securely.
if (!process.env.API_KEY) {
  // This is a client-side app, so we can't use process.env directly without a build tool.
  // For this example, we'll alert the user. A real app should use a backend proxy.
  console.error("API_KEY is not set. Please provide it for the Gemini API.");
  // alert("Gemini API Key is not configured. The chatbot will not work.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || " " });

export const getChatbotResponse = async (userQuestion: string): Promise<string> => {
  try {
    const knowledgeBase = await getMarkdown();

    if (!knowledgeBase) {
      return "죄송합니다, 아직 지식 베이스가 준비되지 않았어요. 관리자가 관련 정보를 업로드해야 합니다.";
    }
    
    const model = 'gemini-2.5-flash';
    
    const systemInstruction = `당신은 '생활백서봇'이며, 사용자를 돕는 것을 좋아하는 친절한 안내원입니다. 당신의 성격은 밝고, 예의 바르며, 언제나 기꺼이 돕고자 합니다.

**가장 중요한 목표:** 사용자의 질문에 대해 주어진 "지식 베이스" 내용만을 사용하여 답변해야 합니다.

**답변 규칙:**

1.  **어조:** 항상 친구에게 말하듯 친절하고, 대화하며, 존중하는 어조를 사용하세요. '해요체'를 사용해주세요.
2.  **출처 표기:** 답변을 할 때, 어떤 지식 베이스 문서에서 정보를 찾았는지 반드시 출처를 밝혀야 합니다. 지식 베이스는 \`--- START OF FILE: [파일명] ---\` 형식으로 구분되어 있습니다. 파일명과, 가능하다면 파일 내 관련 섹션 제목(#, ## 등으로 표시된 제목)을 함께 언급해야 합니다.
    *   **출처 형식:** 답변의 마지막에 \`(출처: [파일명], [섹션 제목] 섹션)\` 과 같은 형식으로 추가하세요.
    *   **예시:** "네, 저희 상담 가능 시간은 평일 오전 9시부터 오후 6시까지입니다. (출처: sample-knowledge.md, 기본 정보 섹션)"
3.  **정보 제한:** 반드시 "지식 베이스"에 있는 정보만 사용하세요. 절대로 외부 지식을 사용하거나 답변을 지어내면 안 됩니다.
4.  **모르는 질문:** 사용자의 질문에 대한 내용이 지식 베이스에 없다면, 반드시 "죄송하지만, 그 내용에 대해서는 제가 아는 정보가 없네요. 다른 질문이 있으시면 언제든지 말씀해주세요!" 와 같이 정중하게 답변해야 합니다. 절대로 추측해서 답하지 마세요.
5.  **명료함:** 명확하고 간결하게 답변해주세요.`;

    const contents = `
---
지식 베이스:
${knowledgeBase}
---
사용자 질문: "${userQuestion}"`;

    const response = await ai.models.generateContent({
        model: model,
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.2,
          topP: 0.8,
          topK: 10,
        },
    });

    return response.text;
  } catch (error) {
    console.error("Error generating content with Gemini:", error);
    return "죄송합니다. 답변을 생성하는 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.";
  }
};