import { Link } from "react-router-dom";
import { nombrePrograma } from "../datos/catalogos";
import { useAlmacen } from "../estado/Almacen";
import { estadoConvocatoria, fechaLarga, hoyISO } from "../utilidades/reglas";

const ETIQUETA = { abierta: "Registro abierto", proxima: "Próxima", cerrada: "Cerrada" };

const diasEntre = (desde, hasta) =>
  Math.round((new Date(`${hasta}T00:00`) - new Date(`${desde}T00:00`)) / 86400000);

// Curvas de nivel decorativas
function CurvasDeNivel() {
  const curvas = [
    [270, 250, 0], [240, 215, 8], [205, 180, -6], [168, 142, 12], [128, 104, -4], [86, 66, 10], [44, 30, 0],
  ];
  return (
    <svg className="inicio-curvas" viewBox="0 0 560 560" aria-hidden="true">
      {curvas.map(([rx, ry, giro], i) => (
        <ellipse
          key={i}
          cx={280 + i * 9}
          cy={280 - i * 6}
          rx={rx}
          ry={ry}
          transform={`rotate(${giro + 18} 280 280)`}
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.16"
          strokeWidth="1.5"
        />
      ))}
    </svg>
  );
}

export default function Convocatorias() {
  const { convocatorias, solicitudes } = useAlmacen();
  const ordenadas = [...convocatorias].sort((a, b) => b.id - a.id);
  const hoy = hoyISO();

  return (
    <>
      <section className="inicio-banda">
        <CurvasDeNivel />
        <div className="inicio-banda-interior">
          <h1>Apoyos para plantar y cuidar el bosque</h1>
          <p>
            Regístrate en línea a las convocatorias de PROBOSQUE y sigue tu solicitud con tu folio,
            sin vueltas a la delegación.
          </p>
        </div>
      </section>

      <div className="app-pagina">
        <h2 className="app-subtitulo" style={{ marginTop: 0 }}>Convocatorias publicadas</h2>

        {ordenadas.length === 0 && (
          <p className="app-vacio">
            Todavía no hay convocatorias. La Dirección General puede publicar la primera desde “Publicar”.
          </p>
        )}

        {ordenadas.map((c) => {
          const estado = estadoConvocatoria(c, hoy);
          const registradas = solicitudes.filter((s) => s.convocatoriaId === c.id).length;
          const restan = diasEntre(hoy, c.fechaClausura);
          return (
            <article key={c.id} className="convocatoria">
              <h2>{nombrePrograma(c.programa)}</h2>
              <p className="convocatoria-texto">{c.texto}</p>
              <ul className="convocatoria-meta">
                <li>Reglas de operación: {c.reglasNombre}</li>
                <li>{registradas} {registradas === 1 ? "solicitud registrada" : "solicitudes registradas"}</li>
              </ul>

              <div className="convocatoria-lado">
                <span className={`app-etiqueta app-etiqueta--${estado}`}>{ETIQUETA[estado]}</span>
                {estado === "abierta" && (
                  <>
                    <p className="convocatoria-plazo">
                      <strong>
                        {restan === 0 ? "Cierra hoy" : `${restan === 1 ? "Queda 1 día" : `Quedan ${restan} días`}`}
                      </strong>
                      Cierra el {fechaLarga(c.fechaClausura)}
                    </p>
                    <Link className="app-boton app-boton--primario" to={`/registro/${c.id}`}>
                      Registrarme
                    </Link>
                  </>
                )}
                {estado === "proxima" && (
                  <p className="convocatoria-plazo">
                    <strong>Abre el {fechaLarga(c.fechaApertura)}</strong>
                    Cierra el {fechaLarga(c.fechaClausura)}
                  </p>
                )}
                {estado === "cerrada" && (
                  <p className="convocatoria-plazo">Cerró el {fechaLarga(c.fechaClausura)}</p>
                )}
              </div>
            </article>
          );
        })}

        <div className="app-accesos">
          <Link className="app-boton" to="/estatus">Consultar mi solicitud</Link>
        </div>
      </div>
    </>
  );
}
