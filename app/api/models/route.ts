import { NextResponse } from 'next/server';

export const runtime = 'nodejs'; // Use nodejs runtime for local/Vercel with DB

export async function GET(request: Request) {
  const apiKey = request.headers.get('x-google-api-key');
  const defaultModels = [
    { name: 'gemini-1.5-flash', displayName: 'Gemini 1.5 Flash (Default)' },
    { name: 'gemini-1.5-pro', displayName: 'Gemini 1.5 Pro' },
  ];

  if (!apiKey) {
    return NextResponse.json(defaultModels);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error("Failed to fetch models from Google API");
      return NextResponse.json(defaultModels);
    }

    const data = await response.json();
    
    if (data.models && Array.isArray(data.models)) {
      // Filter for generateContent supported models and map to our format
      const models = data.models
        .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
        .map((m: any) => ({
          name: m.name.replace('models/', ''),
          displayName: m.displayName || m.name
        }))
        // Sort to put gemini-1.5-flash first if it exists
        .sort((a: any, b: any) => {
           if (a.name.includes('flash')) return -1;
           if (b.name.includes('flash')) return 1;
           return 0;
        });

      return NextResponse.json(models.length > 0 ? models : defaultModels);
    }

    return NextResponse.json(defaultModels);
  } catch (error) {
    console.error("Error fetching models:", error);
    return NextResponse.json(defaultModels);
  }
}
