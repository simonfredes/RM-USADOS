// Isolated fixtures: this server never connects to the shared Supabase database.
import { createServer } from 'node:http';

let mode = 'empty';
let delay = 0;
const base = { sitio: 'usados', estado: 'publicado', combustible: 'Nafta', transmision: 'Automática', carroceria: 'Sedán', color: 'Gris', moneda: 'USD' };
const vehicles = [
  { ...base, id: 'fixture-audi', slug: 'audi-a6-45-tfsi-2023', marca: 'Audi', modelo: 'A6', version: '45 TFSI quattro · Unidad de prueba', anio: 2023, kilometraje: 18500, precio: 68000, descripcion: '245 CV · Única mano', ubicacion: 'Bahía Blanca, Buenos Aires', imagenes_vehiculo: [{ storage_path: 'sedan.png', orden: 0 }, { storage_path: 'suv-angle.png', orden: 1 }, { storage_path: 'suv-rear.png', orden: 2 }] },
  { ...base, id: 'fixture-mercedes', slug: 'mercedes-benz-gle-450-2024', marca: 'Mercedes-Benz', modelo: 'GLE 450 4MATIC AMG Line Premium Plus con paquete de asistencia a la conducción', version: 'Configuración extensa para pruebas de responsive', anio: 2024, kilometraje: 27000, precio: 123456789, carroceria: 'SUV', imagenes_vehiculo: [{ storage_path: 'suv.png', orden: 0 }] },
  { ...base, id: 'fixture-bmw', marca: 'BMW', modelo: 'Serie 8', version: 'M850i xDrive · Unidad de prueba', anio: 2021, kilometraje: null, precio: null, imagenes_vehiculo: [] },
  { ...base, id: 'fixture-porsche', slug: 'porsche-911-carrera-2022', marca: 'Porsche', modelo: '911 Carrera', version: 'Fotografía fallida · Unidad de prueba', anio: 2022, kilometraje: 9200, precio: 155000, imagenes_vehiculo: [{ storage_path: 'broken.png', orden: 0 }] },
];

createServer((req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1:54329');
  res.setHeader('Content-Type', 'application/json');
  if (url.pathname === '/__fixtures') {
    if (req.method === 'PUT') { mode = url.searchParams.get('mode') || 'empty'; delay = Number(url.searchParams.get('delay')) || 0; }
    res.end(JSON.stringify({ mode }));
    return;
  }
  if (url.pathname === '/rest/v1/vehiculos') {
    if (url.searchParams.get('sitio') !== 'eq.usados' || url.searchParams.get('estado') !== 'eq.publicado') {
      res.writeHead(400); res.end(JSON.stringify({ message: 'Missing public catalog filters' })); return;
    }
    setTimeout(() => res.end(JSON.stringify(mode === 'stock' ? vehicles : [])), delay);
    return;
  }
  res.writeHead(404); res.end(JSON.stringify({ message: 'Fixture not found' }));
}).listen(54329, '127.0.0.1', () => console.log('RM catalog fixtures: http://127.0.0.1:54329'));
