const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://superplane_user:fkHZMr0WyuHreU67GWo9hqgNac8Np15w@dpg-d8vvt89o3t8c73bpeir0-a.oregon-postgres.render.com/superplane',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Deleting profile for kyle...\n');
    const res = await client.query("DELETE FROM profiles WHERE username = 'kyle'");
    console.log(`Deleted ${res.rowCount} row(s).`);
  } catch (err) {
    console.error('Error deleting data:', err);
  } finally {
    await client.end();
  }
}

main();
