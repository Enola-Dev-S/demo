# การตั้งค่าระบบส่งอีเมลแจ้งเตือน

ระบบส่งอีเมลแจ้งเตือนจะส่งอีเมลไปยัง admin และผู้จองเมื่อมีการจอง แก้ไข หรือยกเลิกการจอง

## การตั้งค่า

### 1. สร้างไฟล์ `.env` ในโฟลเดอร์ `server/`

เพิ่มตัวแปรต่อไปนี้:

```env
# Email Configuration (Gmail SMTP)
EMAIL_USER=your-email@fatima.co.th
EMAIL_PASSWORD=your-app-password
```

### 2. สร้าง Gmail App Password

เนื่องจาก Gmail ใช้ 2-Step Verification ต้องสร้าง App Password:

1. ไปที่ [Google Account Settings](https://myaccount.google.com/)
2. เลือก **Security** > **2-Step Verification** (ต้องเปิดใช้งานก่อน)
3. เลื่อนลงไปที่ **App passwords**
4. เลือก:
   - **Select app**: Mail
   - **Select device**: Other (Custom name) → ใส่ชื่อ "Car Booking System"
5. คลิก **Generate**
6. คัดลอก App Password ที่ได้มา (16 ตัวอักษร) ใส่ใน `EMAIL_PASSWORD` ในไฟล์ `.env`

### 3. ตรวจสอบว่า Admin มีอีเมลในระบบ

ระบบจะส่งอีเมลไปยังผู้ใช้ที่มี role เป็น:
- `administrator`
- `superadmin`
- `admin`

และมีอีเมลในฐานข้อมูล

### 4. รีสตาร์ทเซิร์ฟเวอร์

หลังจากตั้งค่าแล้ว ให้รีสตาร์ทเซิร์ฟเวอร์เพื่อให้การตั้งค่าใหม่มีผล

## การทดสอบ

เมื่อมีการจอง แก้ไข หรือยกเลิกการจอง ระบบจะส่งอีเมลไปยัง:
- ผู้จอง (อีเมลจากตาราง user)
- Admin ทั้งหมด (อีเมลจากตาราง user ที่มี role เป็น admin)

ตรวจสอบ console log เพื่อดูว่าการส่งอีเมลสำเร็จหรือไม่

