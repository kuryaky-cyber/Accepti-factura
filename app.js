/* =====================================================
   ACCEPTI CONTADORES - FORMULARIO DE FACTURA v3.0
   app.js - Simplificado para cliente, retenciones en Make

   ANTES DE SUBIR reemplaza:
   TU_WEBHOOK_FORMULARIO -> URL del escenario Factura en Make
===================================================== */

var WEBHOOK_FORM = 'https://hook.us2.make.com/scr4cut77aypoff1uypc7hh8byby1kcn';

/* =====================================================
   CATÁLOGO SAT
===================================================== */
var SAT = [
  {c:"84111506",d:"Servicios de contabilidad",k:"Servicios profesionales",u:"E48"},
  {c:"84111507",d:"Servicios de auditoria",k:"Servicios profesionales",u:"E48"},
  {c:"84111508",d:"Asesoria fiscal y tributaria",k:"Servicios profesionales",u:"E48"},
  {c:"84111509",d:"Administracion financiera",k:"Servicios profesionales",u:"E48"},
  {c:"80141600",d:"Contabilidad general",k:"Servicios profesionales",u:"E48"},
  {c:"80141601",d:"Servicios de nomina",k:"Servicios profesionales",u:"E48"},
  {c:"80141602",d:"Declaraciones fiscales",k:"Servicios profesionales",u:"E48"},
  {c:"80111500",d:"Consultoria empresarial",k:"Servicios profesionales",u:"E48"},
  {c:"80111501",d:"Consultoria en administracion de empresas",k:"Servicios profesionales",u:"E48"},
  {c:"80101500",d:"Servicios juridicos y legales",k:"Servicios profesionales",u:"E48"},
  {c:"80101501",d:"Asesoria legal corporativa",k:"Servicios profesionales",u:"E48"},
  {c:"80101801",d:"Servicios notariales",k:"Servicios profesionales",u:"E48"},
  {c:"86101500",d:"Servicios de recursos humanos",k:"Servicios profesionales",u:"E48"},
  {c:"86101501",d:"Reclutamiento y seleccion de personal",k:"Servicios profesionales",u:"E48"},
  {c:"85101500",d:"Servicios medicos y hospitalarios",k:"Salud",u:"E48"},
  {c:"85101501",d:"Consulta medica general",k:"Salud",u:"E48"},
  {c:"85101502",d:"Servicios odontologicos y dentales",k:"Salud",u:"E48"},
  {c:"85101503",d:"Servicios medicos especializados",k:"Salud",u:"E48"},
  {c:"51101500",d:"Medicamentos y productos farmaceuticos",k:"Salud",u:"H87"},
  {c:"85151600",d:"Servicios de psicologia",k:"Salud",u:"E48"},
  {c:"85161500",d:"Servicios de fisioterapia",k:"Salud",u:"E48"},
  {c:"56101500",d:"Arrendamiento de bienes inmuebles",k:"Arrendamiento",u:"E48"},
  {c:"56101501",d:"Arrendamiento de oficinas",k:"Arrendamiento",u:"E48"},
  {c:"56101502",d:"Arrendamiento de locales comerciales",k:"Arrendamiento",u:"E48"},
  {c:"56101503",d:"Arrendamiento de bodegas",k:"Arrendamiento",u:"E48"},
  {c:"56101504",d:"Arrendamiento de casa habitacion",k:"Arrendamiento",u:"E48"},
  {c:"56101601",d:"Arrendamiento de vehiculos",k:"Arrendamiento",u:"E48"},
  {c:"56101602",d:"Arrendamiento de equipo de computo",k:"Arrendamiento",u:"E48"},
  {c:"81111500",d:"Tecnologias de la informacion TI",k:"Tecnologia",u:"E48"},
  {c:"81111501",d:"Desarrollo de software",k:"Tecnologia",u:"E48"},
  {c:"81111502",d:"Soporte tecnico informatico",k:"Tecnologia",u:"E48"},
  {c:"81111504",d:"Servicios de programacion",k:"Tecnologia",u:"E48"},
  {c:"81111800",d:"Servicios de redes informaticas",k:"Tecnologia",u:"E48"},
  {c:"81111900",d:"Alojamiento web hosting",k:"Tecnologia",u:"E48"},
  {c:"81112000",d:"Servicios en la nube cloud computing",k:"Tecnologia",u:"E48"},
  {c:"81161500",d:"Ciberseguridad",k:"Tecnologia",u:"E48"},
  {c:"81161501",d:"Licencias de software",k:"Tecnologia",u:"E48"},
  {c:"82101500",d:"Publicidad y marketing",k:"Publicidad",u:"E48"},
  {c:"82101501",d:"Diseno grafico",k:"Publicidad",u:"E48"},
  {c:"82101502",d:"Diseno de paginas web",k:"Publicidad",u:"E48"},
  {c:"82141500",d:"Gestion de redes sociales",k:"Publicidad",u:"E48"},
  {c:"82141501",d:"Marketing digital y SEO",k:"Publicidad",u:"E48"},
  {c:"78101800",d:"Transporte terrestre de carga",k:"Transporte",u:"E48"},
  {c:"78101801",d:"Mensajeria y paqueteria",k:"Transporte",u:"KGM"},
  {c:"78101802",d:"Logistica y almacenaje",k:"Transporte",u:"E48"},
  {c:"78101803",d:"Servicio de flete",k:"Transporte",u:"E48"},
  {c:"78111500",d:"Transporte de pasajeros",k:"Transporte",u:"E48"},
  {c:"72101500",d:"Construccion general",k:"Construccion",u:"E48"},
  {c:"72101501",d:"Servicios de arquitectura",k:"Construccion",u:"E48"},
  {c:"72101502",d:"Ingenieria civil",k:"Construccion",u:"E48"},
  {c:"72101503",d:"Remodelacion y acabados",k:"Construccion",u:"E48"},
  {c:"72101504",d:"Instalaciones electricas",k:"Construccion",u:"E48"},
  {c:"72101505",d:"Instalaciones hidraulicas y sanitarias",k:"Construccion",u:"E48"},
  {c:"72141500",d:"Mantenimiento de inmuebles",k:"Construccion",u:"E48"},
  {c:"50101500",d:"Alimentos y productos alimenticios",k:"Alimentos",u:"H87"},
  {c:"50101501",d:"Frutas y verduras frescas",k:"Alimentos",u:"KGM"},
  {c:"50101502",d:"Carnes y productos carnicos",k:"Alimentos",u:"KGM"},
  {c:"50171500",d:"Panaderia y reposteria",k:"Alimentos",u:"H87"},
  {c:"50181500",d:"Bebidas sin alcohol",k:"Alimentos",u:"LTR"},
  {c:"50181501",d:"Agua embotellada",k:"Alimentos",u:"LTR"},
  {c:"90101501",d:"Servicio de catering y banquetes",k:"Alimentos",u:"E48"},
  {c:"15111500",d:"Gasolina y combustibles",k:"Gasolinera",u:"LTR"},
  {c:"15111501",d:"Diesel",k:"Gasolinera",u:"LTR"},
  {c:"15111502",d:"Gas LP",k:"Gasolinera",u:"LTR"},
  {c:"86111500",d:"Servicios educativos y de capacitacion",k:"Educacion",u:"E48"},
  {c:"86111501",d:"Cursos y talleres de capacitacion",k:"Educacion",u:"E48"},
  {c:"86111502",d:"Ensenanza de idiomas",k:"Educacion",u:"E48"},
  {c:"80131500",d:"Servicios de bienes raices",k:"Bienes raices",u:"E48"},
  {c:"80131501",d:"Compraventa de inmuebles",k:"Bienes raices",u:"E48"},
  {c:"43211500",d:"Equipo de computo laptops",k:"Electronica",u:"H87"},
  {c:"43211501",d:"Servidores y equipo de red",k:"Electronica",u:"H87"},
  {c:"43191500",d:"Telefonos celulares smartphones",k:"Electronica",u:"H87"},
  {c:"44101500",d:"Papeleria y articulos de escritorio",k:"Oficina",u:"H87"},
  {c:"44101600",d:"Muebles de oficina",k:"Oficina",u:"H87"},
  {c:"53101500",d:"Ropa y prendas de vestir",k:"Ropa",u:"H87"},
  {c:"53101501",d:"Uniformes de trabajo",k:"Ropa",u:"H87"},
  {c:"76101500",d:"Servicios de limpieza y aseo",k:"Limpieza",u:"E48"},
  {c:"76101501",d:"Limpieza de oficinas y establecimientos",k:"Limpieza",u:"E48"},
  {c:"84131500",d:"Servicios financieros",k:"Finanzas",u:"E48"},
  {c:"84131501",d:"Seguros y fianzas",k:"Finanzas",u:"E48"},
  {c:"90101600",d:"Organizacion de eventos",k:"Eventos",u:"E48"},
  {c:"90101601",d:"Renta de salones para eventos",k:"Eventos",u:"E48"},
  {c:"90111500",d:"Servicios hoteleros y hospedaje",k:"Eventos",u:"E48"},
  {c:"30102500",d:"Cemento block y materiales de construccion",k:"Materiales",u:"H87"},
  {c:"30102501",d:"Pinturas y recubrimientos",k:"Materiales",u:"LTR"},
  {c:"83111500",d:"Servicios de telecomunicaciones",k:"Telecomunicaciones",u:"E48"},
  {c:"55121501",d:"Redaccion y copywriting",k:"Editorial",u:"E48"},
  {c:"55121502",d:"Traduccion e interpretacion",k:"Editorial",u:"E48"},
  {c:"01010101",d:"No existe en catalogo del SAT",k:"Otros",u:"ACT"},
  {c:"92121500",d:"Servicios gubernamentales y tramites",k:"Otros",u:"E48"}
];

