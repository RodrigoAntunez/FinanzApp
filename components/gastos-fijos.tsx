"use client"

import { useState, useEffect } from "react"
import { CalendarIcon, CheckCircle2, Circle, Edit, Plus, Trash, Home, Wifi, CreditCard, Shield } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useRef } from "react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import "../styles/check-pop.css"

// Añadimos el campo 'cubierto' y 'cuotas' a cada gasto fijo
type GastoFijo = {
  id: number
  nombre: string
  monto: number
  categoria: string
  fechaPago: Date
  cubierto: boolean
  cuotas?: number
}

// Array de colores único y largo para todas las categorías
const COLORES_UNICOS = [
  "bg-blue-600/20 text-blue-400",
  "bg-green-600/20 text-green-400",
  "bg-yellow-500/20 text-yellow-400",
  "bg-purple-600/20 text-purple-400",
  "bg-pink-600/20 text-pink-400",
  "bg-orange-600/20 text-orange-400",
  "bg-teal-600/20 text-teal-400",
  "bg-indigo-600/20 text-indigo-400",
  "bg-cyan-600/20 text-cyan-400",
  "bg-rose-600/20 text-rose-400",
  "bg-emerald-600/20 text-emerald-400",
  "bg-violet-600/20 text-violet-400",
]

function getColorCategoriaPorIndice(categoria: string, categorias: string[]): string {
  const index = categorias.indexOf(categoria)
  return COLORES_UNICOS[index % COLORES_UNICOS.length]
}

