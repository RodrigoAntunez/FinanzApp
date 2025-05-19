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
    const ingresos = await prisma.ingreso.findMany({ where: { userId: user.id } })
    return res.status(200).json(ingresos)
  }

  if (req.method === "POST") {
    const { nombre, monto, categoria, fecha, recibido } = req.body
    if (!nombre || !monto || !categoria || !fecha) {
      return res.status(400).json({ error: "Faltan campos obligatorios" })
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
    return res.status(201).json(ingreso)
  }

  if (req.method === "PUT") {
    const { id, nombre, monto, categoria, fecha, recibido } = req.body
    if (!id) return res.status(400).json({ error: "Falta el id" })
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
    return res.status(200).json(ingreso)
  }

  if (req.method === "DELETE") {
    const { id } = req.body
    if (!id) return res.status(400).json({ error: "Falta el id" })
    await prisma.ingreso.delete({ where: { id } })
    return res.status(204).end()
  }

  return res.status(405).json({ error: "Método no permitido" })
} 