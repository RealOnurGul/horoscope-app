import { readFile, writeFile } from 'node:fs/promises';

const [citiesPath, countriesPath, outputPath] = process.argv.slice(2);

if (!citiesPath || !countriesPath || !outputPath) {
  throw new Error('Usage: node build-major-cities.mjs <cities15000.txt> <countryInfo.txt> <output.json>');
}

const countries = new Map(
  (await readFile(countriesPath, 'utf8'))
    .split('\n')
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const columns = line.split('\t');
      return [columns[0], columns[4]];
    }),
);

const cities = (await readFile(citiesPath, 'utf8'))
  .trim()
  .split('\n')
  .map((line) => line.split('\t'))
  .filter((columns) =>
    columns[7] !== 'PPLX' && (Number(columns[14]) >= 500000 || columns[7] === 'PPLC'),
  )
  .map((columns) => ({
    country: countries.get(columns[8]) ?? columns[8],
    countryCode: columns[8],
    latitude: Number(columns[4]),
    longitude: Number(columns[5]),
    name: columns[1],
    population: Number(columns[14]),
  }))
  .sort((a, b) => b.population - a.population);

await writeFile(outputPath, `${JSON.stringify(cities)}\n`);
console.log(`Wrote ${cities.length} cities to ${outputPath}`);
