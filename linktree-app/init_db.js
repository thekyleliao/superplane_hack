const { Client } = require('pg');
const fs = require('fs');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://superplane_user:fkHZMr0WyuHreU67GWo9hqgNac8Np15w@dpg-d8vvt89o3t8c73bpeir0-a.oregon-postgres.render.com/superplane',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to Render database');
    const schema = fs.readFileSync('./schema.sql', 'utf8');
    await client.query(schema);
    console.log('Schema successfully applied');
  } catch (err) {
    console.error('Error applying schema:', err);
  } finally {
    await client.end();
  }
}

main();
