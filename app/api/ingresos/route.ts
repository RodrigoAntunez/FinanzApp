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

  const ingresos = await prisma.ingreso.findMany({ where: { userId: user.id } })
  return NextResponse.json(ingresos)
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

  const { nombre, monto, categoria, fecha, recibido } = await request.json()
  if (!nombre || !monto || !categoria || !fecha) {
    return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 })
  }

  const ingreso = await prisma.ingreso.create({
    data: {
      userId: user.id,
      nombre,
      monto: Number(monto),
      categoria,
      fecha: new Date(fecha),
      recibido: !!recibido,
    },
  })
  return NextResponse.json(ingreso, { status: 201 })
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

  const { id, nombre, monto, categoria, fecha, recibido } = await request.json()
  if (!id) {
    return NextResponse.json({ error: "Falta el id" }, { status: 400 })
  }

  const ingreso = await prisma.ingreso.update({
    where: { id },
    data: {
      nombre,
      monto: Number(monto),
      categoria,
      fecha: new Date(fecha),
      recibido: !!recibido,
    },
  })
  return NextResponse.json(ingreso)
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

  await prisma.ingreso.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
} 