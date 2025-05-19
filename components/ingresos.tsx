"use client"

import { useState, useEffect } from "react"
import { CalendarIcon, Edit, Plus, Trash, TrendingUp, Briefcase, DollarSign, CreditCard, Gift, CheckCircle2, Circle } from "lucide-react"
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

// Mapeo de categorías a iconos
const categoriaIcons: { [key: string]: any } = {
  "Empleo": Briefcase,
  "Trabajo independiente": DollarSign,
  "Inversiones": CreditCard,
  "Ventas": Gift,
  "Otros": Circle,
}

// Mapeo de categorías a colores
const categoriaColors: { [key: string]: string } = {
  "Empleo": "from-emerald-500 to-emerald-600",
  "Trabajo independiente": "from-teal-500 to-teal-600",
  "Inversiones": "from-cyan-500 to-cyan-600",
  "Ventas": "from-green-500 to-green-600",
}

// Mapeo de categorías a colores de badge
const categoriaBadgeColors: { [key: string]: string } = {
  "Empleo": "bg-emerald-600/20 text-emerald-400",
  "Trabajo independiente": "bg-teal-600/20 text-teal-400",
  "Inversiones": "bg-cyan-600/20 text-cyan-400",
  "Ventas": "bg-green-600/20 text-green-400",
  "Otros": "bg-gray-600/20 text-gray-300",
}

const ingresosIniciales = [
  {
    id: 1,
    nombre: "Salario",
    monto: 3200.0,
    categoria: "Empleo",
    fecha: new Date(2025, 4, 1),
    recibido: true,
  },
  {
    id: 2,
    nombre: "Freelance",
    monto: 450.0,
    categoria: "Trabajo independiente",
    fecha: new Date(2025, 4, 5),
    recibido: false,
  },
  {
    id: 3,
    nombre: "Dividendos",
    monto: 120.5,
    categoria: "Inversiones",
    fecha: new Date(2025, 4, 8),
    recibido: true,
  },
  {
    id: 4,
    nombre: "Venta en línea",
    monto: 85.0,
    categoria: "Ventas",
    fecha: new Date(2025, 4, 9),
    recibido: false,
  },
]

// Utilidad para obtener la fecha local en formato YYYY-MM-DD
function getFechaLocal(date = new Date()) {
  const tzOffset = date.getTimezoneOffset() * 60000
  const localISO = new Date(date.getTime() - tzOffset).toISOString().split('T')[0]
  return localISO
}

