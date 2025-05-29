"use client"

import { useState, useEffect } from "react"
import { CalendarIcon, Edit, Plus, Trash, ShoppingCart, Car, Film, Pill, Coffee, TrendingDown } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
import { cn } from "@/lib/utils"

// Mapeo de categorías a iconos
const categoriaIcons: { [key: string]: any } = {
  "Alimentación": ShoppingCart,
  "Transporte": Car,
  "Entretenimiento": Film,
  "Salud": Pill,
  "Café": Coffee,
}

// Mapeo de categorías a emojis
const categoriaEmojis: { [key: string]: string } = {
  "Combustible": "⛽️",
  "Supermercado": "🛒",
  "Alimentación": "🍕",
  "Comida": "🍔",
  "Café": "☕️",
  "Farmacia": "💊",
  "Entretenimiento": "🎬",
  "Transporte": "🚌",
  "Salud": "🩺",
  "Bar": "🍻",
  "Verdulería": "🥦",
  "Restaurante": "🍽️",
  "Uber": "🚕",
  "Cine": "🎥",
  "Mascota": "🐶",
  "Ropa": "👕",
  "Facultad": "📚",
  "Universidad": "📚",
  "Colegio": "📚",
  "Tecnología": "💻",
  "Regalos": "🎁",
  "Viaje": "✈️",
  "Hogar": "🏠",
  "Servicios": "💡",
  "Suscripciones": "📺",
  "Veterinaria": "🏥",
  "Coche": "🚗",
  "Otros": "💸"
}

// Color uniforme para cards y fondo de iconos
const cardBg = "bg-[#101c3a] border-none"
const iconBg = "bg-blue-900/60"

// Mapeo de categorías a colores de badge
const categoriaBadgeColors: { [key: string]: string } = {
  "Alimentación": "bg-blue-600/20 text-blue-400",
  "Transporte": "bg-green-600/20 text-green-400",
  "Entretenimiento": "bg-purple-600/20 text-purple-400",
  "Salud": "bg-red-600/20 text-red-400",
  "Café": "bg-yellow-500/20 text-yellow-400",
  "Otros": "bg-gray-600/20 text-gray-300",
}

const gastosDiarios = [
  {
    id: 1,
    nombre: "Supermercado",
    monto: 85.4,
    categoria: "Alimentación",
    fecha: new Date(2025, 4, 11),
  },
  {
    id: 2,
    nombre: "Gasolina",
    monto: 45.0,
    categoria: "Transporte",
    fecha: new Date(2025, 4, 10),
  },
  {
    id: 3,
    nombre: "Restaurante",
    monto: 32.5,
    categoria: "Alimentación",
    fecha: new Date(2025, 4, 10),
  },
  {
    id: 4,
    nombre: "Cine",
    monto: 24.0,
    categoria: "Entretenimiento",
    fecha: new Date(2025, 4, 9),
  },
  {
    id: 5,
    nombre: "Farmacia",
    monto: 18.75,
    categoria: "Salud",
    fecha: new Date(2025, 4, 8),
  },
  {
    id: 6,
    nombre: "Café",
    monto: 4.5,
    categoria: "Alimentación",
    fecha: new Date(2025, 4, 8),
  },
  {
    id: 7,
    nombre: "Taxi",
    monto: 12.0,
    categoria: "Transporte",
    fecha: new Date(2025, 4, 7),
  },
]

// Calcular totales por categoría
const calcularTotalesPorCategoria = (gastos: any[]) => {
  return gastos.reduce((acc, gasto) => {
    acc[gasto.categoria] = (acc[gasto.categoria] || 0) + (Number(gasto.monto) || 0)
    return acc
  }, {} as { [key: string]: number })
}

// Array de colores únicos para etiquetas de categoría
const COLORES_ETIQUETA = [
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
  "bg-gray-600/20 text-gray-300",
]

function getColorCategoria(categoria: string, categorias: string[]): string {
  const index = categorias.indexOf(categoria)
  return COLORES_ETIQUETA[index % COLORES_ETIQUETA.length]
}

// Utilidad para obtener la fecha local de Buenos Aires en formato YYYY-MM-DD
function getFechaBuenosAires() {
  const ahora = new Date();
  // Buenos Aires es UTC-3
  const offset = -3 * 60; // en minutos
  const local = new Date(ahora.getTime() + (offset - ahora.getTimezoneOffset()) * 60000);
  return local.toISOString().split('T')[0];
}

