import { createContext, useContext, useEffect, useReducer } from "react";
import { ESTADOS, PROGRAMAS } from "../datos/catalogos";
import { fechaLarga, hoyISO, sumarDiasHabiles } from "../utilidades/reglas";

// Todo el estado vive en el navegador (localStorage). Cuando exista un backend,
// basta con cambiar las funciones de este archivo por llamadas a la API.
const CLAVE = "probosque-convocatorias-v1";

// Datos de demostración (personas ficticias)
function datosIniciales() {
  const evento = (fecha, estado, nota) => ({ fecha, estado, nota });
  return {
    convocatorias: [
      {
        id: 1,
        programa: "plantaciones",
        fechaApertura: "2026-11-01",
        fechaClausura: "2026-12-18",
        reglasNombre: "Reglas_de_Operacion_Plantaciones_Sustentables_2026.pdf",
        texto:
          "PROBOSQUE convoca a ejidos, comunidades y pequeños propietarios del Estado de México con terrenos aptos para reconversión a participar en el programa Plantaciones Sustentables 2026. La solicitud se presenta en la delegación regional que corresponda al predio. (Convocatoria de demostración.)",
        publicadaEl: "2026-11-01",
      },
    ],
    solicitudes: [
      {
        id: 1, folio: "PS-2026-0001", convocatoriaId: 1,
        nombres: "María Guadalupe", apellidos: "Hernández Ruiz", telefono: "7221234567",
        direccion: "Ejido San Juan, Villa Victoria", correo: "maria.ejemplo@correo.mx",
        delegacion: "Toluca", concepto: "plantacion", superficie: 12, clabe: "000000001234567897",
        documentos: ["Identificación oficial.pdf", "Título de propiedad.pdf"],
        validacionSig: "poligono_san_juan.kml",
        registradaEl: "2026-11-10", estado: ESTADOS.RECIBIDA, limiteSubsanacion: null,
        historial: [evento("2026-11-10", ESTADOS.RECIBIDA, "Solicitud registrada en línea.")],
      },
      {
        id: 2, folio: "PS-2026-0002", convocatoriaId: 1,
        nombres: "José Luis", apellidos: "Mendoza Reyes", telefono: "7129876543",
        direccion: "Rancho El Encino, Atlacomulco", correo: "jose.ejemplo@correo.mx",
        delegacion: "Atlacomulco", concepto: "mantenimiento", superficie: 4.5, clabe: "000000001234567897",
        documentos: ["Identificación oficial.pdf", "Certificado parcelario.pdf"],
        validacionSig: "predio_el_encino.geojson",
        registradaEl: "2026-11-11", estado: ESTADOS.RECIBIDA, limiteSubsanacion: null,
        historial: [evento("2026-11-11", ESTADOS.RECIBIDA, "Solicitud registrada en línea.")],
      },
      {
        id: 3, folio: "PS-2026-0003", convocatoriaId: 1,
        nombres: "Rosa Elena", apellidos: "Martínez Cruz", telefono: "7265550123",
        direccion: "Paraje Los Pinos, Valle de Bravo", correo: "rosa.ejemplo@correo.mx",
        delegacion: "Valle de Bravo", concepto: "plantacion", superficie: 30, clabe: "000000001234567897",
        documentos: ["Identificación oficial.pdf", "Escritura.pdf", "Comprobante de domicilio.pdf"],
        validacionSig: "los_pinos.kmz",
        registradaEl: "2026-11-05", estado: ESTADOS.EN_DICTAMEN, limiteSubsanacion: null,
        historial: [
          evento("2026-11-05", ESTADOS.RECIBIDA, "Solicitud registrada en línea."),
          evento("2026-11-09", ESTADOS.EN_DICTAMEN, "La delegación cotejó la documentación completa."),
        ],
      },
      {
        id: 4, folio: "PS-2026-0004", convocatoriaId: 1,
        nombres: "Andrés", apellidos: "García Flores", telefono: "5955550188",
        direccion: "Predio La Joya, Texcoco", correo: "andres.ejemplo@correo.mx",
        delegacion: "Texcoco", concepto: "navideno", superficie: 2, clabe: "000000001234567897",
        documentos: ["Identificación oficial.pdf"],
        validacionSig: "la_joya.zip",
        registradaEl: "2026-11-12", estado: ESTADOS.SUBSANACION, limiteSubsanacion: "2026-11-23",
        historial: [
          evento("2026-11-12", ESTADOS.RECIBIDA, "Solicitud registrada en línea."),
          evento("2026-11-16", ESTADOS.SUBSANACION, "Documentación incompleta. Tiene hasta el 23 de noviembre de 2026 para subsanar."),
        ],
      },
    ],
  };
}

