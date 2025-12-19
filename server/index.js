import express from 'express'
import cors from 'cors'
import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import chalk from 'chalk'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

import config from './config.js'
import { authenticateToken } from './middleware/auth.js'
import createCarRouter from './car.js'
import createBookingRouter from './booking.js'
import createUserRouter from './user.js'

// Initialize dotenv
dotenv.config()

// Setup paths
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Initialize app
const app = express()

// Middleware
app.use(cors())
app.use(express.json())

app.use((req, res, next) => {
  console.log(chalk.cyan(`${req.method} ${req.url}`));
  next();
});

// Create database connection pool
const pool = mysql.createPool(config.dbConfig)

// Test database connection
async function test() {
  try {
    const [rows] = await pool.execute('select count(*) as count from user');
    console.log(chalk.green('Database connection test result:'), rows);
  } catch (err) {
    console.error(chalk.red('Error Database connection:'), err);
  }
}
test();

// Serve uploaded images
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../imgcar')
app.use('/imgcar', express.static(uploadDir))

// --- API Routes ---

// Login route (Public)
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body

  try {
    const [users] = await pool.execute(
      'SELECT * FROM user WHERE email = ?',
      [email]
    )

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'ไม่พบผู้ใช้งาน'
      })
    }

    const user = users[0]
    const match = await bcrypt.compare(password, user.password)

    if (!match) {
      return res.status(401).json({
        success: false,
        message: 'รหัสผ่านไม่ถูกต้อง'
      })
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: '24h' }
    )

    res.json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })

  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์'
    })
  }
})

// Protected Routes
// Mount routers with authentication
app.use('/api/car', authenticateToken, createCarRouter(pool))
app.use('/api/booking', authenticateToken, createBookingRouter(pool))
app.use('/api/users', authenticateToken, createUserRouter(pool))

// Basic health check
app.get('/api', (req, res) => {
  res.json({ message: 'API is running' })
})

// Serve static files from the Vue app build directory
const distDir = path.join(__dirname, '../dist')
app.use(express.static(distDir))

// Handle SPA routing: return index.html for any unknown api routes
app.get(/(.*)/, (req, res) => {
  if (req.url.startsWith('/api')) {
     return res.status(404).json({ message: 'API route not found' })
  }
  res.sendFile(path.join(distDir, 'index.html'))
})

const port = config.port || 3000
app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on http://localhost:${port} and on all interfaces (http://<your-ip>:${port})`)
})
