/**
 * HEMISFERIO · Servicio del Libro de Reclamaciones en Salud (virtual)
 * ---------------------------------------------------------------------------
 * Registra cada hoja en una Hoja de cálculo de Google, asigna el correlativo
 * anual (HR-AAAA-000001), envía la copia al correo del reclamante (art. 16.3
 * del D.S. N.° 002-2019-SA) y avisa al correo del centro.
 *
 * INSTALACIÓN (cuenta Hemisferiorehab@gmail.com)
 * 1. Crear una Hoja de cálculo nueva: "Libro de Reclamaciones HEMISFERIO".
 * 2. Extensiones > Apps Script. Pegar este archivo completo y guardar.
 * 3. Implementar > Nueva implementación > Tipo: Aplicación web.
 *      Ejecutar como: Yo.   Quién tiene acceso: Cualquier persona.
 * 4. Autorizar los permisos (Hojas de cálculo y Gmail).
 * 5. Copiar la URL que termina en /exec y pegarla en js/config.js:
 *      legal.libroEndpoint: "https://script.google.com/macros/s/.../exec"
 * 6. Hacer una prueba completa desde la web y verificar la fila y los correos.
 *
 * CONSERVACIÓN: el expediente del reclamo debe conservarse cuatro años desde
 * su conclusión (art. 26.2). No borrar filas de la hoja.
 */

var CONFIG = {
  CORREO_CENTRO: 'Hemisferiorehab@gmail.com',
  RAZON_SOCIAL: 'Centro de Rehabilitación Física Hemisferio S.A.C.',
  PLAZO_DIAS: 30,
  HOJA: 'Reclamos'
};

var COLUMNAS = [
  'N.° de hoja', 'Fecha y hora de registro',
  'Usuario: nombre o razón social', 'Usuario: tipo doc.', 'Usuario: n.° doc.', 'Usuario: domicilio', 'Usuario: teléfono', 'Usuario: correo',
  'Presentante: nombre o razón social', 'Presentante: tipo doc.', 'Presentante: n.° doc.', 'Presentante: domicilio', 'Presentante: teléfono', 'Presentante: correo',
  'Fecha del hecho', 'Detalle del reclamo', 'Autoriza notificación por correo', 'Canal',
  'Estado', 'Fecha de respuesta', 'Resultado / solución', 'Responsable'
];

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    var data = JSON.parse(e.postData.contents);
    validar_(data);

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheetByName(CONFIG.HOJA) || ss.insertSheet(CONFIG.HOJA);
    if (sh.getLastRow() === 0) { sh.appendRow(COLUMNAS); sh.setFrozenRows(1); }

    var ahora = new Date();
    var tz = Session.getScriptTimeZone() || 'America/Lima';
    var anio = Utilities.formatDate(ahora, 'America/Lima', 'yyyy');
    var numero = siguienteNumero_(sh, anio);
    var fecha = Utilities.formatDate(ahora, 'America/Lima', 'dd/MM/yyyy HH:mm');

    var u = data.usuario, p = data.presentante || {};
    sh.appendRow([
      numero, fecha,
      u.nombre, u.tipoDoc, "'" + u.numDoc, u.domicilio, "'" + (u.telefono || ''), u.email,
      p.nombre || '', p.tipoDoc || '', p.numDoc ? "'" + p.numDoc : '', p.domicilio || '', p.telefono ? "'" + p.telefono : '', p.email || '',
      data.detalle.fechaHecho || '', data.detalle.descripcion, data.autorizaEmail, data.canal || 'Web',
      'Recibido', '', '', ''
    ]);

    var html = constanciaHtml_(data, numero, fecha);
    var destinatario = (data.presentante && data.presentante.email) || u.email;
    MailApp.sendEmail({
      to: destinatario,
      subject: 'Copia de tu Hoja de Reclamación N.° ' + numero + ' · HEMISFERIO',
      htmlBody: html,
      name: 'HEMISFERIO · Libro de Reclamaciones',
      replyTo: CONFIG.CORREO_CENTRO
    });
    MailApp.sendEmail({
      to: CONFIG.CORREO_CENTRO,
      subject: 'Nuevo reclamo N.° ' + numero + ' · responder en ' + CONFIG.PLAZO_DIAS + ' días hábiles',
      htmlBody: html,
      name: 'Libro de Reclamaciones web'
    });

    return json_({ ok: true, numero: numero, fecha: fecha });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err) });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