function cargar() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE));
    if (guardado?.convocatorias && guardado?.solicitudes) return guardado;
  } catch {
    // localStorage vacío, bloqueado o corrupto: se usan los datos de demostración
  }
  return datosIniciales();
}

const siguienteId = (lista) => lista.reduce((max, x) => Math.max(max, x.id), 0) + 1;

function reductor(estado, accion) {
  switch (accion.tipo) {
    case "PUBLICAR":
      return { ...estado, convocatorias: [...estado.convocatorias, accion.convocatoria] };
    case "REGISTRAR":
      return { ...estado, solicitudes: [...estado.solicitudes, accion.solicitud] };
    case "CAMBIAR_ESTADO":
      return {
        ...estado,
        solicitudes: estado.solicitudes.map((s) =>
          s.id === accion.id
            ? {
                ...s,
                estado: accion.estado,
                limiteSubsanacion: accion.limite ?? null,
                historial: [...s.historial, { fecha: hoyISO(), estado: accion.estado, nota: accion.nota }],
              }
            : s
        ),
      };
    case "REINICIAR":
      return datosIniciales();
    default:
      return estado;
  }
}

const Contexto = createContext(null);

export function ProveedorAlmacen({ children }) {
  const [estado, despachar] = useReducer(reductor, undefined, cargar);

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(estado));
    } catch {
      // sin almacenamiento: la app sigue funcionando en memoria
    }
  }, [estado]);

  const cambiar = (id, nuevoEstado, nota, limite) =>
    despachar({ tipo: "CAMBIAR_ESTADO", id, estado: nuevoEstado, nota, limite });

  const acciones = {
    // Dirección General
    publicarConvocatoria(datos) {
      const convocatoria = { ...datos, id: siguienteId(estado.convocatorias), publicadaEl: hoyISO() };
      despachar({ tipo: "PUBLICAR", convocatoria });
      return convocatoria;
    },

    // Beneficiario
    registrarSolicitud(convocatoria, datos) {
      const id = siguienteId(estado.solicitudes);
      const siglas = PROGRAMAS.find((p) => p.id === convocatoria.programa)?.siglas ?? "SOL";
      const anio = convocatoria.fechaApertura.slice(0, 4);
      const solicitud = {
        ...datos,
        id,
        folio: `${siglas}-${anio}-${String(id).padStart(4, "0")}`,
        convocatoriaId: convocatoria.id,
        registradaEl: hoyISO(),
        estado: ESTADOS.RECIBIDA,
        limiteSubsanacion: null,
        historial: [{ fecha: hoyISO(), estado: ESTADOS.RECIBIDA, nota: "Solicitud registrada en línea." }],
      };
      despachar({ tipo: "REGISTRAR", solicitud });
      return solicitud;
    },
    reenviarDocumentacion(id) {
      cambiar(id, ESTADOS.RECIBIDA, "El solicitante reenvió su documentación para un nuevo cotejo.");
    },

    // Delegación regional
    aceptarSolicitud(id) {
      cambiar(id, ESTADOS.EN_DICTAMEN, "La delegación cotejó la documentación completa. Pasa a dictamen jurídico.");
    },
    rechazarSolicitud(id) {
      const limite = sumarDiasHabiles(hoyISO(), 5); // 5 días hábiles para subsanar
      cambiar(id, ESTADOS.SUBSANACION, `Documentación incompleta. Tiene hasta el ${fechaLarga(limite)} para subsanar.`, limite);
      return limite;
    },

    // Unidad jurídica
    dictaminar(id, favorable) {
      if (favorable) cambiar(id, ESTADOS.JURIDICO_FAVORABLE, "La Unidad jurídica emitió dictamen favorable.");
      else cambiar(id, ESTADOS.NO_FACTIBLE, "La Unidad jurídica emitió dictamen desfavorable. Pasa al listado de no factibles.");
    },

    reiniciar() {
      despachar({ tipo: "REINICIAR" });
    },
  };

  return <Contexto.Provider value={{ ...estado, ...acciones }}>{children}</Contexto.Provider>;
}

export const useAlmacen = () => useContext(Contexto);