/* Catálogo de unidades SAT */
var UNIDADES = {
  'E48':'E48 - Servicio',
  'H87':'H87 - Pieza',
  'KGM':'KGM - Kilogramo',
  'LTR':'LTR - Litro',
  'MTR':'MTR - Metro',
  'ACT':'ACT - Actividad',
  'MTS':'MTS - Metro cuadrado',
  'TON':'TON - Tonelada',
  'XBX':'XBX - Caja',
  'XPK':'XPK - Paquete'
};

var paso = 1;
var nc   = 0;

document.addEventListener('DOMContentLoaded', function() {
  var img = document.getElementById('logo-img');
  if (img) { img.onerror = function() { img.style.display='none'; document.getElementById('logo-fallback').style.display='grid'; }; }

  document.getElementById('btn-next-1').addEventListener('click', function() { goNext(1); });
  document.getElementById('btn-next-2').addEventListener('click', function() { goNext(2); });
  document.getElementById('btn-next-3').addEventListener('click', function() { goNext(3); });
  document.getElementById('btn-prev-2').addEventListener('click', function() { goPrev(2); });
  document.getElementById('btn-prev-3').addEventListener('click', function() { goPrev(3); });
  document.getElementById('btn-prev-4').addEventListener('click', function() { goPrev(4); });
  document.getElementById('btn-enviar').addEventListener('click', function() { enviar(); });
  document.getElementById('btn-add-conc').addEventListener('click', function() { addConc(); });

  document.getElementById('rfc').addEventListener('input', function() { this.value=this.value.toUpperCase(); clrE('rfc'); });
  document.getElementById('email').addEventListener('input', function() { clrE('email'); });
  document.getElementById('usd').addEventListener('change', function() { document.getElementById('tcwrap').style.display='flex'; });
  document.getElementById('mxn').addEventListener('change', function() { document.getElementById('tcwrap').style.display='none'; });

  document.addEventListener('click', function(e) {
    if (!e.target.closest('.satwrap')) {
      document.querySelectorAll('.satdrop.open').forEach(function(d) { d.classList.remove('open'); });
    }
  });

  addConc();
});

