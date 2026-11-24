import { useEffect, useRef, useState } from "react";
import "./VistaPreviaDocumento.css";

// Ventana emergente para revisar un documento sin salir de la bandeja.
// "cargar" devuelve una promesa con { blob, demostracion } o null si no hay archivo.
export default function VistaPreviaDocumento({ nombre, cargar, onCerrar }) {
  const dialogo = useRef(null);
  const [vista, setVista] = useState({ fase: "cargando" });

  // showModal() da el fondo oscuro, atrapa el foco y cierra con Esc
  useEffect(() => {
    if (!dialogo.current.open) dialogo.current.showModal();
  }, []);

  useEffect(() => {
    let vigente = true;
    let url;
    Promise.resolve(cargar())
      .then((resultado) => {
        if (!vigente) return;
        if (!resultado) return setVista({ fase: "sin-archivo" });
        const esPdf = resultado.blob.type === "application/pdf" || /\.pdf$/i.test(nombre);
        url = URL.createObjectURL(resultado.blob);
        setVista({ fase: esPdf ? "pdf" : "otro", url, demostracion: resultado.demostracion });
      })
      .catch(() => vigente && setVista({ fase: "sin-archivo" }));
    return () => {
      vigente = false;
      if (url) URL.revokeObjectURL(url);
    };
    // Solo al abrir: la ventana se monta de nuevo para cada documento
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <dialog
      ref={dialogo}
      className="vp-dialogo"
      aria-labelledby="vp-titulo"
      onClose={onCerrar}
      onClick={(e) => {
        if (e.target === dialogo.current) onCerrar(); // clic en el fondo
      }}
    >
      <div className="vp-marco">
        <header className="vp-encabezado">
          <div className="vp-encabezado-texto">
            <h2 id="vp-titulo" className="vp-titulo">{nombre}</h2>
            {vista.demostracion && <span className="vp-etiqueta">Documento de demostración</span>}
          </div>
          {vista.url && (
            <a className="vp-enlace" href={vista.url} target="_blank" rel="noreferrer">
              Abrir en otra pestaña
            </a>
          )}
          <button type="button" className="ps-boton ps-boton--secundario vp-cerrar" onClick={onCerrar}>
            Cerrar
          </button>
        </header>

        <div className="vp-cuerpo">
          {vista.fase === "cargando" && <p className="vp-mensaje" role="status">Cargando documento…</p>}
          {vista.fase === "pdf" && <iframe className="vp-visor" src={vista.url} title={`Vista previa de ${nombre}`} />}
          {vista.fase === "otro" && (
            <div className="vp-mensaje">
              <p>Este tipo de archivo no se puede previsualizar aquí. Solo los PDF se muestran en la ventana.</p>
              <a className="vp-enlace" href={vista.url} download={nombre}>Descargar {nombre}</a>
            </div>
          )}
          {vista.fase === "sin-archivo" && (
            <p className="vp-mensaje">
              No hay una copia de este archivo en este navegador. El prototipo guarda los archivos
              solo en el equipo donde se registró la solicitud.
            </p>
          )}
        </div>
      </div>
    </dialog>
  );
}
