"use client"

import { useState, useEffect } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

// Array de colores único y largo para todas las categorías
const COLORES_UNICOS = [
  "#0ea5e9", // Vivienda
  "#22c55e", // Servicios
  "#f59e0b", // Alimentación
  "#8b5cf6", // Transporte
  "#ec4899", // Entretenimiento
  "#ef4444", // Salud
  "#fbbf24", // Café
  "#64748b", // Otros
  "#06b6d4", // cyan
  "#a21caf", // púrpura
  "#eab308", // amarillo extra
  "#14b8a6", // teal extra
  "#f472b6", // pink extra
  "#f87171", // red extra
  "#818cf8", // indigo extra
  "#34d399", // emerald extra
]

function getColorCategoriaPorIndice(categoria: string, categorias: string[]): string {
  const index = categorias.indexOf(categoria)
  return COLORES_UNICOS[index % COLORES_UNICOS.length]
}

export function ResumenGastos() {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const [gastosFijos, gastosDiarios] = await Promise.all([
          fetch("/api/gastos-fijos").then(r => r.json()),
          fetch("/api/gastos-diarios").then(r => r.json())
        ])

        // Combinar gastos fijos y diarios
        const todosLosGastos = [...gastosFijos, ...gastosDiarios]

        // Agrupar por categoría
        const gastosPorCategoria = todosLosGastos.reduce((acc: { [key: string]: number }, gasto: any) => {
          const categoria = gasto.categoria
          acc[categoria] = (acc[categoria] || 0) + (Number(gasto.monto) || 0)
          return acc
        }, {})

        const categoriasUnicas = Object.keys(gastosPorCategoria)
        const datosGrafico = Object.entries(gastosPorCategoria).map(([categoria, valor]) => ({
          name: categoria,
          value: valor,
          color: getColorCategoriaPorIndice(categoria, categoriasUnicas)
        }))

        setData(datosGrafico)
      } catch (error) {
        console.error("Error al cargar datos:", error)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [`$${value}`, "Monto"]}
            contentStyle={{ borderRadius: "8px", border: "1px solid #334155", background: "#0f172a", color: "#fff" }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