/* =====================================================
   NAVEGACIÓN
===================================================== */
function goNext(from) {
  if (!validar(from)) return;
  paso = from + 1;
  if (paso === 4) armarResumen();
  actualizarUI();
  window.scrollTo({top:0,behavior:'smooth'});
}
function goPrev(from) {
  paso = from - 1;
  actualizarUI();
  window.scrollTo({top:0,behavior:'smooth'});
}
function actualizarUI() {
  for (var i=1;i<=4;i++) {
    var c=document.getElementById('card'+i);
    if(i===paso) c.classList.add('active'); else c.classList.remove('active');
    var t=document.getElementById('st'+i), n=document.getElementById('sn'+i);
    t.classList.remove('active','done');
    if(i===paso){t.classList.add('active');n.textContent=i;}
    else if(i<paso){t.classList.add('done');n.textContent='\u2713';}
    else{n.textContent=i;}
  }
}

/* =====================================================
   VALIDACIÓN
===================================================== */
function validar(p) {
  var ok=true;
  if (p===1) {
    var rfc=document.getElementById('rfc').value.trim();
    if(rfc.length<12){marcarErr('rfc');ok=false;}
    var em=document.getElementById('email').value.trim();
    if(!em||em.indexOf('@')<1){marcarErr('email');ok=false;}
  }
  if (p===2 && document.querySelectorAll('.conc').length===0) {
    alert('Agrega al menos un concepto para continuar.');
    return false;
  }
  if (p===4 && !document.getElementById('acepto').checked) {
    alert('Debes aceptar los terminos para continuar.');
    return false;
  }
  return ok;
}
function marcarErr(id){var el=document.getElementById(id);if(el)el.classList.add('err');var em=document.getElementById('e-'+id);if(em)em.style.display='block';}
function clrE(id){var el=document.getElementById(id);if(el)el.classList.remove('err');var em=document.getElementById('e-'+id);if(em)em.style.display='none';}

