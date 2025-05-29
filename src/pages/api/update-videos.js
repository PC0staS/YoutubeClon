// API endpoint para actualizar videos automáticamente
import fetch from 'node-fetch';

const API_KEY = import.meta.env.GOOGLE_API_KEY;
const UPLOADS_PLAYLIST_ID = 'UUHHvk-VDgD8pP2AN2AmX8FQ';

async function fetchComments(videoId) {
  try {
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
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
}

async function fetchVideosData() {
  try {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${UPLOADS_PLAYLIST_ID}&maxResults=10&key=${API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error fetching playlist items: ${response.statusText}`);
    }
    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const videoIds = data.items.map((item) => item.snippet.resourceId.videoId).join(',');
      const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds}&key=${API_KEY}`;
      const statsResponse = await fetch(statsUrl);
      if (!statsResponse.ok) {
        throw new Error(`Error fetching video statistics: ${statsResponse.statusText}`);
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
          comentarios: comments,
        });
      }
      return videos;
    } else {
      throw new Error('No se encontraron videos en la lista de reproducción.');
    }
  } catch (error) {
    console.error('Error fetching videos:', error);
    throw error;
  }
}

export async function GET({ request }) {
  try {
    // Verificar que la request viene de un cron job o autenticación
    const authHeader = request.headers.get('authorization');
    const cronSecret = import.meta.env.CRON_SECRET;
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const videos = await fetchVideosData();
    
    return new Response(JSON.stringify({ 
      success: true, 
      videos: videos,
      updatedAt: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST({ request }) {
  try {
    // Verificar que la request viene de un cron job o autenticación
    const authHeader = request.headers.get('authorization');
    const cronSecret = import.meta.env.CRON_SECRET;
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const videos = await fetchVideosData();
    
    return new Response(JSON.stringify({ 
      success: true, 
      videos: videos,
      updatedAt: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