function siguienteNumero_(sh, anio) {
  var prefijo = 'HR-' + anio + '-';
  var n = 0;
  if (sh.getLastRow() > 1) {
    var vals = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues();
    vals.forEach(function (r) {
      var v = String(r[0]);
      if (v.indexOf(prefijo) === 0) n = Math.max(n, parseInt(v.slice(prefijo.length), 10) || 0);
    });
  }
  return prefijo + ('000000' + (n + 1)).slice(-6);
}

function validar_(d) {
  if (!d || !d.usuario || !d.detalle) throw new Error('Datos incompletos');
  var u = d.usuario;
  ['nombre', 'tipoDoc', 'numDoc', 'domicilio', 'email'].forEach(function (k) {
    if (!u[k] || !String(u[k]).trim()) throw new Error('Falta ' + k);
  });
  if (!d.detalle.descripcion || String(d.detalle.descripcion).trim().length < 20) throw new Error('Detalle insuficiente');
  if (String(d.detalle.descripcion).length > 3000) throw new Error('Detalle demasiado largo');
  if (d.autorizaEmail !== 'SI' && d.autorizaEmail !== 'NO') throw new Error('Falta autorización');
  if (d.declaracion !== true) throw new Error('Falta declaración');
}

function esc_(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/\n/g, '<br>');
}

function persona_(t, x) {
  return '<h3 style="font-size:14px;color:#123858;margin:18px 0 6px">' + t + '</h3>' +
    '<p style="margin:0;line-height:1.6">' + esc_(x.nombre) + '<br>' + esc_(x.tipoDoc) + ' ' + esc_(x.numDoc) + '<br>' +
    esc_(x.domicilio) + (x.telefono ? '<br>Tel. ' + esc_(x.telefono) : '') + '<br>' + esc_(x.email) + '</p>';
}

function constanciaHtml_(d, numero, fecha) {
  var e = d.establecimiento || {};
  return '<div style="font-family:Verdana,Arial,sans-serif;color:#203B45;max-width:640px;font-size:13px">' +
    '<p style="text-transform:uppercase;letter-spacing:.1em;color:#357A9C;font-size:11px;margin:0">Libro de Reclamaciones en Salud</p>' +
    '<h2 style="color:#123858;margin:6px 0 4px">Hoja de reclamación N.° ' + numero + '</h2>' +
    '<p style="margin:0 0 12px">Fecha y hora: ' + fecha + '<br>HEMISFERIO · ' + esc_(e.razonSocial || CONFIG.RAZON_SOCIAL) +
    (e.ruc ? ' · RUC ' + esc_(e.ruc) : '') + (e.renipress ? ' · RENIPRESS ' + esc_(e.renipress) : '') +
    (e.domicilio ? '<br>' + esc_(e.domicilio) : '') + '</p>' +
    persona_('1. Usuario o tercero legitimado', d.usuario) +
    (d.presentante ? persona_('2. Quien presenta el reclamo', d.presentante) : '<h3 style="font-size:14px;color:#123858;margin:18px 0 6px">2. Quien presenta el reclamo</h3><p style="margin:0">El mismo usuario.</p>') +
    '<h3 style="font-size:14px;color:#123858;margin:18px 0 6px">3. Detalle del reclamo</h3>' +
    (d.detalle.fechaHecho ? '<p style="margin:0 0 6px">Fecha del hecho: ' + esc_(d.detalle.fechaHecho) + '</p>' : '') +
    '<p style="margin:0;line-height:1.6">' + esc_(d.detalle.descripcion) + '</p>' +
    '<h3 style="font-size:14px;color:#123858;margin:18px 0 6px">4. Notificación del resultado al correo</h3><p style="margin:0">' + (d.autorizaEmail === 'SI' ? 'Sí autoriza.' : 'No autoriza.') + '</p>' +
    '<h3 style="font-size:14px;color:#123858;margin:18px 0 6px">5. Declaración</h3><p style="margin:0">El reclamante declaró la veracidad de los datos. El registro virtual reemplaza su firma.</p>' +
    '<p style="margin:22px 0 0;padding-top:12px;border-top:1px solid #D3DEE5;font-size:12px;line-height:1.6">Conforme al D.S. N.° 002-2019-SA, ' +
    esc_(e.razonSocial || CONFIG.RAZON_SOCIAL) + ' responderá su reclamo en un plazo máximo de ' + CONFIG.PLAZO_DIAS +
    ' días hábiles, contados desde el día siguiente de su recepción. Si no está conforme con la respuesta o no la recibe en ese plazo, puede presentar una denuncia ante la Superintendencia Nacional de Salud (SUSALUD).</p></div>';
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