/* =====================================================
   CONCEPTOS
===================================================== */
function addConc() {
  nc++;
  var n=nc;
  var div=document.createElement('div');
  div.className='conc'; div.id='c'+n;
  div.innerHTML=
    '<div class="chead2">'+
      '<span class="cnum">Concepto '+n+'</span>'+
      '<div class="cdesc"><input type="text" id="cdesc'+n+'" placeholder="Descripcion del producto o servicio"></div>'+
      '<button class="btnrm" data-n="'+n+'">&times;</button>'+
    '</div>'+
    '<div class="f" style="margin-bottom:12px">'+
      '<label>Clave SAT</label>'+
      '<div class="satwrap" id="sw'+n+'">'+
        '<span class="satico">&#128269;</span>'+
        '<input type="text" class="satinput" id="ss'+n+'" placeholder="Escribe el producto o servicio..." autocomplete="off">'+
        '<div class="satdrop" id="sd'+n+'"></div>'+
        '<div class="satmanual"><span>O escribe la clave:</span><input type="text" id="sm'+n+'" placeholder="84111506" maxlength="8"></div>'+
      '</div>'+
      '<div class="satsel" id="ssel'+n+'"><strong id="sco'+n+'"></strong><span id="sde'+n+'"></span><button class="satclr" data-n="'+n+'">&times;</button></div>'+
    '</div>'+
    '<div class="cgrid">'+
      '<div class="f"><label>Cantidad</label><input type="number" id="ccant'+n+'" value="1" min="0.001" step="0.001"></div>'+
      '<div class="f"><label>Unidad SAT</label>'+
        '<select id="cunit'+n+'">'+
          Object.keys(UNIDADES).map(function(k){return '<option value="'+k+'"'+(k==='E48'?' selected':'')+'>'+UNIDADES[k]+'</option>';}).join('')+
        '</select>'+
      '</div>'+
      '<div class="f"><label>Precio unitario (sin IVA)</label><div class="pfx"><span class="pfxl">$</span><input type="number" id="cprice'+n+'" placeholder="0.00" min="0" step="0.01"></div></div>'+
      '<div class="f"><label>Descuento %</label><input type="number" id="cdisc'+n+'" placeholder="0" min="0" max="100" step="0.01"></div>'+
    '</div>';

  document.getElementById('conc-list').appendChild(div);

  div.querySelector('.btnrm').addEventListener('click', function() { rmConc(this.dataset.n); });
  div.querySelector('.satclr').addEventListener('click', function() { clearSAT(this.dataset.n); });
  div.querySelector('#ss'+n).addEventListener('input', function() { buscar(n); });
  div.querySelector('#sm'+n).addEventListener('input', function() { manualSAT(n); });
  div.querySelector('#ccant'+n).addEventListener('input', recalc);
  div.querySelector('#cprice'+n).addEventListener('input', recalc);
  div.querySelector('#cdisc'+n).addEventListener('input', recalc);

  recalc();
}

