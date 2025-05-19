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
    const gastosFijos = await prisma.gastoFijo.findMany({ where: { userId: user.id } })
    return res.status(200).json(gastosFijos)
  }

  if (req.method === "POST") {
    const { nombre, monto, categoria, fechaPago, cubierto, cuotas } = req.body
    console.log("Datos recibidos en POST /api/gastos-fijos:", { nombre, monto, categoria, fechaPago, cubierto, cuotas })
    if (!nombre || !monto || !categoria || !fechaPago) {
      console.error("Faltan campos obligatorios:", { nombre, monto, categoria, fechaPago })
      return res.status(400).json({ error: "Faltan campos obligatorios" })
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
    return res.status(201).json(gastoFijo)
  }

  if (req.method === "PUT") {
    const { id, nombre, monto, categoria, fechaPago, cubierto, cuotas } = req.body
    if (!id) return res.status(400).json({ error: "Falta el id" })
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
    return res.status(200).json(gastoFijo)
  }

  if (req.method === "DELETE") {
    const { id } = req.body
    console.log("Intentando eliminar gasto fijo con id:", id)
    if (!id) return res.status(400).json({ error: "Falta el id" })
    try {
      await prisma.gastoFijo.delete({ where: { id } })
      console.log("Eliminado correctamente")
      return res.status(204).end()
    } catch (error) {
      console.error("Error al eliminar gasto fijo:", error)
      return res.status(500).json({ error: "No se pudo eliminar el gasto fijo", detalle: error })
    }
  }

  return res.status(405).json({ error: "Método no permitido" })
} 