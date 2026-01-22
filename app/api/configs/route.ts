import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs'; // Use nodejs runtime for local/Vercel with DB

export async function GET() {
  try {
    let configs = await prisma.fieldConfig.findMany({
        orderBy: { createdAt: 'asc' }
    });

    // Lazy Seeding: If no configs found, insert defaults
    if (configs.length === 0) {
        const defaults = [
            {
              key: 'visualTheme',
              label: '视觉主题 (Visual Theme)',
              options: [
                "Low-poly (低多边形)",
                "Realistic Cyberpunk (写实赛博朋克)",
                "Toon Shading (卡通渲染)",
                "Pixel Art (像素风)",
                "Vaporwave (蒸汽波)",
                "Ink Wash (水墨风)",
                "Ghibli Style (吉卜力风格)",
                "Neon Noir (霓虹黑色电影)"
              ]
            },
            {
              key: 'cameraAngle',
              label: '运镜视角 (Camera Angle)',
              options: [
                "Third Person Chase (第三人称追尾)",
                "First Person Cockpit (第一人称座舱)",
                "Top-down (上帝视角)",
                "Cinematic Drone (电影级无人机跟随)",
                "Dynamic Action (动态动作捕捉)",
                "Wheel Cam (车轮特写)"
              ]
            },
            {
              key: 'coreInteraction',
              label: '核心交互 (Interaction)',
              options: [
                "One-finger Hold (单指按住)",
                "Gravity / Tilt (重力感应)",
                "Virtual Joystick (虚拟摇杆)",
                "Tap to Drift (点击漂移)",
                "Swipe Gestures (滑动收拾)",
                "Voice Control (语音控制)",
                "Rhythm Tap (节奏点击)"
              ]
            },
            {
              key: 'copyHook',
              label: '文案钩子 (Hook)',
              options: [
                "99% Fail Rate (99%的玩家都会失败)",
                "Only for Pro Drivers (只有老司机能过)",
                "Satisfying Drift (极其解压的漂移)",
                "Can you beat level 1? (你能过第一关吗？)",
                "Noob vs Pro (菜鸟 vs 高手)",
                "Don't Blink (千万别眨眼)"
              ]
            },
            {
              key: 'audioDesign',
              label: '音频设计 (Audio)',
              options: [
                "Phonk Music (Phonk 漂移神曲)",
                "ASMR Engine (ASMR 引擎声)",
                "Intense Rock (激昂摇滚)",
                "Meme Sounds (网络热梗音效)",
                "Voiceover Commentary (解说旁白)",
                "Synthwave (合成波音乐)"
              ]
            },
            {
              key: 'scriptFlow',
              label: '剧本流程 (Flow)',
              options: [
                "High Skill Showcase (高玩炫技流)",
                "Tutorial -> Fail (教学 -> 失败)",
                "Noob vs Pro Contrast (新手高手对比)",
                "Unexpected Chaos (意外的混乱)",
                "Speedrun (极速通关)",
                "Evolution (车辆进化过程)"
              ]
            },
            {
              key: 'ending',
              label: '结尾 (Ending)',
              options: [
                "Fail after High Score (高分后意外失败)",
                "Epic Comeback (极限反杀)",
                "Cliffhanger (悬念结局)",
                "Unlock Secret Car (解锁隐藏车)",
                "Funny Crash (滑稽车祸)",
                "Victory Lap (胜利冲线)"
              ]
            }
        ];

        for (const config of defaults) {
            await prisma.fieldConfig.create({
                data: {
                    key: config.key,
                    label: config.label,
                    options: JSON.stringify(config.options)
                }
            });
        }
        
        // Re-fetch after seeding
        configs = await prisma.fieldConfig.findMany({
            orderBy: { createdAt: 'asc' }
        });
    }

    return NextResponse.json(configs);
  } catch (error) {
    // If DB fails (e.g. on Edge without Polyfill), return empty array so frontend uses defaults
    console.error("Failed to fetch configs:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { key, label, options } = body;
    
    const config = await prisma.fieldConfig.upsert({
      where: { key },
      update: { 
        label, 
        options: JSON.stringify(options) 
      },
      create: { 
        key, 
        label, 
        options: JSON.stringify(options) 
      },
    });
    
    return NextResponse.json(config);
  } catch (error: any) {
    return NextResponse.json({ error: `Failed to save config: ${error.message}` }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const key = searchParams.get('key');

        if (!key) {
            return NextResponse.json({ error: 'Key is required' }, { status: 400 });
        }

        await prisma.fieldConfig.delete({
            where: { key }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete config' }, { status: 500 });
    }
}
