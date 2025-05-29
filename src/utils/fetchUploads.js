// fetch is available globally in modern environments
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const API_KEY = process.env.GOOGLE_API_KEY;
// Hardcoded playlist ID for the channel's uploads playlist
const UPLOADS_PLAYLIST_ID = 'UUHHvk-VDgD8pP2AN2AmX8FQ'; // Replace with the correct playlist ID

async function fetchComments(videoId) {
  const url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=10&key=${API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) return [];
  const data = await response.json();
  if (!data.items) return [];
  return data.items.map(item => {
    const snippet = item.snippet.topLevelComment.snippet;
    return {
      author: snippet.authorDisplayName,
      text: snippet.textDisplay,
      publishedAt: snippet.publishedAt,
      authorProfileImageUrl: snippet.authorProfileImageUrl
    };
  });
}

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
    const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds}&key=${API_KEY}`;
    const statsResponse = await fetch(statsUrl);
    if (!statsResponse.ok) {
      console.error(`Error fetching video statistics: ${statsResponse.statusText}`);
      return;
    }
    const statsData = await statsResponse.json();

    const videos = [];
    for (const item of data.items) {
      const videoId = item.snippet.resourceId.videoId;
      const videoStats = statsData.items.find((statItem) => statItem.id === videoId);
      const comments = await fetchComments(videoId);
      videos.push({
        titulo: item.snippet.title,
        url: `https://www.youtube.com/embed/${videoId}`,
        date: item.snippet.publishedAt,
        views: videoStats?.statistics?.viewCount || 0,
        descripcion: videoStats?.snippet?.description || '',
        comentarios: await comments,
      });
    }

    const fileContent = `export const videos = ${JSON.stringify(videos, null, 2)};`;
    fs.writeFileSync('src/data/videos.js', fileContent);
    console.log('Videos guardados en src/data/videos.js');
  } else {
    console.error('No se encontraron videos en la lista de reproducción.');
  }
}

fetchVideos();