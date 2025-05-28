"use client"

import { useState, useEffect } from "react"
import { CalendarIcon, Edit, Plus, Trash, PiggyBank, Banknote, Shield, TrendingUp, CheckCircle2, Circle, Home, Plane, Car, GraduationCap, Heart } from "lucide-react"
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
import { Checkbox } from "@/components/ui/checkbox"

type Ahorro = {
  id: number
  nombre: string
  monto: number
  categoria: string
  fecha: Date
  objetivo?: number
  icono?: string
}

// Mapeo de categorías a iconos
const categoriaIcons: { [key: string]: any } = {
  "Cuenta de ahorros": PiggyBank,
  "Fondo de emergencia": Shield,
  "Inversiones": Banknote,
}

// Mapeo de categorías a colores
const categoriaColors: { [key: string]: string } = {
  "Cuenta de ahorros": "from-sky-500 to-blue-600",
  "Fondo de emergencia": "from-cyan-500 to-cyan-700",
  "Inversiones": "from-indigo-500 to-indigo-700",
}

const iconosDisponibles = [
  { value: "PiggyBank", label: "Ahorro", icon: PiggyBank },
  { value: "Home", label: "Casa", icon: Home },
  { value: "Plane", label: "Viaje", icon: Plane },
  { value: "Car", label: "Auto", icon: Car },
  { value: "GraduationCap", label: "Educación", icon: GraduationCap },
  { value: "Heart", label: "Salud", icon: Heart },
  { value: "Banknote", label: "Inversión", icon: Banknote },
  { value: "Shield", label: "Fondo emergencia", icon: Shield },
]

const ahorrosIniciales: Ahorro[] = [
  {
    id: 1,
    nombre: "Comprar casa",
    monto: 50,
    categoria: "Cuenta de ahorros",
    fecha: new Date(2025, 4, 1),
    objetivo: 1000,
    icono: "Home",
  },
  {
    id: 2,
    nombre: "Comprar casa",
    monto: 100,
    categoria: "Cuenta de ahorros",
    fecha: new Date(2025, 4, 5),
    objetivo: 1000,
    icono: "Home",
  },
  {
    id: 3,
    nombre: "Fondo de emergencia",
    monto: 2000,
    categoria: "Fondo de emergencia",
    fecha: new Date(2025, 4, 10),
    objetivo: 3000,
    icono: "Shield",
  },
]

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

// Utilidad para obtener la fecha local en formato YYYY-MM-DD
function getFechaLocal(date = new Date()) {
  const tzOffset = date.getTimezoneOffset() * 60000
  const localISO = new Date(date.getTime() - tzOffset).toISOString().split('T')[0]
  return localISO
}

