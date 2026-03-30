import { createClient } from './supabase/client'

export type LogTipo = 'INFO' | 'WARNING' | 'ERROR';

export interface LogParams {
  usuario: string;
  accion: string;
  modulo: string;
  detalles?: any;
  tipo?: LogTipo;
  status?: 'SUCCESS' | 'FAILURE';
}

/**
 * Registra una acción en la tabla logs_sistema de Supabase.
 */
export const logAccion = async ({
  usuario,
  accion,
  modulo,
  detalles = {},
  tipo = 'INFO',
  status = 'SUCCESS'
}: LogParams) => {
  const supabase = createClient()
  
  try {
    const { error } = await supabase
      .from('logs_sistema')
      .insert([
        {
          usuario,
          accion,
          modulo,
          detalles,
          tipo,
          status
        }
      ])

    if (error) {
      console.error('Error al guardar log:', error)
      return { success: false, error }
    }

    return { success: true }
  } catch (error) {
    console.error('Error inesperado al guardar log:', error)
    return { success: false, error }
  }
}
