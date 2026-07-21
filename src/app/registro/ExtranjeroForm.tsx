'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { submitProveedorForm, uploadDocument, getPaises } from './actions'

const esCountries = ['AR', 'BO', 'CL', 'CO', 'CR', 'CU', 'DO', 'EC', 'SV', 'GQ', 'GT', 'HN', 'MX', 'NI', 'PA', 'PY', 'PE', 'ES', 'UY', 'VE']
const zhCountries = ['CN', 'TW', 'HK', 'MO']

const dict = {
    en: {
        title: "Counterparty Knowledge Form",
        subtitle: "Please complete all required fields",
        step0_title: "Select Your Country",
        step0_subtitle: "Please search and select your country of origin to continue with the registration form.",
        step0_btn: "Start Form",
        country_label: "Country",
        search_placeholder: "Search and select a country...",
        search_input: "Type to search...",
        no_countries: "No countries found matching",
        step1_title: "General Information",
        company_name: "Company Name",
        tax_id: "TAX ID",
        business_structure: "Business Structure",
        origin_capital: "Origin of capital",
        email: "E-mail",
        web_page: "Web page",
        economic_activity: "Main Economic Activity",
        btn_continue: "Continue",
        btn_back: "Back",
        btn_submit: "Submit Form",
        processing: "Processing...",
        optional: "(Optional)",
        select_placeholder: "Select...",
        step2_title: "Legal Representative & Compliance",
        full_name: "Full Name (First and Last names)",
        doc_type: "Type of document",
        id_number: "ID. Number",
        place_issue: "Place of issue",
        phone: "Phone",
        city: "City",
        department: "Department/State",
        answer_yes_no: "Answer YES or NO",
        manage_public: "Do you manage public resources?",
        is_pep: "Are you a Politically Exposed Person?",
        public_authority: "Do you have public authority?",
        linked_pep: "Are you linked to a PEP?",
        step3_title: "Banking Information",
        swift: "SWIFT Code",
        aba: "ABA",
        bank_name: "Bank Name",
        bank_address: "Bank Address",
        account_number: "Account Number",
        bank_phone: "Bank Phone",
        time_to_pay: "Time to pay bills",
        contact_person: "Contact Person",
        step4_title: "Documents & Declaration",
        decl_title: "DECLARATION OF ORIGIN OF FUNDS:",
        decl_p1: "I expressly declare that: The content of this information is truthful and verifiable, I make the following declaration of source of goods and funds to FIRPLAK SA, in order to comply with the current legal regulations.",
        decl_1: "1) The assets that I own come from: (Detail of occupation, activity, business)",
        decl_1_placeholder: "Specify here...",
        decl_2: "2) The activity of my represented is legal and is within the legal framework. The resources that my represented owns do not come from illegal activities contemplated in the applicable law.",
        decl_3: "3) The information that I have provided in this document is true and verifiable and will be updated as FIRPLAK requests.",
        decl_4: "4) I authorize FIRPLAK to request, consult or process to any Entity that is duly authorized to handle or administer databases included in government entities, the information contained in this form.",
        decl_5: "5) The resources derived from the development of commercial relations will not be used to finance terrorism, terrorist groups or terrorist activities.",
        decl_6: "6) We exempt FIRPLAK, its legal representatives and administrators, from all responsibilities arising from erroneous, false or inaccurate information that has been provided in this document or from the violation thereof.",
        docs_title: "Documents to attach",
        doc_tax: "Tax identification certificate",
        doc_id: "Copy of the identity document or passport of the legal representative at 150%",
        doc_share: "Copy of the shareholding composition",
        doc_finance: "Certified comparative financial statements (immediately preceding period)",
        doc_bank: "Bank certification",
        sign_title: "Signature & Footprint",
        sign_click: "Click to select signature/stamp image",
        sign_format: "PNG, JPG up to 5MB",
        accept_terms: "I declare that I have read, understood and accept the Privacy Policy and terms mentioned.",
        options_business: [{value: 'Anónima', label: 'Anonymous'}, {value: 'Limitada', label: 'LLC'}, {value: 'Corporación', label: 'CORP'}, {value: 'OTRA', label: 'OTHER'}],
        options_capital: [{value: 'Privado', label: 'Private'}, {value: 'Público', label: 'Public'}, {value: 'Mixto', label: 'Mixed'}, {value: 'Sin ánimo de lucro', label: 'Non profit'}],
        options_ciiu: [{value: 'Alimentos y bebidas', label: 'Food and beverage'}, {value: 'Farmacéutica', label: 'Pharmaceutical'}, {value: 'Química', label: 'Chemical'}, {value: 'Servicios', label: 'Services'}, {value: 'Industria', label: 'Industry'}, {value: 'Salud', label: 'Health'}, {value: 'Minería y Petróleo', label: 'Mining and Oil'}, {value: 'Ventas', label: 'Sales'}, {value: 'Financiero', label: 'Financial'}, {value: 'Transporte', label: 'Transportation'}, {value: 'Otro', label: 'Other'}],
        options_doc: [{value: 'CC', label: 'CC'}, {value: 'FIDC', label: 'FIDC'}, {value: 'IC', label: 'IC'}, {value: 'PAS', label: 'PAS'}],
        options_yesno: [{value: 'Sí', label: 'Yes'}, {value: 'No', label: 'No'}],
        options_pay: [{value: '60 días', label: '60 days'}, {value: '75 días', label: '75 days'}, {value: '90 días', label: '90 days'}, {value: 'Contado', label: 'Cash'}, {value: 'Otro', label: 'Other'}],
        error_submit: "Registration error:",
        error_unexpected: "Unexpected error:",
        alert_docs: "The registration was saved, but there were issues with some documents:\n",
        alert_contact: "\n\nPlease contact support."
    },
    es: {
        title: "Formulario de Conocimiento de Contraparte",
        subtitle: "Por favor complete todos los campos obligatorios",
        step0_title: "Seleccione su País",
        step0_subtitle: "Por favor busque y seleccione su país de origen para continuar con el formulario de registro.",
        step0_btn: "Iniciar Formulario",
        country_label: "País",
        search_placeholder: "Buscar y seleccionar país...",
        search_input: "Escriba para buscar...",
        no_countries: "No se encontraron países que coincidan con",
        step1_title: "Información General",
        company_name: "Razón Social",
        tax_id: "Número de Identificación Tributaria",
        business_structure: "Tipo de Sociedad",
        origin_capital: "Origen de Capital",
        email: "Correo Electrónico",
        web_page: "Página Web",
        economic_activity: "Actividad Económica Principal",
        btn_continue: "Continuar",
        btn_back: "Atrás",
        btn_submit: "Enviar Formulario",
        processing: "Procesando...",
        optional: "(Opcional)",
        select_placeholder: "Seleccionar...",
        step2_title: "Representante Legal y Cumplimiento",
        full_name: "Nombre Completo (Nombres y Apellidos)",
        doc_type: "Tipo de Documento",
        id_number: "Número de Identificación",
        place_issue: "Lugar de expedición",
        phone: "Teléfono",
        city: "Ciudad",
        department: "Departamento/Estado",
        answer_yes_no: "Responda SÍ o NO",
        manage_public: "¿Administra recursos públicos?",
        is_pep: "¿Es una Persona Expuesta Políticamente (PEP)?",
        public_authority: "¿Tiene grado de poder público?",
        linked_pep: "¿Tiene vínculo con un PEP?",
        step3_title: "Información Bancaria",
        swift: "Código SWIFT",
        aba: "Código ABA",
        bank_name: "Nombre del Banco",
        bank_address: "Dirección del Banco",
        account_number: "Número de Cuenta",
        bank_phone: "Teléfono del Banco",
        time_to_pay: "Días de Crédito",
        contact_person: "Persona de Contacto",
        step4_title: "Documentos y Declaración",
        decl_title: "DECLARACIÓN DE ORIGEN DE FONDOS:",
        decl_p1: "Declaro expresamente que: El contenido de esta información es veraz y verificable, realizo la siguiente declaración de origen de bienes y fondos a FIRPLAK SA, con el fin de dar cumplimiento a la normatividad legal vigente.",
        decl_1: "1) Los activos que poseo provienen de: (Detalle de ocupación, actividad, negocio)",
        decl_1_placeholder: "Especifique aquí...",
        decl_2: "2) La actividad de mi representada es lícita y se encuentra dentro del marco legal. Los recursos que mi representada posee no provienen de actividades ilícitas contempladas en la ley aplicable.",
        decl_3: "3) La información que he suministrado en este documento es verdadera y verificable y será actualizada conforme FIRPLAK lo solicite.",
        decl_4: "4) Autorizo a FIRPLAK a solicitar, consultar o procesar ante cualquier Entidad debidamente autorizada para manejar o administrar bases de datos incluidas en entidades gubernamentales, la información contenida en este formulario.",
        decl_5: "5) Los recursos derivados del desarrollo de relaciones comerciales no serán destinados para la financiación del terrorismo, grupos terroristas o actividades terroristas.",
        decl_6: "6) Eximimos a FIRPLAK, sus representantes legales y administradores, de todas las responsabilidades derivadas de información errónea, falsa o inexacta que haya sido suministrada en este documento o de la violación del mismo.",
        docs_title: "Documentos para adjuntar",
        doc_tax: "Certificado de identificación tributaria (RUT o equivalente)",
        doc_id: "Copia del documento de identidad o pasaporte del representante legal al 150%",
        doc_share: "Copia de la composición accionaria",
        doc_finance: "Estados financieros comparativos certificados (período inmediatamente anterior)",
        doc_bank: "Certificación Bancaria",
        sign_title: "Firma y Huella",
        sign_click: "Clic para seleccionar imagen de firma/sello",
        sign_format: "PNG, JPG hasta 5MB",
        accept_terms: "Declaro que he leído, entendido y acepto la Política de Privacidad y términos mencionados.",
        options_business: [{value: 'Anónima', label: 'Anónima'}, {value: 'Limitada', label: 'Limitada'}, {value: 'Corporación', label: 'Corporación'}, {value: 'OTRA', label: 'OTRA'}],
        options_capital: [{value: 'Privado', label: 'Privado'}, {value: 'Público', label: 'Público'}, {value: 'Mixto', label: 'Mixto'}, {value: 'Sin ánimo de lucro', label: 'Sin ánimo de lucro'}],
        options_ciiu: [{value: 'Alimentos y bebidas', label: 'Alimentos y bebidas'}, {value: 'Farmacéutica', label: 'Farmacéutica'}, {value: 'Química', label: 'Química'}, {value: 'Servicios', label: 'Servicios'}, {value: 'Industria', label: 'Industria'}, {value: 'Salud', label: 'Salud'}, {value: 'Minería y Petróleo', label: 'Minería y Petróleo'}, {value: 'Ventas', label: 'Ventas'}, {value: 'Financiero', label: 'Financiero'}, {value: 'Transporte', label: 'Transporte'}, {value: 'Otro', label: 'Otro'}],
        options_doc: [{value: 'CC', label: 'CC'}, {value: 'FIDC', label: 'FIDC'}, {value: 'IC', label: 'IC'}, {value: 'PAS', label: 'PAS'}],
        options_yesno: [{value: 'Sí', label: 'Sí'}, {value: 'No', label: 'No'}],
        options_pay: [{value: '60 días', label: '60 días'}, {value: '75 días', label: '75 días'}, {value: '90 días', label: '90 días'}, {value: 'Contado', label: 'Contado'}, {value: 'Otro', label: 'Otro'}],
        error_submit: "Error de registro:",
        error_unexpected: "Error inesperado:",
        alert_docs: "El registro fue guardado, pero hubo problemas con algunos documentos:\n",
        alert_contact: "\n\nPor favor contacte a soporte."
    },
    zh: {
        title: "交易对手了解表 (Counterparty Knowledge Form)",
        subtitle: "请填写所有必填字段",
        step0_title: "选择您的国家",
        step0_subtitle: "请搜索并选择您的原籍国以继续注册表格。",
        step0_btn: "开始填写表单",
        country_label: "国家",
        search_placeholder: "搜索并选择国家...",
        search_input: "输入以搜索...",
        no_countries: "未找到匹配的国家",
        step1_title: "基本信息 (General Information)",
        company_name: "公司名称 (Company Name)",
        tax_id: "税号 (TAX ID)",
        business_structure: "企业结构 (Business Structure)",
        origin_capital: "资本来源 (Origin of capital)",
        email: "电子邮件 (E-mail)",
        web_page: "网页 (Web page)",
        economic_activity: "主要经济活动 (Main Economic Activity)",
        btn_continue: "继续 (Continue)",
        btn_back: "返回 (Back)",
        btn_submit: "提交表单 (Submit Form)",
        processing: "处理中 (Processing)...",
        optional: "(可选)",
        select_placeholder: "选择 (Select)...",
        step2_title: "法定代表人与合规 (Legal Representative & Compliance)",
        full_name: "全名（名字和姓氏）",
        doc_type: "证件类型",
        id_number: "证件号码",
        place_issue: "签发地点",
        phone: "电话",
        city: "城市",
        department: "省/州 (Department/State)",
        answer_yes_no: "回答是或否 (Answer YES or NO)",
        manage_public: "您是否管理公共资源？",
        is_pep: "您是政治公众人物吗？(PEP)",
        public_authority: "您拥有公共权力吗？",
        linked_pep: "您与政治公众人物有联系吗？",
        step3_title: "银行信息 (Banking Information)",
        swift: "SWIFT 代码",
        aba: "ABA 代码",
        bank_name: "银行名称",
        bank_address: "银行地址",
        account_number: "账号",
        bank_phone: "银行电话",
        time_to_pay: "付款时间 (Time to pay bills)",
        contact_person: "联系人",
        step4_title: "文件与声明 (Documents & Declaration)",
        decl_title: "资金来源声明：",
        decl_p1: "我明确声明：本信息的内容是真实且可验证的，为了遵守现行法律法规，我向 FIRPLAK SA 做出以下关于货物和资金来源的声明。",
        decl_1: "1) 我拥有的资产来源于：（详细说明职业、活动、业务）",
        decl_1_placeholder: "在此说明...",
        decl_2: "2) 我所代表的活动是合法的，并且在法律框架内。我所代表的资源并非来自适用法律中规定的非法活动。",
        decl_3: "3) 我在本文件中提供的信息是真实和可验证的，并将根据 FIRPLAK 的要求进行更新。",
        decl_4: "4) 我授权 FIRPLAK 向任何被正式授权处理或管理政府实体数据库的机构请求、查询或处理本表格中包含的信息。",
        decl_5: "5) 发展商业关系所产生的资源将不用于资助恐怖主义、恐怖组织或恐怖活动。",
        decl_6: "6) 我们免除 FIRPLAK 及其法定代表人和管理人员因本文件中提供的错误、虚假或不准确的信息或因违反该信息而产生的所有责任。",
        docs_title: "要附加的文件",
        doc_tax: "税务登记证 (Tax identification certificate)",
        doc_id: "法定代表人身份证或护照复印件（放至150%）",
        doc_share: "股权结构复印件",
        doc_finance: "经认证的比较财务报表（上一期间）",
        doc_bank: "银行证明 (Bank certification)",
        sign_title: "签名与指纹 (Signature & Footprint)",
        sign_click: "点击选择签名/印章图片",
        sign_format: "PNG, JPG，最大 5MB",
        accept_terms: "我声明我已阅读、理解并接受上述隐私政策和条款。",
        options_business: [{value: 'Anónima', label: '股份有限公司 (Anonymous)'}, {value: 'Limitada', label: '有限责任公司 (LLC)'}, {value: 'Corporación', label: '集团公司 (CORP)'}, {value: 'OTRA', label: '其他 (OTHER)'}],
        options_capital: [{value: 'Privado', label: '私人 (Private)'}, {value: 'Público', label: '公共 (Public)'}, {value: 'Mixto', label: '混合 (Mixed)'}, {value: 'Sin ánimo de lucro', label: '非盈利 (Non profit)'}],
        options_ciiu: [{value: 'Alimentos y bebidas', label: '食品和饮料 (Food/Beverage)'}, {value: 'Farmacéutica', label: '制药 (Pharmaceutical)'}, {value: 'Química', label: '化工 (Chemical)'}, {value: 'Servicios', label: '服务 (Services)'}, {value: 'Industria', label: '工业 (Industry)'}, {value: 'Salud', label: '健康 (Health)'}, {value: 'Minería y Petróleo', label: '采矿和石油 (Mining/Oil)'}, {value: 'Ventas', label: '销售 (Sales)'}, {value: 'Financiero', label: '金融 (Financial)'}, {value: 'Transporte', label: '运输 (Transportation)'}, {value: 'Otro', label: '其他 (Other)'}],
        options_doc: [{value: 'CC', label: 'CC'}, {value: 'FIDC', label: 'FIDC'}, {value: 'IC', label: 'IC'}, {value: 'PAS', label: '护照 (PAS)'}],
        options_yesno: [{value: 'Sí', label: '是 (Yes)'}, {value: 'No', label: '否 (No)'}],
        options_pay: [{value: '60 días', label: '60 天'}, {value: '75 días', label: '75 天'}, {value: '90 días', label: '90 天'}, {value: 'Contado', label: '现金 (Cash)'}, {value: 'Otro', label: '其他 (Other)'}],
        error_submit: "注册错误:",
        error_unexpected: "意外错误:",
        alert_docs: "注册已保存，但某些文件出现问题：\n",
        alert_contact: "\n\n请联系技术支持。"
    }
}

