# PROBOSQUE · Ingreso y seguimiento de convocatorias 2026

Prototipo en React del sistema de ingreso a la convocatoria de PROBOSQUE
(Protectora de Bosques del Estado de México), con foco en el programa
**Plantaciones Sustentables 2026**.

Proyecto de la materia Formulación de Proyectos Informáticos (ESCOM-IPN).

## Cómo correrlo

Necesitas [Node.js](https://nodejs.org) 18 o más reciente.

```powershell
git clone https://github.com/angelsaulhernandezaguilar-source/probosque-registro.git
cd probosque-registro
npm install      # solo la primera vez
npm run dev      # abre la dirección que aparece, normalmente http://localhost:5173
```

Para apagarlo, `Ctrl + C` en la terminal.

| Comando | Para qué |
|---------|----------|
| `npm run dev` | Servidor de desarrollo con recarga automática |
| `npm test` | Pruebas de las reglas de negocio |
| `npm run build` | Genera la carpeta `dist/` lista para publicar |
| `npm run preview` | Sirve lo que quedó en `dist/` |

## Qué hace

Cubre el inicio del flujo de la convocatoria, de la publicación al dictamen jurídico:

1. La **Dirección General** publica la convocatoria con su periodo de registro.
2. El **beneficiario** se registra, carga sus documentos y el polígono de su predio, y recibe un folio.
3. La **delegación regional** coteja la documentación. Si la acepta, pasa a dictamen jurídico.
   Si la rechaza, el beneficiario tiene 5 días hábiles para subsanar y puede reenviarla.
4. La **Unidad jurídica** revisa los documentos en una ventana de vista previa y emite dictamen
   favorable o desfavorable (no factible).
5. El beneficiario consulta en cualquier momento en qué paso va, con su folio.

## Pantallas

| Ruta | Pantalla | Quién la usa |
|------|----------|--------------|
| `#/` | Convocatorias publicadas y días que quedan para registrarse | Público |
| `#/registro/:id` | Registro a la convocatoria | Beneficiario |
| `#/estatus` | Mi solicitud: ruta del trámite, datos e historial | Beneficiario |
| `#/publicar` | Publicación de convocatorias | Dirección General |
| `#/recepcion` | Recepción de solicitudes | Delegación regional |
| `#/dictamenes` | Emisión de dictámenes jurídicos | Unidad jurídica |

No hay inicio de sesión: la barra superior deja entrar a la pantalla de cualquier instancia.

## Necesidades que atiende

Los números corresponden a la tabla de necesidades del proyecto.

| # | Necesidad | Dónde |
|---|-----------|-------|
| 5 | Captura de superficie y polígonos | Registro (el polígono se recibe como archivo) |
| 9 | Cálculo de montos por concepto y superficie | Registro, Recepción y Mi solicitud |
| 17 | Consulta de estatus por el usuario | Mi solicitud |
| 23 | Validación de CLABE | Registro |

Reglas aplicadas (Reglas de Operación 2026):

- **Plantación maderable / no maderable:** $10,000 por hectárea, de 1 a 150 ha.
- **Mantenimiento de plantaciones:** $5,000 por hectárea, de 0.5 a 150 ha.
- **Mantenimiento navideño:** sin recurso económico, desde 0.5 ha.
- El apoyo se divide en dos ministraciones: 70% y 30%.
- La CLABE debe tener 18 dígitos y dígito verificador válido.
- Subsanar documentación: 5 días hábiles.

Los conceptos de apoyo solo aparecen cuando la convocatoria es de Plantaciones Sustentables.

## Estructura del código

```
src/
├── App.jsx                  Rutas, barra de navegación y conexión de cada vista con el estado
├── App.css                  Sistema visual: colores, tipografías, botones, campos y paneles
├── vistas/                  Las cuatro vistas de trabajo; solo dibujan y avisan por props
│   ├── PublicacionConvocatorias.jsx / .css
│   ├── RegistroConvocatoria.jsx / .css
│   ├── RecepcionSolicitudes.jsx
│   ├── EmisionDictamenes.jsx
│   ├── VistaPreviaDocumento.jsx Ventana emergente para previsualizar PDF en Dictámenes
│   └── PanelSolicitudes.css     Bandeja compartida por Recepción y Dictámenes
├── paginas/
│   ├── Convocatorias.jsx    Inicio
│   └── Estatus.jsx          Consulta por folio
├── estado/Almacen.jsx       Estado global, acciones y datos de demostración
├── estado/archivos.js       Archivos subidos por el beneficiario (IndexedDB)
├── utilidades/reglas.js     CLABE, superficie, montos, días hábiles y fechas
├── utilidades/pdfDemo.js    PDF de demostración para las solicitudes de ejemplo
└── datos/catalogos.js       Programas, delegaciones, conceptos de apoyo y estados
```

Las vistas no conocen el estado global: reciben datos y funciones por props. Por eso
`RegistroConvocatoria` entrega un `FormData` en `onFinalizar`, listo para mandarse a un
servidor.

## Diseño

- **Color:** verde pino sobre fondo salvia; ámbar para lo pendiente y rojo para lo no factible.
- **Tipografía:** Bricolage Grotesque en títulos y Public Sans en texto, cargadas desde
  Google Fonts. Sin internet se usa la fuente del sistema.
- **Bandejas en dos columnas:** lista a la izquierda y expediente a la derecha.
- Se adapta a pantallas de celular.

## Datos de demostración

La app arranca con una convocatoria abierta y cuatro solicitudes de personas ficticias.
Las fechas de esa convocatoria (1 de noviembre al 18 de diciembre de 2026) son inventadas
para que el registro esté abierto; no son las fechas reales del programa.

Todo se guarda en el `localStorage` del navegador. El enlace "Restablecer datos de
demostración", al pie de la página, borra los cambios.

## Límites del prototipo

- No hay backend ni usuarios: los datos viven en un solo navegador.
- Los archivos se guardan solo en el navegador donde se registró la solicitud (IndexedDB).
  Las solicitudes de ejemplo muestran un PDF de demostración. La vista previa solo abre PDF;
  los demás formatos se descargan. El polígono no se lee ni se valida.
- Los días hábiles saltan sábados y domingos, pero no días festivos.
- Quedan fuera el Listado de Incumplidos, el dictamen técnico (SIG), la priorización,
  el Comité, el vivero, el contrato de adhesión, los pagos y la verificación en campo.

## Solo el módulo de registro

La rama [`solo-registro`](https://github.com/angelsaulhernandezaguilar-source/probosque-registro/tree/solo-registro)
conserva la versión que tiene únicamente la pantalla de registro, para trabajarla por separado:

```powershell
git switch solo-registro
npm install
npm run dev
```
