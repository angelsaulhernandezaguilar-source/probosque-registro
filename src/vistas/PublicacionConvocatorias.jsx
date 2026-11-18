import { useState, useRef } from "react";
import { PROGRAMAS } from "../datos/catalogos";
import "./PublicacionConvocatorias.css";

export default function PublicacionConvocatorias({ onVolver, onPublicar }) {
  // Un estado por cada campo del formulario
  const [programa, setPrograma] = useState("");
  const [fechaApertura, setFechaApertura] = useState("");
  const [fechaClausura, setFechaClausura] = useState("");
  const [reglas, setReglas] = useState(null); // archivo con las reglas de operación
  const [texto, setTexto] = useState("");
  const [arrastrando, setArrastrando] = useState(false); // para resaltar la zona al arrastrar

  const inputArchivoRef = useRef(null); // referencia al <input type="file"> oculto

  // Se ejecuta cuando sueltan un archivo sobre la zona
  const handleDrop = (e) => {
    e.preventDefault(); // evita que el navegador abra el archivo
    setArrastrando(false);
    const archivo = e.dataTransfer.files[0]; // tomamos solo el primero
    if (archivo) setReglas(archivo);
  };

  // Se ejecuta cuando eligen el archivo con el explorador (clic)
  const handleArchivo = (e) => {
    const archivo = e.target.files[0];
    if (archivo) setReglas(archivo);
  };

  // La clausura no puede ser antes que la apertura
  const fechasInvalidas =
    fechaApertura && fechaClausura && fechaClausura < fechaApertura;

  // El botón se habilita solo si todo está completo
  const puedePublicar =
    programa && fechaApertura && fechaClausura && reglas && texto.trim() && !fechasInvalidas;

  const handleSubmit = (e) => {
    e.preventDefault();
    // FormData sirve para enviar texto + archivo en una sola petición
    const datos = new FormData();
    datos.append("programa", programa);
    datos.append("fechaApertura", fechaApertura);
    datos.append("fechaClausura", fechaClausura);
    datos.append("reglas", reglas);
    datos.append("texto", texto);
    onPublicar?.(datos); // el componente padre decide qué hacer (fetch, axios, etc.)
  };

  return (
    <form className="pc-pagina" onSubmit={handleSubmit}>
      <h1 className="pc-titulo">Publicación de convocatorias</h1>
      <p className="pc-entrada">
        Define el programa, el periodo de registro y el texto. Al publicar, la convocatoria queda visible para todos.
      </p>

      {/* Recuadro "Parámetros" */}
      <section className="pc-caja">
        <h2 className="pc-subtitulo">Parámetros</h2>

        <div className="pc-campo pc-programa">
          <label htmlFor="programa">Programa</label>
          <select
            id="programa"
            value={programa}
            onChange={(e) => setPrograma(e.target.value)}
          >
            <option value="">Selecciona un programa</option>
            {PROGRAMAS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Dos fechas lado a lado */}
        <div className="pc-fechas">
          <div className="pc-campo">
            <label htmlFor="apertura">Fecha de apertura</label>
            <input
              id="apertura"
              type="date"
              value={fechaApertura}
              onChange={(e) => setFechaApertura(e.target.value)}
            />
          </div>
          <div className="pc-campo">
            <label htmlFor="clausura">Fecha de clausura</label>
            <input
              id="clausura"
              type="date"
              min={fechaApertura} // el calendario bloquea fechas anteriores a la apertura
              value={fechaClausura}
              onChange={(e) => setFechaClausura(e.target.value)}
            />
          </div>
        </div>
        {fechasInvalidas && (
          <p className="pc-error">
            La fecha de clausura debe ser posterior a la de apertura.
          </p>
        )}

        {/* Zona para arrastrar el archivo de reglas */}
        <div
          className={`pc-dropzone ${arrastrando ? "pc-dropzone--activa" : ""} ${reglas ? "pc-dropzone--llena" : ""}`}
          onDragOver={(e) => {
            e.preventDefault(); // necesario para permitir el drop
            setArrastrando(true);
          }}
          onDragLeave={() => setArrastrando(false)}
          onDrop={handleDrop}
          onClick={() => inputArchivoRef.current.click()} // clic = abre el explorador
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputArchivoRef.current.click();
          }}
        >
          {reglas ? reglas.name : "Arrastra aquí las reglas de operación, o haz clic para elegir el archivo"}
          <input
            ref={inputArchivoRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleArchivo}
            onClick={(e) => e.stopPropagation()} // evita que el clic vuelva a abrir el explorador
            hidden
          />
        </div>
      </section>

      {/* Recuadro del texto de la convocatoria */}
      <section className="pc-caja pc-texto">
        <label htmlFor="texto" className="pc-subtitulo pc-subtitulo--chico">
          Texto de la convocatoria
        </label>
        <textarea
          id="texto"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribe aquí el texto de la convocatoria"
        />
      </section>

      {/* Botones inferiores */}
      <div className="pc-acciones">
        <button type="button" className="pc-boton pc-boton--secundario" onClick={onVolver}>
          Volver a las convocatorias
        </button>
        <button type="submit" className="pc-boton pc-boton--primario" disabled={!puedePublicar}>
          Publicar convocatoria
        </button>
      </div>
    </form>
  );
}
