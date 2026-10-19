# HEMISFERIO · Sitio web v5

Sitio estático (HTML, CSS y JavaScript, sin dependencias). Se publica en cualquier hosting estático (Netlify, Vercel, GitHub Pages, cPanel).

## Estructura

```
index.html                       Página
css/styles.css                   Estilos (paleta y tipografía del Manual de marca 1.2)
js/config.js                     DATOS EDITABLES (contacto, profesional, legal, Mica)
js/main.js                       WhatsApp, contacto, menú, secciones activables
js/mica.js                       Asistente virtual Mica
js/libro.js                      Libro de Reclamaciones en Salud virtual
apps-script/LibroReclamaciones.gs  Servicio gratuito (Google) que registra los reclamos
assets/img/                      Logo maestro, fotografías y retrato
assets/fonts/                    DejaVu Sans (woff2) + licencia
build_preview.py                 Genera dist/hemisferio-vista-previa.html (un solo archivo)
```

Revisión interna de datos faltantes: abrir `index.html#revision`.

## Cambios de la versión 5

- Franja en movimiento con las cuatro especialidades (se detiene al pasar el cursor y queda fija si la persona reduce animaciones en su sistema).
- WhatsApp y Mica se alternan cada 5 segundos en la misma posición; la alternancia se detiene al pasar el cursor, al enfocar con teclado o con Mica abierta.
- Botón de modo claro y oscuro en el encabezado. La elección se recuerda en el navegador; si no hay elección, sigue la preferencia del sistema.
- Formación de la directora: Universidad Privada Norbert Wiener (título) y Universidad Nacional Mayor de San Marcos (maestría). Actualizado también en Mica, JSON-LD y llms.txt.
- Casos narrados con nombre (Rosa, Jorge, Luis y Mateo), marcados como casos ilustrativos con nombres referenciales. Reemplazar por casos reales solo con autorización escrita.
- El menú pasa a modo celular por debajo de 1280 px para que el encabezado no se desborde.

## Cambios de la versión 4

Técnico:
- Política de privacidad en `politica-de-privacidad/` (Ley N.° 29733), enlazada desde el pie, Mica y el Libro de Reclamaciones.
- Datos estructurados JSON-LD en `index.html`: centro (Physiotherapy), directora con CTMP N.° 19389, sitio y página.
- `robots.txt` (permite buscadores con IA), `sitemap.xml`, `llms.txt`, `manifest.webmanifest`, `.nojekyll`.
- Ícono provisional del navegador recortado del símbolo del logo (`assets/img/favicon-32.png`, `icono-*.png`). Reemplazar por el isotipo oficial cuando exista.
- Fecha de revisión visible en el pie (`sitio.revision` en `js/config.js`).
- La URL pública está fijada en `https://tolentinocj-afk.github.io/web-hemisferio/`. Al contratar dominio, cambiarla en `js/config.js`, `index.html` (canonical, og y JSON-LD), `politica-de-privacidad/index.html`, `robots.txt`, `sitemap.xml` y `llms.txt`.

Mica:
- Pide consentimiento antes del nombre y permite continuar sin darlo.
- Oculta contraseñas, claves y números de tarjeta antes de mostrarlos y no procesa ese mensaje.
- Respuestas editables en `js/mica-conocimiento.js`, con un espacio `preguntas` para preguntas frecuentes reales.

Diseño:
- Portada con 4 elementos (logo, lema, texto y botones); el botón principal entra en la primera pantalla desde 1280 × 720.
- Franja de respaldo profesional bajo la portada (Bobath, CTMP, maestría, sede).
- Propósito como declaración sin foto, para no repetir tres bloques seguidos de foto y texto.
- Etiquetas pequeñas sobre títulos reducidas de 8 a 2; encabezados apilados en Cómo trabajamos y Casos.
- Íconos de la librería Tabler Icons (licencia MIT) en lugar de dibujos propios; sin puntos decorativos.
- Áreas complementarias en mosaico con foto y fondos diferenciados.

## Cambios de la versión 3

- Logo nuevo con el descriptor "Terapia física y rehabilitación especializada" (sustituye "Centro especializado en rehabilitación física"; el manual 1.2 debe actualizarse a una versión 1.3).
- Sección "Casos que acompañamos": ACV, parálisis facial, paro cardíaco y alteraciones congénitas de los pies. Describe el punto de partida, el trabajo y los objetivos, sin atribuir resultados. Los resultados reales se agregan en `casos` de `js/config.js`, solo con autorización escrita y datos anonimizados.
- Bloque de la directora: "Directora de HEMISFERIO", Mg. Lic. María Mercedes Tolentino Bejar, CTMP N.° 19389 (Colegio Tecnólogo Médico del Perú).
- Mica se presenta como Micaela, con carita feliz junto a su ícono, y reconoce consultas sobre parálisis facial, paro cardíaco y pies al nacer.
- Botón de WhatsApp con el número visible.

## Cambios de la versión 2

