import { readFile, writeFile } from 'node:fs/promises';

const [inputPath, outputPath] = process.argv.slice(2);

if (!inputPath || !outputPath) {
  throw new Error('Usage: node build-world-boundaries.mjs <countries.geojson> <output.json>');
}

const geojson = JSON.parse(await readFile(inputPath, 'utf8'));
const lines = [];

for (const feature of geojson.features) {
  const polygons = feature.geometry.type === 'Polygon'
    ? [feature.geometry.coordinates]
    : feature.geometry.coordinates;

  for (const polygon of polygons) {
    for (const ring of polygon) {
      const flattened = [];
      for (const [longitude, latitude] of ring) {
        flattened.push(Math.round(longitude * 100), Math.round(latitude * 100));
      }
      lines.push(flattened);
    }
  }
}

await writeFile(outputPath, `${JSON.stringify(lines)}\n`);
console.log(`Wrote ${lines.length} boundary lines to ${outputPath}`);
