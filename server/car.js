import express from 'express'
import chalk from 'chalk'
import multer from 'multer'
import fs from 'fs'
import path from 'path'

export default function createCarRouter(pool) {
  const router = express.Router()
  const TABLE = 'car' // เปลี่ยนถ้าจำเป็น

  // ensure upload dir
  const UPLOAD_DIR = './imgcar/'
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname) || ''   // <-- ดึงนามสกุลจากไฟล์ต้นทาง
      const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`
      cb(null, name)
    }
  })
  const upload = multer({ storage })

  // helper: format date to dd-mm-yyyy (handles 'YYYY-MM-DD' string or Date)
  function formatDate(val) {
    if (!val) return ''
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
      const [y, m, d] = val.split('-')
      return `${d}-${m}-${y}`
    }
    const dt = new Date(val)
    const d = String(dt.getDate()).padStart(2, '0')
    const m = String(dt.getMonth() + 1).padStart(2, '0')
    const y = dt.getFullYear()
    return `${d}-${m}-${y}`
  }

  // GET /api/car/         - list all
  router.get('/', async (req, res) => {
    try {
      const [rows] = await pool.execute(
        `SELECT id, name, status, start_date, end_dete, img FROM ${TABLE}`
      )
      const data = rows.map((r) => ({
        ...r,
        start_date: formatDate(r.start_date),
        end_dete: formatDate(r.end_dete)
      }))
      res.json({ success: true, data })
    } catch (err) {
      console.error(chalk.red('Get cars error:'), err)
      res.status(500).json({ success: false, message: 'Database query error' })
    }
  })

  // GET /api/car/:id      - get one
  router.get('/:id', async (req, res) => {
    try {
      const [rows] = await pool.execute(
        `SELECT id, name, status, start_date, end_dete, img FROM ${TABLE} WHERE id = ?`,
        [req.params.id]
      )
      if (rows.length === 0) return res.status(404).json({ success: false, message: 'Not found' })
      const row = rows[0]
      row.start_date = formatDate(row.start_date)
      row.end_dete = formatDate(row.end_dete)
      res.json({ success: true, data: row })
    } catch (err) {
      console.error(chalk.red('Get car error:'), err)
      res.status(500).json({ success: false, message: 'Database query error' })
    }
  })

  // PUT /api/car/:id      - update (also accepts multipart/form-data)
  router.put('/:id', upload.single('img'), async (req, res) => {
    const id = req.params.id
    const updates = req.body
    const fields = []
    const values = []

    if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name) }
    if (updates.status !== undefined) { fields.push('status = ?'); values.push(updates.status) }
    if (updates.start_date !== undefined) { fields.push('start_date = ?'); values.push(updates.start_date) }
    if (updates.end_dete !== undefined) { fields.push('end_dete = ?'); values.push(updates.end_dete) }
    if (req.file) { fields.push('img = ?'); values.push(req.file.filename) } else if (updates.img !== undefined) { fields.push('img = ?'); values.push(updates.img) }

    if (fields.length === 0) return res.status(400).json({ success: false, message: 'No fields to update' })

    values.push(id)
    try {
      const sql = `UPDATE ${TABLE} SET ${fields.join(', ')} WHERE id = ?`
      const [result] = await pool.execute(sql, values)
      if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Not found' })
      res.json({ success: true, message: 'Updated' })
    } catch (err) {
      console.error(chalk.red('Update car error:'), err)
      res.status(500).json({ success: false, message: 'Database update error' })
    }
  })

  // DELETE /api/car/:id   - delete
  router.delete('/:id', async (req, res) => {
    try {
      const [result] = await pool.execute(`DELETE FROM ${TABLE} WHERE id = ?`, [req.params.id])
      if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Not found' })
      res.json({ success: true, message: 'Deleted' })
    } catch (err) {
      console.error(chalk.red('Delete car error:'), err)
      res.status(500).json({ success: false, message: 'Database delete error' })
    }
  })

  // POST /api/car/ - create (accepts multipart/form-data, field 'img')
  router.post('/', upload.single('img'), async (req, res) => {
    const { name, status, start_date, end_dete } = req.body
    const img = req.file ? req.file.filename : (req.body.img || null)

    if (!name || !status || !start_date || !end_dete) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' })
    }

    try {
      const [result] = await pool.execute(
        `INSERT INTO ${TABLE} (name, status, start_date, end_dete, img) VALUES (?, ?, ?, ?, ?)`,
        [name, status, start_date, end_dete, img]
      )
      res.status(201).json({ success: true, message: 'Created', id: result.insertId })
    } catch (err) {
      console.error(chalk.red('Create car error:'), err)
      res.status(500).json({ success: false, message: 'Database insert error' })
    }
  })

  return router
}