/* ================================================================
   ACCEPTI CONTADORES — FORMULARIO CFDI 4.0
   app.js v5.0 — Factura de Ingreso / Complemento de Pago
   
   Reemplaza antes de subir:
   WEBHOOK_URL -> URL del escenario de Factura en Make
================================================================ */

var WEBHOOK_URL = 'https://hook.us2.make.com/scr4cut77aypoff1uypc7hh8byby1kcn';

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

/* ================================================================
   CATALOGO SAT
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
   INIT
================================================================ */
document.addEventListener('DOMContentLoaded', function() {
  var img = document.getElementById('logo-img');
  if (img) { img.onerror = function(){ img.style.display='none'; document.getElementById('logo-fb').style.display='grid'; }; }

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

  document.getElementById('email_emisor').addEventListener('input', function(){ clrE('email_emisor'); });
  document.getElementById('cp_receptor').addEventListener('input', function(){ clrE('cp_receptor'); });
  document.getElementById('regimen_receptor').addEventListener('change', function(){ clrE('regimen_receptor'); });
  document.getElementById('uso_cfdi').addEventListener('change', function(){ clrE('uso_cfdi'); });
  document.getElementById('nombre_receptor').addEventListener('input', function(){ clrE('nombre_receptor'); });
  document.getElementById('uuid_origen').addEventListener('input', function(){ this.value=this.value.toUpperCase(); clrE('uuid_origen'); });
  document.getElementById('monto_pago').addEventListener('input', function(){ clrE('monto_pago'); });
  document.getElementById('fecha_pago').addEventListener('input', function(){ clrE('fecha_pago'); });
  document.getElementById('forma_pago_cp').addEventListener('change', function(){ clrE('forma_pago_cp'); });
  document.getElementById('saldo_anterior').addEventListener('input', function(){ clrE('saldo_anterior'); });
  document.getElementById('forma_pago').addEventListener('change', function(){ clrE('forma_pago'); });

  // PPD -> fuerza forma de pago 99
  document.querySelectorAll('input[name=metodo]').forEach(function(r){
    r.addEventListener('change', function(){
      var fp = document.getElementById('forma_pago');
      if (this.value === 'PPD') {
        fp.value = '99';
        fp.disabled = true;
      } else {
        fp.disabled = false;
      }
    });
  });

  document.getElementById('mon-usd').addEventListener('change', function(){ document.getElementById('f-tc').classList.remove('hide'); });
  document.getElementById('mon-mxn').addEventListener('change', function(){ document.getElementById('f-tc').classList.add('hide'); });

  document.addEventListener('click', function(e){
    if (!e.target.closest('.satwrap')) {
      document.querySelectorAll('.satdrop.open').forEach(function(d){ d.classList.remove('open'); });
    }
  });

  addConc();
  renderStepbar();
});

function addUpper(id, errId) {
  var el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('input', function(){ this.value=this.value.toUpperCase(); if(errId) clrE(errId); });
}

/* ================================================================
   SELECCION DE TIPO
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
  document.getElementById('chk-'+t).textContent = '\u2713';
  renderStepbar();
}

/* ================================================================
   BARRA DE PASOS
================================================================ */
function renderStepbar() {
  var bar = document.getElementById('stepbar');
  if (!flujo.length) { bar.innerHTML = ''; return; }
  var html = '';
  for (var i = 0; i < flujo.length; i++) {
    var s = flujo[i];
    var cls = s === flujo[fpos] ? 'active' : (i < fpos ? 'done' : '');
    html += '<div class="sb"><div class="snum '+cls+'">'+(cls==='done'?'\u2713':s)+'</div><div class="slabel '+cls+'">'+LABELS[s]+'</div></div>';
    if (i < flujo.length-1) html += '<div class="sarrow">&rsaquo;</div>';
  }
  bar.innerHTML = html;
  var cur = fpos+1, tot = flujo.length;
  for (var j=1; j<=5; j++) {
    var el = document.getElementById('sf'+j);
    if (el) el.textContent = 'Paso '+cur+' de '+tot;
  }
}