function rmConc(n){var el=document.getElementById('c'+n);if(el)el.remove();recalc();}

/* =====================================================
   BUSCADOR SAT
===================================================== */
function buscar(n) {
  var q=document.getElementById('ss'+n).value.toLowerCase().trim();
  var drop=document.getElementById('sd'+n);
  if(q.length<2){drop.classList.remove('open');return;}
  var hits=[];
  for(var i=0;i<SAT.length;i++){
    var it=SAT[i];
    if(it.d.toLowerCase().indexOf(q)>=0||it.c.indexOf(q)>=0||it.k.toLowerCase().indexOf(q)>=0){hits.push(it);if(hits.length>=12)break;}
  }
  if(hits.length===0){drop.innerHTML='<div class="nores">Sin resultados - escribe la clave manualmente</div>';drop.classList.add('open');return;}
  drop.innerHTML='';
  for(var j=0;j<hits.length;j++){
    var item=hits[j];
    var row=document.createElement('div');
    row.className='satitem';
    row.innerHTML='<span class="satcode">'+item.c+'</span><span>'+item.d+'<br><span class="satcat">'+item.k+'</span></span>';
    (function(id,code,desc,unit){
      row.addEventListener('click',function(e){e.stopPropagation();selSAT(id,code,desc,unit);});
    }(n,item.c,item.d,item.u));
    drop.appendChild(row);
  }
  drop.classList.add('open');
}

function selSAT(n,code,desc,unit) {
  document.getElementById('sd'+n).classList.remove('open');
  document.getElementById('ss'+n).value='';
  document.getElementById('sm'+n).value=code;
  document.getElementById('sco'+n).textContent=code;
  document.getElementById('sde'+n).textContent=' - '+desc;
  document.getElementById('ssel'+n).classList.add('show');
  if(unit){var sel=document.getElementById('cunit'+n);if(sel)sel.value=unit;}
}
function manualSAT(n){
  var code=document.getElementById('sm'+n).value.trim();
  if(code.length>=6){
    var found=null;
    for(var i=0;i<SAT.length;i++){if(SAT[i].c===code){found=SAT[i];break;}}
    document.getElementById('sco'+n).textContent=code;
    document.getElementById('sde'+n).textContent=found?' - '+found.d:' - Clave manual';
    document.getElementById('ssel'+n).classList.add('show');
    if(found&&found.u){var sel=document.getElementById('cunit'+n);if(sel)sel.value=found.u;}
  }
}
function clearSAT(n){document.getElementById('ssel'+n).classList.remove('show');document.getElementById('sm'+n).value='';document.getElementById('ss'+n).value='';}

/* =====================================================
   TOTALES
===================================================== */
function getIds(){var ids=[];document.querySelectorAll('.conc').forEach(function(r){ids.push(r.id.replace('c',''));});return ids;}

