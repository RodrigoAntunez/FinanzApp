import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "./auth/[...nextauth]"
import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session || !session.user?.email) {
    return res.status(401).json({ error: "No autenticado" })
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) {
    return res.status(404).json({ error: "Usuario no encontrado" })
  }

  if (req.method === "GET") {
    const categorias = await prisma.categoriaGastoDiario.findMany({ where: { userId: user.id } })
    return res.status(200).json(categorias)
  }

  if (req.method === "POST") {
    const { nombre } = req.body
    if (!nombre) {
      return res.status(400).json({ error: "Falta el nombre de la categoría" })
    }
    // Evitar duplicados por nombre (case insensitive)
    const existe = await prisma.categoriaGastoDiario.findFirst({
      where: {
        userId: user.id,
        nombre: { equals: nombre, mode: "insensitive" },
      },
    })
    if (existe) {
      return res.status(409).json({ error: "La categoría ya existe" })
    }
    const nueva = await prisma.categoriaGastoDiario.create({
      data: {
        userId: user.id,
        nombre,
      },
    })
    return res.status(201).json(nueva)
  }

  return res.status(405).json({ error: "Método no permitido" })
} 