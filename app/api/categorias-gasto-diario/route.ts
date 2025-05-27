import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { authOptions } from "../auth/[...nextauth]/route"

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
  }

  const { nombre } = await request.json()
  if (!nombre) {
    return NextResponse.json({ error: "Falta el nombre de la categoría" }, { status: 400 })
  }

  // Verificar si ya existe la categoría para este usuario (case insensitive)
  const existe = await prisma.categoriaGastoDiario.findFirst({
    where: {
      userId: user.id,
      nombre: { equals: nombre, mode: "insensitive" }
    }
  })
  if (existe) {
    return NextResponse.json({ error: "La categoría ya existe" }, { status: 409 })
  }

  const nueva = await prisma.categoriaGastoDiario.create({
    data: {
      nombre,
      userId: user.id
    }
  })
  return NextResponse.json(nueva, { status: 201 })
} 