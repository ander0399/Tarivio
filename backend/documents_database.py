# Official Documents Database for TARIC AI
# Contains direct links to official PDF forms and documentation

OFFICIAL_DOCUMENTS = {
    # CITES Documents
    "cites_import_permit": {
        "name": "Permiso de Importación CITES",
        "type": "cites",
        "required": True,
        "description": "Permiso obligatorio para importar especímenes de especies incluidas en los Anexos A y B del Reglamento CITES",
        "issuing_authority": "MITECO - Ministerio para la Transición Ecológica",
        "official_link": "https://www.miteco.gob.es/es/biodiversidad/temas/conservacion-de-especies/convenios-internacionales/cites-solicitud.html",
        "pdf_form": "https://cites.comercio.gob.es/es-es/Documentos/Documents/SOLICITUD%20notificaci%C3%B3n%20FORMULARIO%20Ok.pdf",
        "pdf_guide": "https://www.miteco.gob.es/content/dam/miteco/es/biodiversidad/temas/conservacion-de-especies/guia_cites_tcm30-196941.pdf",
        "validity_days": 180,
        "processing_time": "15-30 días hábiles"
    },
    "cites_export_permit": {
        "name": "Permiso de Exportación CITES",
        "type": "cites",
        "required": True,
        "description": "Permiso para exportar especímenes de especies protegidas CITES",
        "issuing_authority": "MITECO - Ministerio para la Transición Ecológica",
        "official_link": "https://www.miteco.gob.es/es/biodiversidad/temas/conservacion-de-especies/convenios-internacionales/cites-permisos.html",
        "pdf_form": "https://cites.comercio.gob.es/es-es/Documentos/Documents/SOLICITUD%20notificaci%C3%B3n%20FORMULARIO%20Ok.pdf",
        "validity_days": 180,
        "processing_time": "15-30 días hábiles"
    },
    
    # Phytosanitary Documents
    "phytosanitary_certificate": {
        "name": "Certificado Fitosanitario de Importación",
        "type": "fitosanitario",
        "required": True,
        "description": "Certificado expedido por la autoridad fitosanitaria del país de origen, válido por 60 días",
        "issuing_authority": "ONPF del país de origen / Control en MAPA España",
        "official_link": "https://www.mapa.gob.es/es/agricultura/temas/comercio-exterior-vegetal/importaciongeneral",
        "pdf_guide": "https://www.mapa.gob.es/es/agricultura/publicaciones/guia_importadores_tcm30-58022.pdf",
        "pdf_form": "https://servicio.mapama.gob.es/cexvegweb/home",
        "validity_days": 60,
        "processing_time": "Inmediato en origen"
    },
    "phytosanitary_inspection": {
        "name": "Solicitud Inspección Fitosanitaria",
        "type": "fitosanitario",
        "required": True,
        "description": "Formulario para solicitar inspección fitosanitaria en punto de entrada",
        "issuing_authority": "MAPA - Puntos de Control Fronterizo",
        "official_link": "https://www.mapa.gob.es/es/agricultura/temas/comercio-exterior-vegetal/consulta_requisitos",
        "pdf_form": "https://sede.agenciatributaria.gob.es/static_files/Sede/Tema/Aduanas/Notas_info/NI_2025/NI_14_2025.pdf",
        "validity_days": 0,
        "processing_time": "1-3 días hábiles"
    },
    
    # Customs Documents (DUA)
    "dua_import": {
        "name": "DUA - Documento Único Administrativo de Importación",
        "type": "aduanero",
        "required": True,
        "description": "Declaración aduanera obligatoria para todas las importaciones de terceros países",
        "issuing_authority": "AEAT - Agencia Estatal de Administración Tributaria",
        "official_link": "https://sede.agenciatributaria.gob.es/Sede/aduanas/entrada-salida-mercancias/declaracion-aduana.html",
        "pdf_form": "https://comercio.gob.es/es-es/brexit-comercio/Documents/DUA_2016.pdf",
        "pdf_guide": "https://sede.agenciatributaria.gob.es/static_files/Sede/Procedimiento_ayuda/DB02/Tutorial_alta_dua_por_formulario.pdf",
        "online_portal": "https://sede.agenciatributaria.gob.es/Sede/tramitacion/DB01.shtml",
        "validity_days": 0,
        "processing_time": "Inmediato (electrónico)"
    },
    "dua_export": {
        "name": "DUA - Documento Único Administrativo de Exportación",
        "type": "aduanero",
        "required": True,
        "description": "Declaración aduanera para exportaciones fuera de la UE",
        "issuing_authority": "AEAT - Agencia Estatal de Administración Tributaria",
        "official_link": "https://sede.agenciatributaria.gob.es/Sede/aduanas/entrada-salida-mercancias/declaracion-aduana.html",
        "pdf_guide": "https://sede.agenciatributaria.gob.es/static_files/Sede/Procedimiento_ayuda/DB02/NotasAltaManualExportMedFormulario.pdf",
        "online_portal": "https://sede.agenciatributaria.gob.es/Sede/tramitacion/DB02.shtml",
        "validity_days": 0,
        "processing_time": "Inmediato (electrónico)"
    },
    
    # Origin Certificates
    "eur1_certificate": {
        "name": "Certificado EUR.1 de Origen Preferencial",
        "type": "aduanero",
        "required": False,
        "description": "Certificado de circulación de mercancías para beneficiarse de aranceles preferenciales según acuerdos comerciales",
        "issuing_authority": "Aduanas del país de exportación",
        "official_link": "https://sede.agenciatributaria.gob.es/Sede/aduanas.html",
        "pdf_form": "https://myatlanticforwarding.com/wp-content/uploads/2020/11/Certificado_EUR1.pdf",
        "pdf_guide": "https://sede.agenciatributaria.gob.es/static_files/Sede/Tema/Aduanas/Notas_info/NI_2024/NIGA0524.pdf",
        "validity_days": 120,
        "processing_time": "1-5 días hábiles"
    },
    "certificate_origin": {
        "name": "Certificado de Origen No Preferencial",
        "type": "aduanero",
        "required": False,
        "description": "Documento que acredita el país de fabricación/producción del producto",
        "issuing_authority": "Cámaras de Comercio",
        "official_link": "https://www.camara.es/comercio-exterior/certificado-de-origen",
        "pdf_form": "https://internacional.camaravalencia.com/wp-content/uploads/2022/07/Plantilla_Certificado_Origen_PDF.pdf",
        "validity_days": 365,
        "processing_time": "1-3 días hábiles"
    },
    
    # Food Safety Documents
    "health_certificate_food": {
        "name": "Certificado Sanitario de Importación de Alimentos",
        "type": "no_fitosanitario",
        "required": True,
        "description": "Certificado sanitario oficial del país de origen para productos alimenticios",
        "issuing_authority": "Autoridad sanitaria del país de origen / AESAN control en España",
        "official_link": "https://www.aesan.gob.es/AECOSAN/web/seguridad_alimentaria/seccion/registro.htm",
        "pdf_form": "https://www.aesan.gob.es/AECOSAN/docs/documentos/seguridad_alimentaria/registro/solicitud_certificado_empresas.pdf",
        "pdf_guide": "https://www.aesan.gob.es/AECOSAN/docs/documentos/seguridad_alimentaria/registro/Guia_RGSEAA.pdf",
        "validity_days": 90,
        "processing_time": "Variable según producto"
    },
    "rgseaa_registration": {
        "name": "Inscripción RGSEAA",
        "type": "no_fitosanitario",
        "required": True,
        "description": "Registro General Sanitario de Empresas Alimentarias y Alimentos",
        "issuing_authority": "AESAN - Agencia Española de Seguridad Alimentaria",
        "official_link": "https://www.aesan.gob.es/AECOSAN/web/seguridad_alimentaria/subseccion/procedimientos_registro.htm",
        "pdf_form": "https://www.aesan.gob.es/AECOSAN/docs/documentos/seguridad_alimentaria/registro/1_fomulario.pdf",
        "online_portal": "https://rgsa-web-aesan.mscbs.es/rgsa/formulario_principal_js.jsp",
        "validity_days": 0,
        "processing_time": "15-30 días"
    },
    
    # Veterinary Documents
    "veterinary_certificate": {
        "name": "Certificado Veterinario de Importación",
        "type": "no_fitosanitario",
        "required": True,
        "description": "Certificado sanitario para productos de origen animal",
        "issuing_authority": "Autoridad veterinaria del país de origen",
        "official_link": "https://www.mapa.gob.es/es/ganaderia/temas/comercio-exterior-ganadero/",
        "pdf_guide": "https://www.mapa.gob.es/es/ganaderia/temas/comercio-exterior-ganadero/importacion/default.aspx",
        "validity_days": 10,
        "processing_time": "Variable"
    },
    
    # Transit Documents
    "t2l_document": {
        "name": "Documento T2L - Estatuto Aduanero",
        "type": "aduanero",
        "required": False,
        "description": "Documento que acredita el estatuto comunitario de las mercancías",
        "issuing_authority": "AEAT - Agencia Tributaria",
        "official_link": "https://sede.agenciatributaria.gob.es/Sede/aduanas.html",
        "pdf_guide": "https://sede.agenciatributaria.gob.es/Sede/aduanas/aduana-electronica/guias-tecnicas.html",
        "validity_days": 0,
        "processing_time": "Inmediato"
    },
    
    # CE Marking
    "ce_declaration": {
        "name": "Declaración de Conformidad CE",
        "type": "no_fitosanitario",
        "required": False,
        "description": "Declaración del fabricante de que el producto cumple con las directivas europeas aplicables",
        "issuing_authority": "Fabricante / Organismo Notificado",
        "official_link": "https://ec.europa.eu/growth/single-market/ce-marking_es",
        "pdf_guide": "https://ec.europa.eu/docsroom/documents/38822",
        "validity_days": 0,
        "processing_time": "Variable según producto"
    },
    
    # Special Taxes
    "ie_special_taxes": {
        "name": "Documento Impuestos Especiales",
        "type": "aduanero",
        "required": False,
        "description": "Documentación para productos sujetos a impuestos especiales (alcohol, tabaco, hidrocarburos)",
        "issuing_authority": "AEAT - Departamento de Aduanas e IIEE",
        "official_link": "https://sede.agenciatributaria.gob.es/Sede/impuestos-especiales-medioambientales.html",
        "pdf_guide": "https://sede.agenciatributaria.gob.es/Sede/impuestos-especiales-medioambientales/impuestos-especiales.html",
        "validity_days": 0,
        "processing_time": "Variable"
    },
    
    # Anti-Dumping Documents
    "antidumping_certificate": {
        "name": "Certificado Anti-Dumping",
        "type": "aduanero", 
        "required": False,
        "description": "Documentación para productos sujetos a derechos antidumping según regulaciones UE",
        "issuing_authority": "Comisión Europea / AEAT",
        "official_link": "https://ec.europa.eu/trade/policy/accessing-markets/trade-defence/",
        "pdf_guide": "https://eur-lex.europa.eu/legal-content/ES/TXT/PDF/?uri=CELEX:32016R1036",
        "validity_days": 0,
        "processing_time": "N/A"
    }
}

