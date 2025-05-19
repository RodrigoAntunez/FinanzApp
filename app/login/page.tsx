"use client"
import { useState, useEffect } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Mail, LogIn } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()

  useEffect(() => {
    // Si hay un error en la URL, mostrarlo
    const error = searchParams.get("error")
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.includes("@")) {
      setError("Ingresa un email válido")
      return
    }
    setLoading(true)
    setError("")
    try {
      const res = await signIn("email", { 
        email, 
        redirect: false,
        callbackUrl: "/"
      })
      if (res?.error) {
        setError("No se pudo enviar el código. Intenta de nuevo.")
      } else {
        router.push("/verify")
      }
    } catch (error) {
      setError("Ocurrió un error. Por favor, intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0f1a] via-[#181c2a] to-[#111827] text-white">
      <form onSubmit={handleSubmit} className="bg-black/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-sm flex flex-col gap-6 border border-gray-800">
        <div className="flex flex-col items-center gap-2 mb-2">
          <span className="bg-gray-900 p-3 rounded-full mb-2 shadow-lg">
            <Mail className="h-7 w-7 text-blue-500" />
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight">Iniciar sesión</h1>
          <p className="text-gray-300 text-sm">Accede a tu cuenta con tu email o Google</p>
        </div>
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="flex items-center justify-center gap-2 bg-white text-gray-900 font-semibold py-2 rounded-lg shadow hover:bg-gray-100 transition-all"
        >
          <LogIn className="h-5 w-5 text-blue-500" />
          Iniciar sesión con Google
        </button>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-gray-700" />
          <span className="text-xs text-gray-400">o</span>
          <div className="flex-1 h-px bg-gray-700" />
        </div>
        <input
          type="email"
          placeholder="Tu email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="p-3 rounded-lg bg-gray-900 text-white border border-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition"
        />
        {error && <div className="text-red-400 text-sm text-center">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-2 rounded-lg transition-all shadow-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
        >
          {loading ? "Enviando..." : "Enviar código"}
        </button>
      </form>
    </div>
  )
} 