function recalc(){
  var sub=0,des=0;
  getIds().forEach(function(n){
    var cant=parseFloat(document.getElementById('ccant'+n).value)||0;
    var price=parseFloat(document.getElementById('cprice'+n).value)||0;
    var disc=parseFloat(document.getElementById('cdisc'+n).value)||0;
    var base=cant*price;
    sub+=base; des+=base*(disc/100);
  });
  var neto=sub-des;
  document.getElementById('t-sub').textContent=fmt(sub);
  document.getElementById('t-des').textContent=fmt(des);
  document.getElementById('t-neto').textContent=fmt(neto);
}
function fmt(n){return '$'+n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,',');}

/* =====================================================
   RECOLECTAR CONCEPTOS
===================================================== */
function recolectarConceptos(){
  var conceptos=[];
  getIds().forEach(function(n){
    var desc=document.getElementById('cdesc'+n)?document.getElementById('cdesc'+n).value.trim():'';
    var clave=document.getElementById('sm'+n)?document.getElementById('sm'+n).value.trim():'';
    var unidad=document.getElementById('cunit'+n)?document.getElementById('cunit'+n).value:'E48';
    var cant=parseFloat(document.getElementById('ccant'+n).value)||0;
    var price=parseFloat(document.getElementById('cprice'+n).value)||0;
    var disc=parseFloat(document.getElementById('cdisc'+n).value)||0;
    var base=cant*price;
    var descV=base*(disc/100);
    var importe=base-descV;
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
      /* IVA y retenciones los calcula Make segun el perfil fiscal del cliente */
    });
  });
  return conceptos;
}

/* =====================================================
   RESUMEN
===================================================== */
function armarResumen(){
  var mp=document.querySelector('input[name=mp]:checked');
  var mon=document.querySelector('input[name=mon]:checked');
  var conceptos=recolectarConceptos();
  var datos=[
    {l:'RFC Receptor',      v:val('rfc')},
    {l:'Correo',            v:val('email')},
    {l:'Metodo de pago',    v:mp?mp.value:''},
    {l:'Forma de pago',     v:val('forma')},
    {l:'Moneda',            v:mon?mon.value:'MXN'},
    {l:'Conceptos',         v:conceptos.length+' concepto(s)'},
    {l:'Referencia',        v:val('ref')||'-'},
    {l:'Importe neto (sin impuestos)',  v:document.getElementById('t-neto').textContent, big:true, full:true}
  ];
  var html='';
  datos.forEach(function(d){
    html+='<div class="ri'+(d.full?' full':'')+'"><div class="ril">'+d.l+'</div><div class="riv'+(d.big?' big':'')+'">'+( d.v||'\u2014')+'</div></div>';
  });
  document.getElementById('resumen').innerHTML=html;
}
function val(id){var el=document.getElementById(id);return el?el.value:'';}

/* =====================================================
   ENVIAR
===================================================== */
function enviar(){
  if(!document.getElementById('acepto').checked){alert('Debes aceptar los terminos.');return;}
  var folio='FAC-'+new Date().getFullYear()+'-'+(Math.floor(Math.random()*90000)+10000);
  var mp=document.querySelector('input[name=mp]:checked');
  var mon=document.querySelector('input[name=mon]:checked');
  var data={
    folio:folio, timestamp:new Date().toISOString(),
    receptor:{
      rfc:val('rfc'),
      email:val('email'),
      tel:val('tel')
    },
    pago:{
      metodo:mp?mp.value:'PUE',
      forma:val('forma'),
      moneda:mon?mon.value:'MXN',
      tipo_cambio:val('tc'),
      referencia:val('ref'),
      notas:val('notas')
    },
    conceptos:recolectarConceptos(),
    totales:{
      subtotal:document.getElementById('t-sub').textContent,
      descuento:document.getElementById('t-des').textContent,
      neto:document.getElementById('t-neto').textContent
      /* IVA y total los calcula Make con el perfil fiscal del cliente */
    }
  };

  fetch(WEBHOOK_FORM,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})
    .catch(function(){console.warn('Webhook no configurado');});

  for(var i=1;i<=4;i++) document.getElementById('card'+i).classList.remove('active');
  document.getElementById('success').classList.add('active');
  document.getElementById('folio-num').textContent=folio;
  window.scrollTo({top:0,behavior:'smooth'});
}
