require('dotenv').config({ quiet: true });
const express = require('express');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const basicAuth = require('express-basic-auth');
const multer = require('multer');
const sharp = require('sharp');
const si = require('systeminformation');

const app = express();
const serverPort = process.env.PORT || 8080;
const mediaDir = path.join(__dirname, 'media');
const authUser = process.env.ADMIN_USERNAME || 'admin';
const authPass = process.env.ADMIN_PASSWORD || 'admin';

const authUsers = {};
authUsers[authUser] = authPass;

app.use(basicAuth({
  users: authUsers,
  challenge: true,
  realm: 'RPi5MediaCenter'
}));

const storageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    const typeDir = path.join(mediaDir, req.body.mediaType, req.body.albumName);
    if (!fs.existsSync(typeDir)) {
      fs.mkdirSync(typeDir, { recursive: true });
    }
    cb(null, typeDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storageConfig });

app.use(express.static(path.join(__dirname, 'public')));
app.use('/media', express.static(mediaDir));

const getAlbums = (type, mimePrefix) => {
  const dirPath = path.join(mediaDir, type);
  if (!fs.existsSync(dirPath)) return [];

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const albums = [];

  entries.forEach((entry) => {
    if (entry.isDirectory() && !entry.name.startsWith('.')) {
      const albumPath = path.join(dirPath, entry.name);
      const files = fs.readdirSync(albumPath).filter((file) => {
        if (file.startsWith('.')) return false;
        if (type === 'videos' && file.endsWith('.vtt')) return true;
        const mimeType = mime.lookup(file);
        return mimeType && mimeType.startsWith(mimePrefix);
      });

      if (files.length > 0) {
        const mediaFiles = files.filter(f => !f.endsWith('.vtt'));
        const subFiles = files.filter(f => f.endsWith('.vtt'));
        
        if (mediaFiles.length > 0) {
          albums.push({
            name: entry.name,
            cover: mediaFiles[0],
            count: mediaFiles.length,
            items: mediaFiles,
            subs: subFiles
          });
        }
      }
    }
  });

  return albums;
};

app.get('/api/media', (req, res) => {
  res.json({
    videos: getAlbums('videos', 'video/'),
    music: getAlbums('music', 'audio/'),
    photos: getAlbums('photos', 'image/')
  });
});

app.get('/api/sysinfo', async (req, res) => {
  try {
    const cpu = await si.cpuTemperature();
    const mem = await si.mem();
    const fsSize = await si.fsSize();
    res.json({ cpu, mem, fsSize });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/upload', upload.array('files'), (req, res) => {
  res.sendStatus(200);
});

app.get('/api/thumb/:album/:filename', async (req, res) => {
  const { album, filename } = req.params;
  const filePath = path.join(mediaDir, 'photos', album, filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Not found');
  }

  try {
    const buffer = await sharp(filePath)
      .resize(400, 400, { fit: 'cover' })
      .webp({ quality: 80 })
      .toBuffer();
      
    res.set('Content-Type', 'image/webp');
    res.send(buffer);
  } catch (error) {
    res.sendFile(filePath);
  }
});

app.get('/stream/:type/:album/:filename', (req, res) => {
  const { type, album, filename } = req.params;
  const filePath = path.join(mediaDir, type, album, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;
  const contentType = mime.lookup(filePath) || 'application/octet-stream';

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;

    const fileStream = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': contentType
    };

    res.writeHead(206, head);
    fileStream.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': contentType
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

app.listen(serverPort, '0.0.0.0', () => {
  console.log(`Server listening on port ${serverPort}`);
});