export function GastosFijos() {
  const [gastos, setGastos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [gastoEdit, setGastoEdit] = useState<any>(null)
  const [editFields, setEditFields] = useState<any>({})
  const [addOpen, setAddOpen] = useState(false)
  const [categorias, setCategorias] = useState<string[]>(["Vivienda", "Servicios", "Suscripciones", "Seguros", "Tarjeta de crédito", "Otros"])
  const [creandoCategoria, setCreandoCategoria] = useState(false)
  const [nuevaCategoria, setNuevaCategoria] = useState("")

  // Estado inicial de addFields con fecha local
  const hoy = getFechaLocal()
  const [addFields, setAddFields] = useState<any>({ nombre: "", monto: "", categoria: categorias[0], fechaPago: hoy, cubierto: false, cuotas: 1 })

  // Mapeo de categorías a iconos
  const categoriaIcons: { [key: string]: any } = {
    "Vivienda": Home,
    "Servicios": Wifi,
    "Suscripciones": CreditCard,
    "Seguros": Shield,
    "Tarjeta de crédito": CreditCard,
    "Otros": Circle,
  }

  // Calcular totales por categoría
  const calcularTotalesPorCategoria = (gastos: GastoFijo[]) => {
    return gastos.reduce((acc, gasto) => {
      acc[gasto.categoria] = (acc[gasto.categoria] || 0) + gasto.monto
      return acc
    }, {} as { [key: string]: number })
  }

  // Utilidad para obtener la fecha local en formato YYYY-MM-DD
  function getFechaLocal(date = new Date()) {
    const tzOffset = date.getTimezoneOffset() * 60000
    const localISO = new Date(date.getTime() - tzOffset).toISOString().split('T')[0]
    return localISO
  }

  useEffect(() => {
    async function fetchGastos() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/gastos-fijos")
        if (!res.ok) throw new Error("Error al cargar los gastos fijos")
        let data = await res.json()
        // Reset automático el primer día del mes
        const hoy = new Date()
        if (hoy.getDate() === 1) {
          const gastosReseteados = await Promise.all(data.map(async (g: any) => {
            if (g.cubierto) {
              await fetch("/api/gastos-fijos", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...g, cubierto: false }),
              })
              return { ...g, cubierto: false }
            }
            return g
          }))
          setGastos(gastosReseteados)
        } else {
          setGastos(data)
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchGastos()
  }, [])

  async function handleAddGasto() {
    try {
      const res = await fetch("/api/gastos-fijos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addFields),
      })
      if (!res.ok) throw new Error("Error al guardar el gasto fijo")
      const nuevo = await res.json()
      setGastos([...gastos, nuevo])
      setAddOpen(false)
      setAddFields({ nombre: "", monto: "", categoria: categorias[0], fechaPago: hoy, cubierto: false, cuotas: 1 })
    } catch (err: any) {
      setError(err.message)
    }
  }

  async function handleEditGasto() {
    try {
      const res = await fetch("/api/gastos-fijos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editFields, id: gastoEdit.id }),
      })
      if (!res.ok) throw new Error("Error al editar el gasto fijo")
      const actualizado = await res.json()
      setGastos(gastos.map(g => g.id === actualizado.id ? actualizado : g))
      setEditOpen(false)
    } catch (err: any) {
      setError(err.message)
    }
  }

  async function handleDeleteGasto(id: string) {
    try {
      const res = await fetch("/api/gastos-fijos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id.toString() }),
      })
      if (!res.ok) throw new Error("Error al eliminar el gasto fijo")
      setGastos(gastos => gastos.filter(g => g.id !== id))
    } catch (err: any) {
      setError(err.message)
    }
  }

  // Marcar/desmarcar como cubierto y persistir en backend
  const handleToggleCubierto = async (id: number, cubierto: boolean, gasto: any) => {
    try {
      const res = await fetch("/api/gastos-fijos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...gasto, cubierto: !cubierto }),
      })
      if (!res.ok) throw new Error("Error al actualizar el gasto fijo")
      const actualizado = await res.json()
      setGastos(gastos => gastos.map(g => g.id === id ? actualizado : g))
    } catch (err: any) {
      setError(err.message)
    }
  }

  // Calcular el total de gastos cubiertos y no cubiertos
  const totalCubierto = gastos.filter((gasto) => gasto.cubierto).reduce((sum, gasto) => sum + (Number(gasto.monto) || 0), 0)
  const totalNoCubierto = gastos.filter((gasto) => !gasto.cubierto).reduce((sum, gasto) => sum + (Number(gasto.monto) || 0), 0)
  const totalesPorCategoria = gastos.reduce((acc: { [key: string]: number }, gasto) => {
    acc[gasto.categoria] = (acc[gasto.categoria] || 0) + (Number(gasto.monto) || 0)
    return acc
  }, {})
  const totalGastos = gastos.reduce((sum, gasto) => sum + (Number(gasto.monto) || 0), 0)

  // Cuando se agrega una nueva categoría
  function handleAgregarCategoria() {
    if (nuevaCategoria && !categorias.includes(nuevaCategoria)) {
      setCategorias([...categorias, nuevaCategoria])
      setAddFields({ ...addFields, categoria: nuevaCategoria })
      setNuevaCategoria("")
      setCreandoCategoria(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
        <Card className="bg-[#1e293b]/60 border-[#334155] hover:bg-[#1e293b]/80 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] p-2 sm:p-4 text-sm sm:text-base">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5 text-blue-400" />
              Gastos Cubiertos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">
              ${Math.round(totalCubierto).toLocaleString('de-DE')}
            </div>
            <p className="text-sm text-gray-400 mt-1">Monto que ya juntaste</p>
          </CardContent>
        </Card>
        <Card className="bg-[#1e293b]/60 border-[#334155] hover:bg-[#1e293b]/80 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] p-2 sm:p-4 text-sm sm:text-base">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5 text-red-400" />
              Gastos Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">
              ${Math.round(totalNoCubierto).toLocaleString('de-DE')}
            </div>
            <p className="text-sm text-gray-400 mt-1">Monto que resta juntar</p>
          </CardContent>
        </Card>
        <Card className="bg-[#1e293b]/60 border-[#334155] hover:bg-[#1e293b]/80 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] p-2 sm:p-4 text-sm sm:text-base">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5 text-blue-300" />
              Total de Gastos Fijos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-400">
              ${Math.round(totalGastos).toLocaleString('de-DE')}
            </div>
            <p className="text-sm text-gray-400 mt-1">Suma de todos los gastos</p>
          </CardContent>
        </Card>
      </div>
      <Card className="bg-[#181c2a]/80 border-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Gastos Fijos</CardTitle>
            <CardDescription className="text-gray-400">Tabla de tus gastos fijos mensuales</CardDescription>
          </div>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Agregar Gasto Fijo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-[#181c2a] text-white">
              <DialogHeader>
                <DialogTitle>Agregar Gasto Fijo</DialogTitle>
                <DialogDescription className="text-gray-300">Ingresa los detalles del gasto fijo que deseas registrar.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="add-nombre" className="text-right">Nombre</label>
                  <input
                    id="add-nombre"
                    className="col-span-3 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white"
                    value={addFields.nombre}
                    onChange={e => setAddFields({ ...addFields, nombre: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="add-monto" className="text-right">Monto</label>
                  <input
                    id="add-monto"
                    type="number"
                    className="col-span-3 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white"
                    value={addFields.monto}
                    onChange={e => setAddFields({ ...addFields, monto: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="add-categoria" className="text-right">Categoría</label>
                  <select
                    id="add-categoria"
                    className="col-span-3 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white"
                    value={creandoCategoria ? "__nueva__" : addFields.categoria}
                    onChange={e => {
                      if (e.target.value === "__nueva__") {
                        setCreandoCategoria(true)
                        setAddFields({ ...addFields, categoria: "" })
                      } else {
                        setCreandoCategoria(false)
                        setAddFields({ ...addFields, categoria: e.target.value })
                      }
                    }}
                  >
                    {categorias.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="__nueva__">Crear nueva categoría...</option>
                  </select>
                </div>
                {creandoCategoria && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="nueva-categoria" className="text-right">Nueva categoría</label>
                    <div className="col-span-3 flex gap-2">
                      <input
                        id="nueva-categoria"
                        className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white flex-1"
                        value={nuevaCategoria}
                        onChange={e => setNuevaCategoria(e.target.value)}
                        placeholder="Nombre de la categoría"
                      />
                      <Button type="button" size="sm" className="bg-blue-700 text-white" onClick={handleAgregarCategoria}>
                        Agregar
                      </Button>
                    </div>
                  </div>
                )}
                {/* Campo de cuotas solo si la categoría es Tarjeta de crédito */}
                {addFields.categoria === "Tarjeta de crédito" && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="add-cuotas" className="text-right">Cuotas</label>
                    <div className="col-span-3">
                      <input
                        id="add-cuotas"
                        type="number"
                        min={1}
                        max={36}
                        className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white w-full"
                        value={addFields.cuotas}
                        onChange={e => setAddFields({ ...addFields, cuotas: Number(e.target.value) })}
                      />
                      <p className="text-xs text-gray-400 mt-1">1 cuota de {addFields.cuotas || 1}</p>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="add-fecha" className="text-right">Fecha</label>
                  <input
                    id="add-fecha"
                    type="date"
                    className="col-span-3 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white"
                    value={addFields.fechaPago}
                    onChange={e => setAddFields({ ...addFields, fechaPago: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="add-cubierto" className="text-right">Cubierto</label>
                  <div className="col-span-3 flex items-center">
                    <Checkbox id="add-cubierto" checked={addFields.cubierto} onCheckedChange={v => setAddFields({ ...addFields, cubierto: v })} />
                    <span className="ml-2 text-sm">¿Ya cubierto?</span>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  onClick={async () => {
                    // Validación de campos obligatorios
                    if (!addFields.nombre || !addFields.monto || (!addFields.categoria && !nuevaCategoria) || !addFields.fechaPago) {
                      setError("Completa todos los campos obligatorios.")
                      return
                    }
                    let categoriaFinal = addFields.categoria
                    // Si está creando nueva categoría
                    if (creandoCategoria) {
                      if (!nuevaCategoria) {
                        setError("Debes ingresar el nombre de la nueva categoría.")
                        return
                      }
                      if (!categorias.includes(nuevaCategoria)) {
                        setCategorias([...categorias, nuevaCategoria])
                      }
                      categoriaFinal = nuevaCategoria
                    }
                    try {
                      const res = await fetch("/api/gastos-fijos", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ ...addFields, categoria: categoriaFinal }),
                      })
                      if (!res.ok) throw new Error("Error al guardar el gasto fijo")
                      const nuevo = await res.json()
                      setGastos([...gastos, nuevo])
                      setAddOpen(false)
                      setAddFields({ nombre: "", monto: "", categoria: categorias[0], fechaPago: hoy, cubierto: false, cuotas: 1 })
                      setCreandoCategoria(false)
                      setNuevaCategoria("")
                      setError(null)
                    } catch (err: any) {
                      setError(err.message)
                    }
                  }}
                >
                  Guardar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto w-full">
            <Card className="bg-[#181c2a]/80 border-none min-w-[600px] sm:min-w-0 p-2 sm:p-6 text-sm sm:text-base">
              <Table className="min-w-full text-sm rounded-xl overflow-hidden bg-[#181c2a]/80 border border-[#23204d]">
                <thead>
                  <tr className="bg-blue-950/80 text-blue-200 border-b border-[#23204d]">
                    <th className="px-4 py-3 text-left font-semibold">Icono</th>
                    <th className="px-4 py-3 text-left font-semibold">Nombre</th>
                    <th className="px-4 py-3 text-left font-semibold">Monto</th>
                    <th className="px-4 py-3 text-left font-semibold">Categoría</th>
                    <th className="px-4 py-3 text-left font-semibold">Cuotas</th>
                    <th className="px-4 py-3 text-left font-semibold">Fecha</th>
                    <th className="px-4 py-3 text-left font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {gastos.map((gasto, idx) => {
                    const Icon = categoriaIcons[gasto.categoria] || Circle
                    // Unifico la obtención de categorías únicas
                    const categoriasUnicas = [...new Set(gastos.map(g => g.categoria))]
                    const badgeColor = getColorCategoriaPorIndice(gasto.categoria, categoriasUnicas)
                    // Abrir modal de edición
                    const handleEdit = (gasto: any) => {
                      setGastoEdit(gasto)
                      setEditFields({
                        nombre: gasto.nombre,
                        monto: gasto.monto,
                        categoria: gasto.categoria,
                        fechaPago: gasto.fechaPago,
                        cuotas: gasto.cuotas,
                      })
                      setEditOpen(true)
                    }
                    return (
                      <tr key={gasto.id} className={cn(
                        idx % 2 === 0 ? "bg-[#101c3a]/80" : "bg-blue-950/40",
                        "border-b border-[#23204d] hover:bg-[#23204d]/80 hover:shadow-[0_0_8px_0_rgba(59,130,246,0.10)] transition-all"
                      )}>
                        <td className="px-4 py-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "h-8 w-8 rounded-full",
                              gasto.cubierto ? "text-green-500 hover:text-green-600" : "text-gray-500 hover:text-gray-400",
                            )}
                            onClick={() => handleToggleCubierto(gasto.id, gasto.cubierto, gasto)}
                          >
                            <span
                              className={cn(
                                "inline-block transition-transform duration-300",
                                gasto.cubierto && "animate-check-pop"
                              )}
                            >
                              {gasto.cubierto ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                            </span>
                            <span className="sr-only">
                              {gasto.cubierto ? "Marcar como no cubierto" : "Marcar como cubierto"}
                            </span>
                          </Button>
                        </td>
                        <td className={cn("px-4 py-3 text-white font-medium", gasto.cubierto ? "line-through text-gray-400" : "")}>{gasto.nombre}</td>
                        <td className={gasto.cubierto ? "px-4 py-3 text-gray-400" : "px-4 py-3 text-red-500 font-bold"}>${Math.round(gasto.monto).toLocaleString('de-DE')}</td>
                        <td className={gasto.cubierto ? "px-4 py-3 text-gray-400" : "px-4 py-3"}>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeColor} category-bounce-glow`}>{gasto.categoria}</span>
                        </td>
                        <td className={gasto.cubierto ? "px-4 py-3 text-gray-400 text-center" : "px-4 py-3 text-center"}>{gasto.categoria === "Tarjeta de crédito" && gasto.cuotas ? gasto.cuotas : "-"}</td>
                        <td className={gasto.cubierto ? "px-4 py-3 text-gray-400" : "px-4 py-3 text-gray-400"}>{format(gasto.fechaPago, "d 'de' MMMM", { locale: es })}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(gasto)}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteGasto(gasto.id)}>
                              <Trash className="h-4 w-4" />
                              <span className="sr-only">Eliminar</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </Table>
            </Card>
          </div>
        </CardContent>
      </Card>
      {/* Modal de edición */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[425px] bg-[#181c2a] text-white">
          <DialogHeader>
            <DialogTitle>Editar Gasto Fijo</DialogTitle>
            <DialogDescription className="text-gray-300">Modifica los datos del gasto fijo y guarda los cambios.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-nombre" className="text-right">Nombre</label>
              <input
                id="edit-nombre"
                className="col-span-3 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white"
                value={editFields.nombre || ""}
                onChange={e => setEditFields({ ...editFields, nombre: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-monto" className="text-right">Monto</label>
              <input
                id="edit-monto"
                type="number"
                className="col-span-3 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white"
                value={editFields.monto || ""}
                onChange={e => setEditFields({ ...editFields, monto: Number(e.target.value) })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-categoria" className="text-right">Categoría</label>
              <select
                id="edit-categoria"
                className="col-span-3 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white"
                value={editFields.categoria || ""}
                onChange={e => setEditFields({ ...editFields, categoria: e.target.value })}
              >
                {categorias.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            {/* Campo de cuotas solo si la categoría es Tarjeta de crédito */}
            {editFields.categoria === "Tarjeta de crédito" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-cuotas" className="text-right">Cuotas</label>
                <div className="col-span-3">
                  <input
                    id="edit-cuotas"
                    type="number"
                    min={1}
                    max={36}
                    className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white w-full"
                    value={editFields.cuotas || 1}
                    onChange={e => setEditFields({ ...editFields, cuotas: Number(e.target.value) })}
                  />
                  <p className="text-xs text-gray-400 mt-1">1 cuota de {editFields.cuotas || 1}</p>
                </div>
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-fecha" className="text-right">Fecha</label>
              <input
                id="edit-fecha"
                type="date"
                className="col-span-3 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white"
                value={editFields.fechaPago ? getFechaLocal(new Date(editFields.fechaPago)) : hoy}
                onChange={e => setEditFields({ ...editFields, fechaPago: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-cubierto" className="text-right">Cubierto</label>
              <div className="col-span-3 flex items-center">
                <Checkbox id="edit-cubierto" checked={editFields.cubierto} onCheckedChange={v => setEditFields({ ...editFields, cubierto: v })} />
                <span className="ml-2 text-sm">¿Ya cubierto?</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              onClick={handleEditGasto}
            >
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
