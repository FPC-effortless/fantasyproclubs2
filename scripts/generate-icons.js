const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]
const sourceIcon = path.join(__dirname, '../public/icon.svg')
const outputDir = path.join(__dirname, '../public/icons')

// Create icons directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

// Generate icons for each size
async function generateIcons() {
  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`)
    await sharp(sourceIcon)
      .resize(size, size)
      .png()
      .toFile(outputPath)
    console.log(`Generated ${outputPath}`)
  }
}

generateIcons().catch(console.error) 