/* ================================================================
   NAVEGACION
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
  window.scrollTo({top:0,behavior:'smooth'});
}

function goPrev() {
  fpos--;
  mostrarCard(flujo[fpos]);
  renderStepbar();
  window.scrollTo({top:0,behavior:'smooth'});
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
    ico3.textContent = '\u{1F4B3}';
    t3.textContent   = 'Datos del Complemento de Pago';
    sub3.textContent = 'Proporciona los datos del pago recibido y la factura que se liquida';
  } else {
    secConc.style.display = 'block';
    secPago.style.display = 'none';
    t3.textContent  = 'Conceptos de la Factura';
    sub3.textContent= 'Agrega los productos o servicios. Puedes agregar multiples conceptos.';
  }
}

/* ================================================================
   VALIDACION
================================================================ */
function validar(step) {
  var ok = true;
  if (!step) return false;
  if (step === 1) {
    if (!tipo) { alert('Selecciona el tipo de CFDI para continuar.'); return false; }
    if (g('rfc_emisor').trim().length < 12) { marcarErr('rfc_emisor'); ok=false; }
    var em = g('email_emisor').trim();
    if (!em || em.indexOf('@')<1) { marcarErr('email_emisor'); ok=false; }
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
    if (firstErr) firstErr.scrollIntoView({behavior:'smooth',block:'center'});
  }
  return ok;
}

function marcarErr(id){ var el=document.getElementById(id); if(el)el.classList.add('err'); var em=document.getElementById('e-'+id); if(em)em.style.display='block'; }
function clrE(id){ var el=document.getElementById(id); if(el)el.classList.remove('err'); var em=document.getElementById('e-'+id); if(em)em.style.display='none'; }
function g(id){ var el=document.getElementById(id); return el?el.value:''; }

/* ================================================================
   CONCEPTOS
================================================================ */
function addConc() {
  nc++;
  var n = nc;
  var unitsHtml = Object.keys(UNIDADES).map(function(k){
    return '<option value="'+k+'"'+(k==='E48'?' selected':'')+'>'+UNIDADES[k]+'</option>';
  }).join('');
  var div = document.createElement('div');
  div.className = 'conc'; div.id = 'c'+n;
  div.innerHTML =
    '<div class="chead2">'+
      '<span class="cnum">Concepto '+n+'</span>'+
      '<div class="cdesc-wrap"><input type="text" id="cdesc'+n+'" placeholder="Descripcion del producto o servicio"></div>'+
      '<button class="btnrm" data-n="'+n+'">&times;</button>'+
    '</div>'+
    '<div class="f" style="margin-bottom:12px">'+
      '<label>Clave SAT</label>'+
      '<div class="satwrap" id="sw'+n+'">'+
        '<span class="satico">&#128269;</span>'+
        '<input type="text" class="satinput" id="ss'+n+'" placeholder="Buscar producto o servicio..." autocomplete="off">'+
        '<div class="satdrop" id="sd'+n+'"></div>'+
        '<div class="satmanual"><span>O clave manual:</span><input type="text" id="sm'+n+'" placeholder="84111506" maxlength="8"></div>'+
      '</div>'+
      '<div class="satsel" id="ssel'+n+'"><strong id="sco'+n+'"></strong><span id="sde'+n+'"></span><button class="satclr" data-n="'+n+'">&times;</button></div>'+
      '<a href="https://pys.sat.gob.mx/PyS/catPyS.aspx" target="_blank" class="sat-catalogo-link">&#128269; No encuentras tu clave? Consulta el catalogo oficial del SAT</a>'+
    '</div>'+
    '<div class="cgrid">'+
      '<div class="f"><label>Cantidad</label><input type="number" id="ccant'+n+'" value="1" min="0.001" step="0.001"></div>'+
      '<div class="f"><label>Unidad SAT</label><select id="cunit'+n+'">'+unitsHtml+'</select></div>'+
      '<div class="f"><label>Precio unitario (sin IVA)</label><div class="pfx"><span class="pfxl">$</span><input type="number" id="cprice'+n+'" placeholder="0.00" min="0" step="0.01"></div></div>'+
      '<div class="f"><label>Descuento %</label><input type="number" id="cdisc'+n+'" placeholder="0" min="0" max="100" step="0.01"></div>'+
    '</div>';
  document.getElementById('conc-list').appendChild(div);
  div.querySelector('.btnrm').addEventListener('click', function(){ rmConc(this.dataset.n); });
  div.querySelector('.satclr').addEventListener('click', function(){ clearSAT(this.dataset.n); });
  div.querySelector('#ss'+n).addEventListener('input', function(){ buscar(n); });
  div.querySelector('#sm'+n).addEventListener('input', function(){ manualSAT(n); });
  div.querySelector('#ccant'+n).addEventListener('input', recalc);
  div.querySelector('#cprice'+n).addEventListener('input', recalc);
  div.querySelector('#cdisc'+n).addEventListener('input', recalc);
  recalc();
}

