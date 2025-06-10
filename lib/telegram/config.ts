import { Telegraf } from 'telegraf';

if (!process.env.TELEGRAM_BOT_TOKEN) {
  throw new Error('TELEGRAM_BOT_TOKEN must be provided!');
}

export const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Comandos disponibles
export const COMMANDS = {
  START: '/start',
  HELP: '/help',
  GASTO: '/gasto',
  RESUMEN: '/resumen',
  CATEGORIAS: '/categorias',
} as const;

// Mensajes de ayuda
export const HELP_MESSAGE = `
Comandos disponibles:

${COMMANDS.START} - Iniciar el bot
${COMMANDS.HELP} - Mostrar esta ayuda
${COMMANDS.GASTO} <monto> <categoría> - Registrar un gasto
${COMMANDS.RESUMEN} - Ver resumen de gastos
${COMMANDS.CATEGORIAS} - Ver categorías disponibles

Ejemplos:
/gasto 1000 comida
/gasto 5000 transporte
/resumen
`;

export const WELCOME_MESSAGE = `
¡Bienvenido a tu asistente de finanzas personales! 🎉

Puedes usar los siguientes comandos:
${HELP_MESSAGE}
`; 