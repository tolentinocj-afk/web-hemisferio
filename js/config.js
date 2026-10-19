/* =========================================================================
   HEMISFERIO · Configuración editable del sitio
   -------------------------------------------------------------------------
   Todo campo vacío ("") se oculta automáticamente: el público nunca verá
   campos en blanco ni avisos de "pendiente".
   Para revisar qué datos faltan, abra la página con #revision al final.
   ========================================================================= */

window.HEMISFERIO_CONFIG = {

  contacto: {
    /* WhatsApp con código de país, solo dígitos */
    whatsapp: "51958667928",
    mensajeWhatsapp: "Hola, quisiera agendar una evaluación en HEMISFERIO.",

    telefono: "958 667 928",             // Se muestra tal cual
    telefonoMarcado: "+51958667928",     // Para el enlace tel:
    correo: "Hemisferiorehab@gmail.com",

    /* Sede de atención (confirmada como igual al domicilio fiscal) */
    direccion: "Av. La Paz 1150",
    distrito: "San Miguel, Lima",
    referencia: "",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Av.%20La%20Paz%201150%2C%20San%20Miguel%2C%20Lima%2C%20Per%C3%BA",

    /* Horarios: una línea por bloque. Ejemplo: ["Lunes a viernes: 8:00 a 20:00"] */
    horario: [],

    /* Modalidades confirmadas. Ejemplo: ["Atención en sede", "Atención a domicilio"] */
    modalidades: []
  },

  redes: {
    instagram: "",
    facebook: "",
    tiktok: ""
  },

  profesional: {
    nombre: "María Mercedes Tolentino Bejar",
    tratamiento: "Mg. Lic.",
    registroProfesional: "CTMP N.° 19389",   // Colegio Tecnólogo Médico del Perú
    aniosExperiencia: 7,            // Experiencia de la profesional, no del centro
    fotoRetrato: "assets/img/maria-mercedes-tolentino-bejar.jpg",
    entidadHombro: ""               // Precisar con el certificado (manual 1.2)
  },

  secciones: {
    sueloPelvico: false             // Mantener en false hasta confirmar alcance
  },

  /* Casos que acompañamos: resultados reales (opcional).
     Completar SOLO con casos documentados y con autorización escrita del
     paciente o de su representante legal (Ley N.° 29733: los datos de salud
     son datos sensibles). Usar datos anonimizados: edad o rango, sin nombre.
     Ejemplo:
       acv: { paciente: "Varón de 62 años", duracion: "4 meses de terapia",
              resultado: "Pasó de caminar con andador a caminar dentro de casa sin ayuda.",
              autorizado: true } */
  casos: {
    acv:      { paciente: "", duracion: "", resultado: "", autorizado: false },
    facial:   { paciente: "", duracion: "", resultado: "", autorizado: false },
    cardiaco: { paciente: "", duracion: "", resultado: "", autorizado: false },
    pies:     { paciente: "", duracion: "", resultado: "", autorizado: false }
  },

  /* Asistente virtual */
  mica: {
    activa: true,
    /* SAMU (atención prehospitalaria de emergencia, Perú) */
    telefonoEmergencias: "106"
  },

  legal: {
    razonSocial: "Centro de Rehabilitación Física Hemisferio S.A.C.",
    ruc: "",                        // RUC de la sociedad
    codigoRenipress: "",            // Código de la IPRESS en RENIPRESS (SUSALUD)
    domicilioFiscal: "Av. La Paz 1150, San Miguel, Lima",
    correoReclamos: "Hemisferiorehab@gmail.com",

    /* Libro de Reclamaciones en Salud (D.S. N.° 002-2019-SA).
       URL del servicio que registra la hoja, asigna el correlativo y envía la
       copia al correo del reclamante. Ver apps-script/LibroReclamaciones.gs.
       Mientras esté vacío, la hoja se genera en pantalla con un código
       provisional y se ofrece enviarla por correo al centro. */
    libroEndpoint: "",
    plazoRespuestaDias: 30,

    politicaPrivacidadUrl: "politica-de-privacidad/"
  },

  /* Sitio: URL pública y fecha de la última revisión de contenidos.
     Cambiar url al contratar el dominio propio (y actualizar sitemap.xml,
     robots.txt, llms.txt y el bloque JSON-LD de index.html). */
  sitio: {
    url: "https://tolentinocj-afk.github.io/web-hemisferio/",
    revision: "2026-10-19"
  },

  modoRevision: false
};
