import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import readXlsxFile from "read-excel-file/node";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDirectory = path.join(root, "edu", "outros_relatorios");
const outputFile = path.join(root, "app", "data", "machine-readings.json");

if (!fs.existsSync(sourceDirectory)) {
  throw new Error(`Pasta de origem não encontrada: ${sourceDirectory}`);
}

const files = fs
  .readdirSync(sourceDirectory)
  .filter((file) => file.toLowerCase().endsWith(".xlsx"))
  .sort((a, b) => a.localeCompare(b, "pt-BR"));

if (!files.length) {
  throw new Error("Nenhum relatório .xlsx foi encontrado na pasta edu/outros_relatorios.");
}

function isoDate(value) {
  if (value instanceof Date && !Number.isNaN(value.valueOf())) {
    return value.toISOString().slice(0, 10);
  }

  const raw = String(value ?? "").trim().slice(0, 10);
  const match = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) throw new Error(`Data inválida no relatório: ${String(value)}`);
  return `${match[3]}-${match[2]}-${match[1]}`;
}

function number(value, field, file) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Valor inválido em ${field}, arquivo ${file}: ${String(value)}`);
  }
  return parsed;
}

const readings = [];

for (const file of files) {
  const workbook = await readXlsxFile(path.join(sourceDirectory, file));
  const rows = Array.isArray(workbook[0]) ? workbook : workbook[0]?.data;

  if (!rows || rows.length < 2 || rows[0][0] !== "Máquina") {
    throw new Error(`Formato inesperado no relatório ${file}.`);
  }

  for (const row of rows.slice(1)) {
    if (!row[0]) continue;
    readings.push({
      machine: String(row[0]),
      model: String(row[1]),
      type: String(row[2]),
      serial: String(row[3]),
      organization: String(row[4]),
      periodStart: isoDate(row[6]),
      periodEnd: isoDate(row[7]),
      lifetimeEngineHours: number(row[8], "horas de vida útil", file),
      averageFuelRate: number(row[10], "taxa média de combustível", file),
      fuelConsumed: number(row[12], "combustível consumido", file),
      idleFuel: number(row[14], "combustível ocioso", file),
      highLoadFuel: number(row[16], "combustível em carga alta", file),
      mediumLoadFuel: number(row[18], "combustível em carga média", file),
      lowLoadFuel: number(row[20], "combustível em carga baixa", file),
      productivePercent: number(row[22], "utilização trabalhando", file),
      idlePercent: number(row[24], "utilização ocioso", file),
      idleHours: number(row[26], "horas ociosas", file),
      productiveHours: number(row[28], "horas trabalhando", file),
      source: file,
    });
  }
}

readings.sort(
  (a, b) =>
    a.periodStart.localeCompare(b.periodStart) || a.machine.localeCompare(b.machine),
);

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, `${JSON.stringify(readings, null, 2)}\n`, "utf8");

const periods = new Set(readings.map((reading) => reading.periodStart)).size;
console.log(
  `Importação concluída: ${readings.length} registros, ${periods} períodos mensais, ${files.length} arquivos.`,
);
console.log(`Saída: ${path.relative(root, outputFile)}`);
