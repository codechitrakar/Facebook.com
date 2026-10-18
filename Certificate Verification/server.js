
const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

const UPLOAD_DIR = path.join(__dirname, 'uploads');
const PUBLIC_DIR = path.join(__dirname, 'public');

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

app.use(express.json({ limit: '5mb' }));
app.use(express.static(PUBLIC_DIR));

app.post('/upload', (req, res) => {
  try {
    const { image } = req.body || {};

    if (typeof image !== 'string') {
      return res.status(400).json({
        ok: false,
        error: ''
      });
    }

    const match = image.match(
      /^data:image\/jpeg;base64,([A-Za-z0-9+/]+={0,2})$/
    );

    if (!match) {
      return res.status(400).json({
        ok: false,
        error: ''
      });
    }

    const buffer = Buffer.from(match[1], 'base64');

    if (!buffer.length || buffer.length > 3 * 1024 * 1024) {
      return res.status(400).json({
        ok: false,
        error: ''
      });
    }

    // Check JPEG file signature
    if (
      buffer.length < 3 ||
      buffer[0] !== 0xff ||
      buffer[1] !== 0xd8 ||
      buffer[2] !== 0xff
    ) {
      return res.status(400).json({
        ok: false,
        error: ''
      });
    }

    const filename =
      `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.jpg`;

    const filepath = path.join(UPLOAD_DIR, filename);

    fs.writeFile(filepath, buffer, (err) => {
      if (err) {
        console.error('File save error:', err);

        return res.status(500).json({
          ok: false,
          error: ''
        });
      }

      console.log('Photo saved:', filename);

      return res.json({
        ok: true,
        file: filename
      });
    });
  } catch (error) {
    console.error('');

    return res.status(500).json({
      ok: false,
      error: ''
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
