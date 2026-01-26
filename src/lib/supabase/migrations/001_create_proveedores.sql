-- =====================================================
-- MIGRACIÓN: Crear tablas para registro de proveedores
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- Tabla principal de proveedores
CREATE TABLE IF NOT EXISTS proveedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Tipo de solicitud y contraparte
  tipo_solicitud TEXT,
  tipo_contraparte TEXT CHECK (tipo_contraparte IN ('persona_natural', 'persona_juridica')),
  fecha_diligenciamiento TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- ===== PERSONA NATURAL (1.1) =====
  tipo_documento TEXT,
  numero_identificacion TEXT,
  primer_apellido TEXT,
  segundo_apellido TEXT,
  primer_nombre TEXT,
  segundo_nombre TEXT,
  fecha_expedicion DATE,
  lugar_expedicion TEXT,
  fecha_nacimiento DATE,
  lugar_nacimiento TEXT,
  direccion TEXT,
  pais TEXT,
  departamento TEXT,
  ciudad TEXT,
  telefono1_codigo TEXT,
  telefono1_numero TEXT,
  telefono2_codigo TEXT,
  telefono2_numero TEXT,
  celular TEXT,
  email TEXT,
  profesion TEXT,
  
  -- PEP Persona Natural
  es_pep BOOLEAN DEFAULT FALSE,
  tiene_vinculo_pep BOOLEAN DEFAULT FALSE,
  administra_recursos_publicos BOOLEAN DEFAULT FALSE,
  tiene_reconocimiento_publico BOOLEAN DEFAULT FALSE,
  tiene_grado_poder_publico BOOLEAN DEFAULT FALSE,
  
  -- ===== PERSONA JURÍDICA (1.2) =====
  razon_social TEXT,
  tipo_sociedad TEXT,
  origen_capital TEXT,
  codigo_ciiu TEXT,
  correo_facturacion TEXT,
  pais_juridica TEXT,
  
  -- Contactos
  contacto_comercial TEXT,
  contacto_comercial_tel TEXT,
  contacto_logistica TEXT,
  contacto_logistica_tel TEXT,
  contacto_contable TEXT,
  contacto_contable_tel TEXT,
  contacto_tesoreria TEXT,
  contacto_tesoreria_tel TEXT,
  
  -- Dirección de notificación
  direccion_notificacion TEXT,
  departamento_notificacion TEXT,
  ciudad_notificacion TEXT,
  
  -- Sistemas de gestión
  sector_actividad TEXT, -- Minero, Comercial, Financiero
  
  -- Información tributaria
  es_gran_contribuyente BOOLEAN DEFAULT FALSE,
  es_autorretenedor BOOLEAN DEFAULT FALSE,
  responsable_iva TEXT, -- Régimen Simplificado, Común, Especial
  aplica_iva BOOLEAN DEFAULT FALSE,
  tarifa_iva DECIMAL(5,2),
  aplica_retencion_iva BOOLEAN DEFAULT FALSE,
  tarifa_retencion_iva DECIMAL(5,2),
  concepto_retencion TEXT,
  
  -- Evaluación SST
  tiene_evaluacion_sst BOOLEAN DEFAULT FALSE,
  
  -- Representante Legal (1.2.4)
  rep_legal_primer_apellido TEXT,
  rep_legal_segundo_apellido TEXT,
  rep_legal_primer_nombre TEXT,
  rep_legal_segundo_nombre TEXT,
  rep_legal_tipo_documento TEXT,
  rep_legal_numero_identificacion TEXT,
  
  -- PEP Persona Jurídica
  pj_tiene_vinculo_pep BOOLEAN DEFAULT FALSE,
  pj_administra_recursos_publicos BOOLEAN DEFAULT FALSE,
  pj_tiene_reconocimiento_publico BOOLEAN DEFAULT FALSE,
  pj_tiene_grado_poder_publico BOOLEAN DEFAULT FALSE,
  
  -- ===== INFORMACIÓN FINANCIERA (1.3) =====
  total_activos DECIMAL(18,2),
  total_pasivos DECIMAL(18,2),
  total_patrimonio DECIMAL(18,2),
  ingresos_mensuales DECIMAL(18,2),
  egresos_mensuales DECIMAL(18,2),
  otros_ingresos_mensuales DECIMAL(18,2),
  concepto_otros_ingresos TEXT,
  posee_activos_virtuales BOOLEAN DEFAULT FALSE,
  fecha_corte_info_financiera DATE,
  
  -- ===== INFORMACIÓN BANCARIA (1.4) =====
  tipo_cuenta TEXT CHECK (tipo_cuenta IN ('corriente', 'ahorros')),
  entidad_bancaria TEXT,
  sucursal_banco TEXT,
  numero_cuenta TEXT,
  telefono_banco TEXT,
  
  -- ===== FACTURACIÓN ELECTRÓNICA (1.5) =====
  fe_correo TEXT,
  fe_persona_encargada TEXT,
  fe_telefono TEXT,
  
  -- ===== REFERENCIA COMERCIAL (1.5) =====
  ref_nombre_entidad TEXT,
  ref_nombre_contacto TEXT,
  ref_telefono TEXT,
  
  -- ===== OPERACIONES INTERNACIONALES (1.6) =====
  realiza_operaciones_internacionales BOOLEAN DEFAULT FALSE,
  tipo_transacciones TEXT[], -- Array: importaciones, exportaciones, inversiones, etc.
  operaciones_internacionales_cual TEXT,
  
  -- ===== DECLARACIÓN Y FIRMA (1.7, 1.8) =====
  declaracion_origen_fondos TEXT,
  acepta_terminos BOOLEAN DEFAULT FALSE,
  firma_base64 TEXT,
  
  -- Metadatos
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de accionistas (1.2.4)
CREATE TABLE IF NOT EXISTS proveedor_accionistas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proveedor_id UUID REFERENCES proveedores(id) ON DELETE CASCADE,
  nombre_razon_social TEXT NOT NULL,
  numero_documento TEXT,
  porcentaje_participacion DECIMAL(5,2),
  tiene_vinculo_pep BOOLEAN DEFAULT FALSE,
  administra_recursos_publicos BOOLEAN DEFAULT FALSE,
  tiene_reconocimiento_publico BOOLEAN DEFAULT FALSE,
  tiene_grado_poder_publico BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de documentos adjuntos
