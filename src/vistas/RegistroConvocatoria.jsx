import { useState, useRef } from "react";
import { CONCEPTOS, DELEGACIONES } from "../datos/catalogos";
import { calcularApoyo, pesos, validarClabe, validarSuperficie } from "../utilidades/reglas";
import "./RegistroConvocatoria.css";

// Zona de arrastrar y soltar reutilizable (la usamos dos veces abajo)
function ZonaArchivo({ titulo, archivos, onArchivos, accept, multiple = false }) {
  const [arrastrando, setArrastrando] = useState(false);
  const inputRef = useRef(null);

  const recibir = (lista) => {
    const elegidos = Array.from(lista);
    if (elegidos.length) onArchivos(multiple ? elegidos : elegidos.slice(0, 1));
  };

  const handleDrop = (e) => {
    e.preventDefault(); // evita que el navegador abra el archivo
    setArrastrando(false);
    recibir(e.dataTransfer.files);
  };

  return (
    <div
      className={`rc-dropzone ${arrastrando ? "rc-dropzone--activa" : ""} ${archivos.length ? "rc-dropzone--llena" : ""}`}
      onDragOver={(e) => {
        e.preventDefault(); // necesario para permitir el drop
        setArrastrando(true);
      }}
      onDragLeave={() => setArrastrando(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current.click();
      }}
    >
      <span>{titulo}</span>
      {archivos.map((a) => (
        <strong key={a.name} className="rc-archivo">{a.name}</strong>
      ))}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        hidden
        onClick={(e) => e.stopPropagation()} // evita que el clic vuelva a abrir el explorador
        onChange={(e) => recibir(e.target.files)}
      />
    </div>
  );
}

