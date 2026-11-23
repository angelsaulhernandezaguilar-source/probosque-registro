import { describe, expect, it } from "vitest";
import { textoPdfDemostracion } from "./pdfDemo";

describe("textoPdfDemostracion", () => {
  const pdf = textoPdfDemostracion({
    nombre: "Título (copia).pdf",
    folio: "PS-2026-0003",
    solicitante: "Rosa Elena Martínez Cruz",
  });

  it("arma un PDF con encabezado y cierre", () => {
    expect(pdf.startsWith("%PDF-1.4")).toBe(true);
    expect(pdf.endsWith("%%EOF")).toBe(true);
  });

  it("apunta la tabla de referencias y cada objeto a su posición real", () => {
    const inicioTabla = Number(pdf.match(/startxref\n(\d+)/)[1]);
    expect(pdf.slice(inicioTabla, inicioTabla + 4)).toBe("xref");

    const posiciones = [...pdf.matchAll(/^(\d{10}) 00000 n /gm)].map((m) => Number(m[1]));
    expect(posiciones).toHaveLength(5);
    posiciones.forEach((p, i) => expect(pdf.slice(p).startsWith(`${i + 1} 0 obj`)).toBe(true));
  });

  it("escapa los paréntesis y solo usa caracteres de un byte", () => {
    expect(pdf).toContain("(Título \\(copia\\))");
    expect(Array.from(pdf).every((c) => c.charCodeAt(0) <= 255)).toBe(true);
  });
});
