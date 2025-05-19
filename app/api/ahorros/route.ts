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

  const ahorros = await prisma.ahorro.findMany({ where: { userId: user.id } })
  return NextResponse.json(ahorros)
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

  const { nombre, monto, categoria, fecha, objetivo, icono } = await request.json()
  if (!nombre || !monto || !categoria || !fecha) {
    return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 })
  }

  const ahorro = await prisma.ahorro.create({
    data: {
      userId: user.id,
      nombre,
      monto: Number(monto),
      categoria,
      fecha: new Date(fecha),
      objetivo: objetivo ? Number(objetivo) : undefined,
      icono: icono || undefined,
    },
  })
  return NextResponse.json(ahorro, { status: 201 })
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

  const { id, nombre, monto, categoria, fecha, objetivo, icono } = await request.json()
  if (!id) {
    return NextResponse.json({ error: "Falta el id" }, { status: 400 })
  }

  const ahorro = await prisma.ahorro.update({
    where: { id },
    data: {
      nombre,
      monto: Number(monto),
      categoria,
      fecha: new Date(fecha),
      objetivo: objetivo ? Number(objetivo) : undefined,
      icono: icono || undefined,
    },
  })
  return NextResponse.json(ahorro)
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

  await prisma.ahorro.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
} 