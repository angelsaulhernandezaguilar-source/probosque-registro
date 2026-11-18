import { useState } from "react";
import { nombreConcepto } from "./datos/catalogos";
import { calcularApoyo, pesos } from "./utilidades/reglas";
import RegistroConvocatoria from "./vistas/RegistroConvocatoria";
import "./App.css";

// Módulo de registro: el usuario llena sus datos y carga su información geográfica.
// Aquí no hay backend: al finalizar se muestra lo que se enviaría al servidor.
export default function App() {
  const [enviado, setEnviado] = useState(null);

  const alFinalizar = (formData) => {
    // "formData" es lo que se mandaría con fetch("/api/solicitudes", { method: "POST", body: formData })
    setEnviado({
      nombre: `${formData.get("nombres")} ${formData.get("apellidos")}`,
      telefono: formData.get("telefono"),
      correo: formData.get("correo"),
      direccion: formData.get("direccion"),
      delegacion: formData.get("delegacion"),
      concepto: formData.get("concepto"),
      superficie: Number(formData.get("superficie")),
      clabe: formData.get("clabe"),
      documentos: formData.getAll("documentos").map((a) => a.name),
      poligono: formData.get("validacionSig").name,
    });
    window.scrollTo(0, 0);
  };

  const apoyo = enviado && calcularApoyo(enviado.concepto, enviado.superficie);

  return (
    <>
      <header className="app-barra">
        <div className="app-barra-interior">
          <div className="app-marca">
            <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
              <path d="M17 3 9 14h4l-6 8h5l-5 7h20l-5-7h5l-6-8h4z" fill="#8fc49a" />
              <rect x="15.5" y="27" width="3" height="5" fill="#8fc49a" />
            </svg>
            <div>
              <strong>PROBOSQUE</strong>
              <span>Convocatorias forestales 2026</span>
            </div>
          </div>
        </div>
      </header>

      <main className="app-principal">
        {enviado ? (
          <div className="app-pagina app-pagina--angosta">
            <h1 className="app-titulo">Registro recibido</h1>
            <p className="app-entrada">Estos son los datos y archivos que se enviarían al servidor.</p>

            <article className="app-panel">
              <dl className="app-datos">
                <dt>Solicitante</dt>
                <dd>{enviado.nombre}</dd>
                <dt>Teléfono</dt>
                <dd>{enviado.telefono}</dd>
                <dt>Correo</dt>
                <dd>{enviado.correo}</dd>
                <dt>Dirección</dt>
                <dd>{enviado.direccion}</dd>
                <dt>Delegación</dt>
                <dd>{enviado.delegacion}</dd>
                <dt>Concepto</dt>
                <dd>{nombreConcepto(enviado.concepto)}</dd>
                <dt>Superficie</dt>
                <dd>{enviado.superficie} ha</dd>
                <dt>Apoyo estimado</dt>
                <dd>{apoyo && apoyo.total > 0 ? pesos(apoyo.total) : "Sin recurso económico: se entrega planta"}</dd>
                <dt>CLABE</dt>
                <dd>{enviado.clabe}</dd>
                <dt>Documentos</dt>
                <dd>{enviado.documentos.join(", ")}</dd>
                <dt>Polígono (SIG)</dt>
                <dd>{enviado.poligono}</dd>
              </dl>
            </article>

            <div className="app-accesos">
              <button type="button" className="app-boton" onClick={() => setEnviado(null)}>
                Hacer otro registro
              </button>
            </div>
          </div>
        ) : (
          <RegistroConvocatoria nombrePrograma="Plantaciones Sustentables" onFinalizar={alFinalizar} />
        )}
      </main>
    </>
  );
}
