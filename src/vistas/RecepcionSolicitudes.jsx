import { useState } from "react";
import "./PanelSolicitudes.css";

// Cada solicitud: { id, folio, nombre, detalles: [[etiqueta, valor], ...] }
export default function RecepcionSolicitudes({ solicitudes = [], onAceptar, onRechazar }) {
  // Guardamos solo el id de la solicitud elegida, no el objeto completo
  const [seleccionadaId, setSeleccionadaId] = useState(null);

  // Buscamos el objeto completo cada vez que se renderiza
  const seleccionada = solicitudes.find((s) => s.id === seleccionadaId);

  return (
    <div className="ps-pagina">
      <header className="ps-encabezado">
        <h1 className="ps-titulo">Recepción de solicitudes</h1>
        <p className="ps-entrada">Coteja los documentos de cada solicitud. Si acepta, pasa a dictamen jurídico; si rechaza, el solicitante tiene 5 días hábiles para subsanar.</p>
      </header>

      {/* Lista de solicitudes */}
      <ul className="ps-lista">
        {solicitudes.length === 0 && (
          <li className="ps-lista-vacia">No hay solicitudes pendientes de cotejo.</li>
        )}
        {solicitudes.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              className={`ps-fila ${s.id === seleccionadaId ? "ps-fila--activa" : ""}`}
              aria-pressed={s.id === seleccionadaId}
              onClick={() => setSeleccionadaId(s.id)}
            >
              <span className="ps-folio">{s.folio}</span>
              <span className="ps-nombre">{s.nombre}</span>
              <span className="ps-accion">Ver</span>
            </button>
          </li>
        ))}
      </ul>

      {/* Detalle de la solicitud elegida */}
      <section className="ps-detalle">
        <div className="ps-detalle-cuerpo">
          {seleccionada ? (
            <>
              <h2 className="ps-detalle-titulo">{seleccionada.nombre}</h2>
              <dl className="ps-datos">
                {(seleccionada.detalles ?? []).map(
                  ([etiqueta, valor]) => (
                    <div key={etiqueta} style={{ display: "contents" }}>
                      <dt>{etiqueta}</dt>
                      <dd>{valor}</dd>
                    </div>
                  )
                )}
              </dl>
            </>
          ) : (
            <p className="ps-vacio">Selecciona una solicitud con “Ver” para revisarla.</p>
          )}
        </div>

        <div className="ps-acciones">
          <button
            type="button"
            className="ps-boton ps-boton--secundario"
            disabled={!seleccionada}
            onClick={() => onRechazar?.(seleccionada.id)}
          >
            Rechazar solicitud
          </button>
          <button
            type="button"
            className="ps-boton ps-boton--primario"
            disabled={!seleccionada}
            onClick={() => onAceptar?.(seleccionada.id)}
          >
            Aceptar solicitud
          </button>
        </div>
      </section>
    </div>
  );
}
