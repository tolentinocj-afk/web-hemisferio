/* =========================================================================
   Mica · Base de conocimiento editable
   -------------------------------------------------------------------------
   Aquí se corrigen las respuestas de Mica sin tocar el resto del código.
   Reglas: no prometer resultados, no dar diagnósticos, no inventar precios,
   horarios ni requisitos. Si un dato no está confirmado, derivar a WhatsApp.

   {lic}  se reemplaza por "la Lic. María Mercedes"
   {tel}  se reemplaza por el teléfono de contacto
   ========================================================================= */

window.MICA_CONOCIMIENTO = {

  costos: [
    "Los costos dependen del tipo de evaluación y del plan de atención que se defina para cada persona.",
    "Para darte información exacta, {lic} te los confirma por WhatsApp o por teléfono al {tel}."
  ],

  seguros: [
    "Para consultas sobre seguros, EPS, comprobantes o formas de pago, escríbenos y te respondemos directamente."
  ],

  domicilioSi: [
    "Sí, contamos con atención a domicilio. Escríbenos para coordinar la zona y el horario."
  ],
  domicilioNo: [
    "La atención se realiza en nuestra sede de San Miguel. Si necesitas otra modalidad, consúltalo por WhatsApp y {lic} te dirá si es posible en tu caso."
  ],

  horarioSinDatos: [
    "El día y la hora de tu evaluación se coordinan directamente con {lic}, según su disponibilidad."
  ],

  consentimiento: [
    "Ya casi terminamos. Para preparar tu mensaje necesito tu nombre.",
    "No guardamos esta conversación. Tus datos solo llegan a HEMISFERIO si tú decides enviar el mensaje por WhatsApp."
  ],

  datoSensible: [
    "Por tu seguridad oculté un dato que parece una contraseña, una clave o un número de tarjeta.",
    "No compartas ese tipo de información por este medio. Nunca te la pediremos."
  ],

  /* Preguntas frecuentes adicionales.
     Mica las revisa antes que sus respuestas generales.
     claves: palabras sin tildes y en minúsculas que activan la respuesta.
     Ejemplo (activar solo con datos confirmados):
     { claves: ["orden medica", "referencia"],
       respuesta: ["No necesitas orden médica para la evaluación inicial."] } */
  preguntas: []
};