function rmConc(n){ var el=document.getElementById('c'+n); if(el)el.remove(); recalc(); }

/* Credencial Facturama para busqueda de catalogo SAT */
var FAC_TOKEN = 'Basic ' + btoa('huguinsf:cis2005');
var FAC_TIMERS = {};

function buscar(n) {
  var q = document.getElementById('ss'+n).value.trim();
  var drop = document.getElementById('sd'+n);
  if (q.length < 2) { drop.classList.remove('open'); return; }

  /* Debounce: espera 350ms antes de llamar la API */
  clearTimeout(FAC_TIMERS[n]);
  FAC_TIMERS[n] = setTimeout(function() { buscarAPI(n, q); }, 350);
}

function buscarAPI(n, q) {
  var drop = document.getElementById('sd'+n);
  drop.innerHTML = '<div class="nores">&#128269; Buscando...</div>';
  drop.classList.add('open');

  /* Primero busca en catalogo local (respuesta inmediata) */
  var local = [];
  for (var i = 0; i < SAT.length; i++) {
    var it = SAT[i];
    if (it.d.toLowerCase().indexOf(q.toLowerCase()) >= 0 || it.c.indexOf(q) >= 0) {
      local.push(it); if (local.length >= 5) break;
    }
  }

  /* Luego consulta Facturama API para resultados completos */
  fetch('https://apisandbox.facturama.mx/catalogs/ProductsOrServices?keyword=' + encodeURIComponent(q), {
    headers: { 'Authorization': FAC_TOKEN }
  })
  .then(function(r){ return r.json(); })
  .then(function(data){
    drop.innerHTML = '';
    if (!data || !data.length) {
      if (!local.length) {
        drop.innerHTML = '<div class="nores">Sin resultados. Ingresa la clave manualmente o consulta el catalogo del SAT.</div>';
      } else {
        renderResultados(n, local, drop);
      }
      return;
    }
    /* Combina: primero locales (mas rapidos), luego API sin duplicados */
    var vistos = {};
    var combinados = [];
    local.forEach(function(x){ if(!vistos[x.c]){ vistos[x.c]=true; combinados.push({c:x.c,d:x.d,u:x.u}); } });
    data.slice(0, 15).forEach(function(x){
      if (!vistos[x.Value]) {
        vistos[x.Value] = true;
        combinados.push({ c: x.Value, d: x.Name, u: 'E48' });
      }
    });
    renderResultados(n, combinados, drop);
  })
  .catch(function(){
    /* Si falla la API usa solo el catalogo local */
    drop.innerHTML = '';
    if (local.length) {
      renderResultados(n, local, drop);
    } else {
      drop.innerHTML = '<div class="nores">Sin resultados. Ingresa la clave manualmente.</div>';
    }
  });
}

function renderResultados(n, items, drop) {
  drop.innerHTML = '';
  items.forEach(function(item){
    var row = document.createElement('div');
    row.className = 'satitem';
    row.innerHTML = '<span class="satcode">'+item.c+'</span><span>'+item.d+'</span>';
    row.addEventListener('click', function(e){
      e.stopPropagation();
      selSAT(n, item.c, item.d, item.u || 'E48');
    });
    drop.appendChild(row);
  });
  if (items.length === 0) {
    drop.innerHTML = '<div class="nores">Sin resultados. Ingresa la clave manualmente.</div>';
  }
  drop.classList.add('open');
}

