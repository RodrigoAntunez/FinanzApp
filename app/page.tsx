"use client"

import Link from "next/link"
import { ArrowDown, ArrowUp, Calendar, DollarSign, Home as HomeIcon, PiggyBank, Plus, Wallet } from "lucide-react"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GastosFijos } from "@/components/gastos-fijos"
import { GastosDiarios } from "@/components/gastos-diarios"
import { Ingresos } from "@/components/ingresos"
import { Ahorros } from "@/components/ahorros"
import { ResumenGastos } from "@/components/resumen-gastos"
import { BalanceChart } from "@/components/balance-chart"
import { Sidebar } from "@/components/sidebar"

export default function Home() {
  const [sidebarHovered, setSidebarHovered] = useState(false)
  const [tab, setTab] = useState("overview")

  // Estados para los datos reales
  const [ahorros, setAhorros] = useState<any[]>([])
  const [ingresos, setIngresos] = useState<any[]>([])
  const [gastosFijos, setGastosFijos] = useState<any[]>([])
  const [gastosDiarios, setGastosDiarios] = useState<any[]>([])

  const { data: session, status } = useSession()

  useEffect(() => {
    async function fetchAll() {
      const [a, i, gf, gd] = await Promise.all([
        fetch("/api/ahorros").then(r => r.json()),
        fetch("/api/ingresos").then(r => r.json()),
        fetch("/api/gastos-fijos").then(r => r.json()),
        fetch("/api/gastos-diarios").then(r => r.json()),
      ])
      setAhorros(a)
      setIngresos(i)
      setGastosFijos(gf)
      setGastosDiarios(gd)
    }
    fetchAll()
  }, [])

  // Cálculos de totales reales
  const totalAhorros = ahorros.reduce((sum, a) => sum + (Number(a.monto) || 0), 0)
  const totalIngresos = ingresos.reduce((sum, i) => sum + (Number(i.monto) || 0), 0)
  const totalGastosFijos = gastosFijos.reduce((sum, g) => sum + (Number(g.monto) || 0), 0)
  const totalGastosDiarios = gastosDiarios.reduce((sum, g) => sum + (Number(g.monto) || 0), 0)
  const totalGastos = totalGastosFijos + totalGastosDiarios
  const balanceTotal = totalIngresos - totalGastos

  if (status === "loading") {
    return <div>Cargando...</div>
  }

  if (!session || !session.user || !session.user.id) {
    return <div>No autenticado</div>
  }

  return (
    <>
      <div style={{background: '#23204d', color: '#fff', padding: 16, borderRadius: 8, margin: 16, textAlign: 'center'}}>
        ¡Bienvenido, {session.user.name}!<br />
        <pre style={{textAlign: 'left', background: '#18132b', color: '#fff', padding: 12, borderRadius: 8, marginTop: 8}}>{JSON.stringify(session, null, 2)}</pre>
      </div>
      <div className="flex min-h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#3730a3] via-[#23204d] to-[#0a0f1a] text-white">
        <Sidebar
          isHovered={sidebarHovered}
          onMouseEnter={() => setSidebarHovered(true)}
          onMouseLeave={() => setSidebarHovered(false)}
          onTabChange={setTab}
          activeTab={tab}
        />
        <main
          className={
            `flex-1 transition-all duration-300 ${sidebarHovered ? 'ml-64' : 'ml-8'}`
          }
        >
          <div className="max-w-screen-xl mx-auto flex flex-col items-center justify-center mt-16 mb-12 px-4">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-6 bg-gradient-to-r from-blue-400 via-slate-400 to-gray-300 text-transparent bg-clip-text">💸 Finanzas Personales 💰</h2>
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="flex justify-center gap-2 mt-2 bg-[#1e293b]/50 backdrop-blur-md rounded-xl p-1 border border-[#334155] shadow-lg">
                <TabsTrigger value="overview">Resumen</TabsTrigger>
                <TabsTrigger value="gastos-fijos">Gastos Fijos</TabsTrigger>
                <TabsTrigger value="gastos-diarios">Gastos Diarios</TabsTrigger>
                <TabsTrigger value="ingresos">Ingresos</TabsTrigger>
                <TabsTrigger value="ahorros">Ahorros</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-[#1e293b]/60 border-[#334155] hover:bg-[#1e293b]/80 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Balance Total</CardTitle>
                    <DollarSign className="h-4 w-4 text-blue-400" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${balanceTotal >= 0 ? 'text-blue-400' : 'text-rose-400'}`}>${balanceTotal.toFixed(2)}</div>
                    <p className="text-xs text-gray-400">+20.1% del mes pasado</p>
                  </CardContent>
                </Card>
                <Card className="bg-[#1e293b]/60 border-[#334155] hover:bg-[#1e293b]/80 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Gastos Fijos</CardTitle>
                    <HomeIcon className="h-4 w-4 text-blue-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-400">${totalGastosFijos.toFixed(2)}</div>
                    <p className="text-xs text-gray-400">42% de tus gastos totales</p>
                  </CardContent>
                </Card>
                <Card className="bg-[#1e293b]/60 border-[#334155] hover:bg-[#1e293b]/80 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
                    <ArrowUp className="h-4 w-4 text-blue-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-400">${totalIngresos.toFixed(2)}</div>
                    <p className="text-xs text-gray-400">+12.5% del mes pasado</p>
                  </CardContent>
                </Card>
                <Card className="bg-[#1e293b]/60 border-[#334155] hover:bg-[#1e293b]/80 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ahorros</CardTitle>
                    <PiggyBank className="h-4 w-4 text-blue-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-slate-300">${totalAhorros.toFixed(2)}</div>
                    <p className="text-xs text-gray-400">+4.3% del mes pasado</p>
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 bg-[#1e293b]/60 border-[#334155] hover:bg-[#1e293b]/80 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                  <CardHeader>
                    <CardTitle>Balance Mensual</CardTitle>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <BalanceChart />
                  </CardContent>
                </Card>
                <Card className="col-span-3 bg-[#1e293b]/60 border-[#334155] hover:bg-[#1e293b]/80 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                  <CardHeader>
                    <CardTitle>Distribución de Gastos</CardTitle>
                    <CardDescription>Desglose de tus gastos este mes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResumenGastos />
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="bg-[#1e293b]/60 border-[#334155] hover:bg-[#1e293b]/80 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Gastos Recientes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {gastosDiarios.slice(-3).reverse().map((gasto, idx) => (
                        <div className="flex items-center" key={gasto.id}>
                          <Wallet className="mr-2 h-4 w-4 text-blue-400" />
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">{gasto.nombre}</p>
                            <p className="text-sm text-gray-400">{gasto.fecha ? new Date(gasto.fecha).toLocaleDateString() : ""}</p>
                          </div>
                          <div className="text-sm font-medium text-rose-400">-${Number(gasto.monto).toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <a className="text-sm text-blue-400 hover:text-blue-300 transition-colors cursor-pointer" onClick={() => setTab('gastos-diarios')}>
                      Ver todos los gastos
                    </a>
                  </CardFooter>
                </Card>
                <Card className="bg-[#1e293b]/60 border-[#334155] hover:bg-[#1e293b]/80 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Ingresos Recientes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {ingresos.slice(-3).reverse().map((ingreso, idx) => (
                        <div className="flex items-center" key={ingreso.id}>
                          <ArrowDown className="mr-2 h-4 w-4 text-blue-400" />
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">{ingreso.nombre}</p>
                            <p className="text-sm text-gray-400">{ingreso.fecha ? new Date(ingreso.fecha).toLocaleDateString() : ""}</p>
                          </div>
                          <div className="text-sm font-medium text-blue-400">+${Number(ingreso.monto).toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <a className="text-sm text-blue-400 hover:text-blue-300 transition-colors cursor-pointer" onClick={() => setTab('ingresos')}>
                      Ver todos los ingresos
                    </a>
                  </CardFooter>
                </Card>
                <Card className="bg-[#1e293b]/60 border-[#334155] hover:bg-[#1e293b]/80 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Ahorros</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {ahorros.slice(-3).reverse().map((ahorro, idx) => (
                        <div className="flex items-center" key={ahorro.id}>
                          <PiggyBank className="mr-2 h-4 w-4 text-blue-400" />
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">{ahorro.nombre}</p>
                            <p className="text-sm text-gray-400">{ahorro.fecha ? new Date(ahorro.fecha).toLocaleDateString() : ""}</p>
                          </div>
                          <div className="text-sm font-medium text-slate-300">${Number(ahorro.monto).toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <a className="text-sm text-blue-400 hover:text-blue-300 transition-colors cursor-pointer" onClick={() => setTab('ahorros')}>
                      Ver todos los ahorros
                    </a>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="gastos-fijos" className="space-y-4">
              <GastosFijos />
            </TabsContent>
            <TabsContent value="gastos-diarios" className="space-y-4">
              <GastosDiarios />
            </TabsContent>
            <TabsContent value="ingresos" className="space-y-4">
              <Ingresos />
            </TabsContent>
            <TabsContent value="ahorros" className="space-y-4">
              <Ahorros />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  )
}
