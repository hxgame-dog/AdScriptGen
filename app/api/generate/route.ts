import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs'; // Use nodejs runtime for local/Vercel with DB

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { apiKey, model, parameters } = body;

    if (!apiKey) {
      return NextResponse.json({ error: 'API Key is required' }, { status: 401 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const generativeModel = genAI.getGenerativeModel({ 
      model: model || 'gemini-1.5-flash',
      generationConfig: { responseMimeType: "application/json" }
    });

    const systemInstruction = {
      role: "资深移动游戏投放素材策划",
      objective: "基于用户参数生成 JSON 格式的视频分镜脚本。",
      language: "分析和画面描述使用中文，文案部分必须使用中英双语"
    };

    const outputRequirement = {
      format: "JSON",
      structure: {
        meta_analysis: "简短分析该脚本的心理学策略和特性（中文）",
        production_guide: "针对视频制作人员的简短指南（中文），包括剪辑节奏、特效重点等建议。",
        script_content: [
          { 
              time: "0-5s", 
              visual: "画面描述...", 
              audio: "...", 
              interaction: "...", 
              text: "中文文案 | English Copy",
              prompt: "Stable Diffusion/Midjourney Prompt for this scene (English)"
          }
        ]
      }
    };
    
    // Calculate approximate scene count
    const duration = parseInt(parameters.videoDuration || '30');
    const sceneCount = Math.ceil(duration / 5);

    const prompt = `
      You are a Senior Mobile Game Ad Creative Director.
      
      System Instruction:
      ${JSON.stringify(systemInstruction, null, 2)}
      
      Input Parameters:
      ${JSON.stringify(parameters, null, 2)}
      
      Constraints:
      1. Total Video Duration: ${duration} seconds.
      2. Scene Duration: Approximately 5 seconds per scene.
      3. Total Scenes: Around ${sceneCount} scenes.
      4. Language: 
         - Meta Analysis, Visual, Audio, Interaction, Production Guide: Chinese (Simplified).
         - Text/Copy: MUST be Bilingual (Chinese | English). Example: "只有高手能过 | Only pros can pass"
         - Prompt: English (Optimized for AI Image Generators like Stable Diffusion)
      
      Output Requirement:
      ${JSON.stringify(outputRequirement, null, 2)}
      
      Please generate the script strictly following the JSON structure.
    `;

    const result = await generativeModel.generateContentStream(prompt);
    
    // Create a readable stream
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            controller.enqueue(chunkText);
          }
          controller.close();
        } catch (e) {
          controller.error(e);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked'
      }
    });

  } catch (error: any) {
    console.error("Generation error:", error);
    return NextResponse.json({ error: error.message || 'Failed to generate content' }, { status: 500 });
  }
}
