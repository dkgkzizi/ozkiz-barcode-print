const { Pool } = require('pg');

function getConnectionString() {
  const value = process.env.SUPABASE_CONNECTION_STRING;
  if (!value) {
    throw new Error('SUPABASE_CONNECTION_STRING environment variable is not set');
  }
  return value;
}

let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: getConnectionString(),
      ssl: { rejectUnauthorized: false },
      max: 3,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    });
  }
  return pool;
}

async function withClient(run) {
  const client = await getPool().connect();
  try {
    return await run(client);
  } finally {
    client.release();
  }
}

module.exports = { withClient };
