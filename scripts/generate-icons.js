import fs from 'fs-extra'
import sharp from 'sharp'
import path from 'path'

const sizes = [16, 32, 48, 128];
const inputSvg = 'public/icons/icon.svg';
const outputDir = 'public/icons';

async function generateIcons() {
  // Ensure the output directory exists
  await fs.ensureDir(outputDir);

  // Generate each size
  for (const size of sizes) {
    await sharp(inputSvg)
      .resize(size, size)
      .png()
      .toFile(path.join(outputDir, `icon${size}.png`));
    
    console.log(`Generated ${size}x${size} icon`);
  }
}

generateIcons().catch(console.error); 