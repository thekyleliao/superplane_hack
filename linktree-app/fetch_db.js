const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://superplane_user:fkHZMr0WyuHreU67GWo9hqgNac8Np15w@dpg-d8vvt89o3t8c73bpeir0-a.oregon-postgres.render.com/superplane',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Fetching profiles from the database...\n');
    const res = await client.query('SELECT * FROM profiles');
    console.table(res.rows);
  } catch (err) {
    console.error('Error fetching data:', err);
  } finally {
    await client.end();
  }
}

main();
