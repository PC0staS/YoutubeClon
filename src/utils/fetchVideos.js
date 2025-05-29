import fetch from 'node-fetch';
import dotenv from 'dotenv';
import fs from 'fs';
import cron from 'node-cron';

dotenv.config();

const API_KEY = process.env.GOOGLE_API_KEY;
const UPLOADS_PLAYLIST_ID = 'UUHHvk-VDgD8pP2AN2AmX8FQ'; // Reemplaza con el ID obtenido en el paso anterior

async function fetchVideos() {
  const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${UPLOADS_PLAYLIST_ID}&maxResults=50&key=${API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.items && data.items.length > 0) {
    const videos = data.items.map((item) => ({
      titulo: item.snippet.title,
      url: `https://www.youtube.com/embed/${item.snippet.resourceId.videoId}`,
      date: item.snippet.publishedAt,
    }));

    // Guardar los videos en videos.js
    const fileContent = `export const videos = ${JSON.stringify(videos, null, 2)};`;
    fs.writeFileSync('src/data/videos.js', fileContent);

    console.log('Videos guardados en src/data/videos.js');
  } else {
    console.error('No se encontraron videos en la lista de reproducción.');
  }
}

cron.schedule('0 0 * * *', () => {
  console.log('Actualizando videos...');
  fetchVideos();
});

fetchVideos();