export function Ahorros() {
  const [ahorros, setAhorros] = useState<Ahorro[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [ahorroEdit, setAhorroEdit] = useState<any>(null)
  const [editFields, setEditFields] = useState<any>({})
  const [addOpen, setAddOpen] = useState(false)
  const [addFields, setAddFields] = useState<any>({ nombre: "", monto: "", categoria: "Cuenta de ahorros", fecha: getFechaLocal(), objetivo: "" })
  const [categorias, setCategorias] = useState<string[]>(Object.keys(categoriaIcons))
  const [creandoCategoria, setCreandoCategoria] = useState(false)
  const [nuevaCategoria, setNuevaCategoria] = useState("")

  useEffect(() => {
    async function fetchAhorros() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/ahorros")
        if (!res.ok) throw new Error("Error al cargar los ahorros")
        const data = await res.json()
        setAhorros(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchAhorros()
  }, [])

  const totalGeneral = ahorros.reduce((sum, a) => sum + a.monto, 0)
  const totalesPorCategoria = ahorros.reduce((acc: { [key: string]: number }, ahorro) => {
    acc[ahorro.categoria] = (acc[ahorro.categoria] || 0) + ahorro.monto
    return acc
  }, {})

  // Agrupar por nombre para calcular progreso
  const ahorrosPorNombre: { [nombre: string]: { total: number, objetivo?: number, icono?: string } } = {}
  ahorros.forEach(a => {
    if (!ahorrosPorNombre[a.nombre]) {
      ahorrosPorNombre[a.nombre] = { total: 0, objetivo: a.objetivo, icono: a.icono }
    }
    ahorrosPorNombre[a.nombre].total += a.monto
    if (a.objetivo) ahorrosPorNombre[a.nombre].objetivo = a.objetivo
    if (a.icono) ahorrosPorNombre[a.nombre].icono = a.icono
  })

  // Calcular porcentaje global de avance
  const sumaAhorrosConObjetivo = Object.values(ahorrosPorNombre)
    .filter(a => a.objetivo)
    .reduce((sum, a) => sum + a.total, 0)
  const sumaObjetivos = Object.values(ahorrosPorNombre)
    .filter(a => a.objetivo)
    .reduce((sum, a) => sum + (a.objetivo || 0), 0)
  const porcentajeGlobal = sumaObjetivos > 0 ? Math.min(100, Math.round((sumaAhorrosConObjetivo / sumaObjetivos) * 100)) : 0

  async function handleAddAhorro() {
    // Validación de campos obligatorios
    if (!addFields.nombre || !addFields.categoria || !addFields.fecha || isNaN(Number(addFields.monto)) || Number(addFields.monto) <= 0) {
      setError("Completa todos los campos obligatorios.")
      return
    }
    try {
      const res = await fetch("/api/ahorros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addFields),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Error al guardar el ahorro")
        return
      }
      const nuevo = await res.json()
      setAhorros([...ahorros, nuevo])
      setAddOpen(false)
      setAddFields({ nombre: "", monto: "", categoria: "Cuenta de ahorros", fecha: getFechaLocal(), objetivo: "" })
      setError(null)
    } catch (err: any) {
      setError(err.message)
    }
  }

  async function handleEditAhorro() {
    try {
      const res = await fetch("/api/ahorros", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editFields, id: ahorroEdit.id }),
      })
      if (!res.ok) throw new Error("Error al editar el ahorro")
      const actualizado = await res.json()
      setAhorros(ahorros.map(a => a.id === actualizado.id ? actualizado : a))
      setEditOpen(false)
    } catch (err: any) {
      setError(err.message)
    }
  }

  async function handleDeleteAhorro(id: string) {
    try {
      const res = await fetch("/api/ahorros", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error("Error al eliminar el ahorro")
      setAhorros(ahorros.filter(a => String(a.id) !== String(id)))
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="space-y-6">
      {/* Cards resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
        <Card className="bg-[#1e293b]/60 border-[#334155] hover:bg-[#1e293b]/80 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] p-2 sm:p-4 text-sm sm:text-base">
          <CardHeader className="p-2 sm:p-4">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <PiggyBank className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
              Ahorro Total
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-4">
            <div className="text-2xl sm:text-3xl font-bold text-blue-400">
              ${totalGeneral.toFixed(2)}
            </div>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">Suma de todos los ahorros</p>
          </CardContent>
        </Card>
        <Card className="bg-[#1e293b]/60 border-[#334155] hover:bg-[#1e293b]/80 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] p-2 sm:p-4 text-sm sm:text-base">
          <CardHeader className="p-2 sm:p-4">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <PiggyBank className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
              Objetivo Alcanzado
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-4">
            <div className="text-2xl sm:text-3xl font-bold text-green-400">
              {porcentajeGlobal}%
            </div>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">Porcentaje total respecto a todos los objetivos</p>
          </CardContent>
        </Card>
        <Card className="bg-[#1e293b]/60 border-[#334155] hover:bg-[#1e293b]/80 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] p-2 sm:p-4 text-sm sm:text-base">
          <CardHeader className="p-2 sm:p-4">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <PiggyBank className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
              Porcentaje de Avance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-4">
            <div className="text-2xl sm:text-3xl font-bold text-yellow-400">
              {porcentajeGlobal}%
            </div>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">Porcentaje total respecto a todos los objetivos</p>
          </CardContent>
        </Card>
      </div>
      {/* Tabla moderna de ahorros */}
      <Card className="bg-[#181c2a]/80 border-none">
        <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-6">
          <div>
            <CardTitle className="text-base sm:text-lg">Ahorros</CardTitle>
            <CardDescription className="text-xs sm:text-sm text-gray-400">Tabla de tus ahorros</CardDescription>
          </div>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-xs sm:text-sm">
                <Plus className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                Agregar Ahorro
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-[#181c2a] text-white">
              <DialogHeader>
                <DialogTitle className="text-base sm:text-lg">Agregar Ahorro</DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-gray-300">Ingresa los detalles del ahorro que deseas registrar.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 sm:gap-4 py-3 sm:py-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                  <label htmlFor="add-nombre" className="text-xs sm:text-sm sm:text-right">Nombre</label>
                  <input
                    id="add-nombre"
                    className="col-span-1 sm:col-span-3 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white text-sm"
                    value={addFields.nombre}
                    onChange={e => setAddFields({ ...addFields, nombre: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                  <label htmlFor="add-monto" className="text-xs sm:text-sm sm:text-right">Monto</label>
                  <input
                    id="add-monto"
                    type="number"
                    className="col-span-1 sm:col-span-3 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white text-sm"
                    value={addFields.monto}
                    onChange={e => setAddFields({ ...addFields, monto: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                  <label htmlFor="add-categoria" className="text-xs sm:text-sm sm:text-right">Categoría</label>
                  <select
                    id="add-categoria"
                    className="col-span-1 sm:col-span-3 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white text-sm"
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
                    <option value="__nueva__">Agregar nueva categoría...</option>
                  </select>
                </div>
                {creandoCategoria && (
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                    <label htmlFor="nueva-categoria" className="text-xs sm:text-sm sm:text-right">Nueva categoría</label>
                    <div className="col-span-1 sm:col-span-3 flex gap-2">
                      <input
                        id="nueva-categoria"
                        className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white text-sm flex-1"
                        value={nuevaCategoria}
                        onChange={e => setNuevaCategoria(e.target.value)}
                        placeholder="Nombre de la categoría"
                      />
                      <Button type="button" size="sm" className="bg-blue-700 text-white text-xs sm:text-sm" onClick={() => {
                        if (nuevaCategoria && !categorias.includes(nuevaCategoria)) {
                          setCategorias([...categorias, nuevaCategoria])
                          setAddFields({ ...addFields, categoria: nuevaCategoria })
                          setNuevaCategoria("")
                          setCreandoCategoria(false)
                        }
                      }}>
                        Agregar
                      </Button>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                  <label htmlFor="add-fecha" className="text-xs sm:text-sm sm:text-right">Fecha</label>
                  <input
                    id="add-fecha"
                    type="date"
                    className="col-span-1 sm:col-span-3 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white text-sm"
                    value={addFields.fecha}
                    onChange={e => setAddFields({ ...addFields, fecha: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                  <label htmlFor="add-objetivo" className="text-xs sm:text-sm sm:text-right">Objetivo</label>
                  <input
                    id="add-objetivo"
                    type="number"
                    className="col-span-1 sm:col-span-3 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white text-sm"
                    value={addFields.objetivo}
                    onChange={e => setAddFields({ ...addFields, objetivo: e.target.value })}
                    placeholder="Opcional"
                  />
                </div>
                {error && <div className="text-red-400 text-xs sm:text-sm col-span-4">{error}</div>}
              </div>
              <DialogFooter>
                <Button type="button" className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white text-xs sm:text-sm" onClick={handleAddAhorro}>
                  Guardar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-2 sm:p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs sm:text-sm rounded-xl overflow-hidden bg-[#181c2a]/80 border border-[#23204d]">
              <thead>
                <tr className="bg-blue-950/80 text-blue-200 border-b border-[#23204d]">
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold">Icono</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold">Nombre</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold">Monto</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold">Categoría</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold">Fecha</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ahorros.map((ahorro, idx) => {
                  const categoriasUnicas = [...new Set(ahorros.map(a => a.categoria))]
                  const badgeColor = getColorCategoriaPorIndice(ahorro.categoria, categoriasUnicas)
                  const progreso = ahorro.objetivo && ahorrosPorNombre[ahorro.nombre]
                    ? Math.min(100, Math.round((ahorrosPorNombre[ahorro.nombre].total / (ahorrosPorNombre[ahorro.nombre].objetivo || 1)) * 100))
                    : null
                  const Icon = iconosDisponibles.find(i => i.value === (ahorro.icono || "PiggyBank"))?.icon || PiggyBank
                  const handleEdit = (ahorro: any) => {
                    setAhorroEdit(ahorro)
                    setEditFields({
                      nombre: ahorro.nombre,
                      monto: ahorro.monto,
                      categoria: ahorro.categoria,
                      fecha: ahorro.fecha,
                      objetivo: ahorro.objetivo || "",
                      icono: ahorro.icono || "PiggyBank",
                    })
                    setEditOpen(true)
                  }
                  return (
                    <tr key={ahorro.id} className={[
                      idx % 2 === 0 ? "bg-[#101c3a]/80" : "bg-blue-950/40",
                      "border-b border-[#23204d] hover:bg-[#23204d]/80 hover:shadow-[0_0_8px_0_rgba(59,130,246,0.10)] transition-all"
                    ].join(' ')}>
                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        <div className="p-1 sm:p-2 rounded-lg bg-blue-900/60 w-fit">
                          <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-white font-medium">
                        {ahorro.nombre}
                        {ahorro.objetivo && (
                          <div className="mt-1">
                            <div className="w-full h-1.5 sm:h-2 bg-green-900 rounded-full overflow-hidden">
                              <div
                                className="h-1.5 sm:h-2 bg-green-500 rounded-full transition-all"
                                style={{ width: `${progreso}%` }}
                              />
                            </div>
                            <span className="text-xs text-green-400 font-semibold mt-0.5 sm:mt-1 block">
                              {progreso}% de ${ahorrosPorNombre[ahorro.nombre].objetivo}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-green-400 font-bold">+${ahorro.monto.toFixed(2)}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold ${badgeColor} category-bounce-glow`}>{ahorro.categoria}</span>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-400">{format(ahorro.fecha, "d 'de' MMMM", { locale: es })}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-6 w-6 sm:h-8 sm:w-8" onClick={() => handleEdit(ahorro)}>
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6 sm:h-8 sm:w-8" onClick={() => handleDeleteAhorro(ahorro.id.toString())}>
                            <Trash className="h-3 w-3 sm:h-4 sm:w-4" />
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
      {/* Modal de edición */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[425px] bg-[#181c2a] text-white">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Editar Ahorro</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-gray-300">Modifica los datos del ahorro y guarda los cambios.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:gap-4 py-3 sm:py-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <label htmlFor="edit-nombre" className="text-xs sm:text-sm sm:text-right">Nombre</label>
              <input
                id="edit-nombre"
                className="col-span-1 sm:col-span-3 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white text-sm"
                value={editFields.nombre || ""}
                onChange={e => setEditFields({ ...editFields, nombre: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <label htmlFor="edit-monto" className="text-xs sm:text-sm sm:text-right">Monto</label>
              <input
                id="edit-monto"
                type="number"
                className="col-span-1 sm:col-span-3 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white text-sm"
                value={editFields.monto || ""}
                onChange={e => setEditFields({ ...editFields, monto: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <label htmlFor="edit-categoria" className="text-xs sm:text-sm sm:text-right">Categoría</label>
              <select
                id="edit-categoria"
                className="col-span-1 sm:col-span-3 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white text-sm"
                value={creandoCategoria ? "__nueva__" : editFields.categoria}
                onChange={e => {
                  if (e.target.value === "__nueva__") {
                    setCreandoCategoria(true)
                    setEditFields({ ...editFields, categoria: "" })
                  } else {
                    setCreandoCategoria(false)
                    setEditFields({ ...editFields, categoria: e.target.value })
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
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                <label htmlFor="nueva-categoria-edit" className="text-xs sm:text-sm sm:text-right">Nueva categoría</label>
                <div className="col-span-1 sm:col-span-3 flex gap-2">
                  <input
                    id="nueva-categoria-edit"
                    className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white text-sm flex-1"
                    value={nuevaCategoria}
                    onChange={e => setNuevaCategoria(e.target.value)}
                    placeholder="Nombre de la categoría"
                  />
                  <Button type="button" size="sm" className="bg-blue-700 text-white text-xs sm:text-sm" onClick={() => {
                    if (nuevaCategoria && !categorias.includes(nuevaCategoria)) {
                      setCategorias([...categorias, nuevaCategoria])
                      setEditFields({ ...editFields, categoria: nuevaCategoria })
                      setNuevaCategoria("")
                      setCreandoCategoria(false)
                    }
                  }}>
                    Agregar
                  </Button>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <label htmlFor="edit-fecha" className="text-xs sm:text-sm sm:text-right">Fecha</label>
              <input
                id="edit-fecha"
                type="date"
                className="col-span-1 sm:col-span-3 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white text-sm"
                value={editFields.fecha ? (typeof editFields.fecha === 'string' ? editFields.fecha : new Date(editFields.fecha).toISOString().split('T')[0]) : ""}
                onChange={e => setEditFields({ ...editFields, fecha: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
              <label htmlFor="edit-objetivo" className="text-xs sm:text-sm sm:text-right">Objetivo</label>
              <input
                id="edit-objetivo"
                type="number"
                className="col-span-1 sm:col-span-3 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white text-sm"
                value={editFields.objetivo || ""}
                onChange={e => setEditFields({ ...editFields, objetivo: e.target.value })}
                placeholder="Opcional"
              />
            </div>
            {error && <div className="text-red-400 text-xs sm:text-sm col-span-4">{error}</div>}
          </div>
          <DialogFooter>
            <Button
              type="button"
              className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white text-xs sm:text-sm"
              onClick={async () => {
                // Validación de campos obligatorios
                if (!editFields.nombre || !editFields.categoria || !editFields.fecha || isNaN(Number(editFields.monto)) || Number(editFields.monto) <= 0) {
                  setError("Completa todos los campos obligatorios.")
                  return
                }
                setError(null)
                try {
                  const res = await fetch("/api/ahorros", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...editFields, id: ahorroEdit.id }),
                  })
                  if (!res.ok) {
                    const data = await res.json()
                    setError(data.error || "Error al editar el ahorro")
                    return
                  }
                  const actualizado = await res.json()
                  setAhorros(ahorros.map(a => a.id === actualizado.id ? actualizado : a))
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
