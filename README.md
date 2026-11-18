# PROBOSQUE · Módulo de registro a la convocatoria

Solo la pantalla donde el usuario se registra y carga su información geográfica
(polígono del predio). Programa Plantaciones Sustentables 2026.

## Cómo correrlo (PowerShell)

```powershell
cd probosque-registro
npm install      # solo la primera vez
npm run dev      # abre la dirección que aparece, normalmente http://localhost:5173
```

Necesita Node.js 18 o más reciente. `npm test` corre las pruebas de las reglas.

## Dónde está cada cosa

| Archivo | Qué contiene |
|---------|--------------|
| `src/vistas/RegistroConvocatoria.jsx` | El formulario completo y las zonas para soltar archivos (`ZonaArchivo`) |
| `src/vistas/RegistroConvocatoria.css` | Estilos del formulario |
| `src/utilidades/reglas.js` | Validación de CLABE, rangos de superficie y cálculo del apoyo |
| `src/datos/catalogos.js` | Delegaciones y conceptos de apoyo |
| `src/App.jsx` | Monta la vista y muestra el resumen de lo enviado |
| `src/App.css` | Colores, tipografías, botones y campos |

## Información geográfica

La segunda zona de archivos recibe el polígono del predio en `.zip` (shapefile),
`.kml`, `.kmz`, `.geojson` o `.shp`. Por ahora solo se guarda el archivo: no se
lee ni se dibuja el polígono.

## Conectar con un backend

`RegistroConvocatoria` entrega un `FormData` en `onFinalizar` con los campos
`nombres`, `apellidos`, `telefono`, `correo`, `direccion`, `delegacion`,
`concepto`, `superficie`, `clabe`, `documentos` (uno o varios archivos) y
`validacionSig` (el archivo del polígono). En `src/App.jsx`, dentro de
`alFinalizar`, se reemplaza el resumen por la llamada al servidor:

```js
await fetch("/api/solicitudes", { method: "POST", body: formData });
```