export default function RegistroConvocatoria({
  nombrePrograma,
  conConceptos = true, // los conceptos de apoyo solo aplican a Plantaciones Sustentables
  onRegresar,
  onFinalizar,
}) {
  // Un solo objeto para todos los campos de texto
  const [datos, setDatos] = useState({
    nombres: "",
    apellidos: "",
    telefono: "",
    direccion: "",
    correo: "",
    delegacion: "",
    concepto: "",
    superficie: "",
    clabe: "",
  });
  const [documentos, setDocumentos] = useState([]);
  const [validacionSig, setValidacionSig] = useState([]);

  // Un solo handler para todos los inputs: usa el atributo "name" para saber cuál cambió
  const handleCambio = (e) => {
    setDatos({ ...datos, [e.target.name]: e.target.value });
  };

  const concepto = CONCEPTOS.find((c) => c.id === datos.concepto);
  const errorSuperficie = conConceptos
    ? validarSuperficie(datos.concepto, datos.superficie)
    : datos.superficie !== "" && Number(datos.superficie) <= 0
      ? "La superficie debe ser mayor a cero."
      : "";
  const errorClabe =
    datos.clabe && !validarClabe(datos.clabe)
      ? "La CLABE debe tener 18 dígitos y un dígito verificador válido."
      : "";
  const apoyo = conConceptos && !errorSuperficie ? calcularApoyo(datos.concepto, datos.superficie) : null;

  // Se habilita el botón solo cuando todo está lleno y sin errores
  const obligatorios = Object.entries(datos).filter(([clave]) => conConceptos || clave !== "concepto");
  const completo =
    obligatorios.every(([, v]) => v.trim()) &&
    !errorSuperficie &&
    !errorClabe &&
    documentos.length > 0 &&
    validacionSig.length > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    obligatorios.forEach(([clave, valor]) => formData.append(clave, valor.trim()));
    documentos.forEach((archivo) => formData.append("documentos", archivo));
    formData.append("validacionSig", validacionSig[0]);
    onFinalizar?.(formData);
  };

  return (
    <form className="rc-pagina" onSubmit={handleSubmit}>
      <h1 className="rc-titulo">Registro a convocatoria</h1>
      <p className="rc-programa">
        {nombrePrograma ? `Programa ${nombrePrograma}. ` : ""}
        Llena tus datos, los de tu predio y sube tus archivos. Al terminar recibes un folio para dar seguimiento.
      </p>

      <div className="rc-contenido">
        {/* Columna izquierda: datos personales y del predio */}
        <div className="rc-columna rc-columna--datos">
          <h2 className="rc-grupo">Tus datos</h2>
          <div className="rc-campo">
            <label htmlFor="nombres">Nombre(s)</label>
            <input id="nombres" name="nombres" value={datos.nombres} onChange={handleCambio} autoComplete="given-name" />
          </div>
          <div className="rc-campo">
            <label htmlFor="apellidos">Apellidos</label>
            <input id="apellidos" name="apellidos" value={datos.apellidos} onChange={handleCambio} autoComplete="family-name" />
          </div>
          <div className="rc-campo">
            <label htmlFor="telefono">Teléfono</label>
            <input id="telefono" name="telefono" type="tel" value={datos.telefono} onChange={handleCambio} autoComplete="tel" />
          </div>
          <div className="rc-campo">
            <label htmlFor="correo">Correo electrónico</label>
            <input id="correo" name="correo" type="email" value={datos.correo} onChange={handleCambio} autoComplete="email" />
          </div>
          <div className="rc-campo rc-campo--ancho">
            <label htmlFor="direccion">Dirección</label>
            <input id="direccion" name="direccion" value={datos.direccion} onChange={handleCambio} autoComplete="street-address" />
          </div>

          <h2 className="rc-grupo">Tu predio</h2>
          <div className="rc-campo rc-campo--ancho">
            <label htmlFor="delegacion">Delegación regional (ventanilla)</label>
            <select id="delegacion" name="delegacion" value={datos.delegacion} onChange={handleCambio}>
              <option value="">Selecciona tu delegación</option>
              {DELEGACIONES.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {conConceptos && (
            <div className="rc-campo rc-campo--ancho">
              <label htmlFor="concepto">Concepto de apoyo</label>
              <select id="concepto" name="concepto" value={datos.concepto} onChange={handleCambio}>
                <option value="">Selecciona un concepto</option>
                {CONCEPTOS.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
              {concepto && <small className="rc-ayuda">{concepto.nota}</small>}
            </div>
          )}

          <div className="rc-campo">
            <label htmlFor="superficie">Superficie del predio (hectáreas)</label>
            <input
              id="superficie"
              name="superficie"
              type="number"
              min="0"
              step="0.01"
              value={datos.superficie}
              onChange={handleCambio}
              aria-invalid={Boolean(errorSuperficie)}
            />
            {errorSuperficie && <small className="rc-error">{errorSuperficie}</small>}
          </div>

          <h2 className="rc-grupo">Pago</h2>
          <div className="rc-campo rc-campo--ancho">
            <label htmlFor="clabe">CLABE interbancaria (18 dígitos)</label>
            <input
              id="clabe"
              name="clabe"
              inputMode="numeric"
              maxLength={18}
              value={datos.clabe}
              onChange={(e) => setDatos({ ...datos, clabe: e.target.value.replace(/\D/g, "") })}
              aria-invalid={Boolean(errorClabe)}
            />
            {errorClabe ? (
              <small className="rc-error">{errorClabe}</small>
            ) : (
              <small className="rc-ayuda">El apoyo se paga siempre por transferencia electrónica.</small>
            )}
          </div>
        </div>

        {/* Columna derecha: archivos y apoyo estimado */}
        <div className="rc-columna rc-columna--lado">
          <ZonaArchivo
            titulo="Suelta tus documentos aquí"
            archivos={documentos}
            onArchivos={setDocumentos}
            accept=".pdf,.doc,.docx"
            multiple
          />
          <ZonaArchivo
            titulo="Suelta tu validación de polígonos (SIG)"
            archivos={validacionSig}
            onArchivos={setValidacionSig}
            accept=".zip,.kml,.kmz,.geojson,.shp"
          />

          {apoyo && (
            <div className="rc-apoyo" aria-live="polite">
              <span className="rc-apoyo-titulo">Apoyo estimado</span>
              {apoyo.total > 0 && <strong className="rc-apoyo-total">{pesos(apoyo.total)}</strong>}
              {apoyo.total > 0 ? (
                <dl>
                  <div><dt>1ª ministración (70%)</dt><dd>{pesos(apoyo.primera)}</dd></div>
                  <div><dt>2ª ministración (30%)</dt><dd>{pesos(apoyo.segunda)}</dd></div>
                </dl>
              ) : (
                <p>Este concepto no incluye recurso económico: se entrega planta.</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="rc-acciones">
        {onRegresar && (
          <button type="button" className="rc-boton rc-boton--secundario" onClick={onRegresar}>
            Regresar
          </button>
        )}
        <button type="submit" className="rc-boton rc-boton--primario" disabled={!completo}>
          Finalizar registro
        </button>
      </div>
    </form>
  );
}
