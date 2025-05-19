import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testConnection() {
  try {
    // Intenta conectar a la base de datos
    await prisma.$connect()
    console.log('✅ Conexión exitosa a la base de datos')
    
    // Intenta hacer una consulta simple
    const result = await prisma.$runCommandRaw({ ping: 1 })
    console.log('✅ Consulta de prueba exitosa:', result)
    
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar la prueba
testConnection() 