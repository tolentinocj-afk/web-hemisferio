/* HEMISFERIO · Comportamiento general. Lee window.HEMISFERIO_CONFIG (js/config.js). */
(function () {
  "use strict";

  var C = window.HEMISFERIO_CONFIG || {};
  var contacto = C.contacto || {};
  var redes = C.redes || {};
  var pro = C.profesional || {};
  var secciones = C.secciones || {};
  var legal = C.legal || {};

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function has(v) { return Array.isArray(v) ? v.length > 0 : (v !== undefined && v !== null && String(v).trim() !== ""); }
  function get(path) { return path.split(".").reduce(function (o, k) { return o ? o[k] : undefined; }, C); }
  function el(tag, attrs, text) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function safeUrl(u) { return /^https?:\/\//i.test(String(u || "").trim()) ? String(u).trim() : ""; }

  /* ---------- Utilidades compartidas con Mica y el Libro ---------- */
  var waNumber = String(contacto.whatsapp || "").replace(/\D/g, "");
  var hasWa = waNumber.length >= 9;
  function waLink(text) {
    var msg = text || contacto.mensajeWhatsapp || "Hola, quisiera agendar una evaluación en HEMISFERIO.";
    return "https://wa.me/" + waNumber + "?text=" + encodeURIComponent(msg);
  }
  window.HEMISFERIO = { config: C, hasWa: hasWa, waLink: waLink, has: has, el: el, safeUrl: safeUrl };

  /* ---------- Botones de evaluación ---------- */
  $$("[data-cta]").forEach(function (a) {
    if (hasWa) {
      var area = a.getAttribute("data-area");
      a.href = waLink(area ? "Hola, quisiera agendar una evaluación en HEMISFERIO para " + area + "." : null);
      a.target = "_blank";
      a.rel = "noopener";
      if (a.hasAttribute("data-wa-only")) a.hidden = false;
    } else {
      if (a.hasAttribute("data-wa-only")) { a.hidden = true; return; }
      a.href = "#contacto";
    }
  });
  if (hasWa) document.body.classList.add("has-floaters");

  /* ---------- Secciones activables ---------- */
  $$("[data-feature]").forEach(function (n) { n.hidden = !secciones[n.getAttribute("data-feature")]; });

  /* ---------- Textos desde la configuración ---------- */
  $$("[data-config-text]").forEach(function (n) {
    var v = get(n.getAttribute("data-config-text"));
    if (has(v)) { n.textContent = v; n.hidden = false; }
    else if (!n.textContent.trim()) { n.hidden = true; }
  });

  if (typeof pro.aniosExperiencia === "number" && pro.aniosExperiencia > 0) {
    $$("[data-years]").forEach(function (n) { n.textContent = pro.aniosExperiencia; });
    $$("[data-config-years]").forEach(function (n) { n.hidden = false; });
  }

  if (has(pro.fotoRetrato)) {
    var fig = $("[data-config-photo]");
    if (fig) {
      var img = $("img", fig);
      img.src = pro.fotoRetrato;
      img.alt = "Retrato de " + (pro.tratamiento ? pro.tratamiento + " " : "") + (pro.nombre || "la directora") + ", directora de HEMISFERIO.";
      fig.hidden = false;
      $(".pro-grid").classList.add("has-photo");
    }
  }

  /* ---------- Número visible en el botón de WhatsApp ---------- */
  $$("[data-wa-number]").forEach(function (n) { n.textContent = contacto.telefono || ("+" + waNumber); });
  var waf = $(".wa-float");
  if (waf) waf.setAttribute("aria-label", "Escribir por WhatsApp al " + (contacto.telefono || waNumber));

  /* ---------- Resultados reales de casos (solo con autorización) ---------- */
  var casos = C.casos || {};
  $$("[data-caso]").forEach(function (box) {
    var k = casos[box.getAttribute("data-caso")];
    if (!k || !k.autorizado || !has(k.resultado)) { box.hidden = true; return; }
    box.appendChild(el("p", { "class": "caso-result-k" }, "Caso acompañado"));
    var meta = [k.paciente, k.duracion].filter(has).join(" · ");
    if (meta) box.appendChild(el("p", { "class": "caso-result-meta" }, meta));
    box.appendChild(el("p", null, k.resultado));
    box.hidden = false;
  });

  /* ---------- Canales de contacto ---------- */
  var channels = $("[data-channels]");
  var items = 0;
  function addChannel(label, build) {
    var row = el("div");
    row.appendChild(el("dt", null, label));
    var dd = el("dd");
    build(dd);
    row.appendChild(dd);
    channels.appendChild(row);
    items++;
  }
  if (channels) {
    var telDigits = String(contacto.telefonoMarcado || contacto.telefono || "").replace(/\D/g, "");
    var sameNumber = hasWa && telDigits && waNumber.slice(-9) === telDigits.slice(-9);
    if (hasWa) addChannel(sameNumber ? "WhatsApp y teléfono" : "WhatsApp", function (dd) {
      dd.appendChild(el("a", { href: waLink(), target: "_blank", rel: "noopener" }, contacto.telefono || ("+" + waNumber)));
      var sm = el("small");
      sm.appendChild(el("a", { href: waLink(), target: "_blank", rel: "noopener" }, "Escribir por WhatsApp"));
      if (sameNumber) { sm.appendChild(document.createTextNode(" · ")); sm.appendChild(el("a", { href: "tel:" + (contacto.telefonoMarcado || telDigits) }, "Llamar")); }
      dd.appendChild(sm);
    });
    if (has(contacto.telefono) && !sameNumber) addChannel("Teléfono", function (dd) {
      dd.appendChild(el("a", { href: "tel:" + (contacto.telefonoMarcado || telDigits) }, contacto.telefono));
    });
    if (has(contacto.correo)) addChannel("Correo", function (dd) {
      dd.appendChild(el("a", { href: "mailto:" + contacto.correo }, contacto.correo));
    });
    if (has(contacto.direccion)) addChannel("Dirección", function (dd) {
      var maps = safeUrl(contacto.mapsUrl);
      var line = contacto.direccion + (has(contacto.distrito) ? ", " + contacto.distrito : "");
      if (maps) dd.appendChild(el("a", { href: maps, target: "_blank", rel: "noopener" }, line));
      else dd.appendChild(document.createTextNode(line));
      if (has(contacto.referencia)) dd.appendChild(el("small", null, contacto.referencia));
      if (maps) dd.appendChild(el("small", null, "Abrir en el mapa"));
    });
    if (has(contacto.horario)) addChannel("Horario de atención", function (dd) {
      contacto.horario.forEach(function (h, i) { if (i) dd.appendChild(el("br")); dd.appendChild(document.createTextNode(h)); });
    });
    if (has(contacto.modalidades)) addChannel("Modalidad", function (dd) { dd.textContent = contacto.modalidades.join(" · "); });
    var ig = safeUrl(redes.instagram);
    if (ig) addChannel("Instagram", function (dd) {
      dd.appendChild(el("a", { href: ig, target: "_blank", rel: "noopener" }, "@" + ig.replace(/\/+$/, "").split("/").pop()));
    });
    if (items) $("[data-contact-wrap]").hidden = false;
  }

  /* ---------- Redes en el pie ---------- */
  var social = $("[data-social]");
  if (social) {
    [["Instagram", redes.instagram], ["Facebook", redes.facebook], ["TikTok", redes.tiktok]].forEach(function (r) {
      var u = safeUrl(r[1]);
      if (!u) return;
      var li = el("li");
      li.appendChild(el("a", { href: u, target: "_blank", rel: "noopener" }, r[0]));
      social.appendChild(li);
    });
    social.hidden = social.children.length === 0;
  }

  /* ---------- Datos legales en el pie ---------- */
  var legalId = $("[data-legal-id]");
  if (legalId) {
    var parts = [has(legal.razonSocial) ? legal.razonSocial : "HEMISFERIO"];
    if (has(legal.ruc)) parts.push("RUC " + legal.ruc);
    if (has(legal.domicilioFiscal)) parts.push(legal.domicilioFiscal);
    legalId.textContent = parts.join(" · ");
  }
  var legalLinks = $("[data-legal-links]");
  if (legalLinks) {
    var pp = safeUrl(legal.politicaPrivacidadUrl);
    if (pp) {
      var li = el("li");
      li.appendChild(el("a", { href: pp, target: "_blank", rel: "noopener" }, "Política de privacidad"));
      legalLinks.appendChild(li);
    }
    legalLinks.hidden = legalLinks.children.length === 0;
  }
  var y = $("[data-year]");
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- Menú móvil ---------- */
  var toggle = $(".menu-toggle");
  var nav = $("#menu");
  function setMenu(open) {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    nav.classList.toggle("is-open", open);
  }
  if (toggle && nav) {
    toggle.addEventListener("click", function () { setMenu(toggle.getAttribute("aria-expanded") !== "true"); });
    $$("a", nav).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  }

  /* ---------- Encabezado al desplazarse y sección activa ---------- */
  var header = $(".site-header");
  function onScroll() { if (header) header.classList.toggle("is-scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* En celular, los accesos flotantes aparecen después de la portada para no tapar sus botones */
  var floaters = $("[data-floaters]");
  var hero = $("#inicio");
  if (floaters && hero && "IntersectionObserver" in window) {
    new IntersectionObserver(function (en) {
      floaters.classList.toggle("is-tucked", en[0].isIntersecting && window.innerWidth < 600);
    }, { threshold: 0.35 }).observe(hero);
  }

  if ("IntersectionObserver" in window) {
    var links = $$('.nav a[href^="#"]:not(.btn)');
    var map = {};
    links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.removeAttribute("aria-current"); });
        var a = map[en.target.id];
        if (a) a.setAttribute("aria-current", "true");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  }

  /* ---------- Panel de revisión interna ---------- */
  function showReview() {
    var panel = $("[data-review]");
    if (!panel) return;
    if (panel.childElementCount) { panel.hidden = false; return; }
    var faltan = [];
    if (!hasWa) faltan.push("Número de WhatsApp (contacto.whatsapp)");
    if (!has(contacto.horario)) faltan.push("Horario de atención (contacto.horario)");
    if (!has(contacto.modalidades)) faltan.push("Modalidades de atención (contacto.modalidades)");
    if (!safeUrl(redes.instagram)) faltan.push("Instagram (redes.instagram)");
    if (!has(pro.registroProfesional)) faltan.push("Registro profesional CTMP (profesional.registroProfesional)");
    if (!has(pro.entidadHombro)) faltan.push("Entidad del curso de hombro (profesional.entidadHombro)");
    if (!has(legal.ruc)) faltan.push("RUC de la sociedad (legal.ruc)");
    if (!has(legal.codigoRenipress)) faltan.push("Código RENIPRESS (legal.codigoRenipress)");
    if (!safeUrl(legal.libroEndpoint)) faltan.push("Servicio del Libro de Reclamaciones (legal.libroEndpoint)");
    if (!safeUrl(legal.politicaPrivacidadUrl)) faltan.push("Política de privacidad (legal.politicaPrivacidadUrl)");
    panel.appendChild(el("h2", null, "Revisión interna: " + faltan.length + " datos por completar"));
    var ul = el("ul");
    faltan.forEach(function (f) { ul.appendChild(el("li", null, f)); });
    panel.appendChild(ul);
    panel.appendChild(el("p", null, "Suelo pélvico: " + (secciones.sueloPelvico ? "visible" : "desactivado") + ". Edite js/config.js. Este panel no se muestra al público."));
    var b = el("button", { type: "button" }, "Cerrar panel");
    b.addEventListener("click", function () { panel.hidden = true; });
    panel.appendChild(b);
    panel.hidden = false;
  }
  if (C.modoRevision || location.hash === "#revision") showReview();
  window.addEventListener("hashchange", function () { if (location.hash === "#revision") showReview(); });
})();
