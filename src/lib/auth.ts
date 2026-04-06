import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'pupiloslani-secret-2026'

interface AdminPayload {
  id: string
  email: string
  nome: string
}

export function verifyAuth(request: Request): AdminPayload | null {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) return null

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as AdminPayload
    return decoded
  } catch {
    return null
  }
}
