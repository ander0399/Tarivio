import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * Exporta los resultados de clasificación y costos a Excel con fórmulas profesionales
 */
export const exportToExcel = (data, filename = 'TaricAI_Export') => {
  const wb = XLSX.utils.book_new();
  
  // ==================== HOJA 1: RESUMEN ====================
  const summaryData = [
    ['TARICAI - REPORTE DE CLASIFICACIÓN ARANCELARIA'],
    [''],
    ['Fecha de generación:', new Date().toLocaleDateString('es-ES', { 
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    })],
    [''],
    ['INFORMACIÓN DEL PRODUCTO'],
    ['Descripción:', data.productDescription || ''],
    ['Código HS/TARIC:', data.hsCode || ''],
    ['País de Origen:', data.originCountry || ''],
    ['País de Destino:', data.destinationCountry || ''],
    [''],
    ['FUENTES OFICIALES'],
    ...(data.sources || []).map(s => [s.name, s.url]),
  ];
  
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  
  // Aplicar estilos de ancho de columna
  wsSummary['!cols'] = [{ wch: 25 }, { wch: 60 }];
  
  // Merge cells para el título
  wsSummary['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }];
  
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen');
  
  // ==================== HOJA 2: CÁLCULO DE COSTOS ====================
  if (data.costBreakdown) {
    const cb = data.costBreakdown;
    
    const costData = [
      ['SIMULADOR DE COSTOS DE IMPORTACIÓN'],
      [''],
      ['DATOS DE LA OPERACIÓN'],
      ['Código HS:', data.hsCode || ''],
      ['Producto:', data.productDescription || ''],
      ['Origen:', data.originCountry || ''],
      ['Destino:', data.destinationCountry || ''],
      [''],
      ['DESGLOSE DE COSTOS', 'VALOR (USD)', 'FÓRMULA'],
      [''],
      ['Valor FOB', cb.valor_fob || 0, 'Valor declarado en factura comercial'],
      ['Flete Internacional', cb.flete_estimado || 0, 'Estimado: 10-15% del FOB o valor real'],
      ['Seguro', cb.seguro_estimado || 0, 'Estimado: 0.5-1% del (FOB + Flete)'],
      [''],
      ['VALOR CIF', null, '=B11+B12+B13'],  // Fórmula real
      [''],
      ['Base para Arancel', null, '=B15'],
      ['% Arancel', (cb.arancel_porcentaje || 0) + '%', 'Según código HS y origen'],
      ['Monto Arancel', null, '=B17*B18/100'],
      [''],
      ['Base para IVA', null, '=B15+B19'],
      ['% IVA', (cb.iva_porcentaje || 0) + '%', 'Tasa del país de destino'],
      ['Monto IVA', null, '=B21*B22/100'],
      [''],
      ['OTROS COSTOS ESTIMADOS'],
      ['Agente Aduanal', cb.otros_costos?.agente_aduanal || 150, 'Variable según operación'],
      ['Almacenaje', cb.otros_costos?.almacenaje_estimado || 100, 'Estimado 3-5 días'],
      ['Documentación', cb.otros_costos?.documentacion || 50, 'Certificados y trámites'],
      [''],
      ['TOTAL IMPUESTOS Y TASAS', null, '=B19+B23+B26+B27+B28'],
      [''],
      ['COSTO TOTAL IMPORTACIÓN', null, '=B11+B12+B13+B30'],
      [''],
      ['PRECIO UNITARIO FINAL', null, '=B32/cantidad'],
    ];
    
    const wsCosts = XLSX.utils.aoa_to_sheet(costData);
    
    // Insertar valores calculados y fórmulas reales
    // Valor CIF
    wsCosts['B15'] = { t: 'n', f: 'B11+B12+B13' };
    // Base para Arancel
    wsCosts['B17'] = { t: 'n', f: 'B15' };
    // Monto Arancel
    wsCosts['B19'] = { t: 'n', f: 'B17*B18/100' };
    // Base para IVA
    wsCosts['B21'] = { t: 'n', f: 'B15+B19' };
    // Monto IVA
    wsCosts['B23'] = { t: 'n', f: 'B21*B22/100' };
    // Total impuestos
    wsCosts['B30'] = { t: 'n', f: 'B19+B23+B26+B27+B28' };
    // Costo total
    wsCosts['B32'] = { t: 'n', f: 'B11+B12+B13+B30' };
    
    // Aplicar anchos de columna
    wsCosts['!cols'] = [{ wch: 25 }, { wch: 18 }, { wch: 40 }];
    
    XLSX.utils.book_append_sheet(wb, wsCosts, 'Cálculo de Costos');
  }
  
  // ==================== HOJA 3: DOCUMENTOS REQUERIDOS ====================
  if (data.documents && data.documents.length > 0) {
    const docsData = [
      ['DOCUMENTOS REQUERIDOS PARA LA IMPORTACIÓN'],
      [''],
      ['#', 'DOCUMENTO', 'DESCRIPCIÓN', 'OBLIGATORIO'],
      ...data.documents.map((doc, idx) => [
        idx + 1,
        typeof doc === 'string' ? doc : doc.name,
        typeof doc === 'string' ? '' : (doc.description || ''),
        'Sí'
      ])
    ];
    
    const wsDocs = XLSX.utils.aoa_to_sheet(docsData);
    wsDocs['!cols'] = [{ wch: 5 }, { wch: 40 }, { wch: 50 }, { wch: 12 }];
    
    XLSX.utils.book_append_sheet(wb, wsDocs, 'Documentos');
  }
  
  // ==================== HOJA 4: TRATADOS COMERCIALES ====================
  if (data.tradeAgreements && data.tradeAgreements.length > 0) {
    const agreementsData = [
      ['TRATADOS COMERCIALES APLICABLES'],
      [''],
      ['TRATADO', 'TIPO', 'REDUCCIÓN ARANCELARIA', 'WEBSITE'],
      ...data.tradeAgreements.map(a => [
        a.name || a,
        a.type || 'FTA',
        a.tariff_elimination || 'Variable',
        a.website || ''
      ])
    ];
    
    const wsAgreements = XLSX.utils.aoa_to_sheet(agreementsData);
    wsAgreements['!cols'] = [{ wch: 35 }, { wch: 20 }, { wch: 25 }, { wch: 50 }];
    
    XLSX.utils.book_append_sheet(wb, wsAgreements, 'Tratados Comerciales');
  }
  
  // ==================== HOJA 5: INFORMACIÓN DEL PAÍS ====================
  if (data.countryInfo) {
    const ci = data.countryInfo;
    const countryData = [
      ['INFORMACIÓN DEL PAÍS DE DESTINO'],
      [''],
      ['Nombre:', ci.name || ''],
      ['Región:', ci.region || ''],
      ['Moneda:', ci.currency || ''],
      ['IVA/VAT:', (ci.vat_rate || '') + '%'],
      ['Miembro UE:', ci.eu_member ? 'Sí' : 'No'],
      [''],
      ['AUTORIDAD ADUANERA'],
      ['Nombre:', ci.customs_authority || ''],
      ['Website:', ci.customs_website || ''],
      ['Base Arancelaria:', ci.tariff_database || ''],
      [''],
      ['AUTORIDAD FITOSANITARIA'],
      ['Nombre:', ci.phytosanitary_authority || ''],
      ['Website:', ci.phytosanitary_website || ''],
      [''],
      ['SISTEMA ARANCELARIO'],
      ['Sistema:', ci.hs_system || ''],
      [''],
      ['NOTAS ESPECIALES'],
      [ci.special_notes || ''],
    ];
    
    const wsCountry = XLSX.utils.aoa_to_sheet(countryData);
    wsCountry['!cols'] = [{ wch: 25 }, { wch: 60 }];
    
    XLSX.utils.book_append_sheet(wb, wsCountry, 'Info País');
  }
  
  // Generar y descargar el archivo
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  saveAs(blob, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
  
  return true;
};

/**
 * Exporta el historial de clasificaciones a Excel
 */
export const exportHistoryToExcel = (history, filename = 'TaricAI_Historial') => {
  const wb = XLSX.utils.book_new();
  
  const historyData = [
    ['HISTORIAL DE CLASIFICACIONES - TARICAI'],
    ['Fecha de exportación:', new Date().toLocaleDateString('es-ES')],
    [''],
    ['FECHA', 'PRODUCTO', 'CÓDIGO HS', 'ORIGEN', 'DESTINO', 'CLIENTE REF'],
    ...history.map(h => [
      new Date(h.created_at).toLocaleDateString('es-ES'),
      h.product_description || '',
      h.taric_code || h.hs_code || '',
      h.origin_country || '',
      h.destination_country || '',
      h.client_reference || ''
    ])
  ];
  
  const ws = XLSX.utils.aoa_to_sheet(historyData);
  ws['!cols'] = [
    { wch: 12 }, { wch: 40 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 }
  ];
  
  XLSX.utils.book_append_sheet(wb, ws, 'Historial');
  
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  saveAs(blob, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
  
  return true;
};

export default { exportToExcel, exportHistoryToExcel };
