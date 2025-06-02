import { useState, useEffect } from "react"
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, isSameDay, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function ResumenGastosSemana() {
  const [gastos, setGastos] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [semanaActual, setSemanaActual] = useState(new Date())
  const [modalOpen, setModalOpen] = useState(false)
  const [gastosDiaSeleccionado, setGastosDiaSeleccionado] = useState<any[]>([])
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | null>(null)

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
      // Comparar por string plano
      if (typeof g.fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(g.fecha)) {
        const [year, month, day] = g.fecha.split('-')
        return fecha.getFullYear() === Number(year) && (fecha.getMonth() + 1) === Number(month) && fecha.getDate() === Number(day)
      }
      // Si es string ISO
      if (typeof g.fecha === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(g.fecha)) {
        const soloFecha = g.fecha.slice(0, 10)
        const [year, month, day] = soloFecha.split('-')
        return fecha.getFullYear() === Number(year) && (fecha.getMonth() + 1) === Number(month) && fecha.getDate() === Number(day)
      }
      // Si es Date
      if (g.fecha instanceof Date && !isNaN(g.fecha.getTime())) {
        return isSameDay(g.fecha, fecha)
      }
      return false
    })
    const total = gastosDelDia.reduce((sum, g) => sum + Number(g.monto), 0)
    return { fecha, gastos: gastosDelDia, total }
  })

  return (
    <div className="max-w-7xl w-full mx-auto">
      <div className="bg-[#181c2a]/80 rounded-xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setSemanaActual(subWeeks(semanaActual, 1))} className="text-blue-400 hover:text-blue-200">← Semana anterior</button>
          <div className="font-bold text-lg text-white">Semana del {format(lunes, "d 'al' d 'de' MMMM yyyy", { locale: es })}</div>
          <button onClick={() => setSemanaActual(addWeeks(semanaActual, 1))} className="text-blue-400 hover:text-blue-200">Semana siguiente →</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-2">
          {gastosPorDia.map(({ fecha, gastos, total }, idx) => (
            <div key={idx} className="bg-[#1e293b]/80 rounded-lg p-2 flex flex-col items-center min-h-[120px]">
              <div className="font-semibold text-blue-300 text-sm mb-1">{format(fecha, "EEEE", { locale: es })}</div>
              <div className="text-xs text-gray-400 mb-2">{format(fecha, "d/M")}</div>
              <div className="text-lg font-bold text-blue-400 mb-1">${total.toFixed(2)}</div>
              {gastos.length > 0 && (
                <button
                  className="text-xs text-blue-400 hover:text-blue-200"
                  onClick={() => {
                    setGastosDiaSeleccionado(gastos)
                    setFechaSeleccionada(fecha)
                    setModalOpen(true)
                  }}
                >
                  Ver gastos
                </button>
              )}
            </div>
          ))}
        </div>
        {loading && <div className="text-blue-400 mt-4">Cargando...</div>}
        {error && <div className="text-red-400 mt-4">{error}</div>}
      </div>
      {/* Modal para mostrar los gastos del día seleccionado */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-[#181c2a] text-white max-w-lg w-full">
          <DialogHeader>
            <DialogTitle>Gastos del día {fechaSeleccionada ? format(fechaSeleccionada, "EEEE d 'de' MMMM", { locale: es }) : ""}</DialogTitle>
          </DialogHeader>
          <div className="overflow-x-auto mt-2">
            <table className="min-w-full text-sm rounded-xl overflow-hidden bg-[#181c2a]/80 border border-[#23204d]">
              <thead>
                <tr className="bg-blue-950/80 text-blue-200 border-b border-[#23204d]">
                  <th className="px-4 py-3 text-left font-semibold">Nombre</th>
                  <th className="px-4 py-3 text-left font-semibold">Monto</th>
                  <th className="px-4 py-3 text-left font-semibold">Categoría</th>
                </tr>
              </thead>
              <tbody>
                {gastosDiaSeleccionado.map((gasto, idx) => (
                  <tr key={gasto.id || idx} className={[idx % 2 === 0 ? "bg-[#101c3a]/80" : "bg-blue-950/40", "border-b border-[#23204d]"].join(' ')}>
                    <td className="px-4 py-3 text-white font-medium">{gasto.nombre}</td>
                    <td className="px-4 py-3 text-rose-400 font-bold">-${Number(gasto.monto).toFixed(2)}</td>
                    <td className="px-4 py-3 text-blue-300">{gasto.categoria}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {gastosDiaSeleccionado.length === 0 && <div className="text-gray-400 text-center py-4">No hay gastos para este día.</div>}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 