CREATE TABLE IF NOT EXISTS proveedor_documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proveedor_id UUID REFERENCES proveedores(id) ON DELETE CASCADE,
  tipo_documento TEXT NOT NULL,
  nombre_archivo TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_proveedores_tipo ON proveedores(tipo_contraparte);
CREATE INDEX IF NOT EXISTS idx_proveedores_estado ON proveedores(estado);
CREATE INDEX IF NOT EXISTS idx_proveedores_created ON proveedores(created_at);
CREATE INDEX IF NOT EXISTS idx_documentos_proveedor ON proveedor_documentos(proveedor_id);
CREATE INDEX IF NOT EXISTS idx_accionistas_proveedor ON proveedor_accionistas(proveedor_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_proveedores_updated_at ON proveedores;
CREATE TRIGGER update_proveedores_updated_at
  BEFORE UPDATE ON proveedores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE proveedor_accionistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE proveedor_documentos ENABLE ROW LEVEL SECURITY;

-- Políticas: Permitir inserción pública (formulario sin login)
CREATE POLICY "Permitir inserción pública de proveedores" ON proveedores
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir inserción pública de accionistas" ON proveedor_accionistas
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir inserción pública de documentos" ON proveedor_documentos
  FOR INSERT WITH CHECK (true);

-- Políticas: Solo usuarios autenticados pueden leer
CREATE POLICY "Usuarios autenticados pueden ver proveedores" ON proveedores
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden ver accionistas" ON proveedor_accionistas
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden ver documentos" ON proveedor_documentos
  FOR SELECT USING (auth.role() = 'authenticated');

-- =====================================================
-- STORAGE: Crear bucket para documentos PDF
-- Ejecutar en Supabase > Storage > New Bucket
-- Nombre: proveedor-documentos
-- Public: false
-- =====================================================

-- Nota: Crear el bucket manualmente en Supabase Dashboard
-- O ejecutar via API si tienes acceso de service_role
