const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'somlance',
      password: 'cashka1234',
    });
    console.log('Successfully connected to MySQL!');
    await connection.end();
  } catch (error) {
    console.error('Failed to connect to MySQL:', error.message);
  }
}

testConnection();
