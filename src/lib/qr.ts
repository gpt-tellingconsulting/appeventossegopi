import QRCode from 'qrcode'
import sharp from 'sharp'
import path from 'path'

const BRAND_COLOR = '#E6007E'
const QR_SIZE = 600
const LOGO_RATIO = 0.25

export async function generateBrandedQR(url: string): Promise<Buffer> {
  // 1. Generate QR buffer with magenta color and high error correction
  const qrBuffer = await QRCode.toBuffer(url, {
    width: QR_SIZE,
    margin: 2,
    errorCorrectionLevel: 'H',
    color: {
      dark: BRAND_COLOR,
      light: '#FFFFFF',
    },
  })

  // 2. Read and resize logo
  const logoPath = path.join(process.cwd(), 'public', 'logo-segopi.png')
  const logoSize = Math.round(QR_SIZE * LOGO_RATIO)

  const logoResized = await sharp(logoPath)
    .resize(logoSize, logoSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .toBuffer()

  // 3. Create white circular background for logo
  const padding = Math.round(logoSize * 0.15)
  const bgSize = logoSize + padding * 2
  const bgCircle = Buffer.from(
    `<svg width="${bgSize}" height="${bgSize}">
      <circle cx="${bgSize / 2}" cy="${bgSize / 2}" r="${bgSize / 2}" fill="white"/>
    </svg>`
  )
  const logoWithBg = await sharp(bgCircle)
    .composite([{ input: logoResized, gravity: 'centre' }])
    .png()
    .toBuffer()

  // 4. Composite QR + centered logo
  const result = await sharp(qrBuffer)
    .composite([{ input: logoWithBg, gravity: 'centre' }])
    .png()
    .toBuffer()

  return result
}
