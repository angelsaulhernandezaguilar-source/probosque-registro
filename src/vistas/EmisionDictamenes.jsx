import { useState } from "react";
import VistaPreviaDocumento from "./VistaPreviaDocumento";
import "./PanelSolicitudes.css";

// Cada solicitud: { id, folio, nombre, documentos: ["archivo.pdf", ...] }
// onAbrirDocumento(id, nombre) devuelve una promesa con { blob, demostracion } o null.
export default function EmisionDictamenes({ solicitudes = [], onFavorable, onDesfavorable, onAbrirDocumento }) {
  const [seleccionadaId, setSeleccionadaId] = useState(null);
  const [enVistaPrevia, setEnVistaPrevia] = useState(null); // nombre del documento abierto
  const seleccionada = solicitudes.find((s) => s.id === seleccionadaId);

  return (
    <div className="ps-pagina">
      <header className="ps-encabezado">
        <h1 className="ps-titulo">Emisión de dictámenes jurídicos</h1>
        <p className="ps-entrada">Revisa los documentos de las solicitudes que ya cotejó la delegación y emite el dictamen jurídico.</p>
      </header>

      {/* Lista de solicitudes */}
      <ul className="ps-lista">
        {solicitudes.length === 0 && (
          <li className="ps-lista-vacia">No hay solicitudes en espera de dictamen jurídico.</li>
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
              <span className="ps-accion">Revisar documentos</span>
            </button>
          </li>
        ))}
      </ul>

      {/* Documentos de la solicitud elegida */}
      <section className="ps-detalle">
        <div className="ps-detalle-cuerpo">
          {seleccionada ? (
            <>
              <h2 className="ps-detalle-titulo">Documentos de {seleccionada.nombre}</h2>
              <ul className="ps-documentos">
                {seleccionada.documentos.map((doc) => (
                  <li key={doc}>
                    <span className="ps-documento-nombre">{doc}</span>
                    {onAbrirDocumento && (
                      <button
                        type="button"
                        className="ps-documento-ver"
                        aria-haspopup="dialog"
                        aria-label={`Vista previa de ${doc}`}
                        onClick={() => setEnVistaPrevia(doc)}
                      >
                        Vista previa
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="ps-vacio">Elige una solicitud con “Revisar documentos” para ver su lista y abrir la vista previa de cada archivo.</p>
          )}
        </div>

        <div className="ps-acciones">
          <button
            type="button"
            className="ps-boton ps-boton--secundario"
            disabled={!seleccionada}
            onClick={() => onDesfavorable?.(seleccionada.id)}
          >
            Emitir desfavorable
          </button>
          <button
            type="button"
            className="ps-boton ps-boton--primario"
            disabled={!seleccionada}
            onClick={() => onFavorable?.(seleccionada.id)}
          >
            Emitir favorable
          </button>
        </div>
      </section>

      {seleccionada && enVistaPrevia && (
        <VistaPreviaDocumento
          key={`${seleccionada.id}/${enVistaPrevia}`}
          nombre={enVistaPrevia}
          cargar={() => onAbrirDocumento(seleccionada.id, enVistaPrevia)}
          onCerrar={() => setEnVistaPrevia(null)}
        />
      )}
    </div>
  );
}
