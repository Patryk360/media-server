const express = require('express');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

const app = express();
const PORT = 8080;
const mediaDir = path.join(__dirname, 'media');

app.use(express.static(path.join(__dirname, 'public')));
app.use('/media/photos', express.static(path.join(mediaDir, 'photos')));

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
        const mimeType = mime.lookup(file);
        return mimeType && mimeType.startsWith(mimePrefix);
      });

      if (files.length > 0) {
        albums.push({
          name: entry.name,
          cover: files[0],
          count: files.length,
          items: files
        });
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});