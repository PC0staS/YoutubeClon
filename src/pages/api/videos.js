// API endpoint para servir videos dinámicamente
// fetch is available globally in Netlify Functions

const API_KEY = import.meta.env.GOOGLE_API_KEY;
const UPLOADS_PLAYLIST_ID = 'UUHHvk-VDgD8pP2AN2AmX8FQ';

// Cache en memoria para evitar demasiadas llamadas a la API
let cachedVideos = null;
let lastFetch = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos

async function fetchComments(videoId) {
  const url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=10&key=${API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) return [];
  const data = await response.json();
  if (!data.items) return [];
  return data.items.map(item => {
    const snippet = item.snippet.topLevelComment.snippet;
    const author = snippet.authorDisplayName;
    const authorProfileImageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(author)}&background=222&color=fff&size=48`;
    return {
      author,
      text: snippet.textDisplay,
      publishedAt: snippet.publishedAt,
      authorProfileImageUrl
    };
  });
}

export async function GET() {
  try {
    const now = Date.now();
    
    // Usar cache si está disponible y no ha expirado
    if (cachedVideos && (now - lastFetch) < CACHE_DURATION) {
      return new Response(JSON.stringify({ 
        videos: cachedVideos,
        cached: true,
        updatedAt: new Date(lastFetch).toISOString()
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Fetch nuevos datos
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${UPLOADS_PLAYLIST_ID}&maxResults=10&key=${API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch playlist');
    }
    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const videoIds = data.items.map((item) => item.snippet.resourceId.videoId).join(',');
      const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds}&key=${API_KEY}`;
      const statsResponse = await fetch(statsUrl);
      if (!statsResponse.ok) {
        throw new Error('Failed to fetch video stats');
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
      
      // Actualizar cache
      cachedVideos = videos;
      lastFetch = now;
      
      return new Response(JSON.stringify({ 
        videos: videos,
        cached: false,
        updatedAt: new Date().toISOString()
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      throw new Error('No videos found');
    }
  } catch (error) {
    console.error('Error in videos API:', error);
    
    // Fallback a datos estáticos
    try {
      const { videos } = await import('../../data/videos.js');
      return new Response(JSON.stringify({ 
        videos: videos,
        fallback: true,
        error: error.message
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (fallbackError) {
      return new Response(JSON.stringify({ 
        error: 'Failed to fetch videos and fallback failed',
        details: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
}
