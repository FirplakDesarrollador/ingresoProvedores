'use client'

import { useState, useEffect } from 'react'
import { fetchUsuarios, updateUsuario } from '@/app/(dashboard)/administracion/usuarios/actions'

interface Usuario {
  id: number
  correo: string
  nombre: string
  rol: string
  contraseña?: string
}

export default function UsersTable() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<Usuario | null>(null)
  const [newPassword, setNewPassword] = useState('')

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await fetchUsuarios()
      setUsuarios(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleUpdatePassword = async () => {
    if (!editingUser) return
    
    await updateUsuario(editingUser.id, { contraseña: newPassword })
    setEditingUser(null)
    setNewPassword('')
    await loadData()
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
      <div className="p-8 border-b border-gray-50 bg-[#F9FAFB]/50">
        <h2 className="text-2xl font-extrabold text-[#254153] tracking-tight">Cuentas de Acceso</h2>
        <p className="text-sm text-gray-500 mt-1">Gestiona las credenciales y perfiles de los usuarios del sistema.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#F9FAFB] text-[#254153]/70 text-[11px] font-bold uppercase tracking-[0.1em] border-y border-gray-50">
              <th className="px-8 py-5">Nombre Completo</th>
              <th className="px-6 py-5">Identificador (Correo)</th>
              <th className="px-6 py-5">Perfil / Rol</th>
              <th className="px-8 py-5 text-right">Gestión de Credenciales</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm">
            {loading ? (
               [...Array(4)].map((_, i) => (
                 <tr key={i} className="animate-pulse">
                   <td colSpan={5} className="px-8 py-6 h-16 bg-gray-50/10"></td>
                 </tr>
               ))
            ) : usuarios.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-16 text-center text-gray-400">
                   No se encontraron usuarios registrados.
                </td>
              </tr>
            ) : usuarios.map((user) => (
              <tr key={user.id} className="hover:bg-[#F9FAFB] transition-all duration-200 group">
                <td className="px-8 py-5 font-bold text-[#254153]">{user.nombre}</td>
                <td className="px-6 py-5 text-gray-500">{user.correo}</td>
                <td className="px-6 py-5">
                  <span className={`px-3 py-1 rounded-full font-bold text-[10px] uppercase border ${
                    user.rol === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                    user.rol === 'porteria' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                    'bg-blue-50 text-blue-700 border-blue-100'
                  }`}>
                    {user.rol}
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <button 
                    onClick={() => setEditingUser(user)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-blue-600 bg-blue-50/30 hover:bg-blue-50 border border-blue-100/50 hover:border-blue-100 font-bold text-xs transition-all active:scale-95 shadow-sm hover:shadow-md"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    Actualizar Contraseña
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-5 duration-300">
             <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 border border-blue-100">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
             </div>
             
             <h3 className="text-2xl font-extrabold text-[#254153] mb-2">Nueva Contraseña</h3>
             <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                Estás actualizando la clave de acceso para <b>{editingUser.nombre}</b>. Esta acción será visible inmediatamente.
             </p>
             
             <div className="space-y-6">
               <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Nueva Clave de Acceso</label>
                  <input 
                    type="text"
                    autoFocus
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all font-mono text-lg text-[#254153] shadow-inner"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Ej: Firplak@2025"
                  />
               </div>
               
               <div className="flex gap-4 pt-2">
                  <button 
                    onClick={() => { setEditingUser(null); setNewPassword(''); }}
                    className="flex-1 py-4 font-bold text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-2xl transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleUpdatePassword}
                    disabled={!newPassword}
                    className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:shadow-none"
                  >
                    Guardar Cambios
                  </button>
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  )
}
