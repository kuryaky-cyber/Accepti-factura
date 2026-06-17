/* ================================================================
   ACCEPTI CONTADORES — FORMULARIO CFDI 4.0
   app.js v7.0 — Retenciones inteligentes por tipo de actividad

   Reemplaza antes de subir a producción:
   WEBHOOK_URL -> URL del escenario de Factura en Make
================================================================ */

var WEBHOOK_URL = 'https://hook.us2.make.com/scr4cut77aypoff1uypc7hh8byby1kcn';
var STORAGE_KEY = 'accepti_cfdi_v7';

var FLUJOS = {
  factura: [1,2,3,4,5],
  pago:    [1,2,3,5]
};

var LABELS = {
  1: 'Tipo y Emisor',
  2: 'Receptor',
  3: 'Conceptos / Pago',
  4: 'Forma de Pago',
  5: 'Confirmar'
};

var tipo  = '';
var flujo = [];
var fpos  = 0;
var nc    = 0;
var receptorEsPM = false; // true = Persona Moral (RFC 12 chars)

/* ================================================================
   TABLA DE RETENCIONES POR TIPO DE ACTIVIDAD
   Fuente: Art. 1-A LIVA + Art. 96/97 LISR
================================================================ */
var RETENCIONES = {
  'ninguna':     { retiva: 0,        retisr: 0,      label: 'Sin retención' },
  'hon_resico':  { retiva: 0.106667, retisr: 0.0125, label: 'Honorarios / Arrend. — PF RESICO (ISR 1.25% + IVA 10.667%)' },
  'hon_general': { retiva: 0.106667, retisr: 0.10,   label: 'Honorarios / Arrend. — PF General (ISR 10% + IVA 10.667%)' },
  'emp_resico':  { retiva: 0,        retisr: 0.0125, label: 'Actividad Empresarial — PF RESICO (ISR 1.25%)' },
  'fletes':      { retiva: 0.04,     retisr: 0,      label: 'Fletes / Autotransporte (IVA 4%)' },
  'comisiones':  { retiva: 0.106667, retisr: 0,      label: 'Comisiones (IVA 10.667%)' },
  'desperdicios':{ retiva: 1.00,     retisr: 0,      label: 'Desperdicios (IVA 100%)' }
};

/* ================================================================
   CATÁLOGO SAT LOCAL
================================================================ */
var SAT = [
  {c:"84111506",d:"Servicios de contabilidad",k:"Contabilidad",u:"E48"},
  {c:"84111507",d:"Servicios de auditoria",k:"Contabilidad",u:"E48"},
  {c:"84111508",d:"Asesoria fiscal y tributaria",k:"Contabilidad",u:"E48"},
  {c:"84111509",d:"Administracion financiera",k:"Contabilidad",u:"E48"},
  {c:"80141600",d:"Contabilidad general",k:"Contabilidad",u:"E48"},
  {c:"80141601",d:"Servicios de nomina",k:"Contabilidad",u:"E48"},
  {c:"80141602",d:"Declaraciones fiscales",k:"Contabilidad",u:"E48"},
  {c:"80111500",d:"Consultoria empresarial",k:"Profesionales",u:"E48"},
  {c:"80111501",d:"Consultoria en administracion",k:"Profesionales",u:"E48"},
  {c:"80101500",d:"Servicios juridicos y legales",k:"Profesionales",u:"E48"},
  {c:"80101501",d:"Asesoria legal corporativa",k:"Profesionales",u:"E48"},
  {c:"86101500",d:"Servicios de recursos humanos",k:"Profesionales",u:"E48"},
  {c:"85101500",d:"Servicios medicos y hospitalarios",k:"Salud",u:"E48"},
  {c:"85101501",d:"Consulta medica general",k:"Salud",u:"E48"},
  {c:"85101502",d:"Servicios odontologicos",k:"Salud",u:"E48"},
  {c:"85101503",d:"Servicios medicos especializados",k:"Salud",u:"E48"},
  {c:"85151600",d:"Servicios de psicologia",k:"Salud",u:"E48"},
  {c:"51101500",d:"Medicamentos y farmaceuticos",k:"Salud",u:"H87"},
  {c:"56101500",d:"Arrendamiento de inmuebles",k:"Arrendamiento",u:"E48"},
  {c:"56101501",d:"Arrendamiento de oficinas",k:"Arrendamiento",u:"E48"},
  {c:"56101502",d:"Arrendamiento de locales",k:"Arrendamiento",u:"E48"},
  {c:"56101503",d:"Arrendamiento de bodegas",k:"Arrendamiento",u:"E48"},
  {c:"56101504",d:"Arrendamiento casa habitacion",k:"Arrendamiento",u:"E48"},
  {c:"56101601",d:"Arrendamiento de vehiculos",k:"Arrendamiento",u:"E48"},
  {c:"56101602",d:"Arrendamiento de equipo de computo",k:"Arrendamiento",u:"E48"},
  {c:"78101800",d:"Transporte terrestre de carga",k:"Transporte",u:"E48"},
  {c:"78101801",d:"Mensajeria y paqueteria",k:"Transporte",u:"KGM"},
  {c:"78101802",d:"Logistica y almacenaje",k:"Transporte",u:"E48"},
  {c:"78101803",d:"Servicio de flete",k:"Transporte",u:"E48"},
  {c:"78111500",d:"Transporte de pasajeros",k:"Transporte",u:"E48"},
  {c:"81111500",d:"Tecnologias de la informacion",k:"Tecnologia",u:"E48"},
  {c:"81111501",d:"Desarrollo de software",k:"Tecnologia",u:"E48"},
  {c:"81111502",d:"Soporte tecnico informatico",k:"Tecnologia",u:"E48"},
  {c:"81111800",d:"Servicios de redes",k:"Tecnologia",u:"E48"},
  {c:"81111900",d:"Alojamiento web hosting",k:"Tecnologia",u:"E48"},
  {c:"81112000",d:"Servicios en la nube",k:"Tecnologia",u:"E48"},
  {c:"82101500",d:"Publicidad y marketing",k:"Publicidad",u:"E48"},
  {c:"82101501",d:"Diseno grafico",k:"Publicidad",u:"E48"},
  {c:"82101502",d:"Diseno de paginas web",k:"Publicidad",u:"E48"},
  {c:"82141500",d:"Gestion de redes sociales",k:"Publicidad",u:"E48"},
  {c:"72101500",d:"Construccion general",k:"Construccion",u:"E48"},
  {c:"72101501",d:"Servicios de arquitectura",k:"Construccion",u:"E48"},
  {c:"72101503",d:"Remodelacion y acabados",k:"Construccion",u:"E48"},
  {c:"72101504",d:"Instalaciones electricas",k:"Construccion",u:"E48"},
  {c:"72141500",d:"Mantenimiento de inmuebles",k:"Construccion",u:"E48"},
  {c:"50101500",d:"Alimentos y productos alimenticios",k:"Alimentos",u:"H87"},
  {c:"50101501",d:"Frutas y verduras frescas",k:"Alimentos",u:"KGM"},
  {c:"50101502",d:"Carnes y productos carnicos",k:"Alimentos",u:"KGM"},
  {c:"50171500",d:"Panaderia y reposteria",k:"Alimentos",u:"H87"},
  {c:"50181500",d:"Bebidas sin alcohol",k:"Alimentos",u:"LTR"},
  {c:"90101501",d:"Servicio de catering",k:"Alimentos",u:"E48"},
  {c:"15111500",d:"Gasolina y combustibles",k:"Gasolinera",u:"LTR"},
  {c:"15111501",d:"Diesel",k:"Gasolinera",u:"LTR"},
  {c:"15111502",d:"Gas LP",k:"Gasolinera",u:"LTR"},
  {c:"86111500",d:"Servicios educativos y capacitacion",k:"Educacion",u:"E48"},
  {c:"86111501",d:"Cursos y talleres",k:"Educacion",u:"E48"},
  {c:"80131500",d:"Servicios de bienes raices",k:"Bienes raices",u:"E48"},
  {c:"44101500",d:"Papeleria y articulos de escritorio",k:"Oficina",u:"H87"},
  {c:"44101600",d:"Muebles de oficina",k:"Oficina",u:"H87"},
  {c:"43211500",d:"Equipo de computo",k:"Electronica",u:"H87"},
  {c:"43191500",d:"Telefonos celulares",k:"Electronica",u:"H87"},
  {c:"53101500",d:"Ropa y prendas de vestir",k:"Ropa",u:"H87"},
  {c:"53101501",d:"Uniformes de trabajo",k:"Ropa",u:"H87"},
  {c:"76101500",d:"Servicios de limpieza",k:"Limpieza",u:"E48"},
  {c:"84131500",d:"Servicios financieros",k:"Finanzas",u:"E48"},
  {c:"90101600",d:"Organizacion de eventos",k:"Eventos",u:"E48"},
  {c:"30102500",d:"Materiales de construccion",k:"Materiales",u:"H87"},
  {c:"83111500",d:"Servicios de telecomunicaciones",k:"Telecomunicaciones",u:"E48"},
  {c:"55121501",d:"Redaccion y copywriting",k:"Editorial",u:"E48"},
  {c:"55121502",d:"Traduccion e interpretacion",k:"Editorial",u:"E48"},
  {c:"92121500",d:"Servicios gubernamentales",k:"Gobierno",u:"E48"},
  {c:"01010101",d:"No existe en catalogo SAT",k:"Otros",u:"ACT"}
];

