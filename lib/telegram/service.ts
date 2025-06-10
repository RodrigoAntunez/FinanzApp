import { bot, COMMANDS, HELP_MESSAGE, WELCOME_MESSAGE } from './config';
import { prisma } from '../prisma';

// Inicializar el bot
export function initializeBot() {
  // Comando /start
  bot.command('start', async (ctx) => {
    const telegramId = ctx.from.id.toString();
    await ctx.reply(WELCOME_MESSAGE);
  });

  // Comando /help
  bot.command('help', async (ctx) => {
    await ctx.reply(HELP_MESSAGE);
  });

  // Comando /gasto
  bot.command('gasto', async (ctx) => {
    const telegramId = ctx.from.id.toString();
    const user = await prisma.user.findUnique({
      where: { telegramId },
    });

    if (!user) {
      await ctx.reply('❌ No estás vinculado a ninguna cuenta. Por favor, vincula tu cuenta de Telegram en la aplicación web.');
      return;
    }

    const args = ctx.message.text.split(' ').slice(1);
    if (args.length < 2) {
      await ctx.reply('❌ Formato incorrecto. Uso: /gasto <monto> <categoría>');
      return;
    }

    const [monto, categoria] = args;
    const montoNum = parseFloat(monto);

    if (isNaN(montoNum)) {
      await ctx.reply('❌ El monto debe ser un número válido');
      return;
    }

    try {
      // Buscar o crear la categoría
      let categoriaObj = await prisma.categoria.findFirst({
        where: {
          nombre: categoria.toLowerCase(),
          userId: user.id,
        },
      });

      if (!categoriaObj) {
        categoriaObj = await prisma.categoria.create({
          data: {
            nombre: categoria.toLowerCase(),
            userId: user.id,
          },
        });
      }

      // Crear el gasto
      const gasto = await prisma.gasto.create({
        data: {
          monto: montoNum,
          categoriaId: categoriaObj.id,
          userId: user.id,
          fecha: new Date(),
        },
      });

      await ctx.reply(`✅ Gasto registrado:\nMonto: $${montoNum}\nCategoría: ${categoria}`);
    } catch (error) {
      console.error('Error al registrar gasto:', error);
      await ctx.reply('❌ Error al registrar el gasto. Por favor, intenta de nuevo.');
    }
  });

  // Comando /resumen
  bot.command('resumen', async (ctx) => {
    const telegramId = ctx.from.id.toString();
    const user = await prisma.user.findUnique({
      where: { telegramId },
    });

    if (!user) {
      await ctx.reply('❌ No estás vinculado a ninguna cuenta. Por favor, vincula tu cuenta de Telegram en la aplicación web.');
      return;
    }

    try {
      const gastos = await prisma.gasto.findMany({
        where: {
          userId: user.id,
          fecha: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
        include: {
          categoria: true,
        },
      });

      const total = gastos.reduce((sum, gasto) => sum + gasto.monto, 0);

      let mensaje = '📊 Resumen de gastos de hoy:\n\n';
      gastos.forEach((gasto) => {
        mensaje += `$${gasto.monto} - ${gasto.categoria.nombre}\n`;
      });
      mensaje += `\nTotal: $${total}`;

      await ctx.reply(mensaje);
    } catch (error) {
      console.error('Error al obtener resumen:', error);
      await ctx.reply('❌ Error al obtener el resumen. Por favor, intenta de nuevo.');
    }
  });

  // Comando /categorias
  bot.command('categorias', async (ctx) => {
    const telegramId = ctx.from.id.toString();
    const user = await prisma.user.findUnique({
      where: { telegramId },
    });

    if (!user) {
      await ctx.reply('❌ No estás vinculado a ninguna cuenta. Por favor, vincula tu cuenta de Telegram en la aplicación web.');
      return;
    }

    try {
      const categorias = await prisma.categoria.findMany({
        where: { userId: user.id },
      });

      if (categorias.length === 0) {
        await ctx.reply('📝 No tienes categorías registradas.');
        return;
      }

      let mensaje = '📝 Tus categorías:\n\n';
      categorias.forEach((categoria) => {
        mensaje += `- ${categoria.nombre}\n`;
      });

      await ctx.reply(mensaje);
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      await ctx.reply('❌ Error al obtener las categorías. Por favor, intenta de nuevo.');
    }
  });

  // Iniciar el bot
  bot.launch().catch(console.error);
}

// Función para vincular un usuario de Telegram con un usuario de la aplicación
export async function linkTelegramUser(telegramId: string, userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { telegramId },
  });
}

// Función para desvincular un usuario de Telegram
export async function unlinkTelegramUser(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { telegramId: null },
  });
}

// Función para verificar si un usuario está vinculado
export async function isUserLinked(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { telegramId: true },
  });
  return !!user?.telegramId;
} 