import dotenv from 'dotenv'
dotenv.config()

export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: 'fatima_car',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}




