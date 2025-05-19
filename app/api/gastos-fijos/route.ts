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

  const gastosFijos = await prisma.gastoFijo.findMany({ where: { userId: user.id } })
  return NextResponse.json(gastosFijos)
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

  const { nombre, monto, categoria, fechaPago, cubierto, cuotas } = await request.json()
  console.log("Datos recibidos en POST /api/gastos-fijos:", { nombre, monto, categoria, fechaPago, cubierto, cuotas })
  
  if (!nombre || !monto || !categoria || !fechaPago) {
    console.error("Faltan campos obligatorios:", { nombre, monto, categoria, fechaPago })
    return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 })
  }

  const gastoFijo = await prisma.gastoFijo.create({
    data: {
      userId: user.id,
      nombre,
      monto: Number(monto),
      categoria,
      fechaPago: new Date(fechaPago),
      cubierto: !!cubierto,
      cuotas: cuotas ? Number(cuotas) : undefined,
    },
  })
  return NextResponse.json(gastoFijo, { status: 201 })
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

  const { id, nombre, monto, categoria, fechaPago, cubierto, cuotas } = await request.json()
  if (!id) {
    return NextResponse.json({ error: "Falta el id" }, { status: 400 })
  }

  const gastoFijo = await prisma.gastoFijo.update({
    where: { id },
    data: {
      nombre,
      monto: Number(monto),
      categoria,
      fechaPago: new Date(fechaPago),
      cubierto: !!cubierto,
      cuotas: cuotas ? Number(cuotas) : undefined,
    },
  })
  return NextResponse.json(gastoFijo)
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
  console.log("Intentando eliminar gasto fijo con id:", id)
  if (!id) {
    return NextResponse.json({ error: "Falta el id" }, { status: 400 })
  }

  try {
    await prisma.gastoFijo.delete({ where: { id } })
    console.log("Eliminado correctamente")
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Error al eliminar gasto fijo:", error)
    return NextResponse.json(
      { error: "No se pudo eliminar el gasto fijo", detalle: error },
      { status: 500 }
    )
  }
} 