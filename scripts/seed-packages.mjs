import mysql from 'mysql2/promise';

const url = process.env.DATABASE_URL;
if (!url) { console.error('DATABASE_URL not set'); process.exit(1); }

const conn = await mysql.createConnection(url);

// Create table
await conn.execute(`CREATE TABLE IF NOT EXISTS \`membershipPackages\` (
  \`id\` int AUTO_INCREMENT NOT NULL,
  \`slug\` varchar(100) NOT NULL,
  \`name\` varchar(255) NOT NULL,
  \`nameEn\` varchar(255),
  \`price\` int NOT NULL,
  \`regularPrice\` int,
  \`description\` text,
  \`descriptionEn\` text,
  \`features\` text,
  \`featuresEn\` text,
  \`imageUrl\` text,
  \`category\` varchar(50) NOT NULL DEFAULT 'nutricion',
  \`badge\` varchar(50),
  \`isActive\` boolean NOT NULL DEFAULT true,
  \`sortOrder\` int NOT NULL DEFAULT 0,
  \`createdAt\` timestamp NOT NULL DEFAULT (now()),
  \`updatedAt\` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT \`membershipPackages_id\` PRIMARY KEY(\`id\`),
  CONSTRAINT \`membershipPackages_slug_unique\` UNIQUE(\`slug\`)
)`);
console.log('Table created!');

// Seed packages
const packages = [
  {
    slug: 'pkg-nutricion',
    name: 'Paquete Nutrición',
    nameEn: 'Nutrition Package',
    price: 2000,
    regularPrice: 3200,
    description: 'Programa completo de asesoría nutricional personalizada con seguimiento y escaneos corporales.',
    descriptionEn: 'Complete personalized nutritional counseling program with follow-up and body scans.',
    features: JSON.stringify(['4 asesorías nutricionales personalizadas','4 escaneos corporales','10% de descuento en tratamientos corporales','Acceso a seguimiento online']),
    featuresEn: JSON.stringify(['4 personalized nutritional consultations','4 body scans','10% discount on body treatments','Access to online follow-up']),
    imageUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/paquete-nutricion-iZYFQemGqyUBv8zktgvgAM.webp',
    category: 'nutricion',
    badge: 'mostPopular',
    isActive: true,
    sortOrder: 1,
  },
  {
    slug: 'pkg-reductor',
    name: 'Paquete Reductor Nutriser',
    nameEn: 'Nutriser Slimming Package',
    price: 4500,
    regularPrice: 6500,
    description: 'Paquete integral de reducción corporal: cavitaciones, radiofrecuencias y mesoterapia reductora.',
    descriptionEn: 'Comprehensive body slimming package: cavitation, radiofrequency and reducing mesotherapy.',
    features: JSON.stringify(['4 asesorías nutricionales personalizadas','4 sesiones de Cavitación corporal','4 sesiones de Radiofrecuencia corporal','4 sesiones de Mesoterapia reductora','10% de descuento en tratamientos faciales','10% de descuento en compra de productos']),
    featuresEn: JSON.stringify(['4 personalized nutritional consultations','4 body cavitation sessions','4 body radiofrequency sessions','4 reducing mesotherapy sessions','10% discount on facial treatments','10% discount on product purchases']),
    imageUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/paquete-reductor-ZsAtHwV2VSTjMf52QKYuRC.webp',
    category: 'corporales',
    badge: 'maxSavings',
    isActive: true,
    sortOrder: 2,
  },
];

for (const pkg of packages) {
  await conn.execute(
    `INSERT IGNORE INTO \`membershipPackages\` (slug, name, nameEn, price, regularPrice, description, descriptionEn, features, featuresEn, imageUrl, category, badge, isActive, sortOrder) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [pkg.slug, pkg.name, pkg.nameEn, pkg.price, pkg.regularPrice, pkg.description, pkg.descriptionEn, pkg.features, pkg.featuresEn, pkg.imageUrl, pkg.category, pkg.badge, pkg.isActive, pkg.sortOrder]
  );
  console.log(`Inserted: ${pkg.name}`);
}

await conn.end();
console.log('Done!');
