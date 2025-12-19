import jwt from 'jsonwebtoken'
import config from '../config.js'

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (token == null) return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' })

  jwt.verify(token, config.jwtSecret, (err, user) => {
    if (err) return res.status(403).json({ success: false, message: 'Forbidden: Invalid token' })
    req.user = user
    next()
  })
}
