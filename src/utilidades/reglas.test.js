import { describe, expect, it } from "vitest";
import {
  calcularApoyo,
  estadoConvocatoria,
  sumarDiasHabiles,
  validarClabe,
  validarSuperficie,
} from "./reglas";

describe("validarClabe", () => {
  it("acepta una CLABE con dígito verificador correcto", () => {
    expect(validarClabe("000000001234567897")).toBe(true);
  });
  it("rechaza dígito verificador incorrecto, longitud o letras", () => {
    expect(validarClabe("000000001234567890")).toBe(false);
    expect(validarClabe("12345")).toBe(false);
    expect(validarClabe("00000000123456789A")).toBe(false);
  });
});

describe("calcularApoyo", () => {
  it("plantación: $10,000/ha en 70% y 30%", () => {
    expect(calcularApoyo("plantacion", 12)).toEqual({ total: 120000, primera: 84000, segunda: 36000 });
  });
  it("mantenimiento: $5,000/ha", () => {
    expect(calcularApoyo("mantenimiento", 0.5).total).toBe(2500);
  });
  it("navideño: sin recurso económico", () => {
    expect(calcularApoyo("navideno", 3).total).toBe(0);
  });
});

describe("validarSuperficie", () => {
  it("respeta los rangos por concepto", () => {
    expect(validarSuperficie("plantacion", "0.5")).not.toBe("");
    expect(validarSuperficie("plantacion", "151")).not.toBe("");
    expect(validarSuperficie("plantacion", "150")).toBe("");
    expect(validarSuperficie("mantenimiento", "0.5")).toBe("");
    expect(validarSuperficie("navideno", "500")).toBe("");
  });
});

describe("sumarDiasHabiles", () => {
  it("salta sábados y domingos", () => {
    // martes 17-nov-2026 + 5 días hábiles = martes 24-nov-2026
    expect(sumarDiasHabiles("2026-11-17", 5)).toBe("2026-11-24");
    // viernes 20-nov-2026 + 1 día hábil = lunes 23-nov-2026
    expect(sumarDiasHabiles("2026-11-20", 1)).toBe("2026-11-23");
  });
});

describe("estadoConvocatoria", () => {
  const c = { fechaApertura: "2026-11-01", fechaClausura: "2026-12-18" };
  it("distingue próxima, abierta y cerrada", () => {
    expect(estadoConvocatoria(c, "2026-10-31")).toBe("proxima");
    expect(estadoConvocatoria(c, "2026-12-18")).toBe("abierta");
    expect(estadoConvocatoria(c, "2026-12-19")).toBe("cerrada");
  });
});
