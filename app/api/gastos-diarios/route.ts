import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { authOptions } from "../auth/[...nextauth]/route"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
  }

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

  const gastoDiario = await prisma.gastoDiario.create({
    data: {
      userId: user.id,
      nombre,
      monto: Number(monto),
      categoria,
      fecha: new Date(fecha),
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

  const gastoDiario = await prisma.gastoDiario.update({
    where: { id },
    data: {
      nombre,
      monto: Number(monto),
      categoria,
      fecha: new Date(fechaFinal),
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