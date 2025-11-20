import express from 'express'
import cors from 'cors'
import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import chalk from 'chalk'
import createCarRouter from './car.js'
import createBookingRouter from './booking.js'
import config from './config.js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


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

// mount car router
app.use('/api/car', createCarRouter(pool))
// mount booking router
app.use('/api/booking', createBookingRouter(pool))

// serve uploaded images
// Use path.join for cross-platform compatibility
// Check if process.env.UPLOAD_DIR is set, otherwise use default relative path
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../imgcar')
app.use('/imgcar', express.static(uploadDir))

// Routes
app.get('/api', (req, res) => {
  res.json({ message: 'API is running' })
})

// Login route

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
        name: user.name, // Add this line
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

// Add new user
app.post('/api/adduser', async (req, res) => {
  const { name, email, password, role } = req.body

  try {
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
      })
    }

    // Check if email already exists
    const [existing] = await pool.execute(
      'SELECT id FROM user WHERE email = ?', 
      [email]
    )

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'อีเมลนี้ถูกใช้งานแล้ว'
      })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Insert new user with name
    const [result] = await pool.execute(
      'INSERT INTO user (name, email, password, role) VALUES (?, ?, ?, ?)',
      [ name, email, hashedPassword, role || 'user']
    )

    res.status(201).json({
      success: true,
      message: 'สร้างผู้ใช้สำเร็จ',
      userId: result.insertId,
      name: name
    })

  } catch (err) {
    console.error(chalk.red('Add user error:'), err)
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการสร้างผู้ใช้'
    })
  }
})

// User Routes
// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT id, name ,email, role FROM user')
    res.json({
      success: true,
      data: rows
    })
  } catch (err) {
    console.error('Get users error:', err)
    res.status(500).json({
      success: false,
      message: 'Database query error'
    })
  }
})

// Get user by id
app.get('/api/users/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, name, email, role FROM user WHERE id = ?', // Add name to SELECT
      [req.params.id]
    )

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบผู้ใช้งาน'
      })
    }

    res.json({
      success: true,
      data: rows[0]
    })
  } catch (err) {
    console.error('Get user error:', err)
    res.status(500).json({
      success: false,
      message: 'Database query error'
    })
  }
})

// Update user
app.put('/api/users/:id', async (req, res) => {
  const id = req.params.id
  const updates = req.body

  try {
    let sql = 'UPDATE user SET'
    const values = []
    const updateFields = []

    if (updates.name) {  // Add this block
      updateFields.push(' name = ?')
      values.push(updates.name)
    }

    if (updates.email) {
      updateFields.push(' email = ?')
      values.push(updates.email)
    }

    // Handle password hashing
    if (updates.password) {
      const salt1 = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(updates.password, salt1)
      updateFields.push(' password = ?')
      values.push(hashedPassword)
    }

    if (updates.role) {
      updateFields.push(' role = ?')
      values.push(updates.role)
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' })
    }

    sql += updateFields.join(',') + ' WHERE id = ?'
    values.push(id)

    const [result] = await pool.execute(sql, values)
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.status(200).json({
      message: 'User updated successfully'+updates.password,
      updatedFields: Object.keys(updates)
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: err.message })
  }
})

// Delete user
app.delete('/api/users/:id', async (req, res) => {
  const id = req.params.id
  try {
    const sql = 'DELETE FROM user WHERE id = ?'
    const [result] = await pool.execute(sql, [id])
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.status(200).json({ message: 'User deleted successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: err.message })
  }
})

// Serve static files from the Vue app build directory
const distDir = path.join(__dirname, '../dist')
app.use(express.static(distDir))

// Handle SPA routing: return index.html for any unknown api routes
app.get(/(.*)/, (req, res) => {
  // Don't intercept API routes that might have been missed (optional, but good practice)
  if (req.url.startsWith('/api')) {
     return res.status(404).json({ message: 'API route not found' })
  }
  res.sendFile(path.join(distDir, 'index.html'))
})

const port = config.port || 3000
// bind to all interfaces so both localhost and LAN IP (10.10.11.114) จะเข้าถึงได้
app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on http://localhost:${port} and on all interfaces (http://<your-ip>:${port})`)
})
