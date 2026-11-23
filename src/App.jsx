import { useState } from "react";
import { HashRouter, Link, NavLink, Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { ESTADOS, nombreConcepto, nombrePrograma } from "./datos/catalogos";
import { ProveedorAlmacen, useAlmacen } from "./estado/Almacen";
import { borrarArchivos, guardarArchivos, leerArchivo } from "./estado/archivos";
import Convocatorias from "./paginas/Convocatorias";
import Estatus from "./paginas/Estatus";
import { pdfDemostracion } from "./utilidades/pdfDemo";
import { calcularApoyo, estadoConvocatoria, fechaLarga, pesos } from "./utilidades/reglas";
import EmisionDictamenes from "./vistas/EmisionDictamenes";
import PublicacionConvocatorias from "./vistas/PublicacionConvocatorias";
import RecepcionSolicitudes from "./vistas/RecepcionSolicitudes";
import RegistroConvocatoria from "./vistas/RegistroConvocatoria";
import "./App.css";

// Cada "Ruta..." conecta una vista con el almacén: la vista solo dibuja y avisa.

function RutaPublicar() {
  const { publicarConvocatoria } = useAlmacen();
  const navegar = useNavigate();
  return (
    <PublicacionConvocatorias
      onVolver={() => navegar("/")}
      onPublicar={(formData) => {
        publicarConvocatoria({
          programa: formData.get("programa"),
          fechaApertura: formData.get("fechaApertura"),
          fechaClausura: formData.get("fechaClausura"),
          reglasNombre: formData.get("reglas").name, // sin backend solo se conserva el nombre
          texto: formData.get("texto").trim(),
        });
        navegar("/");
      }}
    />
  );
}

function RutaRegistro() {
  const { id } = useParams();
  const { convocatorias, registrarSolicitud } = useAlmacen();
  const navegar = useNavigate();
  const convocatoria = convocatorias.find((c) => c.id === Number(id));

  if (!convocatoria || estadoConvocatoria(convocatoria) !== "abierta") {
    return <Navigate to="/" replace />;
  }

  return (
    <RegistroConvocatoria
      nombrePrograma={nombrePrograma(convocatoria.programa)}
      conConceptos={convocatoria.programa === "plantaciones"}
      onRegresar={() => navegar("/")}
      onFinalizar={(formData) => {
        const solicitud = registrarSolicitud(convocatoria, {
          nombres: formData.get("nombres"),
          apellidos: formData.get("apellidos"),
          telefono: formData.get("telefono"),
          direccion: formData.get("direccion"),
          correo: formData.get("correo"),
          delegacion: formData.get("delegacion"),
          concepto: formData.get("concepto") ?? "",
          superficie: Number(formData.get("superficie")),
          clabe: formData.get("clabe"),
          documentos: formData.getAll("documentos").map((a) => a.name),
          validacionSig: formData.get("validacionSig").name,
        });
        // Los archivos se guardan aparte para que la Unidad jurídica pueda previsualizarlos
        guardarArchivos(solicitud.id, [...formData.getAll("documentos"), formData.get("validacionSig")]).catch(() => {});
        navegar(`/estatus?folio=${solicitud.folio}&nuevo=1`);
      }}
    />
  );
}

const nombreCompleto = (s) => `${s.nombres} ${s.apellidos}`;

function RutaRecepcion() {
  const { solicitudes, aceptarSolicitud, rechazarSolicitud } = useAlmacen();
  const [aviso, setAviso] = useState("");

  const pendientes = solicitudes
    .filter((s) => s.estado === ESTADOS.RECIBIDA)
    .map((s) => {
      const apoyo = calcularApoyo(s.concepto, s.superficie);
      return {
        id: s.id,
        folio: s.folio,
        nombre: nombreCompleto(s),
        detalles: [
          ["Registrada el", fechaLarga(s.registradaEl)],
          ["Delegación", s.delegacion],
          ["Teléfono", s.telefono],
          ["Correo", s.correo],
          ["Dirección", s.direccion],
          ...(s.concepto ? [["Concepto", nombreConcepto(s.concepto)]] : []),
          ["Superficie", `${s.superficie} ha`],
          ...(apoyo ? [["Apoyo calculado", apoyo.total > 0 ? pesos(apoyo.total) : "Solo planta"]] : []),
          ["CLABE", s.clabe],
          ["Documentos", s.documentos.join(", ")],
          ["Polígono (SIG)", s.validacionSig],
        ],
      };
    });

  const folioDe = (id) => solicitudes.find((s) => s.id === id)?.folio;

  return (
    <>
      {aviso && <p className="app-aviso app-aviso--suelto" role="status">{aviso}</p>}
      <RecepcionSolicitudes
        solicitudes={pendientes}
        onAceptar={(id) => {
          aceptarSolicitud(id);
          setAviso(`${folioDe(id)}: documentación completa. Pasó a dictamen jurídico.`);
        }}
        onRechazar={(id) => {
          const limite = rechazarSolicitud(id);
          setAviso(`${folioDe(id)}: documentación incompleta. El solicitante puede subsanar hasta el ${fechaLarga(limite)}.`);
        }}
      />
    </>
  );
}

function RutaDictamenes() {
  const { solicitudes, dictaminar } = useAlmacen();
  const [aviso, setAviso] = useState("");

  const enDictamen = solicitudes
    .filter((s) => s.estado === ESTADOS.EN_DICTAMEN)
    .map((s) => ({ id: s.id, folio: s.folio, nombre: nombreCompleto(s), documentos: [...s.documentos, s.validacionSig] }));

  const folioDe = (id) => solicitudes.find((s) => s.id === id)?.folio;

  // Archivo que subió el beneficiario; las solicitudes de ejemplo no lo tienen
  // y se sustituye por un PDF de demostración.
  const abrirDocumento = async (id, nombre) => {
    const blob = await leerArchivo(id, nombre).catch(() => null);
    if (blob) return { blob, demostracion: false };
    if (!/\.pdf$/i.test(nombre)) return null;
    const s = solicitudes.find((x) => x.id === id);
    return { blob: pdfDemostracion({ nombre, folio: s.folio, solicitante: nombreCompleto(s) }), demostracion: true };
  };

  return (
    <>
      {aviso && <p className="app-aviso app-aviso--suelto" role="status">{aviso}</p>}
      <EmisionDictamenes
        solicitudes={enDictamen}
        onAbrirDocumento={abrirDocumento}
        onFavorable={(id) => {
          dictaminar(id, true);
          setAviso(`${folioDe(id)}: dictamen jurídico favorable.`);
        }}
        onDesfavorable={(id) => {
          dictaminar(id, false);
          setAviso(`${folioDe(id)}: dictamen desfavorable. Pasó al listado de no factibles.`);
        }}
      />
    </>
  );
}

function Navegacion() {
  const { solicitudes } = useAlmacen();
  const cuenta = (estado) => solicitudes.filter((s) => s.estado === estado).length;
  const enlaces = [
    { a: "/", texto: "Convocatorias", rol: "Público" },
    { a: "/estatus", texto: "Mi estatus", rol: "Beneficiario" },
    { a: "/publicar", texto: "Publicar", rol: "Dirección General" },
    { a: "/recepcion", texto: "Recepción", rol: "Delegación", pendientes: cuenta(ESTADOS.RECIBIDA) },
    { a: "/dictamenes", texto: "Dictámenes", rol: "Unidad jurídica", pendientes: cuenta(ESTADOS.EN_DICTAMEN) },
  ];
  return (
    <header className="app-barra">
      <div className="app-barra-interior">
      <Link className="app-marca" to="/">
        <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
          <path d="M17 3 9 14h4l-6 8h5l-5 7h20l-5-7h5l-6-8h4z" fill="#8fc49a" />
          <rect x="15.5" y="27" width="3" height="5" fill="#8fc49a" />
        </svg>
        <div>
          <strong>PROBOSQUE</strong>
          <span>Convocatorias forestales 2026</span>
        </div>
      </Link>
      <nav className="app-nav" aria-label="Secciones">
        {enlaces.map((e) => (
          <NavLink key={e.a} to={e.a} end={e.a === "/"}>
            <span className="app-nav-texto">
              {e.texto}
              {e.pendientes > 0 && <b className="app-contador">{e.pendientes}</b>}
            </span>
            <small>{e.rol}</small>
          </NavLink>
        ))}
      </nav>
      </div>
    </header>
  );
}

function Pie() {
  const { reiniciar } = useAlmacen();
  return (
    <footer className="app-pie">
      <div className="app-pie-interior">
      <span>Prototipo académico (FPI, ESCOM-IPN). Los datos se guardan solo en este navegador.</span>
      <button
        type="button"
        className="app-enlace"
        onClick={() => {
          if (window.confirm("¿Borrar los cambios y volver a los datos de demostración?")) {
            reiniciar();
            borrarArchivos().catch(() => {});
          }
        }}
      >
        Restablecer datos de demostración
      </button>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <ProveedorAlmacen>
      <HashRouter>
        <Navegacion />
        <main className="app-principal">
          <Routes>
            <Route path="/" element={<Convocatorias />} />
            <Route path="/publicar" element={<RutaPublicar />} />
            <Route path="/registro/:id" element={<RutaRegistro />} />
            <Route path="/recepcion" element={<RutaRecepcion />} />
            <Route path="/dictamenes" element={<RutaDictamenes />} />
            <Route path="/estatus" element={<Estatus />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Pie />
      </HashRouter>
    </ProveedorAlmacen>
  );
}
