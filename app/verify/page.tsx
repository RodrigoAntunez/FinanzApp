"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function VerifyPage() {
  const [inputCode, setInputCode] = useState("")
  const [error, setError] = useState("")
  const [code, setCode] = useState("")
  const [email, setEmail] = useState("")
  const router = useRouter()

  useEffect(() => {
    setCode(localStorage.getItem("auth_code") || "")
    setEmail(localStorage.getItem("auth_email") || "")
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (inputCode === code) {
      localStorage.setItem("auth_logged", "1")
      router.push("/")
    } else {
      setError("Código incorrecto")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0f1a] via-[#181c2a] to-[#111827] text-white">
      <form onSubmit={handleSubmit} className="bg-black/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-sm flex flex-col gap-6 border border-gray-800">
        <h1 className="text-2xl font-bold text-white mb-2">Verifica tu email</h1>
        <p className="text-gray-300 text-sm mb-2">Hemos enviado un código a <span className="font-semibold text-blue-400">{email}</span></p>
        <input
          type="text"
          placeholder="Código de 6 dígitos"
          value={inputCode}
          onChange={e => setInputCode(e.target.value)}
          className="p-3 rounded-lg bg-gray-900 text-white border border-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition tracking-widest text-center text-lg"
          maxLength={6}
        />
        <div className="text-xs text-gray-500">(Código de prueba: <span className="font-mono">{code}</span>)</div>
        {error && <div className="text-red-400 text-sm text-center">{error}</div>}
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-2 rounded-lg transition-all shadow-md focus:ring-2 focus:ring-blue-400 focus:outline-none">Verificar</button>
      </form>
    </div>
  )
} 