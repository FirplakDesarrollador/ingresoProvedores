-- =====================================================
-- MIGRACIÓN 002: Campos para aprobación/rechazo
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- Agregar campos de aprobación/rechazo
ALTER TABLE proveedores 
ADD COLUMN IF NOT EXISTS fecha_aprobacion TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS fecha_vigencia DATE,
ADD COLUMN IF NOT EXISTS motivo_rechazo TEXT,
ADD COLUMN IF NOT EXISTS aprobado_por UUID,
ADD COLUMN IF NOT EXISTS fecha_decision TIMESTAMP WITH TIME ZONE;

-- Comentarios
COMMENT ON COLUMN proveedores.fecha_aprobacion IS 'Fecha en que se aprobó el proveedor';
COMMENT ON COLUMN proveedores.fecha_vigencia IS 'Fecha hasta la cual es válida la aprobación';
COMMENT ON COLUMN proveedores.motivo_rechazo IS 'Razón por la cual se rechazó el proveedor';
COMMENT ON COLUMN proveedores.aprobado_por IS 'UUID del usuario que tomó la decisión';
COMMENT ON COLUMN proveedores.fecha_decision IS 'Fecha y hora en que se tomó la decisión';
