"use client"
import { useState, useEffect, Suspense } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { LogIn } from "lucide-react"

function LoginForm() {
  const [error, setError] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()

  useEffect(() => {
    // Si hay un error en la URL, mostrarlo
    const error = searchParams?.get("error")
    if (error) {
      setError("Error al iniciar sesión. Por favor, intenta de nuevo.")
    }
  }, [searchParams])

  useEffect(() => {
    // Si el usuario ya está autenticado, redirigir a la página principal
    if (session) {
      router.push("/")
    }
  }, [session, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0f1a] via-[#181c2a] to-[#111827] text-white">
      <div className="bg-black/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-sm flex flex-col gap-6 border border-gray-800">
        <div className="flex flex-col items-center gap-2 mb-2">
          <h1 className="text-2xl font-bold text-white tracking-tight">Iniciar sesión</h1>
          <p className="text-gray-300 text-sm">Accede a tu cuenta con Google</p>
        </div>
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="flex items-center justify-center gap-2 bg-white text-gray-900 font-semibold py-2 rounded-lg shadow hover:bg-gray-100 transition-all"
        >
          <LogIn className="h-5 w-5 text-blue-500" />
          Iniciar sesión con Google
        </button>
        {error && <div className="text-red-400 text-sm text-center">{error}</div>}
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0f1a] via-[#181c2a] to-[#111827] text-white">
        <div className="animate-pulse">Cargando...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
} 