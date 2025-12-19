import express from 'express'
import bcrypt from 'bcryptjs'

export default function createUserRouter(pool) {
  const router = express.Router()

  // Get all users
  router.get('/', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT id, name, email, role FROM user ORDER BY id DESC')
      res.json({ success: true, data: rows })
    } catch (err) {
      console.error(err)
      res.status(500).json({ success: false, message: err.message })
    }
  })

  // Get single user
  router.get('/:id', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT id, name, email, role FROM user WHERE id = ?', [req.params.id])
      if (rows.length === 0) return res.status(404).json({ success: false, message: 'User not found' })
      res.json({ success: true, data: rows[0] })
    } catch (err) {
      console.error(err)
      res.status(500).json({ success: false, message: err.message })
    }
  })

  // Create user
  router.post('/', async (req, res) => {
    const { name, email, role, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Missing required fields' })
    }
    try {
      // check email
      const [existing] = await pool.query('SELECT id FROM user WHERE email = ?', [email])
      if (existing.length > 0) {
        return res.status(409).json({ success: false, message: 'Email already exists' })
      }

      const hash = await bcrypt.hash(password, 10)
      const [result] = await pool.execute(
        'INSERT INTO user (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, hash, role || 'user']
      )
      res.json({ success: true, id: result.insertId })
    } catch (err) {
      console.error(err)
      res.status(500).json({ success: false, message: err.message })
    }
  })

  // Update user
  router.put('/:id', async (req, res) => {
    const { name, email, role, password } = req.body
    try {
      const [users] = await pool.query('SELECT * FROM user WHERE id = ?', [req.params.id])
      if (users.length === 0) return res.status(404).json({ success: false, message: 'User not found' })

      let sql = 'UPDATE user SET name=?, email=?, role=? WHERE id=?'
      let params = [name, email, role, req.params.id]

      if (password && password.trim() !== '') {
        const hash = await bcrypt.hash(password, 10)
        sql = 'UPDATE user SET name=?, email=?, role=?, password=? WHERE id=?'
        params = [name, email, role, hash, req.params.id]
      }

      await pool.execute(sql, params)
      res.json({ success: true })
    } catch (err) {
      console.error(err)
      res.status(500).json({ success: false, message: err.message })
    }
  })

  // Delete user
  router.delete('/:id', async (req, res) => {
    try {
      await pool.execute('DELETE FROM user WHERE id = ?', [req.params.id])
      res.json({ success: true })
    } catch (err) {
      console.error(err)
      res.status(500).json({ success: false, message: err.message })
    }
  })

  return router
}