# Document categories for UI filtering
DOCUMENT_CATEGORIES = {
    "fitosanitario": {
        "label": "Fitosanitario",
        "color": "green",
        "icon": "leaf",
        "description": "Documentos de sanidad vegetal"
    },
    "no_fitosanitario": {
        "label": "No Fitosanitario / Sanitario",
        "color": "amber",
        "icon": "shield",
        "description": "Documentos sanitarios para productos de origen animal y alimentos"
    },
    "aduanero": {
        "label": "Aduanero",
        "color": "cyan",
        "icon": "file-text",
        "description": "Documentos de despacho aduanero"
    },
    "cites": {
        "label": "CITES",
        "color": "purple",
        "icon": "shield-alert",
        "description": "Permisos para especies protegidas"
    }
}

def get_documents_for_product(product_type: str, origin_country: str = None) -> list:
    """
    Returns list of required documents based on product type and origin.
    This is a simplified version - in production would use AI to determine exact requirements.
    """
    base_documents = ["dua_import"]
    
    # Add documents based on product characteristics
    if product_type in ["vegetal", "planta", "fruta", "hortaliza", "semilla"]:
        base_documents.extend(["phytosanitary_certificate", "phytosanitary_inspection"])
    
    if product_type in ["animal", "carne", "pescado", "lácteo", "huevo"]:
        base_documents.extend(["veterinary_certificate", "health_certificate_food"])
    
    if product_type in ["alimento", "comida", "bebida"]:
        base_documents.extend(["health_certificate_food", "rgseaa_registration"])
    
    if product_type in ["protegido", "cites", "fauna", "flora_protegida"]:
        base_documents.extend(["cites_import_permit"])
    
    # Add origin certificate if from preferential country
    if origin_country:
        base_documents.append("eur1_certificate")
    
    return [OFFICIAL_DOCUMENTS[doc_id] for doc_id in base_documents if doc_id in OFFICIAL_DOCUMENTS]
