import dotenv from 'dotenv'
import mysql from 'mysql2/promise'

dotenv.config()

const dbConfig = {
  host: process.env.DB_HOST ,
  user: process.env.DB_USER ,
  password: process.env.DB_PASSWORD ,
  database: process.env.DB_DATABASE ,
  port: process.env.DB_PORT ,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}

// Create pool connection
const pool = mysql.createPool(dbConfig)

// Test database connection
async function testConnection() {
  try {
    const [rows] = await pool.execute('SELECT COUNT(*) as count FROM user')
    console.log('Database connection test result:', rows)
    return true
  } catch (err) {
    console.error('Database connection error:', err)
    return false
  }
}

export default {
  port: process.env.PORT || 3000,
  pool,
  dbConfig,
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  testConnection
}

// Run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testConnection()
}
