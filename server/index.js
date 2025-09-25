import express from 'express'
import cors from 'cors'
import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { dbConfig, jwtSecret } from './dbconfig.js'

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Create database connection pool
const pool = mysql.createPool(dbConfig)

// Test database connection
async function test() {
  try {
    const [rows] = await pool.execute('select count(*) as count from user');
    console.log('Database connection test result:', rows);
  } catch (err) {
    console.error('Database connection error:', err);
  }
}

test();

// Routes
app.get('/', (req, res) => {
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
      jwtSecret,
      { expiresIn: '24h' }
    )

    res.json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      token,
      user: {
        id: user.id,
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

// User Routes
// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT id, email, role FROM user')
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
      'SELECT id, email, role FROM user WHERE id = ?',
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

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Server Start >> running on port ${port}`)
})
