const { Client } = require('pg');
const client = new Client({
  user: process.env.DB_USER || 'deppi',
  password: process.env.DB_PASSWORD || 'd3pp1@2026',
  host: process.env.DB_HOST || 'postgres',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'deppi'
});
client.connect()
  .then(() => {
    console.log('Successfully connected with explicit credentials!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Failed to connect with explicit credentials:', err.message);
    process.exit(1);
  });