export function GastosDiarios() {
  const [gastos, setGastos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [gastoEdit, setGastoEdit] = useState<any>(null)
  const [editFields, setEditFields] = useState<any>({})
  const [addOpen, setAddOpen] = useState(false)
  const [categorias, setCategorias] = useState<string[]>([])
  const [nuevaCategoria, setNuevaCategoria] = useState("")
  const [creandoCategoria, setCreandoCategoria] = useState(false)

  // Estado inicial de addFields con fecha actual
  const hoy = new Date().toISOString().split('T')[0]
  const [addFields, setAddFields] = useState<any>({ nombre: "", monto: "", categoria: "Alimentación", fecha: hoy })

  const categoriasPredefinidas = ["Alimentación", "Transporte", "Entretenimiento", "Salud", "Café"];

  useEffect(() => {
    async function fetchGastos() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/gastos-diarios")
        if (!res.ok) throw new Error("Error al cargar los gastos diarios")
        const data = await res.json()
        setGastos(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchGastos()
  }, [])

  async function fetchCategorias() {
    try {
      const res = await fetch("/api/categorias-gasto-diario", { cache: "no-store" })
      if (!res.ok) throw new Error("Error al cargar las categorías")
      const data = await res.json()
      let personalizadas = Array.isArray(data) ? data.map((cat: any) => cat.nombre) : [];
      // Unir y eliminar duplicados (case insensitive)
      const todas = [...categoriasPredefinidas, ...personalizadas].filter(
        (cat, idx, arr) =>
          arr.findIndex(c => c.trim().toLowerCase() === cat.trim().toLowerCase()) === idx
      );
      setCategorias(todas);
    } catch (err) {
      setCategorias(categoriasPredefinidas);
    }
  }

  useEffect(() => {
    fetchCategorias()
  }, [addOpen])

  async function handleAddGasto() {
    try {
      const res = await fetch("/api/gastos-diarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addFields),
      })
      if (!res.ok) throw new Error("Error al guardar el gasto diario")
      const nuevo = await res.json()
      setGastos([...gastos, nuevo])
      setAddOpen(false)
      setAddFields({ nombre: "", monto: "", categoria: "Alimentación", fecha: hoy })
    } catch (err: any) {
      setError(err.message)
    }
  }

  async function handleEditGasto() {
    try {
      const res = await fetch("/api/gastos-diarios", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editFields, id: gastoEdit.id }),
      })
      if (!res.ok) throw new Error("Error al editar el gasto diario")
      const actualizado = await res.json()
      setGastos(gastos.map(g => g.id === actualizado.id ? actualizado : g))
      setEditOpen(false)
    } catch (err: any) {
      setError(err.message)
    }
  }

  async function handleDeleteGasto(id: string) {
    try {
      const res = await fetch("/api/gastos-diarios", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error("Error al eliminar el gasto diario")
      setGastos(gastos.filter(g => g.id !== id))
    } catch (err: any) {
      setError(err.message)
    }
  }

  const totalGeneral = gastos.reduce((sum, gasto) => sum + (Number(gasto.monto) || 0), 0)
  const totalesPorCategoria = calcularTotalesPorCategoria(gastos)

  const getFechaFormateada = (fecha: any) => {
    // Si es string tipo 'YYYY-MM-DD', mostrarla tal cual en local
    if (typeof fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      // Formatear a 'd de MMMM' en local
      const [year, month, day] = fecha.split('-')
      const dateObj = new Date(Number(year), Number(month) - 1, Number(day))
      return format(dateObj, "d 'de' MMMM", { locale: es })
    }
    // Si es string ISO, convertir a Date
    if (typeof fecha === 'string') {
      const d = new Date(fecha)
      if (!isNaN(d.getTime())) return format(d, "d 'de' MMMM", { locale: es })
    }
    // Si es Date
    if (fecha instanceof Date && !isNaN(fecha.getTime())) {
      return format(fecha, "d 'de' MMMM", { locale: es })
    }
    // Si no hay fecha válida, mostrar vacío
    return ''
  }

  return (
    <div className="space-y-6">
      {/* Header con resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-[#1e293b]/60 border-[#334155] hover:bg-[#1e293b]/80 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-blue-400" />
              Gastos Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${totalGeneral.toFixed(2)}
            </div>
            <p className="text-sm text-gray-400 mt-1">Total de gastos este mes</p>
          </CardContent>
        </Card>
        <Card className="bg-[#1e293b]/60 border-[#334155] hover:bg-[#1e293b]/80 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-green-400" />
              Gastos Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${gastos.length > 0 ? (totalGeneral / gastos.length).toFixed(2) : "0.00"}
            </div>
            <p className="text-sm text-gray-400 mt-1">Gasto promedio diario</p>
          </CardContent>
        </Card>
        <Card className="bg-[#1e293b]/60 border-[#334155] hover:bg-[#1e293b]/80 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-400" />
              Gastos Máximos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${gastos.length > 0 ? gastos.reduce((max, gasto) => Math.max(max, Number(gasto.monto) || 0), 0).toFixed(2) : "0.00"}
            </div>
            <p className="text-sm text-gray-400 mt-1">Gasto máximo registrado</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla moderna de gastos diarios */}
      <div className="overflow-x-auto w-full">
        <Card className="bg-[#181c2a]/80 border-none min-w-[600px] sm:min-w-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Gastos Diarios</CardTitle>
              <CardDescription className="text-gray-400">Tabla de tus gastos diarios</CardDescription>
            </div>
            <Dialog open={addOpen} onOpenChange={(open) => {
              setAddOpen(open)
              setError(null)
              setCreandoCategoria(false)
              setNuevaCategoria("")
              if (open) {
                setAddFields({ nombre: "", monto: "", categoria: "Alimentación", fecha: hoy })
              }
            }}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Gasto
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-[#181c2a] text-white">
                <DialogHeader>
                  <DialogTitle>Agregar Gasto</DialogTitle>
                  <DialogDescription className="text-gray-300">Ingresa los detalles del gasto que deseas registrar.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="add-nombre" className="text-right">Nombre</label>
                    <input
                      id="add-nombre"
                      className="col-span-3 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white"
                      value={addFields.nombre}
                      onChange={e => setAddFields((fields: any) => ({ ...fields, nombre: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="add-monto" className="text-right">Monto</label>
                    <input
                      id="add-monto"
                      type="number"
                      className="col-span-3 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white"
                      value={addFields.monto}
                      onChange={e => setAddFields((fields: any) => ({ ...fields, monto: e.target.value }))}
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
                          setAddFields((fields: any) => ({ ...fields, categoria: "" }))
                        } else {
                          setCreandoCategoria(false)
                          setAddFields((fields: any) => ({ ...fields, categoria: e.target.value }))
                        }
                      }}
                    >
                      {categorias.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      <option value="__nueva__">Agregar nueva categoría...</option>
                    </select>
                  </div>
                  {creandoCategoria && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="nueva-categoria" className="text-right">Nueva categoría</label>
                      <input
                        id="nueva-categoria"
                        className="col-span-3 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white"
                        value={nuevaCategoria}
                        onChange={e => setNuevaCategoria(e.target.value)}
                        placeholder="Nombre de la categoría"
                      />
                      <Button
                        type="button"
                        size="sm"
                        className="bg-blue-700 text-white mt-2 col-span-4"
                        onClick={async () => {
                          const nombreNormalizado = nuevaCategoria.trim().toLowerCase()
                          const existe = categorias.some(cat => cat.trim().toLowerCase() === nombreNormalizado)
                          if (!nuevaCategoria) {
                            setError("El nombre de la categoría no puede estar vacío.")
                            return
                          }
                          if (existe) {
                            setError("La categoría ya existe.")
                            return
                          }
                          if (categorias.length >= 10) {
                            setError("No se pueden crear más de 10 categorías.")
                            return
                          }
                          try {
                            const res = await fetch("/api/categorias-gasto-diario", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ nombre: nuevaCategoria.trim() }),
                            })
                            if (!res.ok) {
                              const data = await res.json()
                              setError(data.error || "Error al crear la categoría")
                              return
                            }
                            await fetchCategorias();
                            setAddFields((fields: any) => ({ ...fields, categoria: nuevaCategoria.trim() }))
                            setNuevaCategoria("")
                            setCreandoCategoria(false)
                            setError(null)
                          } catch (err: any) {
                            setError("Error al crear la categoría")
                          }
                        }}
                      >
                        Agregar
                      </Button>
                    </div>
                  )}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="add-fecha" className="text-right">Fecha</label>
                    <input
                      id="add-fecha"
                      type="date"
                      className="col-span-3 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white"
                      value={addFields.fecha}
                      onChange={e => setAddFields((fields: any) => ({ ...fields, fecha: e.target.value }))}
                    />
                  </div>
                  {error && <div className="text-red-400 text-sm col-span-4">{error}</div>}
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    onClick={async () => {
                      // Validación de campos obligatorios
                      if (!addFields.nombre || !addFields.monto || (!addFields.categoria && !nuevaCategoria)) {
                        setError("Completa todos los campos obligatorios.");
                        return;
                      }
                      let categoriaFinal = addFields.categoria;
                      let fechaFinal = addFields.fecha || getFechaBuenosAires();
                      // Si está creando nueva categoría
                      if (creandoCategoria && nuevaCategoria) {
                        if (categorias.length >= 10) {
                          setError("No se pueden crear más de 10 categorías.");
                          return;
                        }
                        if (!categorias.includes(nuevaCategoria)) {
                          setCategorias([...categorias, nuevaCategoria]);
                        }
                        categoriaFinal = nuevaCategoria;
                      }
                      try {
                        const res = await fetch("/api/gastos-diarios", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ ...addFields, categoria: categoriaFinal, fecha: fechaFinal }),
                        });
                        if (!res.ok) throw new Error("Error al guardar el gasto diario");
                        const nuevo = await res.json();
                        setGastos([...gastos, nuevo]);
                        setAddOpen(false);
                        setAddFields({ nombre: "", monto: "", categoria: "Alimentación", fecha: hoy });
                        setCreandoCategoria(false);
                        setNuevaCategoria("");
                        setError(null);
                      } catch (err: any) {
                        setError(err.message);
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
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm rounded-xl overflow-hidden bg-[#181c2a]/80 border border-[#23204d]">
                <thead>
                  <tr className="bg-blue-950/80 text-blue-200 border-b border-[#23204d]">
                    {/* <th className="px-4 py-3 text-left font-semibold">Icono</th> */}
                    <th className="px-4 py-3 text-left font-semibold"> </th>
                    <th className="px-4 py-3 text-left font-semibold">Nombre</th>
                    <th className="px-4 py-3 text-left font-semibold">Monto</th>
                    <th className="px-4 py-3 text-left font-semibold">Categoría</th>
                    <th className="px-4 py-3 text-left font-semibold">Fecha</th>
                    <th className="px-4 py-3 text-left font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {gastos.map((gasto, idx) => {
                    const Icon = categoriaIcons[gasto.categoria] || ShoppingCart
                    const categoriasUnicas = [...new Set(gastos.map(g => g.categoria))]
                    const badgeColor = getColorCategoria(gasto.categoria, categoriasUnicas)
                    // Abrir modal de edición
                    const handleEdit = (gasto: any) => {
                      setGastoEdit(gasto)
                      setEditFields((fields: any) => ({
                        nombre: gasto.nombre,
                        monto: gasto.monto,
                        categoria: gasto.categoria,
                        fecha: gasto.fecha,
                      }))
                      setEditOpen(true)
                    }
                    // Emoji representativo
                    const emoji = categoriaEmojis[gasto.categoria] || "💸"
                    return (
                      <tr key={gasto.id} className={[
                        idx % 2 === 0 ? "bg-[#101c3a]/80" : "bg-blue-950/40",
                        "border-b border-[#23204d] hover:bg-[#23204d]/80 hover:shadow-[0_0_8px_0_rgba(59,130,246,0.10)] transition-all"
                      ].join(' ')}>
                        <td className="px-4 py-3 text-xl">{emoji}</td>
                        <td className="px-4 py-3 text-white font-medium">{gasto.nombre}</td>
                        <td className="px-4 py-3 text-red-500 font-bold">-${gasto.monto.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeColor} category-bounce-glow`}>{gasto.categoria}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-400">{getFechaFormateada(gasto.fecha)}</td>
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
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de edición */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[425px] bg-[#181c2a] text-white">
          <DialogHeader>
            <DialogTitle>Editar Gasto</DialogTitle>
            <DialogDescription className="text-gray-300">Modifica los datos del gasto y guarda los cambios.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-nombre" className="text-right">Nombre</label>
              <input
                id="edit-nombre"
                className="col-span-3 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white"
                value={editFields.nombre || ""}
                onChange={e => setEditFields((fields: any) => ({ ...fields, nombre: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-monto" className="text-right">Monto</label>
              <input
                id="edit-monto"
                type="number"
                className="col-span-3 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white"
                value={editFields.monto || ""}
                onChange={e => setEditFields((fields: any) => ({ ...fields, monto: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-categoria" className="text-right">Categoría</label>
              <select
                id="edit-categoria"
                className="col-span-3 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white"
                value={creandoCategoria ? "__nueva__" : editFields.categoria}
                onChange={e => {
                  if (e.target.value === "__nueva__") {
                    setCreandoCategoria(true)
                    setEditFields((fields: any) => ({ ...fields, categoria: "" }))
                  } else {
                    setCreandoCategoria(false)
                    setEditFields((fields: any) => ({ ...fields, categoria: e.target.value }))
                  }
                }}
              >
                {categorias.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="__nueva__">Agregar nueva categoría...</option>
              </select>
            </div>
            {creandoCategoria && (
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="nueva-categoria-edit" className="text-right">Nueva categoría</label>
                <input
                  id="nueva-categoria-edit"
                  className="col-span-3 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white"
                  value={nuevaCategoria}
                  onChange={e => setNuevaCategoria(e.target.value)}
                  placeholder="Nombre de la categoría"
                />
                <Button
                  type="button"
                  size="sm"
                  className="bg-blue-700 text-white mt-2 col-span-4"
                  onClick={async () => {
                    const nombreNormalizado = nuevaCategoria.trim().toLowerCase()
                    const existe = categorias.some(cat => cat.trim().toLowerCase() === nombreNormalizado)
                    if (!nuevaCategoria) {
                      setError("El nombre de la categoría no puede estar vacío.")
                      return
                    }
                    if (existe) {
                      setError("La categoría ya existe.")
                      return
                    }
                    if (categorias.length >= 10) {
                      setError("No se pueden crear más de 10 categorías.")
                      return
                    }
                    try {
                      const res = await fetch("/api/categorias-gasto-diario", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ nombre: nuevaCategoria.trim() }),
                      })
                      if (!res.ok) {
                        const data = await res.json()
                        setError(data.error || "Error al crear la categoría")
                        return
                      }
                      await fetchCategorias();
                      setEditFields((fields: any) => ({ ...fields, categoria: nuevaCategoria.trim() }))
                      setNuevaCategoria("")
                      setCreandoCategoria(false)
                      setError(null)
                    } catch (err: any) {
                      setError("Error al crear la categoría")
                    }
                  }}
                >
                  Agregar
                </Button>
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-fecha" className="text-right">Fecha</label>
              <input
                id="edit-fecha"
                type="date"
                className="col-span-3 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white"
                value={editFields.fecha ? (typeof editFields.fecha === 'string' ? editFields.fecha : new Date(editFields.fecha.getTime() - editFields.fecha.getTimezoneOffset() * 60000).toISOString().split('T')[0]) : ""}
                onChange={e => setEditFields((fields: any) => ({ ...fields, fecha: e.target.value }))}
              />
            </div>
            {error && <div className="text-red-400 text-sm col-span-4">{error}</div>}
          </div>
          <DialogFooter>
            <Button
              type="button"
              className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white"
              onClick={async () => {
                // Validación de campos obligatorios
                if (!editFields.nombre || !editFields.categoria || !editFields.fecha || isNaN(Number(editFields.monto)) || Number(editFields.monto) <= 0) {
                  setError("Completa todos los campos obligatorios.")
                  return
                }
                setError(null)
                try {
                  const res = await fetch("/api/gastos-diarios", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...editFields, id: gastoEdit.id }),
                  })
                  if (!res.ok) {
                    const data = await res.json()
                    setError(data.error || "Error al editar el gasto diario")
                    return
                  }
                  const actualizado = await res.json()
                  setGastos(gastos.map(g => g.id === actualizado.id ? actualizado : g))
                  setEditOpen(false)
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
    </div>
  )
}
