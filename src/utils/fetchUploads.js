import fetch from 'node-fetch';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const API_KEY = process.env.GOOGLE_API_KEY;
// Hardcoded playlist ID for the channel's uploads playlist
const UPLOADS_PLAYLIST_ID = 'UUHHvk-VDgD8pP2AN2AmX8FQ'; // Replace with the correct playlist ID

async function fetchVideos() {
  const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${UPLOADS_PLAYLIST_ID}&maxResults=10&key=${API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) {
    console.error(`Error fetching playlist items: ${response.statusText}`);
    return;
  }
  const data = await response.json();

  if (data.items && data.items.length > 0) {
    const videoIds = data.items.map((item) => item.snippet.resourceId.videoId).join(',');

    const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}&key=${API_KEY}`;
    console.log('Stats URL:', statsUrl); // Log the stats URL

    const statsResponse = await fetch(statsUrl);
    if (!statsResponse.ok) {
      console.error(`Error fetching video statistics: ${statsResponse.statusText}`);
      return;
    }
    const statsData = await statsResponse.json();

    console.log('Stats Data:', JSON.stringify(statsData, null, 2)); // Log the stats data

    const videos = data.items.map((item) => {
      const videoId = item.snippet.resourceId.videoId;
      const videoStats = statsData.items.find((statItem) => statItem.id === videoId);

      return {
        titulo: item.snippet.title,
        url: `https://www.youtube.com/embed/${videoId}`,
        date: item.snippet.publishedAt,
        views: videoStats?.statistics?.viewCount || 0,
      };
    });

    const fileContent = `export const videos = ${JSON.stringify(videos, null, 2)};`;
    fs.writeFileSync('src/data/videos.js', fileContent);

    console.log('Videos guardados en src/data/videos.js');
  } else {
    console.error('No se encontraron videos en la lista de reproducción.');
  }
}

fetchVideos();