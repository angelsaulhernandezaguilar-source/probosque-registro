import { CONCEPTOS } from "../datos/catalogos";

// ---------- Fechas ----------

// Fecha local en formato AAAA-MM-DD (el mismo que usa <input type="date">)
export function aISO(fecha) {
  const m = String(fecha.getMonth() + 1).padStart(2, "0");
  const d = String(fecha.getDate()).padStart(2, "0");
  return `${fecha.getFullYear()}-${m}-${d}`;
}

export const hoyISO = () => aISO(new Date());

function desdeISO(iso) {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(a, m - 1, d);
}

// Suma días hábiles (lunes a viernes). No descuenta días festivos.
export function sumarDiasHabiles(iso, dias) {
  const fecha = desdeISO(iso);
  let faltan = dias;
  while (faltan > 0) {
    fecha.setDate(fecha.getDate() + 1);
    const dia = fecha.getDay();
    if (dia !== 0 && dia !== 6) faltan--;
  }
  return aISO(fecha);
}

export function fechaLarga(iso) {
  if (!iso) return "";
  return desdeISO(iso).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// "abierta" | "proxima" | "cerrada" según las fechas de la convocatoria
export function estadoConvocatoria(convocatoria, hoy = hoyISO()) {
  if (hoy < convocatoria.fechaApertura) return "proxima";
  if (hoy > convocatoria.fechaClausura) return "cerrada";
  return "abierta";
}

// ---------- CLABE (necesidad #23) ----------

// 18 dígitos; el último es un dígito verificador con pesos 3-7-1
export function validarClabe(clabe) {
  if (!/^\d{18}$/.test(clabe)) return false;
  const pesos = [3, 7, 1];
  let suma = 0;
  for (let i = 0; i < 17; i++) {
    suma += (Number(clabe[i]) * pesos[i % 3]) % 10;
  }
  const verificador = (10 - (suma % 10)) % 10;
  return verificador === Number(clabe[17]);
}

// ---------- Superficie y montos (necesidades #5 y #9) ----------

// Devuelve un mensaje de error, o "" si la superficie es válida para el concepto
export function validarSuperficie(conceptoId, superficie) {
  const concepto = CONCEPTOS.find((c) => c.id === conceptoId);
  const ha = Number(superficie);
  if (!concepto || superficie === "" || Number.isNaN(ha)) return "";
  if (ha < concepto.minHa) return `La superficie mínima para este concepto es de ${concepto.minHa} ha.`;
  if (concepto.maxHa && ha > concepto.maxHa) return `La superficie máxima para este concepto es de ${concepto.maxHa} ha.`;
  return "";
}

// Apoyo total y sus dos ministraciones (70% y 30%)
export function calcularApoyo(conceptoId, superficie) {
  const concepto = CONCEPTOS.find((c) => c.id === conceptoId);
  const ha = Number(superficie);
  if (!concepto || !ha || ha <= 0) return null;
  const total = Math.round(concepto.montoPorHa * ha * 100) / 100;
  const primera = Math.round(total * 0.7 * 100) / 100;
  return { total, primera, segunda: Math.round((total - primera) * 100) / 100 };
}

export const pesos = (monto) =>
  monto.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
