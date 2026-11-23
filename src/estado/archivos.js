// Archivos que sube el beneficiario. Se guardan en IndexedDB porque localStorage
// solo acepta texto. Cuando exista un backend, estas funciones se cambian por
// llamadas a la API.
const BASE = "probosque-archivos";
const TABLA = "archivos";

function abrir() {
  return new Promise((resolver, rechazar) => {
    const peticion = indexedDB.open(BASE, 1);
    peticion.onupgradeneeded = () => peticion.result.createObjectStore(TABLA);
    peticion.onsuccess = () => resolver(peticion.result);
    peticion.onerror = () => rechazar(peticion.error);
  });
}

// Ejecuta una operación sobre la tabla y devuelve su resultado
async function operar(modo, operacion) {
  const base = await abrir();
  try {
    return await new Promise((resolver, rechazar) => {
      const transaccion = base.transaction(TABLA, modo);
      const peticion = operacion(transaccion.objectStore(TABLA));
      transaccion.oncomplete = () => resolver(peticion?.result);
      transaccion.onerror = () => rechazar(transaccion.error);
      transaccion.onabort = () => rechazar(transaccion.error);
    });
  } finally {
    base.close();
  }
}

const clave = (solicitudId, nombre) => `${solicitudId}/${nombre}`;

export function guardarArchivos(solicitudId, archivos) {
  return operar("readwrite", (tabla) => {
    archivos.forEach((archivo) => tabla.put(archivo, clave(solicitudId, archivo.name)));
  });
}

// Devuelve el archivo (Blob) o null si no se guardó en este navegador
export async function leerArchivo(solicitudId, nombre) {
  return (await operar("readonly", (tabla) => tabla.get(clave(solicitudId, nombre)))) ?? null;
}

export function borrarArchivos() {
  return operar("readwrite", (tabla) => tabla.clear());
}
