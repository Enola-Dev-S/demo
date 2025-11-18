import express from 'express'
import { sendBookingNotification, getAdminEmails, getUserInfo } from './emailService.js'

export default function createBookingRouter(pool) {
  const router = express.Router()
  const TABLE = 'car_booking'

  // helper: check overlap (returns true if conflict)
  async function hasOverlap(car_id, start_dt, end_dt, excludeId = null) {
    let sql = `SELECT COUNT(*) as cnt FROM ${TABLE}
       WHERE car_id = ? AND status != 'cancelled'
         AND NOT (end_datetime <= ? OR start_datetime >= ?)`
    const vals = [car_id, start_dt, end_dt]
    if (excludeId !== null && excludeId !== undefined) {
      sql += ' AND id != ?'
      vals.push(excludeId)
    }
    const [rows] = await pool.execute(sql, vals)
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
      res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' })
    }
  })

  // POST /api/booking  - create booking
  router.post('/', async (req, res) => {
    try {
      console.log('POST /api/booking body:', req.body) // เพิ่ม log เพื่อตรวจสอบค่าที่มาจริง
      const {
        car_id,
        user_id,
        start_datetime,
        end_datetime,
        purpose,
        destination,
        status: rawStatus
      } = req.body

      // validate
      if (!car_id || !user_id || !start_datetime || !end_datetime) {
        return res.status(400).json({ success: false, message: 'ข้อมูลที่จำเป็นไม่ครบถ้วน' })
      }

      const carIdNum = Number(car_id)
      const userIdNum = Number(user_id)
      if (isNaN(carIdNum) || isNaN(userIdNum)) {
        return res.status(400).json({ success: false, message: 'car_id และ user_id ต้องเป็นตัวเลข' })
      }

      if (new Date(start_datetime) >= new Date(end_datetime)) {
        return res.status(400).json({ success: false, message: 'ช่วงวันที่/เวลาไม่ถูกต้อง' })
      }
      const conflict = await hasOverlap(car_id, start_datetime, end_datetime)
      if (conflict) return res.status(409).json({ success: false, message: 'ช่วงเวลานี้ชนกับการจองที่มีอยู่แล้ว' })

      const allowedStatuses = ['pending','approved','rejected','completed','cancelled']
      const status = allowedStatuses.includes(rawStatus) ? rawStatus : 'approved'

      const [result] = await pool.execute(
        `INSERT INTO ${TABLE} (car_id, user_id, start_datetime, end_datetime, purpose, destination, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [car_id, user_id, start_datetime, end_datetime, purpose || null, destination || null, status]
      )

      // ส่งอีเมลแจ้งเตือน (ไม่รอผลลัพธ์)
      ;(async () => {
        try {
          // ดึงข้อมูล car name
          const [carRows] = await pool.execute('SELECT name FROM car WHERE id = ?', [car_id])
          const carName = carRows.length > 0 ? carRows[0].name : 'ไม่ระบุ'

          // ดึงข้อมูล user
          const userInfo = await getUserInfo(pool, user_id)
          const userName = userInfo?.name || 'ไม่ระบุ'
          const userEmail = userInfo?.email || null

          // ดึงอีเมล admin
          const adminEmails = await getAdminEmails(pool)

          // ส่งอีเมล
          await sendBookingNotification({
            booking: {
              id: result.insertId,
              car_id,
              user_id,
              start_datetime,
              end_datetime,
              purpose: purpose || null,
              destination: destination || null,
              status
            },
            carName,
            userName,
            userEmail,
            adminEmails,
            action: 'created'
          })
        } catch (emailError) {
          console.error('[Booking] Error sending email notification:', emailError)
          // ไม่ส่ง error กลับไปยัง client เพราะการจองสำเร็จแล้ว
        }
      })()

      res.status(201).json({ success: true, id: result.insertId })
    } catch (err) {
      console.error('Create booking error:', err)
      res.status(500).json({ success: false, message: 'บันทึกข้อมูลลงฐานข้อมูลไม่สำเร็จ' })
    }
  })

  // PUT /api/booking/:id  - update booking fields/status
  router.put('/:id', async (req, res) => {
    try {
      const id = Number(req.params.id)
      if (Number.isNaN(id)) return res.status(400).json({ success: false, message: 'รหัสการจองไม่ถูกต้อง' })

      const {
        car_id,
        user_id,
        start_datetime,
        end_datetime,
        purpose,
        destination,
        status: rawStatus
      } = req.body

      if (!car_id || !user_id || !start_datetime || !end_datetime || !rawStatus) {
        return res.status(400).json({ success: false, message: 'ข้อมูลที่จำเป็นไม่ครบถ้วน' })
      }

      const carIdNum = Number(car_id)
      const userIdNum = Number(user_id)
      if (Number.isNaN(carIdNum) || Number.isNaN(userIdNum)) {
        return res.status(400).json({ success: false, message: 'car_id และ user_id ต้องเป็นตัวเลข' })
      }
      if (new Date(start_datetime) >= new Date(end_datetime)) {
        return res.status(400).json({ success: false, message: 'ช่วงวันที่/เวลาไม่ถูกต้อง' })
      }

      const allowed = ['pending','approved','rejected','completed','cancelled']
      if (!allowed.includes(rawStatus)) return res.status(400).json({ success: false, message: 'สถานะไม่ถูกต้อง' })

      const conflict = await hasOverlap(car_id, start_datetime, end_datetime, id)
      if (conflict) return res.status(409).json({ success: false, message: 'ช่วงเวลานี้ชนกับการจองที่มีอยู่แล้ว' })

      const [result] = await pool.execute(
        `UPDATE ${TABLE}
         SET car_id = ?, user_id = ?, start_datetime = ?, end_datetime = ?, purpose = ?, destination = ?, status = ?
         WHERE id = ?`,
        [carIdNum, userIdNum, start_datetime, end_datetime, purpose || null, destination || null, rawStatus, id]
      )
      if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'ไม่พบข้อมูล' })

      // ส่งอีเมลแจ้งเตือน (ไม่รอผลลัพธ์)
      ;(async () => {
        try {
          // ดึงข้อมูล car name
          const [carRows] = await pool.execute('SELECT name FROM car WHERE id = ?', [carIdNum])
          const carName = carRows.length > 0 ? carRows[0].name : 'ไม่ระบุ'

          // ดึงข้อมูล user
          const userInfo = await getUserInfo(pool, userIdNum)
          const userName = userInfo?.name || 'ไม่ระบุ'
          const userEmail = userInfo?.email || null

          // ดึงอีเมล admin
          const adminEmails = await getAdminEmails(pool)

          // ส่งอีเมล
          await sendBookingNotification({
            booking: {
              id,
              car_id: carIdNum,
              user_id: userIdNum,
              start_datetime,
              end_datetime,
              purpose: purpose || null,
              destination: destination || null,
              status: rawStatus
            },
            carName,
            userName,
            userEmail,
            adminEmails,
            action: 'updated'
          })
        } catch (emailError) {
          console.error('[Booking] Error sending email notification:', emailError)
          // ไม่ส่ง error กลับไปยัง client เพราะการอัปเดตสำเร็จแล้ว
        }
      })()

      res.json({ success: true, message: 'อัปเดตสำเร็จ' })
    } catch (err) {
      console.error('Update booking error:', err)
      res.status(500).json({ success: false, message: 'อัปเดตข้อมูลไม่สำเร็จ' })
    }
  })

  // PUT /api/booking/:id/cancel - cancel booking (user action)
  router.put('/:id/cancel', async (req, res) => {
    try {
      const id = req.params.id
      
      // ดึงข้อมูลการจองก่อนยกเลิก
      const [bookingRows] = await pool.execute(
        `SELECT b.*, c.name AS car_name, u.name AS user_name, u.email AS user_email
         FROM ${TABLE} b
         LEFT JOIN car c ON c.id = b.car_id
         LEFT JOIN user u ON u.id = b.user_id
         WHERE b.id = ?`,
        [id]
      )

      if (bookingRows.length === 0) {
        return res.status(404).json({ success: false, message: 'ไม่พบข้อมูล' })
      }

      const booking = bookingRows[0]

      const [result] = await pool.execute(`UPDATE ${TABLE} SET status = 'cancelled' WHERE id = ?`, [id])
      if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'ไม่พบข้อมูล' })

      // ส่งอีเมลแจ้งเตือน (ไม่รอผลลัพธ์)
      ;(async () => {
        try {
          // ดึงอีเมล admin
          const adminEmails = await getAdminEmails(pool)

          // ส่งอีเมล
          await sendBookingNotification({
            booking: {
              id: booking.id,
              car_id: booking.car_id,
              user_id: booking.user_id,
              start_datetime: booking.start_datetime,
              end_datetime: booking.end_datetime,
              purpose: booking.purpose,
              destination: booking.destination,
              status: 'cancelled'
            },
            carName: booking.car_name || 'ไม่ระบุ',
            userName: booking.user_name || 'ไม่ระบุ',
            userEmail: booking.user_email || null,
            adminEmails,
            action: 'cancelled'
          })
        } catch (emailError) {
          console.error('[Booking] Error sending email notification:', emailError)
          // ไม่ส่ง error กลับไปยัง client เพราะการยกเลิกสำเร็จแล้ว
        }
      })()

      res.json({ success: true, message: 'ยกเลิกสำเร็จ' })
    } catch (err) {
      console.error('Cancel booking error:', err)
      res.status(500).json({ success: false, message: 'อัปเดตข้อมูลไม่สำเร็จ' })
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
      res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' })
    }
  })

  return router
}