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
    const gastosDiarios = await prisma.gastoDiario.findMany({ where: { userId: user.id } })
    return res.status(200).json(gastosDiarios)
  }

  if (req.method === "POST") {
    const { nombre, monto, categoria, fecha } = req.body
    if (!nombre || !monto || !categoria || !fecha) {
      return res.status(400).json({ error: "Faltan campos obligatorios" })
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
    return res.status(201).json(gastoDiario)
  }

  if (req.method === "PUT") {
    const { id, nombre, monto, categoria, fecha } = req.body
    if (!id) return res.status(400).json({ error: "Falta el id" })
    const gastoDiario = await prisma.gastoDiario.update({
      where: { id },
      data: {
        nombre,
        monto: Number(monto),
        categoria,
        fecha: new Date(fecha),
      },
    })
    return res.status(200).json(gastoDiario)
  }

  if (req.method === "DELETE") {
    const { id } = req.body
    if (!id) return res.status(400).json({ error: "Falta el id" })
    await prisma.gastoDiario.delete({ where: { id } })
    return res.status(204).end()
  }

  return res.status(405).json({ error: "Método no permitido" })
}