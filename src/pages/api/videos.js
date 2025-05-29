import fetch from 'node-fetch';

const API_KEY = import.meta.env.GOOGLE_API_KEY;
const UPLOADS_PLAYLIST_ID = 'UUHHvk-VDgD8pP2AN2AmX8FQ';

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
      publishedAt: snippet.publishedAt
    };
  });
}

export async function GET() {
  const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${UPLOADS_PLAYLIST_ID}&maxResults=10&key=${API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) {
    return new Response(JSON.stringify({ error: 'Failed to fetch playlist' }), { status: 500 });
  }
  const data = await response.json();

  if (data.items && data.items.length > 0) {
    const videoIds = data.items.map((item) => item.snippet.resourceId.videoId).join(',');
    const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds}&key=${API_KEY}`;
    const statsResponse = await fetch(statsUrl);
    if (!statsResponse.ok) {
      return new Response(JSON.stringify({ error: 'Failed to fetch video stats' }), { status: 500 });
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
    return new Response(JSON.stringify(videos), { status: 200 });
  } else {
    return new Response(JSON.stringify({ error: 'No videos found' }), { status: 404 });
  }
}