export default function ExtranjeroForm() {
    const router = useRouter()
    const [step, setStep] = useState(0)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState<Record<string, any>>({})
    const [signatureUrl, setSignatureUrl] = useState<string | null>(null)
    const [mounted, setMounted] = useState(false)
    const [paisesList, setPaisesList] = useState<{codigo: string, pais: string}[]>([])
    const [lang, setLang] = useState<'en' | 'es' | 'zh'>('en')

    useEffect(() => {
        setMounted(true)
        getPaises().then(setPaisesList)
    }, [])

    const updateField = (field: string, value: any) => {
        setFormData(prev => {
            const next = { ...prev, [field]: value }
            if (field === 'pais') {
                if (esCountries.includes(value)) setLang('es')
                else if (zhCountries.includes(value)) setLang('zh')
                else setLang('en')
            }
            return next
        })
    }

    const t = dict[lang]

    const handleSubmit = async () => {
        setLoading(true)
        try {
            const allowedKeys = [
                'tipo_solicitud', 'tipo_contraparte', 'razon_social', 'numero_identificacion', 'pais', 
                'tipo_sociedad', 'origen_capital', 'correo_facturacion', 'pagina_web', 'codigo_ciiu',
                'rep_legal_nombre_completo', 'rep_legal_tipo_documento', 'rep_legal_numero_identificacion',
                'rep_legal_lugar_expedicion', 'rep_legal_telefono', 'rep_legal_email', 'ciudad', 'departamento',
                'administra_recursos_publicos', 'rep_legal_es_pep', 'tiene_grado_poder_publico', 'tiene_vinculo_pep',
                'swift_code', 'aba_code', 'entidad_bancaria', 'direccion', 'numero_cuenta', 'telefono1_numero',
                'dias_credito', 'persona_contacto', 'email', 'detalle_origen_fondos', 'acepta_terminos'
            ]

            const cleanFormData: Record<string, any> = {}
            allowedKeys.forEach(key => {
                if (formData[key] !== undefined) {
                    // Si el form manda el "pais" como codigo, podríamos necesitar guardarlo como codigo o nombre.
                    // En page.tsx original se guardaba el valor del select, que era el nombre (o la opción).
                    // Asumiremos que Supabase lo acepta bien.
                    cleanFormData[key] = formData[key]
                }
            })

            const result = await submitProveedorForm({
                ...cleanFormData as any,
                tipo_solicitud: 'Nuevo Registro Extranjero',
                tipo_contraparte: 'persona_juridica', 
            })

            if (result.success && result.id) {
                const proveedorId = result.id
                const nombreProveedor = formData.razon_social || ''

                const fileFields = [
                    'tax_identification', 
                    'legal_rep_id', 
                    'shareholding_composition', 
                    'financial_statements', 
                    'bank_certification',
                    'firma' 
                ]
                
                const errors: string[] = []
                
                for (const field of fileFields) {
                    const file = formData[field]
                    if (file instanceof File) {
                        const label = field === 'firma' ? 'FIRMA' : field.replace(/_/g, ' ').toUpperCase()
                        
                        const uploadFormData = new FormData()
                        uploadFormData.append('file', file)
                        uploadFormData.append('proveedorId', proveedorId)
                        uploadFormData.append('tipoDocumento', label)
                        uploadFormData.append('nombreProveedor', nombreProveedor)
                        
                        try {
                            const uploadRes = await uploadDocument(uploadFormData)
                            if (!uploadRes.success) {
                                errors.push(`${label}: ${uploadRes.error}`)
                            }
                        } catch (err: any) {
                            errors.push(`${label}: ${err.message || 'Unknown error'}`)
                        }
                    }
                }

                if (errors.length > 0) {
                    alert(`${t.alert_docs}- ${errors.join('\n- ')}${t.alert_contact}`)
                }

                router.push(`/registro/exito?id=${proveedorId}`)
            } else {
                alert(`${t.error_submit} ${(result as any).error}`)
                setLoading(false)
            }
        } catch (e: any) {
            console.error('Error en handleSubmit:', e)
            alert(`${t.error_unexpected} ${(e.message || 'Unknown error')}`)
            setLoading(false)
        }
    }

    if (!mounted) return null

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-[#254153] text-white py-6">
                <div className="max-w-4xl mx-auto px-4">
                    <h1 className="text-2xl font-bold">{t.title}</h1>
                    <p className="text-white/70 text-sm mt-1">{t.subtitle}</p>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Progress */}
                {step > 0 && (
                    <div className="flex gap-2 mb-8">
                        {[1, 2, 3, 4].map(s => (
                            <div key={s} className={`h-2 flex-1 rounded ${step >= s ? 'bg-[#254153]' : 'bg-gray-200'}`} />
                        ))}
                    </div>
                )}

                {/* Step 0: Country Selection */}
                {step === 0 && (
                    <div className="bg-white rounded-xl p-8 shadow-sm border max-w-lg mx-auto mt-10">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-[#254153]/5 text-[#254153] rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-[#254153]">{t.step0_title}</h2>
                            <p className="text-gray-500 mt-2 text-sm">{t.step0_subtitle}</p>
                        </div>
                        
                        <CountrySelect 
                            label={t.country_label}
                            name="pais" 
                            value={formData.pais} 
                            onChange={updateField} 
                            options={paisesList} 
                            t={t}
                        />
                        
                        <button
                            onClick={() => setStep(1)}
                            disabled={!formData.pais}
                            className="mt-8 w-full py-3.5 bg-[#254153] text-white rounded-xl font-bold shadow-lg hover:bg-[#1a2d3a] hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:hover:shadow-lg disabled:cursor-not-allowed"
                        >
                            {t.step0_btn}
                        </button>
                    </div>
                )}

                {/* Step 1: General Information */}
                {step === 1 && (
                    <div className="bg-white rounded-xl p-6 shadow-sm border">
                        <h2 className="text-xl font-semibold text-[#254153] mb-6">{t.step1_title}</h2>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <Input label={t.company_name} name="razon_social" value={formData.razon_social} onChange={updateField} className="col-span-2" t={t} />
                            <Input label={t.tax_id} name="numero_identificacion" value={formData.numero_identificacion} onChange={updateField} t={t} />
                            
                            <div className="opacity-70 pointer-events-none">
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t.country_label}</label>
                                <div className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl bg-gray-100 flex items-center gap-3">
                                    <img src={`https://flagcdn.com/w40/${formData.pais?.toLowerCase()}.png`} alt={formData.pais} className="w-6 rounded-sm shadow-sm" />
                                    <span className="font-medium text-gray-900">{paisesList.find(p => p.codigo === formData.pais)?.pais}</span>
                                </div>
                            </div>
                            
                            <Select label={t.business_structure} name="tipo_sociedad" value={formData.tipo_sociedad} onChange={updateField} options={t.options_business} t={t} />
                            <Select label={t.origin_capital} name="origen_capital" value={formData.origen_capital} onChange={updateField} options={t.options_capital} t={t} />
                            <Input label={t.email} name="correo_facturacion" type="email" value={formData.correo_facturacion} onChange={updateField} t={t} />
                            <Input label={t.web_page} name="pagina_web" value={formData.pagina_web} onChange={updateField} optional t={t} />
                            <Select 
                                label={t.economic_activity}
                                name="codigo_ciiu" 
                                value={formData.codigo_ciiu} 
                                onChange={updateField} 
                                className="col-span-2"
                                options={t.options_ciiu} 
                                t={t}
                            />
                        </div>

                        <div className="flex gap-4 mt-6">
                            <button onClick={() => setStep(0)} className="flex-1 py-3 border border-gray-300 rounded-xl font-medium">{t.btn_back}</button>
                            <button
                                onClick={() => setStep(2)}
                                disabled={!formData.razon_social || !formData.numero_identificacion || !formData.tipo_sociedad || !formData.origen_capital || !formData.correo_facturacion || !formData.codigo_ciiu}
                                className="flex-1 py-3 bg-[#254153] text-white rounded-xl font-semibold disabled:opacity-50"
                            >
                                {t.btn_continue}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Legal Representative */}
                {step === 2 && (
                    <div className="bg-white rounded-xl p-6 shadow-sm border">
                        <h2 className="text-xl font-semibold text-[#254153] mb-6">{t.step2_title}</h2>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <Input label={t.full_name} name="rep_legal_nombre_completo" value={formData.rep_legal_nombre_completo} onChange={updateField} className="col-span-2" t={t} />
                            <Select label={t.doc_type} name="rep_legal_tipo_documento" value={formData.rep_legal_tipo_documento} onChange={updateField} options={t.options_doc} t={t} />
                            <Input label={t.id_number} name="rep_legal_numero_identificacion" value={formData.rep_legal_numero_identificacion} onChange={updateField} t={t} />
                            <Input label={t.place_issue} name="rep_legal_lugar_expedicion" value={formData.rep_legal_lugar_expedicion} onChange={updateField} t={t} />
                            <Input label={t.phone} name="rep_legal_telefono" value={formData.rep_legal_telefono} onChange={updateField} t={t} />
                            <Input label={t.city} name="ciudad" value={formData.ciudad} onChange={updateField} t={t} />
                            <Input label={t.department} name="departamento" value={formData.departamento} onChange={updateField} t={t} />
                            <Input label={t.email} name="rep_legal_email" type="email" value={formData.rep_legal_email} onChange={updateField} className="col-span-2" t={t} />
                        </div>

                        <div className="mt-6 border-t pt-6 space-y-4">
                            <h3 className="font-bold text-[#254153]">{t.answer_yes_no}</h3>
                            <Select label={t.manage_public} name="administra_recursos_publicos" value={formData.administra_recursos_publicos} onChange={updateField} options={t.options_yesno} t={t} />
                            <Select label={t.is_pep} name="rep_legal_es_pep" value={formData.rep_legal_es_pep} onChange={updateField} options={t.options_yesno} t={t} />
                            <Select label={t.public_authority} name="tiene_grado_poder_publico" value={formData.tiene_grado_poder_publico} onChange={updateField} options={t.options_yesno} t={t} />
                            <Select label={t.linked_pep} name="tiene_vinculo_pep" value={formData.tiene_vinculo_pep} onChange={updateField} options={t.options_yesno} t={t} />
                        </div>

                        <div className="flex gap-4 mt-6">
                            <button onClick={() => setStep(1)} className="flex-1 py-3 border border-gray-300 rounded-xl font-medium">{t.btn_back}</button>
                            <button 
                                onClick={() => setStep(3)} 
                                disabled={!formData.rep_legal_nombre_completo || !formData.rep_legal_tipo_documento || !formData.rep_legal_numero_identificacion || !formData.administra_recursos_publicos || !formData.rep_legal_es_pep || !formData.tiene_grado_poder_publico || !formData.tiene_vinculo_pep}
                                className="flex-1 py-3 bg-[#254153] text-white rounded-xl font-semibold disabled:opacity-50"
                            >
                                {t.btn_continue}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Banking Information */}
                {step === 3 && (
                    <div className="bg-white rounded-xl p-6 shadow-sm border">
                        <h2 className="text-xl font-semibold text-[#254153] mb-6">{t.step3_title}</h2>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <Input label={t.swift} name="swift_code" value={formData.swift_code} onChange={updateField} t={t} />
                            <Input label={t.aba} name="aba_code" value={formData.aba_code} onChange={updateField} t={t} />
                            <Input label={t.bank_name} name="entidad_bancaria" value={formData.entidad_bancaria} onChange={updateField} className="col-span-2" t={t} />
                            <Input label={t.bank_address} name="direccion" value={formData.direccion} onChange={updateField} className="col-span-2" t={t} />
                            <Input label={t.account_number} name="numero_cuenta" value={formData.numero_cuenta} onChange={updateField} t={t} />
                            <Input label={t.bank_phone} name="telefono1_numero" value={formData.telefono1_numero} onChange={updateField} t={t} />
                            
                            <Select label={t.time_to_pay} name="dias_credito" value={formData.dias_credito} onChange={updateField} options={t.options_pay} t={t} />
                            <div className="col-span-2 grid grid-cols-2 gap-4 border-t pt-4 mt-2">
                                <Input label={t.contact_person} name="persona_contacto" value={formData.persona_contacto} onChange={updateField} t={t} />
                                <Input label={t.email} name="email" type="email" value={formData.email} onChange={updateField} t={t} />
                            </div>
                        </div>

                        <div className="flex gap-4 mt-6">
                            <button onClick={() => setStep(2)} className="flex-1 py-3 border border-gray-300 rounded-xl font-medium">{t.btn_back}</button>
                            <button 
                                onClick={() => setStep(4)} 
                                disabled={!formData.swift_code || !formData.entidad_bancaria || !formData.numero_cuenta || !formData.dias_credito || !formData.persona_contacto || !formData.email}
                                className="flex-1 py-3 bg-[#254153] text-white rounded-xl font-semibold disabled:opacity-50"
                            >
                                {t.btn_continue}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: Documents and Sign */}
                {step === 4 && (
                    <div className="bg-white rounded-xl p-6 shadow-sm border">
                        <h2 className="text-xl font-semibold text-[#254153] mb-6">{t.step4_title}</h2>
                        
                        <div className="space-y-4 mb-8 text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <p className="font-semibold mb-2 text-[#254153]">{t.decl_title}</p>
                            <p className="mb-4">{t.decl_p1}</p>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-[#254153] mb-2">
                                    {t.decl_1} <span className="text-red-500">*</span>
                                </label>
                                <textarea 
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#254153] bg-white text-sm"
                                    rows={2}
                                    value={formData.detalle_origen_fondos || ''}
                                    onChange={(e) => updateField('detalle_origen_fondos', e.target.value)}
                                    placeholder={t.decl_1_placeholder}
                                />
                            </div>
                            
                            <ul className="space-y-2 list-none">
                                <li>{t.decl_2}</li>
                                <li>{t.decl_3}</li>
                                <li>{t.decl_4}</li>
                                <li>{t.decl_5}</li>
                                <li>{t.decl_6}</li>
                            </ul>
                        </div>

                        <div className="space-y-4 mb-8">
                            <h3 className="font-bold text-[#254153]">{t.docs_title}</h3>
                            <FileInput label={t.doc_tax} name="tax_identification" onChange={updateField} t={t} />
                            <FileInput label={t.doc_id} name="legal_rep_id" onChange={updateField} t={t} />
                            <FileInput label={t.doc_share} name="shareholding_composition" onChange={updateField} t={t} />
                            <FileInput label={t.doc_finance} name="financial_statements" onChange={updateField} t={t} />
                            <FileInput label={t.doc_bank} name="bank_certification" onChange={updateField} t={t} />
                        </div>

                        <div className="mb-6">
                            <p className="text-sm font-medium text-gray-700 mb-3">
                                {t.sign_title} <span className="text-red-500">*</span>
                            </p>
                            
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 text-center">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    id="signature-upload"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            updateField('firma', file);
                                            setSignatureUrl(URL.createObjectURL(file));
                                        }
                                    }}
                                />
                                <label htmlFor="signature-upload" className="cursor-pointer">
                                    <div className="text-4xl mb-2">📸</div>
                                    {formData.firma instanceof File ? (
                                        <p className="text-sm text-green-600 font-medium">✅ {formData.firma.name}</p>
                                    ) : (
                                        <>
                                            <p className="text-sm text-gray-600">{t.sign_click}</p>
                                            <p className="text-xs text-gray-400 mt-1">{t.sign_format}</p>
                                        </>
                                    )}
                                </label>
                                {signatureUrl && (
                                    <div className="mt-4 flex justify-center">
                                        <img src={signatureUrl} alt="Signature Preview" className="max-h-32 object-contain" />
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="mb-6">
                            <Checkbox 
                                label={t.accept_terms}
                                name="acepta_terminos" 
                                checked={formData.acepta_terminos} 
                                onChange={updateField} 
                            />
                        </div>

                        <div className="flex gap-4 mt-6">
                            <button onClick={() => setStep(3)} className="flex-1 py-3 border border-gray-300 rounded-xl font-medium">{t.btn_back}</button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading || !formData.detalle_origen_fondos || !formData.tax_identification || !formData.legal_rep_id || !formData.firma || !formData.acepta_terminos}
                                className="flex-1 py-3 bg-[#254153] text-white rounded-xl font-semibold disabled:opacity-50"
                            >
                                {loading ? t.processing : t.btn_submit}
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}

// Reusable minimal UI Components
function Input({ label, name, value, onChange, type = 'text', className = '', optional = false, disabled = false, t }: any) {
    return (
        <div className={className}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label} {!optional && <span className="text-red-500">*</span>}
                {optional && <span className="text-gray-400 font-normal"> {t.optional}</span>}
            </label>
            <input
                type={type}
                value={value || ''}
                onChange={(e) => onChange(name, e.target.value)}
                disabled={disabled}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#254153] ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            />
        </div>
    )
}

function Select({ label, name, value, onChange, options, className = '', optional = false, t }: any) {
    return (
        <div className={className}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label} {!optional && <span className="text-red-500">*</span>}
            </label>
            <select
                value={value || ''}
                onChange={(e) => onChange(name, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#254153]"
            >
                <option value="">{t.select_placeholder}</option>
                {options.map((o: {value: string, label: string}) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
        </div>
    )
}

function Checkbox({ label, name, checked, onChange }: any) {
    return (
        <label className="flex items-center gap-3 cursor-pointer">
            <input
                type="checkbox"
                checked={checked || false}
                onChange={(e) => onChange(name, e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-[#254153] focus:ring-[#254153]"
            />
            <span className="text-gray-700 text-sm font-medium">{label}</span>
        </label>
    )
}

function FileInput({ label, name, onChange, optional = false, t }: any) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label} {!optional && <span className="text-red-500">*</span>}
                {optional && <span className="text-gray-400 font-normal"> {t.optional}</span>}
            </label>
            <input
                type="file"
                accept=".pdf"
                name={name}
                onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) onChange(name, file)
                }}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#254153] file:text-white file:font-medium cursor-pointer"
            />
        </div>
    )
}

function CountrySelect({ label, name, value, onChange, options, t }: { label: string, name: string, value: string, onChange: any, options: {codigo: string, pais: string}[], t: any }) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const wrapperRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [wrapperRef])

    const filteredOptions = options.filter(option => 
        option.pais.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const selectedOption = options.find(o => o.codigo === value)

    return (
        <div className="relative" ref={wrapperRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label} <span className="text-red-500">*</span>
            </label>
            <div 
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus-within:border-[#254153] focus-within:ring-4 focus-within:ring-[#254153]/10 cursor-pointer flex items-center justify-between transition-all duration-200 hover:border-gray-300"
                onClick={() => {
                    setIsOpen(!isOpen)
                    if (!isOpen) setSearchTerm('')
                }}
            >
                <div className="flex items-center gap-3">
                    {selectedOption ? (
                        <>
                            <img src={`https://flagcdn.com/w40/${selectedOption.codigo.toLowerCase()}.png`} alt={selectedOption.codigo} className="w-6 rounded-sm shadow-sm" />
                            <span className="font-medium text-gray-900">{selectedOption.pais}</span>
                        </>
                    ) : (
                        <span className="text-gray-400">{t.search_placeholder}</span>
                    )}
                </div>
                <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-3 border-b border-gray-100 bg-gray-50/50">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#254153] focus:ring-1 focus:ring-[#254153]"
                                placeholder={t.search_input}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                            />
                        </div>
                    </div>
                    <ul className="max-h-60 overflow-y-auto py-1 custom-scrollbar">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <li 
                                    key={option.codigo}
                                    className={`px-4 py-2.5 flex items-center gap-3 cursor-pointer transition-colors ${value === option.codigo ? 'bg-[#254153]/10 font-medium text-[#254153]' : 'hover:bg-gray-50 text-gray-700'}`}
                                    onClick={() => {
                                        onChange(name, option.codigo)
                                        setIsOpen(false)
                                    }}
                                >
                                    <img src={`https://flagcdn.com/w40/${option.codigo.toLowerCase()}.png`} alt={option.codigo} className="w-6 rounded-sm shadow-sm" />
                                    {option.pais}
                                </li>
                            ))
                        ) : (
                            <li className="px-4 py-8 text-center text-gray-500 text-sm">
                                {t.no_countries} "{searchTerm}"
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    )
}
