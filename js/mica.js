/* =========================================================================
   Mica · Asistente virtual de HEMISFERIO
   -------------------------------------------------------------------------
   Asistente guiado que funciona en el navegador, sin servidor ni costos de
   uso. Conversa con amabilidad, pregunta por la dificultad de la persona,
   sugiere el área que podría corresponder y recomienda agendar una
   evaluación con la licenciada, enviando un resumen por WhatsApp.

   Criterios de seguridad:
   - No diagnostica ni promete resultados (manual de marca 1.2, p. 13).
   - Ante señales de alarma, indica acudir a emergencias (SAMU 106) o, en
     crisis emocional, a la Línea 113, opción 5.
   - No guarda la conversación. Solo se envía si la persona elige WhatsApp.
   ========================================================================= */
(function () {
  "use strict";

  var H = window.HEMISFERIO || {};
  var C = H.config || window.HEMISFERIO_CONFIG || {};
  var micaCfg = C.mica || {};
  if (micaCfg.activa === false) return;

  var contacto = C.contacto || {};
  var pro = C.profesional || {};
  var secciones = C.secciones || {};
  var el = H.el;
  var has = H.has;

  var root = document.getElementById("mica");
  if (!root || !el) return;
  var log = root.querySelector("[data-mica-log]");
  var quick = root.querySelector("[data-mica-quick]");
  var form = root.querySelector("[data-mica-form]");
  var input = root.querySelector("[data-mica-input]");
  var launcher = document.querySelector(".mica-launcher");
  var floaters = document.querySelector("[data-floaters]");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var LIC = "la Lic. " + (pro.nombre ? pro.nombre.split(" ").slice(0, 2).join(" ") : "a cargo");
  var TEL = contacto.telefono || "";
  var EMERG = micaCfg.telefonoEmergencias || "106";

  /* ---------- Áreas ---------- */
  var AREAS = {
    neuro: {
      label: "Rehabilitación neurológica",
      text: "Es nuestra área principal. La valoración y el tratamiento se apoyan en el Concepto Bobath y buscan favorecer el control postural, el equilibrio, la coordinación y la funcionalidad."
    },
    pedia: {
      label: "Fisioterapia pediátrica",
      text: "Acompañamos el desarrollo motor y la participación del niño, junto a su familia, con estrategias individualizadas."
    },
    neuroPedia: {
      label: "Rehabilitación neurológica pediátrica",
      text: "Unimos el enfoque neurológico con la atención pediátrica, siempre junto a la familia."
    },
    orto: {
      label: "Rehabilitación ortopédica",
      text: "Trabajamos movilidad, fuerza, control y desempeño en las actividades diarias, después de una lesión, una cirugía o con dolor musculoesquelético."
    },
    onco: {
      label: "Rehabilitación oncológica",
      text: "Acompañamos a la persona durante o después de un proceso oncológico, cuidando su movilidad, funcionalidad y calidad de vida."
    },
    pelvic: {
      label: "Rehabilitación de suelo pélvico",
      text: "Atención fisioterapéutica individualizada para alteraciones funcionales del suelo pélvico."
    },
    cardio: {
      label: "Rehabilitación después de un evento cardíaco",
      text: "La licenciada tiene experiencia en el área cardiorrespiratoria y acompaña la recuperación de movilidad, fuerza, resistencia e independencia, siempre según las indicaciones del médico tratante."
    },
    general: {
      label: "Evaluación inicial",
      text: "En la evaluación inicial la licenciada conocerá tu caso y definirá contigo el enfoque más adecuado."
    }
  };

  var KW = {
    neuro: ["paralisis facial", "facial", " bell ", "acv", "derrame", "infarto cerebral", "ictus", "isquemi", "hemipleji", "hemipares", "paralisis", "parkinson", "esclerosis", "lesion medular", "medula", "parapleji", "cuadripleji", "tetrapleji", "traumatismo craneo", "tec ", "golpe en la cabeza", "equilibrio", "me caigo", "caidas", "marcha", "caminar", "camina", "temblor", "coordinacion", "neurolog", "neuropatia", "guillain", "ataxia", "espastic", "rigidez", "aneurisma", "tumor cerebral", "distonia", "neuron", "mielitis"],
    pedia: ["pie equino", "pie zambo", "pies torcidos", "pie torcido", "metatarso", "talo valgo", "pies chuecos", "nacio con", "al nacer", "nino", "nina", "bebe", "hijo", "hija", "nieto", "nieta", "infant", "gatea", "gatear", "desarrollo motor", "retraso", "sindrome de down", "tea ", "autismo", "prematuro", "tortícolis", "torticolis", "pie plano", "escoliosis infantil", "sobrino", "sobrina"],
    onco: ["cancer", "oncolog", "quimio", "radioterapia", "mastectom", "linfedema", "tumor", "metasta", "leucemia", "linfoma"],
    orto: ["dolor", "rodilla", "hombro", "cadera", "columna", "lumbar", "espalda", "cuello", "cervical", "esguince", "fractura", "operacion", "operaron", "cirugia", "protesis", "tendin", "ligamento", "menisco", "deport", "contractura", "hernia", "ciatica", "ciatico", "tobillo", "muneca", "codo", "pie ", "mano", "artrosis", "artritis", "lesion", "luxacion", "manguito", "fascitis", "postura"],
    pediaProb: ["pie equino", "pie zambo", "pies torcidos", "pie torcido", "metatarso", "talo valgo", "pies chuecos", "nacio con", "desarrollo motor", "no gatea", "no camina", "retraso", "sindrome de down", "prematuro", "torticolis"],
    cardio: ["paro cardiaco", "paro cardio", "infarto al corazon", "infarto de miocardio", "infarto cardiaco", "cardiac", "corazon", "bypass", "marcapaso", "reanimacion", "fibrilacion", "insuficiencia cardiaca", " uci ", "intubad", "ventilador"],
    pelvic: ["suelo pelvico", "piso pelvico", "incontinencia", "perdida de orina", "escape de orina", "se me escapa la orina", "prolapso", "postparto", "posparto", "diastasis"]
  };

  var EMERGENCY = [
    /(de repente|de golpe|subitamente|subito|repentin|hace (unos )?minutos|hace (una|1|unas|pocas) horas?|ahorita|en este momento).{0,60}(no (puede|puedo) hablar|habla raro|habla mal|boca|cara|torcid|debilidad|no (puede|puedo) mover|adormec|se le durmio|se me durmio|paraliz|perdio la fuerza|perdi la fuerza|no ve|vision)/,
    /(boca torcida|cara caida|cara torcida).{0,60}(de repente|hoy|ahora|ahorita)/,
    /(dolor (en el|de|al) pecho|dolor toracico|opresion en el pecho)/,
    /(no (puede|puedo) respirar|me falta el aire|le falta el aire|me ahogo|se ahoga)/,
    /(convulsi|perdio el conocimiento|perdi el conocimiento|se desmayo|me desmaye|inconsciente)/,
    /(sangrado abundante|hemorragia)/,
    /(golpe|caida).{0,40}cabeza.{0,60}(vomit|somnolien|confus|no despierta)/,
    /(no (puedo|puede) orinar|perdi el control de (la orina|los esfinteres)|perdio el control de (la orina|los esfinteres))/
  ];
  var CRISIS = /(me quiero morir|quiero morirme|suicid|quitarme la vida|hacerme dano|no quiero vivir)/;

  /* ---------- Utilidades ---------- */
  function norm(s) {
    return (" " + String(s || "").toLowerCase() + " ")
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[¿?¡!.,;:()"]/g, " ").replace(/\s+/g, " ");
  }
  function hit(t, list) { for (var i = 0; i < list.length; i++) if (t.indexOf(list[i]) > -1) return true; return false; }

  function classify(text, who) {
    var t = norm(text);
    var isChild = who === "nino" || hit(t, KW.pedia);
    if (hit(t, KW.pelvic)) return secciones.sueloPelvico ? "pelvic" : "general";
    if (hit(t, KW.onco)) return "onco";
    if (hit(t, KW.cardio) && !isChild) return "cardio";
    if (hit(t, KW.neuro)) return isChild ? "neuroPedia" : "neuro";
    if (isChild) return "pedia";
    if (hit(t, KW.orto)) return "orto";
    return "general";
  }
  function looksLikeProblem(t) {
    return hit(t, KW.neuro) || hit(t, KW.onco) || hit(t, KW.orto) || hit(t, KW.pelvic) || hit(t, KW.cardio) || hit(t, KW.pediaProb) ||
      /(me duele|molestia|no puedo|dificultad|me cuesta|rehabilit|terapia|fisioterap|diagnostic)/.test(t);
  }

  /* ---------- Estado ---------- */
  var state;
  function reset() { state = { step: "idle", data: {} }; }
  reset();

  /* ---------- Render ---------- */
  function scroll() { log.scrollTop = log.scrollHeight; }

  function bubble(who) {
    var b = el("div", { "class": "msg msg-" + who });
    log.appendChild(b);
    return b;
  }

  function renderParts(b, parts) {
    (Array.isArray(parts) ? parts : [parts]).forEach(function (p) {
      if (typeof p === "string") { b.appendChild(el("p", null, p)); return; }
      if (p.list) {
        var ul = el("ul");
        p.list.forEach(function (li) {
          var item = el("li");
          if (Array.isArray(li)) { item.appendChild(el("strong", null, li[0])); item.appendChild(document.createTextNode(" " + li[1])); }
          else item.textContent = li;
          ul.appendChild(item);
        });
        b.appendChild(ul);
      }
      if (p.actions) {
        var wrap = el("div", { "class": "msg-actions" });
        p.actions.forEach(function (a) {
          var node;
          if (a.href) {
            node = el("a", { href: a.href, "class": "msg-btn" + (a.primary ? " is-primary" : "") }, a.label);
            if (/^https?:/.test(a.href)) { node.target = "_blank"; node.rel = "noopener"; }
          } else {
            node = el("button", { type: "button", "class": "msg-btn" + (a.primary ? " is-primary" : "") }, a.label);
            node.addEventListener("click", a.onClick);
          }
          wrap.appendChild(node);
        });
        b.appendChild(wrap);
      }
      if (p.note) b.appendChild(el("p", { "class": "msg-note" }, p.note));
    });
  }

  var queue = Promise.resolve();
  function bot(parts, replies) {
    queue = queue.then(function () {
      return new Promise(function (resolve) {
        setQuick([]);
        var typing = bubble("bot");
        typing.classList.add("is-typing");
        typing.setAttribute("aria-hidden", "true");
        typing.appendChild(el("span")); typing.appendChild(el("span")); typing.appendChild(el("span"));
        scroll();
        setTimeout(function () {
          typing.remove();
          var b = bubble("bot");
          renderParts(b, parts);
          scroll();
          if (replies) setQuick(replies);
          resolve();
        }, reduce ? 0 : 420);
      });
    });
    return queue;
  }

  function user(text) {
    var b = bubble("user");
    b.appendChild(el("p", null, text));
    scroll();
  }

  function setQuick(list) {
    quick.innerHTML = "";
    (list || []).forEach(function (label) {
      var b = el("button", { type: "button", "class": "chip" }, label);
      b.addEventListener("click", function () { send(label); });
      quick.appendChild(b);
    });
    quick.hidden = !list || !list.length;
  }

  /* ---------- Contenidos ---------- */
  var MENU = ["Quiero agendar una evaluación", "Tengo una molestia o dificultad", "¿Qué áreas atienden?", "Ubicación y horarios", "Costos"];

  function contactActions(msg) {
    var acts = [];
    if (H.hasWa) acts.push({ label: "Agendar por WhatsApp", href: H.waLink(msg), primary: true });
    if (TEL) acts.push({ label: "Llamar al " + TEL, href: "tel:" + (contacto.telefonoMarcado || TEL.replace(/\s/g, "")) });
    return acts;
  }

  function greet() {
    bot([
      "¡Hola! Soy Micaela, la asistente virtual de HEMISFERIO, pero puedes decirme Mica.",
      "Estoy aquí para escucharte, orientarte y ayudarte a agendar una evaluación con " + LIC + ". ¿En qué te puedo ayudar?"
    ], MENU);
  }

  function emergency() {
    bot([
      "Lo que describes podría necesitar atención médica urgente.",
      "Por favor, acude ahora al servicio de emergencias más cercano o llama al SAMU " + EMERG + ". Si la persona está sola, pide ayuda a alguien cercano.",
      { note: "La terapia física no reemplaza la atención de emergencia. Cuando la situación esté controlada, aquí estaremos para acompañar la recuperación." }
    ], ["Continuar con mi consulta", "Volver al inicio"]);
  }

  function crisis() {
    bot([
      "Siento mucho que estés pasando por algo tan difícil. No estás sola ni solo.",
      "Puedes llamar gratis a la Línea 113, opción 5, de salud mental, a cualquier hora. Si sientes que estás en peligro, acude a emergencias o llama al SAMU " + EMERG + ".",
      "Si quieres, también puedes hablar con alguien de confianza ahora mismo."
    ], ["Volver al inicio"]);
  }

  function services() {
    var list = [
      [AREAS.neuro.label + ":", "nuestra área principal, con formación en Concepto Bobath."],
      [AREAS.orto.label + ":", "lesiones, cirugías y dolor musculoesquelético."],
      [AREAS.pedia.label + ":", "desarrollo motor y participación del niño, con su familia."],
      [AREAS.onco.label + ":", "durante o después de un proceso oncológico."]
    ];
    if (secciones.sueloPelvico) list.push([AREAS.pelvic.label + ":", "alteraciones funcionales del suelo pélvico."]);
    bot(["Estas son nuestras áreas de atención:", { list: list }, "¿Quieres que te ayude a ver cuál corresponde a tu caso?"],
      ["Sí, ayúdame a elegir", "Quiero agendar una evaluación", "Volver al inicio"]);
  }

  function whereWhen() {
    var parts = [];
    if (has(contacto.direccion)) {
      parts.push("Te atendemos en " + contacto.direccion + (contacto.distrito ? ", " + contacto.distrito : "") + ".");
    }
    if (has(contacto.horario)) {
      parts.push("Nuestro horario:");
      parts.push({ list: contacto.horario });
    } else {
      parts.push("El día y la hora de tu evaluación se coordinan directamente con " + LIC + ", según su disponibilidad.");
    }
    var acts = [];
    if (H.safeUrl(contacto.mapsUrl)) acts.push({ label: "Ver en el mapa", href: contacto.mapsUrl });
    acts = acts.concat(contactActions());
    parts.push({ actions: acts });
    bot(parts, ["Quiero agendar una evaluación", "Tengo otra pregunta"]);
  }

  function prices() {
    bot([
      "Los costos dependen del tipo de evaluación y del plan de atención que se defina para cada persona.",
      "Para darte información exacta, " + LIC + " te los confirma por WhatsApp o por teléfono" + (TEL ? " al " + TEL : "") + ".",
      { actions: contactActions("Hola, quisiera información sobre los costos de la evaluación en HEMISFERIO.") }
    ], ["Ayúdame a preparar mi solicitud", "Tengo otra pregunta"]);
  }

  function aboutPro() {
    bot([
      "Te atiende " + (pro.tratamiento ? pro.tratamiento + " " : "") + (pro.nombre || "nuestra directora") + ", directora de HEMISFERIO y licenciada tecnóloga médica en Terapia Física y Rehabilitación" + (pro.registroProfesional ? " (" + pro.registroProfesional.replace("Colegio Tecnólogo Médico del Perú · ", "") + ")" : "") + ".",
      "Su práctica se enfoca en la rehabilitación neurológica, con formación básica y avanzada en Concepto Bobath" +
        (pro.aniosExperiencia ? ", y cuenta con " + pro.aniosExperiencia + " años de experiencia profesional." : "."),
      "¿Te gustaría agendar una evaluación con ella?"
    ], ["Sí, quiero agendar", "Tengo otra pregunta"]);
  }

  function homeVisit() {
    var mods = (contacto.modalidades || []).join(" ").toLowerCase();
    if (mods.indexOf("domicilio") > -1) {
      bot(["Sí, contamos con atención a domicilio. Escríbenos para coordinar la zona y el horario.", { actions: contactActions("Hola, quisiera información sobre la atención a domicilio.") }], ["Tengo otra pregunta"]);
    } else {
      bot(["La atención se realiza en nuestra sede de San Miguel. Si necesitas otra modalidad, consúltalo por WhatsApp y " + LIC + " te dirá si es posible en tu caso.",
        { actions: contactActions("Hola, quisiera consultar si es posible la atención a domicilio.") }], ["Tengo otra pregunta"]);
    }
  }

  function insurance() {
    bot(["Para consultas sobre seguros, EPS, comprobantes o formas de pago, escríbenos y te respondemos directamente.",
      { actions: contactActions("Hola, tengo una consulta sobre seguros o formas de pago.") }], ["Tengo otra pregunta"]);
  }

  function claims() {
    var acts = [{ label: "Abrir el Libro de Reclamaciones", onClick: function () { close(); if (window.HEMISFERIO.openLibro) window.HEMISFERIO.openLibro(); } }];
    bot(["Lamento que hayas tenido una mala experiencia. Puedes registrar tu reclamo en nuestro Libro de Reclamaciones en Salud virtual; recibirás una respuesta en un plazo máximo de " + ((C.legal || {}).plazoRespuestaDias || 30) + " días hábiles.", { actions: acts }], ["Volver al inicio"]);
  }

  /* ---------- Orientación (triage) ---------- */
  var WHO = { "Para mí": "yo", "Para un familiar": "familiar", "Para un niño o niña": "nino" };
  var WHO_LABEL = { yo: "para mí", familiar: "para un familiar", nino: "para un niño o niña" };
  var WHO_SHORT = { yo: "yo mismo(a)", familiar: "un familiar", nino: "un niño o niña" };
  function clean(t) { return String(t).trim().replace(/^(hola|buenas( tardes| noches| dias)?|buenos dias|buen dia)[\s,!.]+/i, "").replace(/^\w/, function (c) { return c.toUpperCase(); }); }
  var TIMES = ["Menos de 1 mes", "Entre 1 y 6 meses", "Más de 6 meses", "Desde el nacimiento o la infancia"];

  function startTriage() {
    state.step = "who";
    bot("Con gusto te ayudo. Primero, ¿la evaluación es para ti o para otra persona?", Object.keys(WHO));
  }

  function askProblem() {
    state.step = "problem";
    var w = state.data.who;
    var q = w === "nino"
      ? "Gracias. Cuéntame con tus palabras qué observas en el niño o la niña: qué se le dificulta, qué te preocupa o si tiene algún diagnóstico."
      : w === "familiar"
        ? "Gracias. Cuéntame qué le está pasando a tu familiar: qué se le dificulta, si tiene dolor o algún diagnóstico."
        : "Gracias. Cuéntame con tus palabras qué te está pasando: qué te molesta, qué actividades se te dificultan o qué diagnóstico te dieron.";
    bot(q);
  }

  function askTime() {
    state.step = "time";
    bot("Entiendo. ¿Desde hace cuánto tiempo ocurre?", TIMES);
  }

  function askGoal() {
    state.step = "goal";
    var w = state.data.who;
    bot(w === "yo"
      ? "¿Qué te gustaría lograr o volver a hacer? Por ejemplo: caminar con más seguridad, trabajar sin dolor o recuperar el uso del brazo."
      : "¿Qué les gustaría lograr? Por ejemplo: que camine con más seguridad, gane independencia o participe más en sus actividades.",
      ["Prefiero conversarlo en la evaluación"]);
  }

  function askName() {
    state.step = "name";
    bot("Ya casi terminamos. ¿Cómo te llamas? Así " + LIC + " sabrá con quién conversa.");
  }

  function finish() {
    state.step = "done";
    var d = state.data;
    var area = AREAS[d.area || "general"];
    var lines = [
      "Hola, soy " + d.name + ". Quisiera agendar una evaluación en HEMISFERIO.",
      "- Paciente: " + WHO_SHORT[d.who || "yo"],
      "- Motivo: " + d.problem
    ];
    if (d.time) lines.push("- Tiempo: " + d.time.toLowerCase());
    if (d.goal) lines.push("- Objetivo: " + d.goal);
    lines.push("- Área sugerida por Mica: " + area.label);
    var msg = lines.join("\n");

    var summary = [["Paciente:", WHO_SHORT[d.who || "yo"]], ["Motivo:", d.problem]];
    if (d.time) summary.push(["Tiempo:", d.time.toLowerCase()]);
    if (d.goal) summary.push(["Objetivo:", d.goal]);

    var parts = [
      "Gracias por contarme, " + d.name + ". Esto es lo que entendí:",
      { list: summary }
    ];
    if (d.area && d.area !== "general") {
      parts.push("Por lo que describes, tu caso podría corresponder a " + area.label.toLowerCase() + ". " + area.text);
      parts.push("La licenciada lo confirmará en la evaluación inicial, donde conocerá tu historia y definirán juntos los objetivos.");
    } else {
      parts.push(area.text);
    }
    if (d.pelvicNote) parts.push("Sobre lo que mencionas, " + LIC + " podrá orientarte en la evaluación sobre el tipo de atención que corresponde.");
    parts.push("Te recomiendo agendar una evaluación con " + LIC + ". Puedes enviarle este resumen por WhatsApp con un solo toque.");
    parts.push({ actions: contactActions(msg) });
    parts.push({ note: "Esta orientación no es un diagnóstico. La evaluación profesional definirá el plan adecuado." });
    bot(parts, ["Tengo otra pregunta", "Empezar de nuevo"]);
  }

  /* ---------- Intenciones en texto libre ---------- */
  function intent(t) {
    if (/(libro de reclamaciones|reclamo|queja|reclamar|denuncia)/.test(t)) return "claims";
    if (/(precio|costo|cuanto cuesta|cuanto (es|sale|cobran|vale)|tarifa|valor de la)/.test(t)) return "prices";
    if (/(horario|que hora|a que hora|atienden los|dias de atencion|abren|cierran)/.test(t)) return "location";
    if (/(direccion|donde (estan|queda|quedan|atienden)|ubicacion|ubicados|como llego|mapa|sede)/.test(t)) return "location";
    if (/(domicilio|a casa|en casa|visita)/.test(t)) return "home";
    if (/(seguro|eps|essalud|sis |pago|yape|plin|tarjeta|factura|boleta)/.test(t)) return "insurance";
    if (/(licenciada|terapeuta|quien atiende|profesional|especialista|mercedes)/.test(t)) return "pro";
    if (/(areas|servicios|que atienden|que tratan|especialidades|tratamientos)/.test(t)) return "services";
    if (/(agendar|cita|reservar|separar|turno|evaluacion|quiero (una )?terapia|ayudame a (elegir|preparar))/.test(t)) return "triage";
    if (/(hablar con|una persona|humano|llamar|telefono|numero|whatsapp|contacto|correo)/.test(t)) return "human";
    if (/(gracias|muy amable|genial|perfecto)/.test(t)) return "thanks";
    if (/^ ?(hola|buenas|buenos dias|buenas tardes|buenas noches|hey|que tal) ?$/.test(t)) return "hello";
    if (/(adios|chau|hasta luego)/.test(t)) return "bye";
    return null;
  }

  function handleFree(text) {
    var t = norm(text);
    var it = intent(t);
    var infoOnly = ["claims", "prices", "location", "insurance", "home", "pro"];
    if (looksLikeProblem(t) && infoOnly.indexOf(it) === -1) {
      state.data.problem = clean(text).slice(0, 400);
      state.data.area = classify(text, null);
      state.data.pelvicNote = hit(t, KW.pelvic) && !secciones.sueloPelvico;
      state.step = "who";
      bot("Gracias por contarme. Para orientarte mejor, ¿la evaluación es para ti o para otra persona?", Object.keys(WHO));
      return;
    }
    switch (it) {
      case "claims": return claims();
      case "prices": return prices();
      case "location": return whereWhen();
      case "home": return homeVisit();
      case "insurance": return insurance();
      case "pro": return aboutPro();
      case "services": return services();
      case "triage": return startTriage();
      case "human":
        return bot(["Claro. Puedes comunicarte directamente con nosotros:" + (TEL ? " WhatsApp y teléfono " + TEL : "") + (contacto.correo ? ", correo " + contacto.correo : "") + ".", { actions: contactActions() }], ["Tengo otra pregunta"]);
      case "thanks": return bot("¡Con mucho gusto! Si necesitas algo más, aquí estoy.", ["Tengo otra pregunta", "Quiero agendar una evaluación"]);
      case "hello": return bot("¡Hola! ¿En qué te puedo ayudar hoy?", MENU);
      case "bye": return bot("¡Gracias por escribirnos! Te deseamos un buen día. Si necesitas algo, vuelve cuando quieras.");
    }
    bot("Gracias por escribirme. Para ayudarte mejor, ¿me cuentas qué dificultad o molestia tienes, o eliges una de estas opciones?", MENU);
  }

  /* ---------- Entrada del usuario ---------- */
  function send(raw) {
    var text = String(raw || "").trim();
    if (!text) return;
    user(text);
    var t = norm(text);

    if (CRISIS.test(t)) return crisis();
    if (EMERGENCY.some(function (r) { return r.test(t); })) return emergency();

    /* Respuestas rápidas globales */
    if (text === "Volver al inicio" || text === "Empezar de nuevo") { reset(); return bot("¡Claro! ¿En qué más te puedo ayudar?", MENU); }
    if (text === "Tengo otra pregunta") { state.step = "idle"; return bot("Cuéntame, ¿qué más quieres saber?", MENU); }
    if (text === "Continuar con mi consulta") { return resume(); }
    if (text === "Quiero agendar una evaluación" || text === "Tengo una molestia o dificultad" || text === "Sí, ayúdame a elegir" || text === "Sí, quiero agendar" || text === "Ayúdame a preparar mi solicitud") { state.data = {}; return startTriage(); }
    if (text === "¿Qué áreas atienden?") return services();
    if (text === "Ubicación y horarios") return whereWhen();
    if (text === "Costos") return prices();

    switch (state.step) {
      case "who": {
        var w = WHO[text];
        if (!w) {
          if (/(hijo|hija|nino|nina|bebe|nieto|nieta|sobrin)/.test(t)) w = "nino";
          else if (/(mama|papa|madre|padre|abuel|espos|herman|famil|tio|tia|pareja|suegr)/.test(t)) w = "familiar";
          else if (/(mi |yo|para mi)/.test(t)) w = "yo";
        }
        if (!w) return bot("Disculpa, no te entendí bien. ¿La evaluación es para ti o para otra persona?", Object.keys(WHO));
        state.data.who = w;
        if (state.data.problem) { state.data.area = classify(state.data.problem, w); return askTime(); }
        return askProblem();
      }
      case "problem": {
        if (text.length < 4 || /^ ?(no se|nada) ?$/.test(t)) return bot("No te preocupes si no sabes el nombre exacto. Cuéntame qué se te dificulta en el día a día, por ejemplo: caminar, subir escaleras, mover el brazo o mantener el equilibrio.");
        state.data.problem = clean(text).slice(0, 400);
        state.data.area = classify(text, state.data.who);
        state.data.pelvicNote = hit(t, KW.pelvic) && !secciones.sueloPelvico;
        return askTime();
      }
      case "time":
        state.data.time = text.slice(0, 60);
        return askGoal();
      case "goal":
        state.data.goal = /prefiero/.test(t) ? "" : text.slice(0, 200);
        return askName();
      case "name": {
        var name = text.replace(/^(soy|me llamo|mi nombre es)\s+/i, "").slice(0, 40);
        state.data.name = name.charAt(0).toUpperCase() + name.slice(1);
        return finish();
      }
      default:
        return handleFree(text);
    }
  }

  function resume() {
    switch (state.step) {
      case "who": return bot("Sigamos. ¿La evaluación es para ti o para otra persona?", Object.keys(WHO));
      case "problem": return askProblem();
      case "time": return askTime();
      case "goal": return askGoal();
      case "name": return askName();
      default: return bot("Sigamos. ¿En qué te puedo ayudar?", MENU);
    }
  }

  /* ---------- Abrir y cerrar ---------- */
  var started = false;
  var lastFocus = null;
  function open() {
    lastFocus = document.activeElement;
    root.hidden = false;
    document.body.classList.add("mica-open");
    if (launcher) launcher.setAttribute("aria-expanded", "true");
    if (!started) { started = true; greet(); }
    setTimeout(function () { input.focus({ preventScroll: true }); }, 50);
  }
  function close() {
    root.hidden = true;
    document.body.classList.remove("mica-open");
    if (launcher) launcher.setAttribute("aria-expanded", "false");
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  H.openMica = open;

  document.querySelectorAll("[data-mica-open]").forEach(function (b) {
    b.addEventListener("click", function () { root.hidden ? open() : close(); });
  });
  root.querySelector("[data-mica-close]").addEventListener("click", close);
  root.querySelector("[data-mica-restart]").addEventListener("click", function () {
    log.innerHTML = ""; reset(); greet(); input.focus();
  });
  root.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = input.value;
    input.value = "";
    send(v);
  });

  if (launcher) launcher.hidden = false;
  if (floaters) document.body.classList.add("has-floaters");
  if (window.location.hash === "#mica") open();
})();
