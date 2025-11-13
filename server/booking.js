import express from 'express'

export default function createBookingRouter(pool) {
  const router = express.Router()
  const TABLE = 'car_booking'

  // helper: check overlap (returns true if conflict)
  async function hasOverlap(car_id, start_dt, end_dt) {
    const [rows] = await pool.execute(
      `SELECT COUNT(*) as cnt FROM ${TABLE}
       WHERE car_id = ? AND status != 'cancelled'
         AND NOT (end_datetime <= ? OR start_datetime >= ?)`,
      [car_id, start_dt, end_dt]
    )
    return rows[0].cnt > 0
  }

  // GET /api/booking?date=YYYY-MM-DD&car_id=&start=&end=
  router.get('/', async (req, res) => {
    try {
      const { date, car_id, start, end } = req.query

      let sql = `SELECT b.*, c.name AS car_name, u.name AS user_name, u.email AS user_email
                 FROM ${TABLE} b
                 LEFT JOIN car c ON c.id = b.car_id
                 LEFT JOIN user u ON u.id = b.user_id`
      const where = []
      const vals = []

      if (car_id) { where.push('b.car_id = ?'); vals.push(car_id) }
      if (date) { where.push('DATE(b.start_datetime) = ?'); vals.push(date) }
      if (start && end) {
        where.push('(b.start_datetime >= ? AND b.start_datetime <= ?) OR (b.end_datetime >= ? AND b.end_datetime <= ?)')
        vals.push(start, end, start, end)
      }

      if (where.length) sql += ' WHERE ' + where.join(' AND ')
      sql += ' ORDER BY b.start_datetime ASC'

      const [rows] = await pool.execute(sql, vals)
      res.json({ success: true, data: rows })
    } catch (err) {
      console.error('Get bookings error:', err)
      res.status(500).json({ success: false, message: 'Database query error' })
    }
  })

  // POST /api/booking  - create booking
  router.post('/', async (req, res) => {
    try {
      console.log('POST /api/booking body:', req.body) // เพิ่ม log เพื่อตรวจสอบค่าที่มาจริง
      const { car_id, user_id, start_datetime, end_datetime, purpose, destination } = req.body

      // validate
      if (!car_id || !user_id || !start_datetime || !end_datetime) {
        return res.status(400).json({ success: false, message: 'Missing required fields' })
      }

      const carIdNum = Number(car_id)
      const userIdNum = Number(user_id)
      if (isNaN(carIdNum) || isNaN(userIdNum)) {
        return res.status(400).json({ success: false, message: 'car_id and user_id must be numbers' })
      }

      if (new Date(start_datetime) >= new Date(end_datetime)) {
        return res.status(400).json({ success: false, message: 'Invalid datetime range' })
      }
      const conflict = await hasOverlap(car_id, start_datetime, end_datetime)
      if (conflict) return res.status(409).json({ success: false, message: 'Time slot conflicts with existing booking' })

      const [result] = await pool.execute(
        `INSERT INTO ${TABLE} (car_id, user_id, start_datetime, end_datetime, purpose, destination, status)
         VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
        [car_id, user_id, start_datetime, end_datetime, purpose || null, destination || null]
      )
      res.status(201).json({ success: true, id: result.insertId })
    } catch (err) {
      console.error('Create booking error:', err)
      res.status(500).json({ success: false, message: 'Database insert error' })
    }
  })

  // PUT /api/booking/:id  - update status (approve/reject/complete)
  router.put('/:id', async (req, res) => {
    try {
      const id = req.params.id
      const { status } = req.body
      if (!status) return res.status(400).json({ success: false, message: 'Missing status' })
      const allowed = ['pending','approved','rejected','completed','cancelled']
      if (!allowed.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' })

      const [result] = await pool.execute(`UPDATE ${TABLE} SET status = ? WHERE id = ?`, [status, id])
      if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Not found' })
      res.json({ success: true, message: 'Updated' })
    } catch (err) {
      console.error('Update booking error:', err)
      res.status(500).json({ success: false, message: 'Database update error' })
    }
  })

  // PUT /api/booking/:id/cancel - cancel booking (user action)
  router.put('/:id/cancel', async (req, res) => {
    try {
      const id = req.params.id
      const [result] = await pool.execute(`UPDATE ${TABLE} SET status = 'cancelled' WHERE id = ?`, [id])
      if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Not found' })
      res.json({ success: true, message: 'Cancelled' })
    } catch (err) {
      console.error('Cancel booking error:', err)
      res.status(500).json({ success: false, message: 'Database update error' })
    }
  })

  // GET /api/booking/car/:id/history?start=&end=
  router.get('/car/:id/history', async (req, res) => {
    try {
      const carId = req.params.id
      const { start, end } = req.query
      let sql = `SELECT b.*, u.name AS user_name FROM ${TABLE} b LEFT JOIN user u ON u.id = b.user_id WHERE b.car_id = ?`
      const vals = [carId]
      if (start) { sql += ' AND b.start_datetime >= ?'; vals.push(start) }
      if (end) { sql += ' AND b.end_datetime <= ?'; vals.push(end) }
      sql += ' ORDER BY b.start_datetime DESC'
      const [rows] = await pool.execute(sql, vals)
      res.json({ success: true, data: rows })
    } catch (err) {
      console.error('Car history error:', err)
      res.status(500).json({ success: false, message: 'Database query error' })
    }
  })

  return router
}