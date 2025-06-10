import { NextResponse } from 'next/server';
import { bot } from '@/lib/telegram/config';
import { initializeBot } from '@/lib/telegram/service';

// Inicializar el bot
initializeBot();

export async function POST(req: Request) {
  try {
    const update = await req.json();
    await bot.handleUpdate(update);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error en webhook de Telegram:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 