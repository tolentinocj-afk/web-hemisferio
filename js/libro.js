/* =========================================================================
   Libro de Reclamaciones en Salud · versión virtual
   Base normativa: Reglamento aprobado por D.S. N.° 002-2019-SA
   (arts. 11, 14, 15, 16 y 24). Campos según el formato de la Hoja de
   Reclamación en Salud: identificación del usuario o tercero legitimado,
   identificación de quien presenta el reclamo, detalle, autorización de
   notificación por correo y declaración que sustituye la firma.

   Registro: si legal.libroEndpoint está configurado, la hoja se envía a ese
   servicio, que asigna el correlativo, la guarda y remite la copia al correo
   del reclamante (apps-script/LibroReclamaciones.gs).
   ========================================================================= */
(function () {
  "use strict";

  var H = window.HEMISFERIO || {};
  var C = H.config || window.HEMISFERIO_CONFIG || {};
  var legal = C.legal || {};
  var contacto = C.contacto || {};
  var el = H.el;
  var has = H.has;

  var dlg = document.getElementById("libro-de-reclamaciones");
  if (!dlg || !el) return;
  var form = dlg.querySelector("[data-libro-form]");
  var done = dlg.querySelector("[data-libro-done]");
  var errBox = dlg.querySelector("[data-libro-error]");
  var submitBtn = dlg.querySelector("[data-libro-submit]");
  var rep = dlg.querySelector("[data-rep]");
  var hojaBox = dlg.querySelector("[data-hoja]");
  var PLAZO = legal.plazoRespuestaDias || 30;
  var RAZON = legal.razonSocial || "HEMISFERIO";
  var CORREO = legal.correoReclamos || contacto.correo || "";
  var endpoint = H.safeUrl(legal.libroEndpoint);

  function pad(n) { return String(n).padStart(2, "0"); }
  function fechaHora(d) {
    return pad(d.getDate()) + "/" + pad(d.getMonth() + 1) + "/" + d.getFullYear() + " " + pad(d.getHours()) + ":" + pad(d.getMinutes());
  }

  /* ---------- Datos del establecimiento ---------- */
  var provider = dlg.querySelector("[data-libro-provider]");
  function addProv(k, v) {
    if (!has(v)) return;
    var d = el("div"); d.appendChild(el("dt", null, k)); d.appendChild(el("dd", null, v)); provider.appendChild(d);
  }
  addProv("Establecimiento", "HEMISFERIO · " + RAZON);
  addProv("RUC", legal.ruc);
  addProv("Código RENIPRESS", legal.codigoRenipress);
  addProv("Domicilio", legal.domicilioFiscal);
  var fechaNode = el("dd");
  var fd = el("div"); fd.appendChild(el("dt", null, "Fecha")); fd.appendChild(fechaNode); provider.appendChild(fd);

  /* ---------- Textos legales ---------- */
  dlg.querySelector("[data-libro-legal]").textContent =
    "Conforme al D.S. N.° 002-2019-SA, " + RAZON + " responderá tu reclamo en un plazo máximo de " + PLAZO +
    " días hábiles, contados desde el día siguiente de su recepción. Si no estás conforme con la respuesta o no la recibes en ese plazo, puedes presentar una denuncia ante la Superintendencia Nacional de Salud (SUSALUD). Presentar este reclamo no te impide acudir a otras vías.";

  dlg.querySelector("[data-privacy-text]").textContent =
    "Responsable: " + RAZON + (legal.domicilioFiscal ? ", " + legal.domicilioFiscal : "") + ". " +
    "Finalidad: registrar, investigar y responder tu reclamo, y cumplir las obligaciones del D.S. N.° 002-2019-SA, incluida su conservación por el plazo legal y su remisión a SUSALUD cuando esta lo solicite. " +
    "No usaremos estos datos con fines comerciales. Puedes ejercer tus derechos de acceso, rectificación, cancelación y oposición escribiendo a " + CORREO + " (Ley N.° 29733 y su reglamento). Más información en nuestra política de privacidad.";
  var ppUrl = H.siteUrl ? H.siteUrl(legal.politicaPrivacidadUrl) : "";
  if (ppUrl) {
    var ppA = el("a", { href: ppUrl, target: "_blank", rel: "noopener" }, "Ver política de privacidad");
    var ppP = el("p"); ppP.appendChild(ppA);
    dlg.querySelector("[data-privacy-text]").parentNode.appendChild(ppP);
  }

  /* ---------- Interacción ---------- */
  var repFields = rep.querySelectorAll("input, select");
  form.querySelectorAll('input[name="presenta"]').forEach(function (r) {
    r.addEventListener("change", function () {
      var otro = form.presenta.value === "otro";
      rep.hidden = !otro;
      ["r_nombre", "r_numdoc", "r_domicilio", "r_email"].forEach(function (n) { form[n].required = otro; });
    });
  });
  var detalle = form.d_detalle;
  var count = dlg.querySelector("[data-count]");
  detalle.addEventListener("input", function () { count.textContent = detalle.value.length; });
  form.d_fecha.max = new Date().toISOString().slice(0, 10);

  function showError(msg, field) {
    errBox.textContent = msg;
    errBox.hidden = false;
    if (field) { field.focus(); field.setAttribute("aria-invalid", "true"); }
  }
  form.addEventListener("input", function (e) { e.target.removeAttribute("aria-invalid"); errBox.hidden = true; });

  function validate() {
    var req = Array.prototype.slice.call(form.querySelectorAll("[required]"));
    for (var i = 0; i < req.length; i++) {
      var f = req[i];
      if (f.type === "radio") {
        if (!form.querySelector('input[name="' + f.name + '"]:checked')) return showError("Indica si autorizas la notificación del resultado por correo.", f), false;
      } else if (f.type === "checkbox") {
        if (!f.checked) return showError("Para registrar el reclamo, marca la declaración de veracidad.", f), false;
      } else if (!f.value.trim()) {
        var lbl = form.querySelector('label[for="' + f.id + '"]');
        return showError("Completa el campo: " + (lbl ? lbl.textContent.replace("*", "").trim() : f.name) + ".", f), false;
      } else if (f.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim())) {
        return showError("Revisa el correo electrónico: parece incompleto.", f), false;
      }
    }
    if (detalle.value.trim().length < 20) return showError("Describe lo ocurrido con un poco más de detalle (mínimo 20 caracteres).", detalle), false;
    var doc = form.u_numdoc.value.trim();
    if (form.u_tipodoc.value === "DNI" && !/^\d{8}$/.test(doc)) return showError("El DNI debe tener 8 dígitos.", form.u_numdoc), false;
    if (form.u_tipodoc.value === "RUC" && !/^\d{11}$/.test(doc)) return showError("El RUC debe tener 11 dígitos.", form.u_numdoc), false;
    return true;
  }

  function collect() {
    var v = function (n) { return (form[n] && form[n].value || "").trim(); };
    var otro = form.presenta.value === "otro";
    return {
      usuario: { nombre: v("u_nombre"), tipoDoc: v("u_tipodoc"), numDoc: v("u_numdoc"), domicilio: v("u_domicilio"), telefono: v("u_telefono"), email: v("u_email") },
      presentante: otro ? { nombre: v("r_nombre"), tipoDoc: v("r_tipodoc"), numDoc: v("r_numdoc"), domicilio: v("r_domicilio"), telefono: v("r_telefono"), email: v("r_email") } : null,
      detalle: { fechaHecho: v("d_fecha"), descripcion: v("d_detalle") },
      autorizaEmail: form.autoriza_email.value,
      declaracion: true,
      establecimiento: { razonSocial: RAZON, ruc: legal.ruc || "", renipress: legal.codigoRenipress || "", domicilio: legal.domicilioFiscal || "" },
      registradoEn: new Date().toISOString(),
      canal: "Libro de Reclamaciones en Salud virtual (web)"
    };
  }

  /* ---------- Constancia ---------- */
  function row(dl, k, v) { if (!has(v)) return; var d = el("div"); d.appendChild(el("dt", null, k)); d.appendChild(el("dd", null, v)); dl.appendChild(d); }
  function personBlock(title, p) {
    var s = el("section");
    s.appendChild(el("h4", null, title));
    var dl = el("dl");
    row(dl, "Nombre o razón social", p.nombre);
    row(dl, "Documento", p.tipoDoc + " " + p.numDoc);
    row(dl, "Domicilio", p.domicilio);
    row(dl, "Teléfono", p.telefono);
    row(dl, "Correo", p.email);
    s.appendChild(dl);
    return s;
  }

  function renderHoja(rec, numero, fecha) {
    hojaBox.innerHTML = "";
    var head = el("header");
    head.appendChild(el("p", { "class": "hoja-kicker" }, "Libro de Reclamaciones en Salud"));
    head.appendChild(el("h3", null, "Hoja de reclamación N.° " + numero));
    var meta = el("dl", { "class": "hoja-meta" });
    row(meta, "Fecha y hora", fecha);
    row(meta, "Establecimiento", "HEMISFERIO · " + rec.establecimiento.razonSocial);
    row(meta, "RUC", rec.establecimiento.ruc);
    row(meta, "Código RENIPRESS", rec.establecimiento.renipress);
    row(meta, "Domicilio", rec.establecimiento.domicilio);
    head.appendChild(meta);
    hojaBox.appendChild(head);
    hojaBox.appendChild(personBlock("1. Usuario o tercero legitimado", rec.usuario));
    hojaBox.appendChild(rec.presentante ? personBlock("2. Quien presenta el reclamo", rec.presentante) : (function () {
      var s = el("section"); s.appendChild(el("h4", null, "2. Quien presenta el reclamo")); s.appendChild(el("p", null, "El mismo usuario.")); return s;
    })());
    var d = el("section");
    d.appendChild(el("h4", null, "3. Detalle del reclamo"));
    if (rec.detalle.fechaHecho) d.appendChild(el("p", { "class": "hoja-small" }, "Fecha de la atención o del hecho: " + rec.detalle.fechaHecho.split("-").reverse().join("/")));
    d.appendChild(el("p", { "class": "hoja-detail" }, rec.detalle.descripcion));
    hojaBox.appendChild(d);
    var n = el("section");
    n.appendChild(el("h4", null, "4. Notificación del resultado al correo consignado"));
    n.appendChild(el("p", null, rec.autorizaEmail === "SI" ? "Sí autoriza." : "No autoriza."));
    hojaBox.appendChild(n);
    var f = el("section");
    f.appendChild(el("h4", null, "5. Declaración"));
    f.appendChild(el("p", null, "El reclamante declaró la veracidad de los datos. El registro virtual reemplaza su firma."));
    hojaBox.appendChild(f);
    hojaBox.appendChild(el("p", { "class": "hoja-foot" }, dlg.querySelector("[data-libro-legal]").textContent));
  }

  function plainText(rec, numero, fecha) {
    var L = [];
    L.push("LIBRO DE RECLAMACIONES EN SALUD");
    L.push("Hoja de reclamación N.° " + numero + " · " + fecha);
    L.push("Establecimiento: HEMISFERIO · " + rec.establecimiento.razonSocial + (rec.establecimiento.ruc ? " · RUC " + rec.establecimiento.ruc : ""));
    if (rec.establecimiento.domicilio) L.push("Domicilio: " + rec.establecimiento.domicilio);
    L.push("");
    function p(t, x) {
      L.push(t);
      L.push("Nombre: " + x.nombre); L.push("Documento: " + x.tipoDoc + " " + x.numDoc); L.push("Domicilio: " + x.domicilio);
      if (x.telefono) L.push("Teléfono: " + x.telefono); L.push("Correo: " + x.email); L.push("");
    }
    p("1. USUARIO O TERCERO LEGITIMADO", rec.usuario);
    if (rec.presentante) p("2. QUIEN PRESENTA EL RECLAMO", rec.presentante); else { L.push("2. QUIEN PRESENTA EL RECLAMO: el mismo usuario."); L.push(""); }
    L.push("3. DETALLE DEL RECLAMO");
    if (rec.detalle.fechaHecho) L.push("Fecha del hecho: " + rec.detalle.fechaHecho.split("-").reverse().join("/"));
    L.push(rec.detalle.descripcion); L.push("");
    L.push("4. Autoriza notificación al correo: " + (rec.autorizaEmail === "SI" ? "Sí" : "No"));
    L.push("5. Declaración de veracidad: aceptada (el registro virtual reemplaza la firma).");
    L.push("");
    L.push(dlg.querySelector("[data-libro-legal]").textContent);
    return L.join("\n");
  }

  var lastText = "";
  function showDone(rec, numero, fecha, registered) {
    renderHoja(rec, numero, fecha);
    lastText = plainText(rec, numero, fecha);
    var title = dlg.querySelector("[data-done-title]");
    var text = dlg.querySelector("[data-done-text]");
    var mail = dlg.querySelector("[data-hoja-mail]");
    var mailTo = rec.presentante ? rec.presentante.email : rec.usuario.email;
    if (registered) {
      title.textContent = "Tu reclamo fue registrado";
      text.textContent = "Enviamos una copia de esta hoja a " + mailTo + ". Te responderemos en un plazo máximo de " + PLAZO + " días hábiles.";
      mail.hidden = true;
    } else {
      title.textContent = "Tu hoja de reclamación está lista";
      text.textContent = "Envíala al correo del centro con el botón de abajo y guarda esta constancia. Te responderemos en un plazo máximo de " + PLAZO + " días hábiles.";
      mail.href = "mailto:" + CORREO + "?cc=" + encodeURIComponent(mailTo) +
        "&subject=" + encodeURIComponent("Libro de Reclamaciones en Salud · Hoja N.° " + numero) +
        "&body=" + encodeURIComponent(lastText);
      mail.hidden = !CORREO;
    }
    var printBtn = dlg.querySelector("[data-hoja-print]");
    var framed = false;
    try { framed = window.self !== window.top; } catch (e) { framed = true; }
    printBtn.hidden = framed;
    form.hidden = true;
    done.hidden = false;
    dlg.querySelector(".libro-inner").scrollTop = 0;
    title.setAttribute("tabindex", "-1");
    title.focus();
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    errBox.hidden = true;
    if (!validate()) return;
    var rec = collect();
    var now = new Date();

    if (!endpoint) {
      var prov = "HR-" + now.getFullYear() + pad(now.getMonth() + 1) + pad(now.getDate()) + "-" + pad(now.getHours()) + pad(now.getMinutes()) + pad(now.getSeconds());
      showDone(rec, prov, fechaHora(now), false);
      return;
    }
    submitBtn.disabled = true;
    submitBtn.textContent = "Registrando…";
    fetch(endpoint, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(rec) })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res || !res.ok) throw new Error(res && res.error || "Error");
        showDone(rec, res.numero, res.fecha || fechaHora(now), true);
      })
      .catch(function () {
        showError("No pudimos registrar tu reclamo en este momento. Inténtalo de nuevo en unos minutos" + (CORREO ? " o escríbenos a " + CORREO : "") + ".");
      })
      .then(function () { submitBtn.disabled = false; submitBtn.textContent = "Registrar reclamo"; });
  });

  dlg.querySelector("[data-hoja-copy]").addEventListener("click", function (e) {
    var btn = e.currentTarget;
    function ok() { btn.textContent = "Constancia copiada"; setTimeout(function () { btn.textContent = "Copiar constancia"; }, 2200); }
    try {
      navigator.clipboard.writeText(lastText).then(ok, function () { selectHoja(); });
    } catch (err) { selectHoja(); }
  });
  function selectHoja() {
    var r = document.createRange(); r.selectNodeContents(hojaBox);
    var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
  }
  dlg.querySelector("[data-hoja-print]").addEventListener("click", function () { document.body.classList.add("print-hoja"); window.print(); });
  window.addEventListener("afterprint", function () { document.body.classList.remove("print-hoja"); });

  /* ---------- Abrir y cerrar ---------- */
  var lastFocus = null;
  function open() {
    lastFocus = document.activeElement;
    fechaNode.textContent = fechaHora(new Date());
    if (typeof dlg.showModal === "function") { if (!dlg.open) dlg.showModal(); }
    else dlg.setAttribute("open", "");
    document.body.classList.add("libro-open");
    setTimeout(function () { var f = form.hidden ? null : form.u_nombre; if (f) f.focus({ preventScroll: true }); }, 60);
  }
  function close() {
    if (typeof dlg.close === "function" && dlg.open) dlg.close(); else dlg.removeAttribute("open");
  }
  dlg.addEventListener("close", function () {
    document.body.classList.remove("libro-open");
    if (!done.hidden) { form.reset(); rep.hidden = true; form.hidden = false; done.hidden = true; count.textContent = "0"; }
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  });
  H.openLibro = open;
  document.querySelectorAll("[data-libro-open]").forEach(function (b) { b.addEventListener("click", open); });
  dlg.querySelectorAll("[data-libro-close]").forEach(function (b) { b.addEventListener("click", close); });
  if (window.location.hash === "#libro-de-reclamaciones") open();
  window.addEventListener("hashchange", function () { if (window.location.hash === "#libro-de-reclamaciones") open(); });
})();