- Manual 1.2: logo maestro (archivo completo con su fondo, a 600 px en portada y pie), descriptor oficial "Centro especializado en rehabilitación física" y retiro del símbolo simplificado anterior.
- Fotografías nuevas y retrato de la Mg. Lic. María Mercedes Tolentino Bejar.
- Contacto: WhatsApp y teléfono 958 667 928, Hemisferiorehab@gmail.com, Av. La Paz 1150, San Miguel, Lima (sede y domicilio fiscal).
- Botón flotante de WhatsApp y asistente Mica.
- Libro de Reclamaciones en Salud virtual.
- Razón social: Centro de Rehabilitación Física Hemisferio S.A.C.

## Mica

Asistente guiado que funciona en el navegador, sin servidor ni costo por uso:

1. Saluda, pregunta para quién es la evaluación, qué dificultad tiene la persona, desde cuándo y qué desea lograr.
2. Sugiere el área que podría corresponder (neurológica, ortopédica, pediátrica u oncológica) sin diagnosticar.
3. Recomienda la evaluación con la licenciada y arma un mensaje de WhatsApp con el resumen del caso.
4. Responde preguntas frecuentes: áreas, ubicación, horarios, costos (deriva a WhatsApp), seguros, domicilio, profesional y reclamos.
5. Ante señales de alarma (por ejemplo, síntomas súbitos de ACV o dolor de pecho) indica acudir a emergencias o llamar al SAMU 106; ante crisis emocional, Línea 113, opción 5.

No guarda la conversación. Para respuestas abiertas con inteligencia artificial se necesita un servidor propio con clave de API, consentimiento expreso y política de privacidad, porque se tratarían datos de salud (datos sensibles, Ley N.° 29733).

## Libro de Reclamaciones en Salud

Base: Reglamento aprobado por D.S. N.° 002-2019-SA (SUSALUD), aplicable a las IPRESS.

- Formulario con los campos de la Hoja de Reclamación en Salud: usuario o tercero legitimado, quien presenta, detalle, autorización de notificación por correo y declaración que sustituye la firma (art. 14.6 y 16.3).
- Acceso desde la página de inicio (pie de página, enlace directo `#libro-de-reclamaciones`, y desde Mica) (art. 16.3).
- Plazo de respuesta informado: 30 días hábiles (art. 11) y derecho a denunciar ante SUSALUD.

### Activación obligatoria antes de publicar

Sin servicio configurado, la hoja se genera en pantalla con un código provisional y se ofrece enviarla por correo. Eso no garantiza el correlativo ni la copia automática que exige el art. 16.3. Para cumplir:

1. Instalar `apps-script/LibroReclamaciones.gs` en la cuenta Hemisferiorehab@gmail.com (instrucciones dentro del archivo).
2. Pegar la URL `/exec` en `legal.libroEndpoint`.
3. Probar un reclamo completo.

El servicio guarda cada hoja en una Hoja de cálculo, asigna el número `HR-AAAA-000001`, envía la copia al reclamante y avisa al centro.

### Obligaciones fuera de la web

- Libro físico de respaldo en la sede (art. 16.4) y aviso visible del Libro (art. 15.4).
- Designar a la persona responsable del Libro (art. 7.a).
- Responder dentro de 30 días hábiles y notificar el resultado dentro de 5 días hábiles (art. 24.1), con el párrafo sobre el derecho a denunciar ante SUSALUD (art. 24.3).
- Conservar el expediente cuatro años desde su conclusión (art. 26.2).
- Registrar el banco de datos de reclamos ante la Autoridad Nacional de Protección de Datos Personales.

## Datos pendientes

| Dato | Campo |
|---|---|
| RUC de la sociedad | `legal.ruc` |
| Código RENIPRESS | `legal.codigoRenipress` |
| Servicio del Libro de Reclamaciones | `legal.libroEndpoint` |
| Horario y modalidades de atención | `contacto.horario`, `contacto.modalidades` |
| Resultados reales de casos (con autorización) | `casos.*` |
| Entidad del curso de hombro | `profesional.entidadHombro` |
| Instagram y redes | `redes.*` |
| Política de privacidad | `legal.politicaPrivacidadUrl` |

## Decisiones según el Manual 1.2

- El logo se usa como archivo maestro completo, sin recortar su fondo ni recomponer letras. En el encabezado aparece solo el nombre como texto, porque el manual pide no miniaturizar el conjunto hasta tener un isotipo para tamaños pequeños. Por la misma razón no hay favicon.
- El descriptor también figura como texto accesible.
- "Mg. Lic." se muestra porque la profesional es Magíster en Salud Pública; la experiencia de 7 años se atribuye a ella, no al centro.
- No se publican la mención a IBITA ni la formación en auditoría; la entidad del curso de hombro sigue pendiente de verificación.
- Retrato: su entorno fue editado (manual, p. 15). Se usa como retrato, no como imagen de la sede.

## Fotografías

Se recortaron para retirar el ventilador, el lema de pared, el logotipo de otro centro y el fondo con otras personas. Antes de publicar se requiere la autorización escrita de cada persona visible (Código Civil, art. 15; Ley N.° 29733) y el permiso del lugar donde se tomaron, si no es la sede.
