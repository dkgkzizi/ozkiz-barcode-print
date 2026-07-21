const { Client } = require('pg');

function getConnectionString() {
  const value = process.env.SUPABASE_CONNECTION_STRING;
  if (!value) {
    throw new Error('SUPABASE_CONNECTION_STRING environment variable is not set');
  }
  return value;
}

async function withClient(run) {
  const client = new Client({
    connectionString: getConnectionString(),
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  try {
    return await run(client);
  } finally {
    await client.end();
  }
}

module.exports = { withClient };
