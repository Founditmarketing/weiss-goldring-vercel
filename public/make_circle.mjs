import sharp from 'sharp';

async function makeCircle() {
  const input = 'WGicon.jpeg';
  const output = 'WGicon_circle.png';
  
  const metadata = await sharp(input).metadata();
  const size = Math.min(metadata.width, metadata.height);
  const r = size / 2;
  
  const circleSvg = `<svg width="${size}" height="${size}"><circle cx="${r}" cy="${r}" r="${r}" /></svg>`;
  
  const squareBuffer = await sharp(input)
    .resize(size, size, { fit: 'cover' })
    .toBuffer();
    
  await sharp(squareBuffer)
    .composite([{ input: Buffer.from(circleSvg), blend: 'dest-in' }])
    .png()
    .toFile(output);
}

makeCircle().then(() => console.log('Done')).catch(console.error);