function selSAT(n,code,desc,unit){
  document.getElementById('sd'+n).classList.remove('open');
  document.getElementById('ss'+n).value='';
  document.getElementById('sm'+n).value=code;
  document.getElementById('sco'+n).textContent=code;
  document.getElementById('sde'+n).textContent=' - '+desc;
  document.getElementById('ssel'+n).classList.add('show');
  if(unit){var s=document.getElementById('cunit'+n);if(s)s.value=unit;}
}
function manualSAT(n){
  var code=document.getElementById('sm'+n).value.trim();
  if(code.length>=6){
    var found=null; for(var i=0;i<SAT.length;i++){if(SAT[i].c===code){found=SAT[i];break;}}
    document.getElementById('sco'+n).textContent=code;
    document.getElementById('sde'+n).textContent=found?' - '+found.d:' - Clave manual';
    document.getElementById('ssel'+n).classList.add('show');
    if(found&&found.u){var s=document.getElementById('cunit'+n);if(s)s.value=found.u;}
  }
}
function clearSAT(n){
  document.getElementById('ssel'+n).classList.remove('show');
  document.getElementById('sm'+n).value='';
  document.getElementById('ss'+n).value='';
}

function getIds(){var ids=[];document.querySelectorAll('.conc').forEach(function(r){ids.push(r.id.replace('c',''));});return ids;}

function recalc(){
  var sub=0,des=0;
  getIds().forEach(function(n){
    var cant=parseFloat(document.getElementById('ccant'+n)&&document.getElementById('ccant'+n).value)||0;
    var price=parseFloat(document.getElementById('cprice'+n)&&document.getElementById('cprice'+n).value)||0;
    var disc=parseFloat(document.getElementById('cdisc'+n)&&document.getElementById('cdisc'+n).value)||0;
    var base=cant*price; sub+=base; des+=base*(disc/100);
  });
  var neto=sub-des;
  document.getElementById('t-sub').textContent=fmt(sub);
  document.getElementById('t-des').textContent=fmt(des);
  document.getElementById('t-neto').textContent=fmt(neto);
}

function fmt(n){return '$'+n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,',');}

function recolectarConceptos(){
  var conceptos=[];
  getIds().forEach(function(n){
    var desc=g('cdesc'+n)||'';
    var clave=g('sm'+n)||'';
    var unidad=g('cunit'+n)||'E48';
    var cant=parseFloat(g('ccant'+n))||0;
    var price=parseFloat(g('cprice'+n))||0;
    var disc=parseFloat(g('cdisc'+n))||0;
    var base=cant*price, descV=base*(disc/100), importe=base-descV;
    conceptos.push({
      descripcion:desc,
      clave_sat:clave,
      clave_unidad:unidad,
      unidad_nombre:UNIDADES[unidad]||unidad,
      cantidad:cant,
      precio_unitario:parseFloat(price.toFixed(2)),
      descuento_pct:disc,
      descuento_monto:parseFloat(descV.toFixed(2)),
      importe:parseFloat(importe.toFixed(2))
    });
  });
  return conceptos;
}

