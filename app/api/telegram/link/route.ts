import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { linkTelegramUser } from '@/lib/telegram/service';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { telegramId } = await req.json();

    if (!telegramId) {
      return NextResponse.json(
        { error: 'ID de Telegram requerido' },
        { status: 400 }
      );
    }

    await linkTelegramUser(telegramId, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al vincular cuenta de Telegram:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 