var UNIDADES = {
  'E48':'E48 - Servicio','H87':'H87 - Pieza','KGM':'KGM - Kilogramo',
  'LTR':'LTR - Litro','MTR':'MTR - Metro','ACT':'ACT - Actividad',
  'MTS':'MTS - Metro cuadrado','TON':'TON - Tonelada',
  'XBX':'XBX - Caja','XPK':'XPK - Paquete','GRM':'GRM - Gramo'
};

/* ================================================================
   ESTILOS DINÁMICOS
================================================================ */
(function injectStyles() {
  var s = document.createElement('style');
  s.textContent =
    '.taxgrid{display:grid;grid-template-columns:1fr 2fr 1fr;gap:8px 10px;margin-top:10px;padding-top:10px;border-top:1.5px dashed var(--border)}' +
    '.taxgrid .f label{font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.4px}' +
    '.taxgrid select,.taxgrid input{padding:7px 9px;font-size:12px}' +
    '.ret-preview{font-size:10px;color:var(--teal2);margin-top:4px;font-weight:600;min-height:14px}' +
    '.receptor-tipo{font-size:11px;font-weight:600;margin-top:4px;padding:3px 8px;border-radius:4px;display:inline-block}' +
    '.receptor-tipo.pm{color:#fff;background:var(--teal2)}' +
    '.receptor-tipo.pf{color:var(--muted);background:var(--lite)}' +
    '.cuota-row{display:none;margin-top:6px;padding:8px 10px;background:rgba(245,158,11,.06);border:1px solid rgba(245,158,11,.3);border-radius:6px}' +
    '.cuota-row.visible{display:block}' +
    '.cuota-row label{color:var(--yellow)!important}' +
    '.conc-total{display:flex;justify-content:space-between;align-items:center;margin-top:10px;background:var(--lite);border:1px solid rgba(0,169,157,.25);border-radius:6px;padding:8px 14px}' +
    '.conc-total-label{font-size:10px;font-family:Montserrat,sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--teal2)}' +
    '.conc-total-value{font-family:monospace;font-size:14px;font-weight:700;color:var(--teal2)}' +
    '.restore-banner{position:fixed;top:0;left:0;right:0;background:var(--teal2);color:#fff;padding:10px 20px;display:flex;justify-content:space-between;align-items:center;z-index:9999;font-family:Montserrat,sans-serif;font-size:12px;font-weight:600}' +
    '.restore-banner button{background:none;border:1px solid rgba(255,255,255,.5);color:#fff;font-size:11px;cursor:pointer;padding:3px 10px;border-radius:3px;font-weight:700}' +
    '.restore-banner .rst-limpiar{margin-right:8px;opacity:.8}';
  document.head.appendChild(s);
})();

