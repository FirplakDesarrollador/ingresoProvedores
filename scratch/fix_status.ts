import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Or we bypass RLS by using anon if it allows it? No, if it doesn't allow it, we can't.

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
    const ids = [
        'a53383e2-0818-41e9-87e9-78c091dd2c6d', // prueba588
        '1b0ebf96-bbac-4940-be79-3f87754375cb'
    ];
    for (const id of ids) {
        const { error } = await supabase.from('proveedores').update({ estado: 'pendiente' }).eq('id', id)
        if (error) {
            console.error('Error updating', id, error)
        } else {
            console.log('Updated', id)
        }
    }
}
main()
