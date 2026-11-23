// Las solicitudes de demostración solo traen el nombre de sus documentos.
// Para poder previsualizarlas se arma un PDF mínimo de una página con ese nombre.

// Texto apto para una cadena PDF: solo Latin-1 y con los paréntesis escapados
const limpiar = (texto) =>
  Array.from(String(texto))
    .map((c) => (c.charCodeAt(0) > 255 ? "?" : c))
    .join("")
    .replace(/([\\()])/g, "\\$1");

export function textoPdfDemostracion({ nombre, folio, solicitante }) {
  const lineas = [
    [18, nombre.replace(/\.pdf$/i, "")],
    [12, `Folio: ${folio}`],
    [12, `Solicitante: ${solicitante}`],
    [12, "Documento de demostración."],
    [12, "El prototipo no conserva el archivo original de las solicitudes de ejemplo."],
  ];
  const contenido = lineas
    .map(([tamano, texto], i) => `BT /F1 ${tamano} Tf 72 ${700 - i * 32} Td (${limpiar(texto)}) Tj ET`)
    .join("\n");

  const objetos = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${contenido.length} >>\nstream\n${contenido}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
  ];

  // Cada carácter ocupa un byte (Latin-1), así que la longitud del texto es la posición en el archivo
  let pdf = "%PDF-1.4\n";
  const posiciones = objetos.map((objeto, i) => {
    const posicion = pdf.length;
    pdf += `${i + 1} 0 obj\n${objeto}\nendobj\n`;
    return posicion;
  });
  const inicioTabla = pdf.length;
  pdf += `xref\n0 ${objetos.length + 1}\n0000000000 65535 f \n`;
  pdf += posiciones.map((p) => `${String(p).padStart(10, "0")} 00000 n \n`).join("");
  pdf += `trailer\n<< /Size ${objetos.length + 1} /Root 1 0 R >>\nstartxref\n${inicioTabla}\n%%EOF`;
  return pdf;
}

export function pdfDemostracion(datos) {
  const bytes = Uint8Array.from(textoPdfDemostracion(datos), (c) => c.charCodeAt(0));
  return new Blob([bytes], { type: "application/pdf" });
}