/* ================================================================
   RESUMEN
================================================================ */
function armarResumen(){
  var nombres={factura:'Factura de Ingreso',pago:'Complemento de Pago'};
  var mp=document.querySelector('input[name=metodo]:checked');
  var mon=document.querySelector('input[name=moneda]:checked');
  var rows=[
    {l:'Tipo de CFDI',v:nombres[tipo]||tipo,big:true,full:true},
    {l:'RFC Emisor',v:g('rfc_emisor')},{l:'Correo Emisor',v:g('email_emisor')},
    {l:'RFC Receptor',v:g('rfc_receptor')},{l:'Razon Social Receptor',v:g('nombre_receptor')},
    {l:'CP Fiscal Receptor',v:g('cp_receptor')},{l:'Regimen Fiscal',v:g('regimen_receptor')},
    {l:'Uso del CFDI',v:g('uso_cfdi')}
  ];
  if(tipo==='pago'){
    rows.push({l:'UUID Factura Original',v:g('uuid_origen'),full:true});
    rows.push({l:'Fecha Pago',v:g('fecha_pago')},{l:'Monto Pagado',v:'$'+parseFloat(g('monto_pago')||0).toFixed(2)});
    rows.push({l:'Parcialidad No.',v:g('num_parcialidad')},{l:'Saldo Anterior',v:'$'+parseFloat(g('saldo_anterior')||0).toFixed(2)});
  } else {
    rows.push({l:'Conceptos',v:document.querySelectorAll('.conc').length+' concepto(s)'});
    rows.push({l:'Subtotal',v:document.getElementById('t-neto').textContent,big:true,full:true});
    rows.push({l:'Metodo de Pago',v:mp?mp.value:''},{l:'Forma de Pago',v:g('forma_pago')});
    rows.push({l:'Moneda',v:mon?mon.value:'MXN'});
  }
  var html='';
  rows.forEach(function(d){
    html+='<div class="ri'+(d.full?' full':'')+'"><div class="ril">'+d.l+'</div><div class="riv'+(d.big?' big':'')+'">'+(d.v||'\u2014')+'</div></div>';
  });
  document.getElementById('resumen').innerHTML=html;
}

/* ================================================================
   ENVIAR
================================================================ */
function enviar(){
  if(!document.getElementById('acepto').checked){alert('Debes aceptar los terminos para continuar.');return;}
  var folio='FAC-'+new Date().getFullYear()+'-'+(Math.floor(Math.random()*90000)+10000);
  var mp=document.querySelector('input[name=metodo]:checked');
  var mon=document.querySelector('input[name=moneda]:checked');
  var moncp=document.querySelector('input[name=mon_cp]:checked');

  var data={
    folio:folio,
    timestamp:new Date().toISOString(),
    tipo_cfdi:tipo,
    emisor:{rfc:g('rfc_emisor'), email:g('email_emisor')},
    receptor:{
      rfc:g('rfc_receptor'),
      nombre:g('nombre_receptor'),
      cp_fiscal:g('cp_receptor'),
      regimen_fiscal:g('regimen_receptor'),
      uso_cfdi:g('uso_cfdi'),
      email:g('email_receptor')
    }
  };

  if(tipo==='pago'){
    var saldoAnt=parseFloat(g('saldo_anterior'))||0;
    var montoPag=parseFloat(g('monto_pago'))||0;
    data.complemento_pago={
      fecha:g('fecha_pago'),
      forma_pago:g('forma_pago_cp'),
      monto:montoPag.toFixed(2),
      moneda:moncp?moncp.value:'MXN',
      num_operacion:g('num_operacion'),
      documentos_relacionados:[{
        uuid:g('uuid_origen'),
        serie:g('serie_origen'),
        folio:g('folio_origen'),
        metodo_pago:'PPD',
        num_parcialidad:parseInt(g('num_parcialidad'))||1,
        saldo_anterior:saldoAnt.toFixed(2),
        monto_pagado:montoPag.toFixed(2),
        saldo_insoluto:Math.max(0,saldoAnt-montoPag).toFixed(2)
      }]
    };
  } else {
    data.conceptos=recolectarConceptos();
    data.totales={
      subtotal:document.getElementById('t-sub').textContent,
      descuento:document.getElementById('t-des').textContent,
      neto:document.getElementById('t-neto').textContent
    };
    data.pago={
      metodo:mp?mp.value:'PUE',
      forma:g('forma_pago'),
      moneda:mon?mon.value:'MXN',
      tipo_cambio:g('tipo_cambio'),
      referencia:g('referencia'),
      notas:g('notas')
    };
  }

  fetch(WEBHOOK_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})
    .catch(function(){console.warn('Webhook no configurado aun');});

  for(var i=1;i<=5;i++){ var c=document.getElementById('card'+i); if(c)c.classList.remove('active'); }
  document.getElementById('success').classList.add('active');
  document.getElementById('folio-num').textContent=folio;
  window.scrollTo({top:0,behavior:'smooth'});
}
