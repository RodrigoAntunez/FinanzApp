import { useState, useEffect } from "react"
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, isSameDay, parseISO } from "date-fns"
import { es } from "date-fns/locale"

export function ResumenGastosSemana() {
  const [gastos, setGastos] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [semanaActual, setSemanaActual] = useState(new Date())

  // Calcular lunes y domingo de la semana actual
  const lunes = startOfWeek(semanaActual, { weekStartsOn: 1 })
  const domingo = endOfWeek(semanaActual, { weekStartsOn: 1 })

  // Fechas en formato YYYY-MM-DD
  const desde = format(lunes, "yyyy-MM-dd")
  const hasta = format(domingo, "yyyy-MM-dd")

  useEffect(() => {
    async function fetchGastosSemana() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/gastos-diarios?desde=${desde}&hasta=${hasta}`)
        if (!res.ok) throw new Error("Error al cargar los gastos de la semana")
        const data = await res.json()
        setGastos(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchGastosSemana()
  }, [desde, hasta])

  // Agrupar gastos por día
  const diasSemana = Array.from({ length: 7 }, (_, i) => {
    const fecha = new Date(lunes)
    fecha.setDate(lunes.getDate() + i)
    return fecha
  })

  const gastosPorDia = diasSemana.map((fecha) => {
    const gastosDelDia = gastos.filter(g => {
      const fechaGasto = typeof g.fecha === 'string' ? parseISO(g.fecha) : new Date(g.fecha)
      return isSameDay(fechaGasto, fecha)
    })
    const total = gastosDelDia.reduce((sum, g) => sum + Number(g.monto), 0)
    return { fecha, gastos: gastosDelDia, total }
  })

  return (
    <div className="bg-[#181c2a]/80 rounded-xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setSemanaActual(subWeeks(semanaActual, 1))} className="text-blue-400 hover:text-blue-200">← Semana anterior</button>
        <div className="font-bold text-lg text-white">Semana del {format(lunes, "d 'al' d 'de' MMMM yyyy", { locale: es })}</div>
        <button onClick={() => setSemanaActual(addWeeks(semanaActual, 1))} className="text-blue-400 hover:text-blue-200">Semana siguiente →</button>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {gastosPorDia.map(({ fecha, gastos, total }, idx) => (
          <div key={idx} className="bg-[#1e293b]/80 rounded-lg p-2 flex flex-col items-center min-h-[120px]">
            <div className="font-semibold text-blue-300 text-sm mb-1">{format(fecha, "EEEE", { locale: es })}</div>
            <div className="text-xs text-gray-400 mb-2">{format(fecha, "d/M")}</div>
            <div className="text-lg font-bold text-blue-400 mb-1">${total.toFixed(2)}</div>
            <ul className="text-xs text-gray-200 space-y-1 w-full">
              {gastos.map(g => (
                <li key={g.id} className="truncate">- {g.nombre} <span className="text-rose-400 font-semibold">${Number(g.monto).toFixed(2)}</span></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {loading && <div className="text-blue-400 mt-4">Cargando...</div>}
      {error && <div className="text-red-400 mt-4">{error}</div>}
    </div>
  )
} 