/* ================================================================
   MEMORIA LOCAL
================================================================ */
function saveToStorage() {
  try {
    var draft = { tipo: tipo, campos: {}, conceptos: [] };
    var fields = [
      'rfc_emisor','email_emisor','regimen_emisor','rfc_receptor','nombre_receptor','cp_receptor',
      'regimen_receptor','uso_cfdi','email_receptor','uuid_origen','serie_origen',
      'folio_origen','fecha_pago','monto_pago','num_parcialidad','saldo_anterior',
      'num_operacion','forma_pago','tipo_cambio','referencia','notas'
    ];
    fields.forEach(function(id) {
      var el = document.getElementById(id);
      if (el) draft.campos[id] = el.value;
    });
    var m  = document.querySelector('input[name=metodo]:checked');
    var mo = document.querySelector('input[name=moneda]:checked');
    var mc = document.querySelector('input[name=mon_cp]:checked');
    if (m)  draft.campos.metodo  = m.value;
    if (mo) draft.campos.moneda  = mo.value;
    if (mc) draft.campos.mon_cp  = mc.value;

    getIds().forEach(function(n) {
      draft.conceptos.push({
        desc:    g('cdesc'+n),
        sm:      g('sm'+n),
        sco:     (document.getElementById('sco'+n)  || {}).textContent || '',
        sde:     (document.getElementById('sde'+n)  || {}).textContent || '',
        cunit:   g('cunit'+n),
        ccant:   g('ccant'+n),
        cprice:  g('cprice'+n),
        cdisc:   g('cdisc'+n),
        civa:    g('civa'+n),
        cretipo: g('ctipret'+n) || 'ninguna',
        cieps:   g('cieps'+n),
        ccuota:  g('ccuota'+n) || ''
      });
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch(e) {}
}

function restoreFromStorage() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    var draft = JSON.parse(raw);

    if (draft.tipo) selTipo(draft.tipo);

    var campos = draft.campos || {};
    Object.keys(campos).forEach(function(id) {
      if (id === 'metodo') {
        var r = document.querySelector('input[name=metodo][value="'+campos[id]+'"]');
        if (r) { r.checked = true; r.dispatchEvent(new Event('change')); }
      } else if (id === 'moneda') {
        var r2 = document.querySelector('input[name=moneda][value="'+campos[id]+'"]');
        if (r2) { r2.checked = true; r2.dispatchEvent(new Event('change')); }
      } else if (id === 'mon_cp') {
        var r3 = document.querySelector('input[name=mon_cp][value="'+campos[id]+'"]');
        if (r3) r3.checked = true;
      } else {
        var el = document.getElementById(id);
        if (el) el.value = campos[id];
      }
    });

    // Detectar tipo receptor al restaurar
    var rfcRec = document.getElementById('rfc_receptor');
    if (rfcRec) actualizarTipoReceptor(rfcRec.value);

    if (draft.conceptos && draft.conceptos.length > 0) {
      document.getElementById('conc-list').innerHTML = '';
      nc = 0;
      draft.conceptos.forEach(function(c) {
        addConc();
        var n = nc;
        if (c.desc)   document.getElementById('cdesc'+n).value  = c.desc;
        if (c.sm) {
          document.getElementById('sm'+n).value = c.sm;
          if (c.sco) {
            document.getElementById('sco'+n).textContent = c.sco;
            document.getElementById('sde'+n).textContent = c.sde || '';
            document.getElementById('ssel'+n).classList.add('show');
          }
        }
        if (c.cunit)   { var e1=document.getElementById('cunit'+n);   if(e1) e1.value=c.cunit; }
        if (c.ccant)   { var e2=document.getElementById('ccant'+n);   if(e2) e2.value=c.ccant; }
        if (c.cprice)  { var e3=document.getElementById('cprice'+n);  if(e3) e3.value=c.cprice; }
        if (c.cdisc)   { var e4=document.getElementById('cdisc'+n);   if(e4) e4.value=c.cdisc; }
        if (c.civa)    { var e5=document.getElementById('civa'+n);    if(e5) e5.value=c.civa; }
        if (c.cretipo) { var e6=document.getElementById('ctipret'+n); if(e6){ e6.value=c.cretipo; aplicarTipoRetencion(n); } }
        if (c.cieps)   { var e8=document.getElementById('cieps'+n);   if(e8){ e8.value=c.cieps; toggleCuota(n); } }
        if (c.ccuota)  { var e9=document.getElementById('ccuota'+n);  if(e9) e9.value=c.ccuota; }
        calcConc(n);
      });
    }
    recalc();
    return true;
  } catch(e) { return false; }
}

function clearStorage() {
  try { localStorage.removeItem(STORAGE_KEY); } catch(e) {}
}

function showRestoreBanner() {
  var b = document.createElement('div');
  b.className = 'restore-banner';
  b.innerHTML =
    '<span>&#x2705; Se restauró tu borrador anterior — puedes continuar donde lo dejaste.</span>' +
    '<span>' +
    '<button class="rst-limpiar" onclick="limpiarBorrador()">Empezar de nuevo</button>' +
    '<button onclick="this.closest(\'.restore-banner\').remove()">Cerrar</button>' +
    '</span>';
  document.body.insertBefore(b, document.body.firstChild);
  setTimeout(function() { if (b.parentNode) b.remove(); }, 6000);
}

function limpiarBorrador() {
  clearStorage();
  window.location.reload();
}

/* ================================================================
   DETECCIÓN TIPO RECEPTOR (PM=12 chars / PF=13 chars)
================================================================ */
function actualizarTipoReceptor(rfc) {
  var rfcClean = (rfc || '').trim().toUpperCase();
  receptorEsPM = (rfcClean.length === 12);

  var hint = document.getElementById('receptor-tipo-hint');
  if (hint) {
    if (rfcClean.length === 12) {
      hint.textContent = '✓ Persona Moral — pueden aplicar retenciones';
      hint.className = 'receptor-tipo pm';
    } else if (rfcClean.length === 13) {
      hint.textContent = '✓ Persona Física';
      hint.className = 'receptor-tipo pf';
    } else {
      hint.textContent = '';
      hint.className = 'receptor-tipo';
    }
  }
}

/* ================================================================
   APLICAR TIPO DE RETENCIÓN — auto-llena tasas ocultas
================================================================ */
function aplicarTipoRetencion(n) {
  var tipoRet = g('ctipret'+n) || 'ninguna';
  var cfg = RETENCIONES[tipoRet] || RETENCIONES['ninguna'];

  var elRetIva = document.getElementById('cretiva'+n);
  var elRetIsr = document.getElementById('cretisr'+n);
  if (elRetIva) elRetIva.value = cfg.retiva;
  if (elRetIsr) elRetIsr.value = cfg.retisr;

  // Mostrar preview de tasas aplicadas
  var preview = document.getElementById('ret-preview'+n);
  if (preview) {
    if (tipoRet === 'ninguna') {
      preview.textContent = '';
    } else {
      var parts = [];
      if (cfg.retisr > 0) parts.push('ISR ' + (cfg.retisr * 100).toFixed(2).replace(/\.?0+$/, '') + '%');
      if (cfg.retiva > 0) parts.push('IVA ret. ' + (cfg.retiva * 100).toFixed(3).replace(/\.?0+$/, '') + '%');
      preview.textContent = parts.length ? '→ ' + parts.join(' + ') : '';
    }
  }
}

/* ================================================================
   INIT
================================================================ */
document.addEventListener('DOMContentLoaded', function() {
  var img = document.getElementById('logo-img');
  if (img) {
    img.onerror = function(){
      img.style.display = 'none';
      document.getElementById('logo-fb').style.display = 'grid';
    };
  }

  ['factura','pago'].forEach(function(t) {
    document.getElementById('tc-'+t).addEventListener('click', function(){ selTipo(t); });
  });

  document.getElementById('btn-n1').addEventListener('click', function(){
    if (!tipo) { alert('Selecciona el tipo de CFDI para continuar.'); return; }
    goNext();
  });
  document.getElementById('btn-n2').addEventListener('click', function(){ goNext(); });
  document.getElementById('btn-n3').addEventListener('click', function(){ goNext(); });
  document.getElementById('btn-n4').addEventListener('click', function(){ goNext(); });
  document.getElementById('btn-p2').addEventListener('click', function(){ goPrev(); });
  document.getElementById('btn-p3').addEventListener('click', function(){ goPrev(); });
  document.getElementById('btn-p4').addEventListener('click', function(){ goPrev(); });
  document.getElementById('btn-p5').addEventListener('click', function(){ goPrev(); });
  document.getElementById('btn-enviar').addEventListener('click', function(){ enviar(); });
  document.getElementById('btn-add-conc').addEventListener('click', function(){ addConc(); });

  addUpper('rfc_emisor','rfc_emisor');
  addUpper('rfc_receptor','rfc_receptor');
  addUpper('nombre_receptor','nombre_receptor');

  // Detección PM/PF al escribir RFC receptor
  var rfcRecEl = document.getElementById('rfc_receptor');
  if (rfcRecEl) {
    rfcRecEl.addEventListener('input', function(){
      actualizarTipoReceptor(this.value);
      saveToStorage();
    });
  }

  var autoSaveFields = [
    'email_emisor','regimen_emisor','cp_receptor','regimen_receptor','uso_cfdi','nombre_receptor',
    'uuid_origen','monto_pago','fecha_pago','forma_pago_cp','saldo_anterior',
    'forma_pago','tipo_cambio','referencia','notas','serie_origen','folio_origen',
    'num_operacion','num_parcialidad','email_receptor'
  ];
  autoSaveFields.forEach(function(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input',  function(){ clrE(id); saveToStorage(); });
    el.addEventListener('change', function(){ clrE(id); saveToStorage(); });
  });

  document.getElementById('uuid_origen').addEventListener('input', function(){
    this.value = this.value.toUpperCase();
  });

  document.querySelectorAll('input[name=metodo]').forEach(function(r){
    r.addEventListener('change', function(){
      var fp = document.getElementById('forma_pago');
      if (this.value === 'PPD') { fp.value = '99'; fp.disabled = true; }
      else { fp.disabled = false; }
      saveToStorage();
    });
  });

  document.getElementById('mon-usd').addEventListener('change', function(){
    document.getElementById('f-tc').classList.remove('hide');
    saveToStorage();
  });
  document.getElementById('mon-mxn').addEventListener('change', function(){
    document.getElementById('f-tc').classList.add('hide');
    saveToStorage();
  });

  document.addEventListener('click', function(e){
    if (!e.target.closest('.satwrap')) {
      document.querySelectorAll('.satdrop.open').forEach(function(d){ d.classList.remove('open'); });
    }
  });

  var restored = restoreFromStorage();
  if (!restored) addConc();
  renderStepbar();
  if (restored && tipo) showRestoreBanner();

  // Pre-fill emisor RFC from URL parameter ?rfc= (flujo multi-empresa)
  var rfcParam = new URLSearchParams(window.location.search).get('rfc');
  if (rfcParam) {
    var rfcEl = document.getElementById('rfc_emisor');
    if (rfcEl) {
      rfcEl.value = rfcParam.toUpperCase();
      rfcEl.dispatchEvent(new Event('input'));
    }
  }

  // Pre-fill regimen fiscal emisor from URL parameter ?regimen=
  var regimenParam = new URLSearchParams(window.location.search).get('regimen');
  if (regimenParam) {
    var regimenEl = document.getElementById('regimen_emisor');
    if (regimenEl) regimenEl.value = regimenParam;
  }
});

function addUpper(id, errId) {
  var el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('input', function(){
    this.value = this.value.toUpperCase();
    if (errId) clrE(errId);
    saveToStorage();
  });
}

/* ================================================================
   SELECCIÓN DE TIPO
================================================================ */
function selTipo(t) {
  tipo = t;
  flujo = FLUJOS[t];
  fpos = 0;
  ['factura','pago'].forEach(function(x){
    document.getElementById('tc-'+x).classList.remove('sel');
    document.getElementById('chk-'+x).textContent = '';
  });
  document.getElementById('tc-'+t).classList.add('sel');
  document.getElementById('chk-'+t).textContent = '✓';
  renderStepbar();
  saveToStorage();
}

/* ================================================================
   BARRA DE PASOS
================================================================ */
function renderStepbar() {
  var bar = document.getElementById('stepbar');
  if (!flujo.length) { bar.innerHTML = ''; return; }
  var html = '';
  for (var i = 0; i < flujo.length; i++) {
    var s   = flujo[i];
    var cls = s === flujo[fpos] ? 'active' : (i < fpos ? 'done' : '');
    html += '<div class="sb"><div class="snum '+cls+'">'+(cls==='done'?'✓':s)+'</div>' +
            '<div class="slabel '+cls+'">'+LABELS[s]+'</div></div>';
    if (i < flujo.length-1) html += '<div class="sarrow">&rsaquo;</div>';
  }
  bar.innerHTML = html;
  var cur = fpos+1, tot = flujo.length;
  for (var j=1; j<=5; j++) {
    var sf = document.getElementById('sf'+j);
    if (sf) sf.textContent = 'Paso '+cur+' de '+tot;
  }
}

/* ================================================================
   NAVEGACIÓN
================================================================ */
function goNext() {
  if (!tipo || !flujo.length) { alert('Selecciona el tipo de CFDI para continuar.'); return; }
  var curStep = flujo[fpos];
  if (!validar(curStep)) return;
  if (curStep === 1) configurarFlujo();
  fpos++;
  var nextStep = flujo[fpos];
  if (nextStep === 5) armarResumen();
  mostrarCard(nextStep);
  renderStepbar();
  window.scrollTo({top:0, behavior:'smooth'});
}

function goPrev() {
  fpos--;
  mostrarCard(flujo[fpos]);
  renderStepbar();
  window.scrollTo({top:0, behavior:'smooth'});
}

function mostrarCard(n) {
  for (var i=1; i<=5; i++) {
    var c = document.getElementById('card'+i);
    if (c) { if (i===n) c.classList.add('active'); else c.classList.remove('active'); }
  }
}

function configurarFlujo() {
  var secConc = document.getElementById('sec-conceptos');
  var secPago = document.getElementById('sec-pago');
  var ico3    = document.getElementById('ico3');
  var t3      = document.getElementById('t3');
  var sub3    = document.getElementById('sub3');
  if (tipo === 'pago') {
    secConc.style.display = 'none';
    secPago.style.display = 'block';
    ico3.textContent  = '\u{1F4B3}';
    t3.textContent    = 'Datos del Complemento de Pago';
    sub3.textContent  = 'Proporciona los datos del pago recibido y la factura que se liquida';
  } else {
    secConc.style.display = 'block';
    secPago.style.display = 'none';
    t3.textContent   = 'Conceptos de la Factura';
    sub3.textContent = 'Agrega los productos o servicios. Puedes agregar multiples conceptos.';
  }
}

/* ================================================================
   VALIDACIÓN
================================================================ */
function validar(step) {
  var ok = true;
  if (!step) return false;
  if (step === 1) {
    if (!tipo) { alert('Selecciona el tipo de CFDI para continuar.'); return false; }
    if (g('rfc_emisor').trim().length < 12) { marcarErr('rfc_emisor'); ok=false; }
    var em = g('email_emisor').trim();
    if (!em || em.indexOf('@') < 1) { marcarErr('email_emisor'); ok=false; }
    if (!g('regimen_emisor')) { marcarErr('regimen_emisor'); ok=false; }
  }
  if (step === 2) {
    if (g('rfc_receptor').trim().length < 12) { marcarErr('rfc_receptor'); ok=false; }
    if (g('nombre_receptor').trim().length < 2) { marcarErr('nombre_receptor'); ok=false; }
    if (g('cp_receptor').trim().length !== 5) { marcarErr('cp_receptor'); ok=false; }
    if (!g('regimen_receptor')) { marcarErr('regimen_receptor'); ok=false; }
    if (!g('uso_cfdi')) { marcarErr('uso_cfdi'); ok=false; }
  }
  if (step === 3) {
    if (tipo === 'pago') {
      var uuid = g('uuid_origen').trim();
      if (uuid.length !== 36 || uuid.split('-').length !== 5) { marcarErr('uuid_origen'); ok=false; }
      if (!g('fecha_pago')) { marcarErr('fecha_pago'); ok=false; }
      if (!g('forma_pago_cp')) { marcarErr('forma_pago_cp'); ok=false; }
      if (!g('monto_pago') || parseFloat(g('monto_pago')) <= 0) { marcarErr('monto_pago'); ok=false; }
      if (!g('num_parcialidad')) { marcarErr('num_parcialidad'); ok=false; }
      if (!g('saldo_anterior') && g('saldo_anterior') !== '0') { marcarErr('saldo_anterior'); ok=false; }
    } else {
      if (document.querySelectorAll('.conc').length === 0) {
        alert('Agrega al menos un concepto para continuar.'); return false;
      }
    }
  }
  if (step === 4) {
    if (!g('forma_pago')) { marcarErr('forma_pago'); ok=false; }
  }
  if (step === 5) {
    if (!document.getElementById('acepto').checked) {
      alert('Debes aceptar los terminos para continuar.'); return false;
    }
  }
  if (!ok) {
    var firstErr = document.querySelector('.err');
    if (firstErr) firstErr.scrollIntoView({behavior:'smooth', block:'center'});
  }
  return ok;
}

function marcarErr(id){ var el=document.getElementById(id); if(el)el.classList.add('err'); var em=document.getElementById('e-'+id); if(em)em.style.display='block'; }
function clrE(id){ var el=document.getElementById(id); if(el)el.classList.remove('err'); var em=document.getElementById('e-'+id); if(em)em.style.display='none'; }
function g(id){ var el=document.getElementById(id); return el ? el.value : ''; }

/* ================================================================
   CONCEPTOS
================================================================ */
function addConc() {
  nc++;
  var n = nc;

  var unitsHtml = Object.keys(UNIDADES).map(function(k){
    return '<option value="'+k+'"'+(k==='E48'?' selected':'')+'>'+UNIDADES[k]+'</option>';
  }).join('');

  // Opciones de tipo de retención
  var tipRetOpts = Object.keys(RETENCIONES).map(function(k){
    return '<option value="'+k+'">'+RETENCIONES[k].label+'</option>';
  }).join('');

  var div = document.createElement('div');
  div.className = 'conc'; div.id = 'c'+n;

  div.innerHTML =
    '<div class="chead2">' +
      '<span class="cnum">Concepto '+n+'</span>' +
      '<div class="cdesc-wrap"><input type="text" id="cdesc'+n+'" placeholder="Descripcion del producto o servicio"></div>' +
      '<button class="btnrm" data-n="'+n+'">&times;</button>' +
    '</div>' +
    '<div class="f" style="margin-bottom:12px">' +
      '<label>Clave SAT</label>' +
      '<div class="satwrap" id="sw'+n+'">' +
        '<span class="satico">&#128269;</span>' +
        '<input type="text" class="satinput" id="ss'+n+'" placeholder="Buscar producto o servicio..." autocomplete="off">' +
        '<div class="satdrop" id="sd'+n+'"></div>' +
        '<div class="satmanual"><span>O clave manual:</span><input type="text" id="sm'+n+'" placeholder="84111506" maxlength="8"></div>' +
      '</div>' +
      '<div class="satsel" id="ssel'+n+'"><strong id="sco'+n+'"></strong><span id="sde'+n+'"></span><button class="satclr" data-n="'+n+'">&times;</button></div>' +
      '<a href="https://pys.sat.gob.mx/PyS/catPyS.aspx" target="_blank" class="sat-catalogo-link">&#128269; No encuentras tu clave? Consulta el catalogo oficial del SAT</a>' +
    '</div>' +
    '<div class="cgrid">' +
      '<div class="f"><label>Cantidad</label><input type="number" id="ccant'+n+'" value="1" min="0.001" step="0.001"></div>' +
      '<div class="f"><label>Unidad SAT</label><select id="cunit'+n+'">'+unitsHtml+'</select></div>' +
      '<div class="f"><label>Precio unitario (sin IVA)</label><div class="pfx"><span class="pfxl">$</span><input type="number" id="cprice'+n+'" placeholder="0.00" min="0" step="0.01"></div></div>' +
      '<div class="f"><label>Descuento %</label><input type="number" id="cdisc'+n+'" placeholder="0" min="0" max="100" step="0.01"></div>' +
    '</div>';

  document.getElementById('conc-list').appendChild(div);

  /* ---- Grid de impuestos: 3 columnas ---- */
  var taxgrid = document.createElement('div');
  taxgrid.className = 'taxgrid';

  /* Columna 1: IVA */
  var fIva = document.createElement('div'); fIva.className = 'f';
  fIva.innerHTML =
    '<label>IVA</label>' +
    '<select id="civa'+n+'">' +
      '<option value="0.16">16% — General</option>' +
      '<option value="0.08">8% — Zona fronteriza</option>' +
      '<option value="0">0% — Alimentos/Medicamentos</option>' +
      '<option value="exento">Exento — Serv. medicos, educacion</option>' +
    '</select>';
  taxgrid.appendChild(fIva);

  /* Columna 2: Tipo de retención (reemplaza los 2 dropdowns anteriores) */
  var fTipRet = document.createElement('div'); fTipRet.className = 'f';
  fTipRet.innerHTML =
    '<label>Tipo de retención' +
      (receptorEsPM ? ' <span style="color:var(--teal2);font-weight:700">● Receptor PM</span>' : '') +
    '</label>' +
    '<select id="ctipret'+n+'">' + tipRetOpts + '</select>' +
    '<div class="ret-preview" id="ret-preview'+n+'"></div>' +
    '<input type="hidden" id="cretiva'+n+'" value="0">' +
    '<input type="hidden" id="cretisr'+n+'" value="0">';
  taxgrid.appendChild(fTipRet);

  /* Columna 3: IEPS */
  var fIeps = document.createElement('div'); fIeps.className = 'f';
  fIeps.innerHTML =
    '<label>IEPS</label>' +
    '<select id="cieps'+n+'">' +
      '<option value="0">Sin IEPS</option>' +
      '<option value="0.08">8% — Alimentos chatarra (&gt;275 kcal)</option>' +
      '<option value="0.265">26.5% — Cerveza / Pulque</option>' +
      '<option value="0.30">30% — Vinos (14°-20° GL)</option>' +
      '<option value="0.53">53% — Licores (&gt;20° GL)</option>' +
      '<option value="cuota">Cuota $/unidad — Combustibles</option>' +
    '</select>';
  taxgrid.appendChild(fIeps);

  div.appendChild(taxgrid);

  /* Campo cuota IEPS */
  var cuotaRow = document.createElement('div');
  cuotaRow.className = 'cuota-row'; cuotaRow.id = 'cuota-row'+n;
  cuotaRow.innerHTML =
    '<div class="f">' +
      '<label>Cuota IEPS ($ por unidad — litro, kg, etc.)</label>' +
      '<div class="pfx"><span class="pfxl">$</span>' +
        '<input type="number" id="ccuota'+n+'" placeholder="6.25" min="0" step="0.0001">' +
      '</div>' +
      '<span class="hint">Consulta la cuota vigente en el SAT cada mes. Ej. gasolina magna ≈ $6.25/L</span>' +
    '</div>';
  div.appendChild(cuotaRow);

  /* Total por concepto */
  var totRow = document.createElement('div');
  totRow.className = 'conc-total';
  totRow.innerHTML = '<span class="conc-total-label">Total concepto</span><span class="conc-total-value" id="ctotal'+n+'">$0.00</span>';
  div.appendChild(totRow);

  /* ---- Event listeners ---- */
  div.querySelector('.btnrm').addEventListener('click', function(){ rmConc(this.dataset.n); });
  div.querySelector('.satclr').addEventListener('click', function(){ clearSAT(this.dataset.n); });

  (function(nn){
    div.querySelector('#ss'+nn).addEventListener('input', function(){ buscar(nn); });
    div.querySelector('#sm'+nn).addEventListener('input', function(){ manualSAT(nn); calcConc(nn); saveToStorage(); });
    div.querySelector('#cdesc'+nn).addEventListener('input', saveToStorage);

    ['ccant','cprice','cdisc'].forEach(function(prefix){
      var el = document.getElementById(prefix+nn);
      if (el) {
        el.addEventListener('input',  function(){ calcConc(nn); saveToStorage(); });
        el.addEventListener('change', function(){ calcConc(nn); saveToStorage(); });
      }
    });

    document.getElementById('civa'+nn).addEventListener('change', function(){
      calcConc(nn); saveToStorage();
    });

    document.getElementById('ctipret'+nn).addEventListener('change', function(){
      aplicarTipoRetencion(nn); calcConc(nn); saveToStorage();
    });

    document.getElementById('cieps'+nn).addEventListener('change', function(){
      toggleCuota(nn); calcConc(nn); saveToStorage();
    });

    var cuotaEl = document.getElementById('ccuota'+nn);
    if (cuotaEl) cuotaEl.addEventListener('input', function(){ calcConc(nn); saveToStorage(); });
  })(n);

  calcConc(n);
  recalc();
}

function rmConc(n) {
  var el = document.getElementById('c'+n);
  if (el) el.remove();
  recalc();
  saveToStorage();
}

/* ================================================================
   TOGGLE CUOTA IEPS
================================================================ */
function toggleCuota(n) {
  var iepsEl   = document.getElementById('cieps'+n);
  var cuotaRow = document.getElementById('cuota-row'+n);
  if (!iepsEl || !cuotaRow) return;
  if (iepsEl.value === 'cuota') cuotaRow.classList.add('visible');
  else cuotaRow.classList.remove('visible');
}

/* ================================================================
   BÚSQUEDA CLAVE SAT (Worker Cloudflare)
================================================================ */
var WORKER_URL  = 'https://accepti.kuryaky.workers.dev';
var FAC_TIMERS  = {};

function buscar(n) {
  var q    = document.getElementById('ss'+n).value.trim();
  var drop = document.getElementById('sd'+n);
  if (q.length < 3) { drop.classList.remove('open'); return; }
  clearTimeout(FAC_TIMERS[n]);
  FAC_TIMERS[n] = setTimeout(function(){ buscarAPI(n, q); }, 400);
}

function buscarAPI(n, q) {
  var drop = document.getElementById('sd'+n);
  var local = [];
  for (var i=0; i<SAT.length; i++) {
    var it = SAT[i];
    if (it.d.toLowerCase().indexOf(q.toLowerCase()) >= 0 || it.c.indexOf(q) >= 0) {
      local.push(it); if (local.length >= 5) break;
    }
  }
  if (local.length) {
    renderResultados(n, local, drop);
  } else {
    drop.innerHTML = '<div class="nores">&#128269; Buscando en catalogo SAT...</div>';
    drop.classList.add('open');
  }
  fetch(WORKER_URL + '?keyword=' + encodeURIComponent(q))
    .then(function(r){ return r.json(); })
    .then(function(data){
      if (!data || !data.length) {
        if (!local.length) {
          drop.innerHTML = '<div class="nores">Sin resultados. Ingresa la clave manualmente.</div>';
          drop.classList.add('open');
        }
        return;
      }
      var vistos = {}, combinados = [];
      local.forEach(function(x){ if(!vistos[x.c]){ vistos[x.c]=true; combinados.push({c:x.c,d:x.d,u:x.u}); } });
      data.slice(0,15).forEach(function(x){
        if (!vistos[x.Value]) { vistos[x.Value]=true; combinados.push({c:x.Value, d:x.Name, u:'E48'}); }
      });
      renderResultados(n, combinados, drop);
    })
    .catch(function(){
      if (!local.length) {
        drop.innerHTML = '<div class="nores">Sin resultados. Ingresa la clave manualmente.</div>';
        drop.classList.add('open');
      }
    });
}

function renderResultados(n, items, drop) {
  drop.innerHTML = '';
  items.forEach(function(item){
    var row = document.createElement('div');
    row.className = 'satitem';
    row.innerHTML = '<span class="satcode">'+item.c+'</span><span>'+item.d+'</span>';
    row.addEventListener('click', function(e){ e.stopPropagation(); selSAT(n, item.c, item.d, item.u||'E48'); });
    drop.appendChild(row);
  });
  if (!items.length) drop.innerHTML = '<div class="nores">Sin resultados.</div>';
  drop.classList.add('open');
}

function selSAT(n, code, desc, unit) {
  document.getElementById('sd'+n).classList.remove('open');
  document.getElementById('ss'+n).value = '';
  document.getElementById('sm'+n).value = code;
  document.getElementById('sco'+n).textContent = code;
  document.getElementById('sde'+n).textContent = ' - '+desc;
  document.getElementById('ssel'+n).classList.add('show');
  if (unit) { var s=document.getElementById('cunit'+n); if(s) s.value=unit; }
  saveToStorage();
}

function manualSAT(n) {
  var code = document.getElementById('sm'+n).value.trim();
  if (code.length >= 6) {
    var found = null;
    for (var i=0; i<SAT.length; i++) { if (SAT[i].c === code) { found=SAT[i]; break; } }
    document.getElementById('sco'+n).textContent = code;
    document.getElementById('sde'+n).textContent = found ? ' - '+found.d : ' - Clave manual';
    document.getElementById('ssel'+n).classList.add('show');
    if (found && found.u) { var s=document.getElementById('cunit'+n); if(s) s.value=found.u; }
  }
}

function clearSAT(n) {
  document.getElementById('ssel'+n).classList.remove('show');
  document.getElementById('sm'+n).value = '';
  document.getElementById('ss'+n).value = '';
  saveToStorage();
}

function getIds() {
  var ids = [];
  document.querySelectorAll('.conc').forEach(function(r){ ids.push(r.id.replace('c','')); });
  return ids;
}

/* ================================================================
   CÁLCULO POR CONCEPTO
================================================================ */
function calcConc(n) {
  var cant    = parseFloat(g('ccant'+n))  || 0;
  var precio  = parseFloat(g('cprice'+n)) || 0;
  var disc    = parseFloat(g('cdisc'+n))  || 0;
  var ivaStr  = g('civa'+n)   || '0.16';
  var iva     = ivaStr === 'exento' ? 0 : (parseFloat(ivaStr) || 0);
  var retIva  = parseFloat(g('cretiva'+n)) || 0;
  var retIsr  = parseFloat(g('cretisr'+n)) || 0;
  var iepsVal = g('cieps'+n)  || '0';

  var subtotal  = cant * precio;
  var descuento = subtotal * (disc / 100);
  var base      = subtotal - descuento;

  var montoIeps = 0;
  if (iepsVal === 'cuota') {
    var cuota = parseFloat(g('ccuota'+n)) || 0;
    montoIeps = cant * cuota;
  } else {
    montoIeps = base * (parseFloat(iepsVal) || 0);
  }

  var total = base + (base * iva) + montoIeps - (base * retIva) - (base * retIsr);

  var el = document.getElementById('ctotal'+n);
  if (el) el.textContent = fmt(total);

  recalc();
}

/* ================================================================
   TOTALES GENERALES
================================================================ */
function recalc() {
  var totSub=0, totDes=0, totIva=0, totIeps=0, totRetIva=0, totRetIsr=0;

  getIds().forEach(function(n) {
    var cant    = parseFloat(g('ccant'+n))  || 0;
    var precio  = parseFloat(g('cprice'+n)) || 0;
    var disc    = parseFloat(g('cdisc'+n))  || 0;
    var ivaStr  = g('civa'+n)   || '0.16';
    var iva     = ivaStr === 'exento' ? 0 : (parseFloat(ivaStr) || 0);
    var retIva  = parseFloat(g('cretiva'+n)) || 0;
    var retIsr  = parseFloat(g('cretisr'+n)) || 0;
    var iepsVal = g('cieps'+n)  || '0';

    var sub  = cant * precio;
    var des  = sub * (disc / 100);
    var base = sub - des;

    var mIeps = iepsVal === 'cuota'
      ? (cant * (parseFloat(g('ccuota'+n)) || 0))
      : (base * (parseFloat(iepsVal) || 0));

    totSub    += sub;
    totDes    += des;
    totIva    += base * iva;
    totIeps   += mIeps;
    totRetIva += base * retIva;
    totRetIsr += base * retIsr;
  });

  var base  = totSub - totDes;
  var total = base + totIva + totIeps - totRetIva - totRetIsr;

  var totbox = document.querySelector('.totbox');
  if (!totbox) return;

  var rows = [];
  rows.push({l:'Subtotal', v: fmt(totSub)});
  if (totDes    > 0.001) rows.push({l:'Descuento', v: '−'+fmt(totDes)});
  if (totDes    > 0.001) rows.push({l:'Base', v: fmt(base)});
  if (totIva    > 0.001) rows.push({l:'IVA', v: fmt(totIva)});
  if (totIeps   > 0.001) rows.push({l:'IEPS', v: fmt(totIeps)});
  if (totRetIva > 0.001) rows.push({l:'Ret. IVA', v: '−'+fmt(totRetIva)});
  if (totRetIsr > 0.001) rows.push({l:'Ret. ISR', v: '−'+fmt(totRetIsr)});

  var html = rows.map(function(r){
    return '<div class="trow"><span>'+r.l+'</span><span>'+r.v+'</span></div>';
  }).join('');
  html += '<div class="trow grand"><span>Total</span><span>'+fmt(total)+'</span></div>';

  totbox.innerHTML = html;
}

function fmt(n) {
  return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/* ================================================================
   RECOLECTAR CONCEPTOS — Payload completo
================================================================ */
function recolectarConceptos() {
  var conceptos = [];
  getIds().forEach(function(n) {
    var desc    = g('cdesc'+n)  || '';
    var clave   = g('sm'+n)     || '';
    var unidad  = g('cunit'+n)  || 'E48';
    var cant    = parseFloat(g('ccant'+n))  || 0;
    var precio  = parseFloat(g('cprice'+n)) || 0;
    var disc    = parseFloat(g('cdisc'+n))  || 0;
    var ivaStr  = g('civa'+n)   || '0.16';
    var iva     = ivaStr === 'exento' ? 0 : (parseFloat(ivaStr) || 0);
    var retIva  = parseFloat(g('cretiva'+n)) || 0;
    var retIsr  = parseFloat(g('cretisr'+n)) || 0;
    var iepsVal = g('cieps'+n)  || '0';
    var cuota   = parseFloat(g('ccuota'+n)) || 0;
    var tipoRet = g('ctipret'+n) || 'ninguna';

    var sub     = cant * precio;
    var descV   = sub * (disc / 100);
    var base    = sub - descV;
    var mIeps   = iepsVal === 'cuota' ? (cant * cuota) : (base * (parseFloat(iepsVal) || 0));
    var mIva    = base * iva;
    var mRetIva = base * retIva;
    var mRetIsr = base * retIsr;
    var total   = base + mIva + mIeps - mRetIva - mRetIsr;

    conceptos.push({
      descripcion:           desc,
      clave_sat:             clave,
      clave_unidad:          unidad,
      unidad_nombre:         UNIDADES[unidad] || unidad,
      cantidad:              cant,
      precio_unitario:       parseFloat(precio.toFixed(2)),
      descuento_pct:         disc,
      descuento_monto:       parseFloat(descV.toFixed(2)),
      importe:               parseFloat(base.toFixed(2)),
      iva:                   ivaStr,
      iva_tasa:              iva,
      iva_monto:             parseFloat(mIva.toFixed(2)),
      retencion_tipo:        tipoRet,
      retencion_iva:         retIva,
      retencion_iva_monto:   parseFloat(mRetIva.toFixed(2)),
      retencion_isr:         retIsr,
      retencion_isr_monto:   parseFloat(mRetIsr.toFixed(2)),
      ieps_tipo:             iepsVal === 'cuota' ? 'cuota' : 'porcentaje',
      ieps_tasa:             iepsVal === 'cuota' ? null : parseFloat(iepsVal),
      ieps_cuota_por_unidad: iepsVal === 'cuota' ? cuota : null,
      ieps_monto:            parseFloat(mIeps.toFixed(2)),
      total:                 parseFloat(total.toFixed(2))
    });
  });
  return conceptos;
}

/* ================================================================
   RESUMEN
================================================================ */
function armarResumen() {
  var nombres = {factura:'Factura de Ingreso', pago:'Complemento de Pago'};
  var mp  = document.querySelector('input[name=metodo]:checked');
  var mon = document.querySelector('input[name=moneda]:checked');
  var rows = [
    {l:'Tipo de CFDI',       v: nombres[tipo]||tipo, big:true, full:true},
    {l:'RFC Emisor',         v: g('rfc_emisor')},
    {l:'Regimen Emisor',     v: g('regimen_emisor')},
    {l:'Correo Emisor',      v: g('email_emisor')},
    {l:'RFC Receptor',       v: g('rfc_receptor')},
    {l:'Tipo Receptor',      v: receptorEsPM ? 'Persona Moral' : 'Persona Física'},
    {l:'Razon Social',       v: g('nombre_receptor')},
    {l:'CP Fiscal Receptor', v: g('cp_receptor')},
    {l:'Regimen Fiscal',     v: g('regimen_receptor')},
    {l:'Uso del CFDI',       v: g('uso_cfdi')}
  ];
  if (tipo === 'pago') {
    rows.push({l:'UUID Factura Original', v:g('uuid_origen'), full:true});
    rows.push({l:'Fecha Pago',     v:g('fecha_pago')});
    rows.push({l:'Monto',          v:'$'+parseFloat(g('monto_pago')||0).toFixed(2)});
    rows.push({l:'Parcialidad',    v:g('num_parcialidad')});
    rows.push({l:'Saldo Anterior', v:'$'+parseFloat(g('saldo_anterior')||0).toFixed(2)});
  } else {
    var totEl = document.querySelector('.trow.grand span:last-child');
    rows.push({l:'Conceptos', v:document.querySelectorAll('.conc').length+' concepto(s)'});
    rows.push({l:'Total',     v: totEl ? totEl.textContent : '—', big:true, full:true});
    rows.push({l:'Metodo de Pago', v:mp?mp.value:''});
    rows.push({l:'Forma de Pago',  v:g('forma_pago')});
    rows.push({l:'Moneda',         v:mon?mon.value:'MXN'});
  }
  var html = '';
  rows.forEach(function(d){
    html += '<div class="ri'+(d.full?' full':'')+'"><div class="ril">'+d.l+'</div>' +
            '<div class="riv'+(d.big?' big':'')+'">'+(d.v||'—')+'</div></div>';
  });
  document.getElementById('resumen').innerHTML = html;
}

/* ================================================================
   ENVIAR
================================================================ */
function enviar() {
  if (!document.getElementById('acepto').checked) {
    alert('Debes aceptar los terminos para continuar.');
    return;
  }
  var folio = 'FAC-'+new Date().getFullYear()+'-'+(Math.floor(Math.random()*90000)+10000);
  var mp    = document.querySelector('input[name=metodo]:checked');
  var mon   = document.querySelector('input[name=moneda]:checked');
  var moncp = document.querySelector('input[name=mon_cp]:checked');
  var waNum = new URLSearchParams(window.location.search).get('wa') || '';

  var data = {
    folio:     folio,
    timestamp: new Date().toISOString(),
    tipo_cfdi: tipo,
    whatsapp:  waNum,
    emisor: {
      rfc:            g('rfc_emisor'),
      email:          g('email_emisor'),
      regimen_fiscal: g('regimen_emisor')
    },
    receptor: {
      rfc:            g('rfc_receptor'),
      nombre:         g('nombre_receptor'),
      cp_fiscal:      g('cp_receptor'),
      regimen_fiscal: g('regimen_receptor'),
      uso_cfdi:       g('uso_cfdi'),
      email:          g('email_receptor'),
      tipo:           receptorEsPM ? 'PM' : 'PF'
    }
  };

  if (tipo === 'pago') {
    var saldoAnt = parseFloat(g('saldo_anterior')) || 0;
    var montoPag = parseFloat(g('monto_pago'))     || 0;
    data.complemento_pago = {
      fecha:         g('fecha_pago'),
      forma_pago:    g('forma_pago_cp'),
      monto:         montoPag.toFixed(2),
      moneda:        moncp ? moncp.value : 'MXN',
      num_operacion: g('num_operacion'),
      documentos_relacionados: [{
        uuid:            g('uuid_origen'),
        serie:           g('serie_origen'),
        folio:           g('folio_origen'),
        metodo_pago:     'PPD',
        num_parcialidad: parseInt(g('num_parcialidad')) || 1,
        saldo_anterior:  saldoAnt.toFixed(2),
        monto_pagado:    montoPag.toFixed(2),
        saldo_insoluto:  Math.max(0, saldoAnt - montoPag).toFixed(2)
      }]
    };
  } else {
    var conceptos = recolectarConceptos();
    var totEl = document.querySelector('.trow.grand span:last-child');
    data.conceptos = conceptos;
    data.totales = {
      subtotal: document.querySelectorAll('.trow')[0] ? document.querySelectorAll('.trow')[0].querySelector('span:last-child').textContent : '',
      total:    totEl ? totEl.textContent : ''
    };
    data.pago = {
      metodo:      mp  ? mp.value  : 'PUE',
      forma:       g('forma_pago'),
      moneda:      mon ? mon.value : 'MXN',
      tipo_cambio: g('tipo_cambio'),
      referencia:  g('referencia'),
      notas:       g('notas')
    };
  }

  fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(data)
  }).catch(function(){ console.warn('Webhook no configurado aun'); });

  for (var i=1; i<=5; i++) {
    var c = document.getElementById('card'+i);
    if (c) c.classList.remove('active');
  }
  document.getElementById('success').classList.add('active');
  document.getElementById('folio-num').textContent = folio;
  window.scrollTo({top:0, behavior:'smooth'});

  clearStorage();
}
