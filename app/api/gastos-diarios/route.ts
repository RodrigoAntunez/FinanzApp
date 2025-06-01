import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { NextResponse, NextRequest } from "next/server"
import { authOptions } from "../auth/[...nextauth]/route"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
  }

  // Soportar query params para rango semanal
  const { searchParams } = new URL(request.url)
  const desde = searchParams.get("desde")
  const hasta = searchParams.get("hasta")

  if (desde && hasta) {
    // Buscar gastos entre las fechas (inclusive) usando strings
    const gastosDiarios = await prisma.gastoDiario.findMany({
      where: {
        userId: user.id,
        fecha: {
          gte: desde,
          lte: hasta,
        },
      },
      orderBy: { fecha: "asc" },
    })
    return NextResponse.json(gastosDiarios)
  }

  // Si no hay query params, devolver todos los gastos
  const gastosDiarios = await prisma.gastoDiario.findMany({ where: { userId: user.id } })
  return NextResponse.json(gastosDiarios)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
  }

  const { nombre, monto, categoria, fecha } = await request.json()
  if (!nombre || !monto || !categoria || !fecha) {
    return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 })
  }

  // Guardar fecha como string plano
  const gastoDiario = await prisma.gastoDiario.create({
    data: {
      userId: user.id,
      nombre,
      monto: Number(monto),
      categoria,
      fecha: fecha, // string
    },
  })
  return NextResponse.json(gastoDiario, { status: 201 })
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
  }

  const { id, nombre, monto, categoria, fecha } = await request.json()
  if (!id) {
    return NextResponse.json({ error: "Falta el id" }, { status: 400 })
  }

  let fechaFinal = fecha
  if (!fechaFinal) {
    const gastoOriginal = await prisma.gastoDiario.findUnique({ where: { id } })
    fechaFinal = gastoOriginal?.fecha
  }

  // Guardar fecha como string plano
  const gastoDiario = await prisma.gastoDiario.update({
    where: { id },
    data: {
      nombre,
      monto: Number(monto),
      categoria,
      fecha: fechaFinal, // string
    },
  })
  return NextResponse.json(gastoDiario)
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
  }

  const { id } = await request.json()
  if (!id) {
    return NextResponse.json({ error: "Falta el id" }, { status: 400 })
  }

  await prisma.gastoDiario.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
} 