export function Ingresos() {
  const [ingresos, setIngresos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [ingresoEdit, setIngresoEdit] = useState<any>(null)
  const [editFields, setEditFields] = useState<any>({})
  const [addOpen, setAddOpen] = useState(false)
  const hoy = getFechaLocal()
  const [addFields, setAddFields] = useState<any>({ nombre: "", monto: "", categoria: "Empleo", fecha: hoy, recibido: false })
  const [categorias, setCategorias] = useState<string[]>(Object.keys(categoriaIcons))
  const [creandoCategoria, setCreandoCategoria] = useState(false)
  const [nuevaCategoria, setNuevaCategoria] = useState("")

  useEffect(() => {
    async function fetchIngresos() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/ingresos")
        if (!res.ok) throw new Error("Error al cargar los ingresos")
        const data = await res.json()
        setIngresos(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchIngresos()
  }, [])

  async function handleAddIngreso() {
    try {
      const res = await fetch("/api/ingresos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addFields),
      })
      if (!res.ok) throw new Error("Error al guardar el ingreso")
      const nuevo = await res.json()
      setIngresos([...ingresos, nuevo])
      setAddOpen(false)
      setAddFields({ nombre: "", monto: "", categoria: "Empleo", fecha: hoy, recibido: false })
    } catch (err: any) {
      setError(err.message)
    }
  }

  async function handleEditIngreso() {
    try {
      const res = await fetch("/api/ingresos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editFields, id: ingresoEdit.id }),
      })
      if (!res.ok) throw new Error("Error al editar el ingreso")
      const actualizado = await res.json()
      setIngresos(ingresos.map(i => i.id === actualizado.id ? actualizado : i))
      setEditOpen(false)
    } catch (err: any) {
      setError(err.message)
    }
  }

  async function handleDeleteIngreso(id: string) {
    try {
      const res = await fetch("/api/ingresos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error("Error al eliminar el ingreso")
      setIngresos(ingresos.filter(i => i.id !== id))
    } catch (err: any) {
      setError(err.message)
    }
  }

  const totalesPorCategoria = ingresos.reduce((acc, ingreso) => {
    acc[ingreso.categoria] = (acc[ingreso.categoria] || 0) + ingreso.monto
    return acc
  }, {} as { [key: string]: number })

  const totalRecibido = ingresos.filter(i => i.recibido).reduce((sum, i) => sum + i.monto, 0)
  const totalPendiente = ingresos.filter(i => !i.recibido).reduce((sum, i) => sum + i.monto, 0)
  const totalGeneral = ingresos.reduce((sum, i) => sum + i.monto, 0)

  const handleToggleRecibido = (id: number) => {
    setIngresos(ingresos.map(i => i.id === id ? { ...i, recibido: !i.recibido } : i))
  }

  const handleEdit = (ingreso: any) => {
    setIngresoEdit(ingreso)
    setEditFields({
      nombre: ingreso.nombre,
      monto: ingreso.monto,
      categoria: ingreso.categoria,
      fecha: ingreso.fecha,
      recibido: ingreso.recibido,
    })
    setEditOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-[#1e293b]/60 border-[#334155] hover:bg-[#1e293b]/80 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              Ingresos Recibidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400">
              ${totalRecibido.toFixed(2)}
            </div>
            <p className="text-sm text-gray-400 mt-1">Monto ya recibido</p>
          </CardContent>
        </Card>
        <Card className="bg-[#1e293b]/60 border-[#334155] hover:bg-[#1e293b]/80 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-yellow-400" />
              Ingresos Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-400">
              ${totalPendiente.toFixed(2)}
            </div>
            <p className="text-sm text-gray-400 mt-1">Monto por recibir</p>
          </CardContent>
        </Card>
        <Card className="bg-[#1e293b]/60 border-[#334155] hover:bg-[#1e293b]/80 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              Total de Ingresos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-400">
              ${totalGeneral.toFixed(2)}
            </div>
            <p className="text-sm text-gray-400 mt-1">Suma de todos los ingresos</p>
          </CardContent>
        </Card>
      </div>
      <Card className="bg-[#181c2a]/80 border-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Ingresos</CardTitle>
            <CardDescription className="text-gray-400">Tabla de tus ingresos</CardDescription>
          </div>
          <Dialog open={addOpen} onOpenChange={(open) => {
            setAddOpen(open)
            if (open) {
              setAddFields({ nombre: "", monto: "", categoria: "Empleo", fecha: hoy, recibido: false })
            }
          }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Agregar Ingreso
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-[#181c2a] text-white">
              <DialogHeader>
                <DialogTitle>Agregar Ingreso</DialogTitle>
                <DialogDescription className="text-gray-300">Ingresa los detalles del ingreso que deseas registrar.</DialogDescription>
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
                    <option value="__nueva__">Agregar nueva categoría...</option>
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
                      <Button type="button" size="sm" className="bg-blue-700 text-white" onClick={() => {
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
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="add-fecha" className="text-right">Fecha</label>
                  <input
                    id="add-fecha"
                    type="date"
                    className="col-span-3 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white"
                    value={addFields.fecha}
                    onChange={e => setAddFields({ ...addFields, fecha: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="add-recibido" className="text-right">Recibido</label>
                  <div className="col-span-3 flex items-center">
                    <Checkbox id="add-recibido" checked={addFields.recibido} onCheckedChange={v => setAddFields({ ...addFields, recibido: v })} />
                    <span className="ml-2 text-sm">¿Ya recibido?</span>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white" onClick={handleAddIngreso}>
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
                  <th className="px-4 py-3 text-left font-semibold">Icono</th>
                  <th className="px-4 py-3 text-left font-semibold">Nombre</th>
                  <th className="px-4 py-3 text-left font-semibold">Monto</th>
                  <th className="px-4 py-3 text-left font-semibold">Categoría</th>
                  <th className="px-4 py-3 text-left font-semibold">Fecha</th>
                  <th className="px-4 py-3 text-left font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ingresos.map((ingreso, idx) => {
                  const Icon = categoriaIcons[ingreso.categoria] || Circle
                  const badgeColor = categoriaBadgeColors[ingreso.categoria] || categoriaBadgeColors["Otros"]
                  return (
                    <tr key={ingreso.id} className={[
                      idx % 2 === 0 ? "bg-[#101c3a]/80" : "bg-blue-950/40",
                      "border-b border-[#23204d] hover:bg-[#23204d]/80 hover:shadow-[0_0_8px_0_rgba(59,130,246,0.10)] transition-all"
                    ].join(' ')}>
                      <td className="px-4 py-3">
                        <div className="p-2 rounded-lg bg-blue-900/60 w-fit">
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white font-medium">{ingreso.nombre}</td>
                      <td className="px-4 py-3 text-green-500 font-bold">+${ingreso.monto.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeColor} category-bounce-glow`}>{ingreso.categoria}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-400">{format(ingreso.fecha, "d 'de' MMMM", { locale: es })}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(ingreso)}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteIngreso(ingreso.id)}>
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
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Ingreso</DialogTitle>
            <DialogDescription>Modifica los datos del ingreso y guarda los cambios.</DialogDescription>
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
                {Object.keys(categoriaIcons).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="Otros">Otros</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-fecha" className="text-right">Fecha</label>
              <input
                id="edit-fecha"
                type="date"
                className="col-span-3 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white"
                value={editFields.fecha ? new Date(editFields.fecha).toISOString().split('T')[0] : ""}
                onChange={e => setEditFields({ ...editFields, fecha: e.target.value ? new Date(e.target.value) : "" })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              onClick={() => {
                setIngresos(ingresos.map(i => i.id === ingresoEdit.id ? { ...i, ...editFields } : i))
                setEditOpen(false)
              }}
            >
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
