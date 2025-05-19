"use client"

import Link from "next/link"
import { ArrowDown, BarChart3, Home, LogOut, PiggyBank, Settings, User, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { signOut, useSession } from "next-auth/react"

// Agrego los tipos de props
interface SidebarProps {
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onTabChange: (tab: string) => void;
  activeTab: string;
}

export function Sidebar({ isHovered, onMouseEnter, onMouseLeave, onTabChange, activeTab }: SidebarProps) {
  const { data: session } = useSession()

  return (
    <div
      className={cn(
        "h-screen flex-col transition-all duration-300 bg-[linear-gradient(to_bottom,_#120c1c_95%,_#05060a)]/100 border-r border-[#120c1c] shadow-[0_0_24px_2px_rgba(55,48,163,0.25)] backdrop-blur-md hidden md:flex fixed",
        isHovered ? "w-64" : "w-8"
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className={cn(
        "flex-1 flex flex-col gap-2",
        isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      >
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Wallet className="h-6 w-6" />
            <span>FinanzApp</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start gap-4 px-2 text-sm font-medium">
            <button
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200 border-l-4 border-transparent",
                activeTab === "overview"
                  ? "bg-[#23204d]/80 border-blue-500 text-blue-300 shadow-[0_2px_8px_rgba(55,48,163,0.15)] scale-[1.03]"
                  : "text-gray-400 hover:bg-[#23204d]/60 hover:text-blue-300 hover:scale-105"
              )}
              onClick={() => onTabChange("overview")}
            >
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </button>
            <button
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200 border-l-4 border-transparent",
                activeTab === "gastos-fijos"
                  ? "bg-[#23204d]/80 border-blue-500 text-blue-300 shadow-[0_2px_8px_rgba(55,48,163,0.15)] scale-[1.03]"
                  : "text-gray-400 hover:bg-[#23204d]/60 hover:text-blue-300 hover:scale-105"
              )}
              onClick={() => onTabChange("gastos-fijos")}
            >
              <Home className="h-4 w-4" />
              Gastos Fijos
            </button>
            <button
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200 border-l-4 border-transparent",
                activeTab === "gastos-diarios"
                  ? "bg-[#23204d]/80 border-blue-500 text-blue-300 shadow-[0_2px_8px_rgba(55,48,163,0.15)] scale-[1.03]"
                  : "text-gray-400 hover:bg-[#23204d]/60 hover:text-blue-300 hover:scale-105"
              )}
              onClick={() => onTabChange("gastos-diarios")}
            >
              <Wallet className="h-4 w-4" />
              Gastos Diarios
            </button>
            <button
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200 border-l-4 border-transparent",
                activeTab === "ingresos"
                  ? "bg-[#23204d]/80 border-blue-500 text-blue-300 shadow-[0_2px_8px_rgba(55,48,163,0.15)] scale-[1.03]"
                  : "text-gray-400 hover:bg-[#23204d]/60 hover:text-blue-300 hover:scale-105"
              )}
              onClick={() => onTabChange("ingresos")}
            >
              <ArrowDown className="h-4 w-4" />
              Ingresos
            </button>
            <button
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200 border-l-4 border-transparent",
                activeTab === "ahorros"
                  ? "bg-[#23204d]/80 border-blue-500 text-blue-300 shadow-[0_2px_8px_rgba(55,48,163,0.15)] scale-[1.03]"
                  : "text-gray-400 hover:bg-[#23204d]/60 hover:text-blue-300 hover:scale-105"
              )}
              onClick={() => onTabChange("ahorros")}
            >
              <PiggyBank className="h-4 w-4" />
              Ahorros
            </button>
          </nav>
        </div>
        <div className="mt-auto">
          <div className="flex items-center gap-2 rounded-lg border border-[#23204d] bg-[#18132b]/80 backdrop-blur-sm p-4 text-sm shadow-[0_2px_8px_rgba(55,48,163,0.10)]">
            <User className="h-4 w-4 text-blue-400" />
            <div className="flex-1">
              <p className="font-semibold text-blue-200">{session?.user?.name || "Usuario"}</p>
              <p className="text-xs text-gray-400">{session?.user?.email || "usuario@ejemplo.com"}</p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[#23204d]/60 transition-colors">
              <Settings className="h-4 w-4 text-blue-400 hover:text-blue-300 transition-colors" />
              <span className="sr-only">Configuración</span>
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 hover:bg-[#23204d]/60 transition-colors"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="h-4 w-4 text-blue-400 hover:text-blue-300 transition-colors" />
              <span className="sr-only">Cerrar sesión</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
