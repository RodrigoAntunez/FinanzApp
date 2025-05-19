"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useState, useEffect } from "react"

export function BalanceChart() {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const [ingresos, gastosFijos, gastosDiarios, ahorros] = await Promise.all([
          fetch("/api/ingresos").then(r => r.json()),
          fetch("/api/gastos-fijos").then(r => r.json()),
          fetch("/api/gastos-diarios").then(r => r.json()),
          fetch("/api/ahorros").then(r => r.json())
        ])

        // Agrupar datos por mes
        const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
        const datosPorMes = meses.map(mes => {
          const ingresosMes = ingresos
            .filter((i: any) => new Date(i.fecha).getMonth() === meses.indexOf(mes))
            .reduce((sum: number, i: any) => sum + (Number(i.monto) || 0), 0)

          const gastosFijosMes = gastosFijos
            .filter((g: any) => new Date(g.fechaPago).getMonth() === meses.indexOf(mes))
            .reduce((sum: number, g: any) => sum + (Number(g.monto) || 0), 0)

          const gastosDiariosMes = gastosDiarios
            .filter((g: any) => new Date(g.fecha).getMonth() === meses.indexOf(mes))
            .reduce((sum: number, g: any) => sum + (Number(g.monto) || 0), 0)

          const ahorrosMes = ahorros
            .filter((a: any) => new Date(a.fecha).getMonth() === meses.indexOf(mes))
            .reduce((sum: number, a: any) => sum + (Number(a.monto) || 0), 0)

          return {
            name: mes,
            ingresos: ingresosMes,
            gastos: gastosFijosMes + gastosDiariosMes,
            ahorros: ahorrosMes
          }
        })

        setData(datosPorMes)
      } catch (error) {
        console.error("Error al cargar datos:", error)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="h-[300px] w-full rounded-xl" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#222" />
          <XAxis dataKey="name" stroke="#e0e7ef" />
          <YAxis stroke="#e0e7ef" />
          <Tooltip
            formatter={(value) => [`$${value}`, ""]}
            contentStyle={{ borderRadius: "8px", border: "1px solid #334155", background: "#0f172a", color: "#fff" }}
          />
          <Legend />
          <Line type="monotone" dataKey="ingresos" stroke="#fbbf24" name="Ingresos" dot={{ r: 6 }} activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="gastos" stroke="#a21caf" name="Gastos" dot={{ r: 6 }} activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="ahorros" stroke="#38bdf8" name="Ahorros" dot={{ r: 6 }} activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
