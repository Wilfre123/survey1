const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',       // no password
  database: 'survey',
};

async function insertData(field1, field2) {
  try {
    const connection = await mysql.createConnection(dbConfig);

    const [result] = await connection.execute(
      'INSERT INTO data (field1, field2) VALUES (?, ?)',
      [field1, field2]
    );

    await connection.end();

    console.log('Data inserted with ID:', result.insertId);
  } catch (error) {
    console.error('Error inserting data:', error);
  }
}

// Example usage:
insertData('example string', 123);
