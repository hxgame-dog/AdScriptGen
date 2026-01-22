import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs'; // Use nodejs runtime for local/Vercel with DB

export async function GET() {
  try {
    const scripts = await prisma.script.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(scripts);
  } catch (error) {
    // If DB fails, return empty so frontend uses LocalStorage
    console.error("Fetch error:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, parameters, content, modelUsed } = body;

    const script = await prisma.script.create({
      data: {
        title: title || 'Untitled Script',
        parameters: typeof parameters === 'string' ? parameters : JSON.stringify(parameters),
        content: typeof content === 'string' ? content : JSON.stringify(content),
        modelUsed: modelUsed || 'unknown',
      },
    });

    return NextResponse.json(script);
  } catch (error) {
    // Return error status so frontend switches to LocalStorage
    console.error("Save error:", error);
    return NextResponse.json({ error: 'Failed to save script' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await prisma.script.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete script' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, title } = body;

    if (!id || !title) {
      return NextResponse.json({ error: 'ID and Title are required' }, { status: 400 });
    }

    const script = await prisma.script.update({
      where: { id },
      data: { title },
    });

    return NextResponse.json(script);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update script' }, { status: 500 });
  }
}
