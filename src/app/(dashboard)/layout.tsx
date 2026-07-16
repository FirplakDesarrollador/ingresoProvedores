import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    let userRole = null;
    if (user.email) {
        const { data: userData } = await supabase
            .from('usuarios')
            .select('rol')
            .eq('correo', user.email)
            .single()
        
        userRole = userData?.rol
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar userEmail={user.email} userRole={userRole} />
            <main className="flex-1 ml-64 p-8">
                {children}
            </main>
        </div>
    )
}
