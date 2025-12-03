import mysql from 'mysql2/promise';
import { dbConfig } from './server/dbconfig.js';
import dotenv from 'dotenv';

dotenv.config();

async function createTable() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    const sql = `
      CREATE TABLE IF NOT EXISTS daily (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        date DATE NOT NULL,
        start_time TIME,
        end_time TIME,
        project VARCHAR(255),
        task TEXT,
        category VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE SET NULL
      )
    `;

    await connection.execute(sql);
    console.log("Table 'daily' created successfully.");
    await connection.end();
  } catch (err) {
    console.error("Error creating table:", err);
  }
}

createTable();
