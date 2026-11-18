import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ESTADOS, ETIQUETA_ESTADO, nombreConcepto, nombrePrograma } from "../datos/catalogos";
import { useAlmacen } from "../estado/Almacen";
import { calcularApoyo, fechaLarga, pesos } from "../utilidades/reglas";

// Qué mostrar en cada paso de la ruta según el estado de la solicitud
const RUTA = {
  [ESTADOS.RECIBIDA]: ["hecho", "actual", "", ""],
  [ESTADOS.SUBSANACION]: ["hecho", "alerta", "", ""],
  [ESTADOS.EN_DICTAMEN]: ["hecho", "hecho", "actual", ""],
  [ESTADOS.JURIDICO_FAVORABLE]: ["hecho", "hecho", "hecho", "actual"],
  [ESTADOS.NO_FACTIBLE]: ["hecho", "hecho", "negativo", ""],
};

const PASOS = [
  ["Registro", "Enviaste tu solicitud"],
  ["Cotejo", "La delegación revisa tus documentos"],
  ["Dictamen jurídico", "La Unidad jurídica revisa tu expediente"],
  ["Comité", "Dictamen técnico y listados de resultados"],
];

const TONO = {
  [ESTADOS.SUBSANACION]: "app-etiqueta--alerta",
  [ESTADOS.NO_FACTIBLE]: "app-etiqueta--negativa",
};

// Consulta de estatus por folio (necesidad #17)
export default function Estatus() {
  const { solicitudes, convocatorias, reenviarDocumentacion } = useAlmacen();
  const [parametros, setParametros] = useSearchParams();
  const folio = (parametros.get("folio") ?? "").toUpperCase();
  const [busqueda, setBusqueda] = useState(folio);

  const solicitud = solicitudes.find((s) => s.folio === folio);
  const convocatoria = solicitud && convocatorias.find((c) => c.id === solicitud.convocatoriaId);
  const apoyo = solicitud && calcularApoyo(solicitud.concepto, solicitud.superficie);

  const buscar = (e) => {
    e.preventDefault();
    setParametros({ folio: busqueda.trim().toUpperCase() });
  };

  return (
    <div className="app-pagina app-pagina--angosta">
      <h1 className="app-titulo">Mi solicitud</h1>
      <p className="app-entrada">Escribe el folio que recibiste al registrarte para ver en qué paso va tu trámite.</p>

      <form className="app-busqueda" onSubmit={buscar}>
        <div className="app-campo">
          <label htmlFor="folio">Folio</label>
          <input
            id="folio"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="PS-2026-0001"
          />
        </div>
        <button type="submit" className="app-boton app-boton--primario" disabled={!busqueda.trim()}>
          Consultar
        </button>
      </form>

      {parametros.get("nuevo") && solicitud && (
        <p className="app-aviso" role="status">
          Registro guardado. Anota tu folio <strong>{solicitud.folio}</strong>: lo necesitas para
          consultar el avance.
        </p>
      )}

      {folio && !solicitud && (
        <p className="app-vacio">
          No hay ninguna solicitud con el folio {folio}. Revisa que esté escrito igual que en tu
          comprobante, con guiones.
        </p>
      )}

      {solicitud && (
        <article className="app-panel">
          <p className="estatus-folio">{solicitud.folio}</p>
          <header className="estatus-encabezado">
            <h2>{solicitud.nombres} {solicitud.apellidos}</h2>
            <span className={`app-etiqueta ${TONO[solicitud.estado] ?? ""}`}>
              {ETIQUETA_ESTADO[solicitud.estado]}
            </span>
          </header>

          <ol className="ruta">
            {PASOS.map(([nombre, detalle], i) => {
              const tipo = RUTA[solicitud.estado][i];
              return (
                <li
                  key={nombre}
                  className={tipo ? `ruta--${tipo}` : undefined}
                  aria-current={tipo === "actual" || tipo === "alerta" ? "step" : undefined}
                >
                  <strong>{nombre}</strong>
                  {detalle}
                </li>
              );
            })}
          </ol>

          {solicitud.estado === ESTADOS.SUBSANACION && (
            <div className="app-aviso app-aviso--alerta">
              <p>
                Tu documentación está incompleta. Tienes hasta el{" "}
                <strong>{fechaLarga(solicitud.limiteSubsanacion)}</strong> (5 días hábiles) para
                subsanarla; después la solicitud se desecha.
              </p>
              <button
                type="button"
                className="app-boton app-boton--primario"
                onClick={() => reenviarDocumentacion(solicitud.id)}
              >
                Reenviar documentación
              </button>
            </div>
          )}

          <h3 className="app-subtitulo">Datos de la solicitud</h3>
          <dl className="app-datos">
            <dt>Programa</dt>
            <dd>{convocatoria ? nombrePrograma(convocatoria.programa) : "No disponible"}</dd>
            <dt>Delegación</dt>
            <dd>{solicitud.delegacion}</dd>
            {solicitud.concepto && (
              <>
                <dt>Concepto</dt>
                <dd>{nombreConcepto(solicitud.concepto)}</dd>
              </>
            )}
            <dt>Superficie</dt>
            <dd>{solicitud.superficie} ha</dd>
            {apoyo && (
              <>
                <dt>Apoyo estimado</dt>
                <dd>
                  {apoyo.total > 0
                    ? `${pesos(apoyo.total)}: ${pesos(apoyo.primera)} al firmar y ${pesos(apoyo.segunda)} al verificar`
                    : "Sin recurso económico: se entrega planta"}
                </dd>
              </>
            )}
          </dl>

          <h3 className="app-subtitulo">Historial</h3>
          <ol className="app-historial">
            {solicitud.historial.map((h, i) => (
              <li key={i}>
                <time dateTime={h.fecha}>{fechaLarga(h.fecha)}</time>
                <span>{h.nota}</span>
              </li>
            ))}
          </ol>
        </article>
      )}
    </div>
  );
}
