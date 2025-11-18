import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

const EMAIL_USER = (process.env.EMAIL_USER || '').trim()
const EMAIL_PASSWORD = (process.env.EMAIL_PASSWORD || '').replace(/\s+/g, '')
const hasEmailCredentials = Boolean(EMAIL_USER && EMAIL_PASSWORD)

let transporter = null
if (hasEmailCredentials) {
  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'canon@fatima.co.th' || '', // อีเมล @fatima.co.th
      pass: 'mqnyygeyvfpnpkat' || ''  // App Password จาก Gmail
    }
  })
} else {
  console.warn('[EmailService] EMAIL_USER หรือ EMAIL_PASSWORD ไม่ได้ถูกตั้งค่า - ระบบส่งอีเมลจะไม่ทำงาน')
}

// ฟังก์ชันสำหรับส่งอีเมลแจ้งเตือนการจอง
export async function sendBookingNotification({
  booking,
  carName,
  userName,
  userEmail,
  adminEmails = ['canon@fatima.co.th'],
  action = 'created' // 'created', 'updated', 'cancelled'
}) {
  try {
    if (!hasEmailCredentials || !transporter) {
      console.warn('[EmailService] ข้ามการส่งอีเมลเพราะยังไม่ได้ตั้งค่า EMAIL_USER/EMAIL_PASSWORD')
      return { success: false, message: 'EMAIL_CREDENTIALS_NOT_CONFIGURED' }
    }

    const actionText = {
      created: 'มีการจองใหม่',
      updated: 'มีการแก้ไขการจอง',
      cancelled: 'มีการยกเลิกการจอง'
    }[action] || 'มีการเปลี่ยนแปลงการจอง'

    const startDate = new Date(booking.start_datetime).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    const endDate = new Date(booking.end_datetime).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    const statusText = {
      pending: 'รออนุมัติ',
      approved: 'อนุมัติแล้ว',
      rejected: 'ปฏิเสธ',
      completed: 'เสร็จสิ้น',
      cancelled: 'ยกเลิก'
    }[booking.status] || booking.status

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none; }
          .info-row { margin: 10px 0; padding: 10px; background: white; border-radius: 4px; }
          .label { font-weight: bold; color: #667eea; }
          .status-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; }
          .status-pending { background: #fef3c7; color: #92400e; }
          .status-approved { background: #d1fae5; color: #065f46; }
          .status-rejected { background: #fee2e2; color: #991b1b; }
          .status-cancelled { background: #fee2e2; color: #991b1b; }
          .status-completed { background: #e0e7ff; color: #3730a3; }
          .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🚗 ${actionText} - ระบบจองรถ</h2>
          </div>
          <div class="content">
            <div class="info-row">
              <span class="label">ผู้จอง:</span> ${userName || 'ไม่ระบุ'}
            </div>
            <div class="info-row">
              <span class="label">รถที่จอง:</span> ${carName || 'ไม่ระบุ'}
            </div>
            <div class="info-row">
              <span class="label">วันที่และเวลาเริ่มต้น:</span> ${startDate}
            </div>
            <div class="info-row">
              <span class="label">วันที่และเวลาสิ้นสุด:</span> ${endDate}
            </div>
            ${booking.purpose ? `
            <div class="info-row">
              <span class="label">จุดประสงค์/ต้นทาง:</span> ${booking.purpose}
            </div>
            ` : ''}
            ${booking.destination ? `
            <div class="info-row">
              <span class="label">ปลายทาง:</span> ${booking.destination}
            </div>
            ` : ''}
            <div class="info-row">
              <span class="label">สถานะ:</span> 
              <span class="status-badge status-${booking.status}">${statusText}</span>
            </div>
            <div class="footer">
              <p>อีเมลนี้ถูกส่งจากระบบจองรถอัตโนมัติ</p>
              <p>Fatima R.B.D.S.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    const textContent = `
${actionText} - ระบบจองรถ

ผู้จอง: ${userName || 'ไม่ระบุ'}
รถที่จอง: ${carName || 'ไม่ระบุ'}
วันที่และเวลาเริ่มต้น: ${startDate}
วันที่และเวลาสิ้นสุด: ${endDate}
${booking.purpose ? `จุดประสงค์/ต้นทาง: ${booking.purpose}\n` : ''}
${booking.destination ? `ปลายทาง: ${booking.destination}\n` : ''}
สถานะ: ${statusText}

---
อีเมลนี้ถูกส่งจากระบบจองรถอัตโนมัติ
Fatima R.B.D.S.
    `

    const recipients = []
    
    // เพิ่มอีเมลผู้จอง
    if (userEmail) {
      recipients.push(userEmail)
    }

    // เพิ่มอีเมล admin ทั้งหมด
    if (adminEmails && adminEmails.length > 0) {
      recipients.push(...adminEmails)
    }

    // ลบอีเมลซ้ำ
    const uniqueRecipients = [...new Set(recipients)]

    if (uniqueRecipients.length === 0) {
      console.warn('[EmailService] No recipients to send email to')
      return { success: false, message: 'ไม่มีผู้รับอีเมล' }
    }

    const mailOptions = {
      from: `"ระบบจองรถ Fatima" <${EMAIL_USER || 'noreply@fatima.co.th'}>`,
      to: uniqueRecipients.join(', '),
      subject: `${actionText} - ${carName || 'การจองรถ'}`,
      text: textContent,
      html: htmlContent
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('[EmailService] Email sent successfully:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('[EmailService] Error sending email:', error)
    return { success: false, error: error.message }
  }
}

// ฟังก์ชันสำหรับดึงอีเมล admin จาก database
export async function getAdminEmails(pool) {
  try {
    const [rows] = await pool.execute(
      `SELECT email FROM user 
       WHERE role IN ('administrator', 'superadmin', 'admin') 
       AND email IS NOT NULL AND email != ''`
    )
    return rows.map(row => row.email).filter(email => email)
  } catch (error) {
    console.error('[EmailService] Error fetching admin emails:', error)
    return []
  }
}

// ฟังก์ชันสำหรับดึงข้อมูล user จาก user_id
export async function getUserInfo(pool, userId) {
  try {
    const [rows] = await pool.execute(
      'SELECT id, name, email FROM user WHERE id = ?',
      [userId]
    )
    return rows.length > 0 ? rows[0] : null
  } catch (error) {
    console.error('[EmailService] Error fetching user info:', error)
    return null
  }
}

