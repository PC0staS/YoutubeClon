// API endpoint to fetch comments for a specific video
const API_KEY = import.meta.env.GOOGLE_API_KEY;

// Function to extract video ID from various YouTube URL formats
function extractVideoId(url) {
  if (!url) return null;
  
  // If it's already just the video ID
  if (url.length === 11 && !url.includes('/')) {
    return url;
  }
  
  // Extract from various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /v=([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return url; // Return as-is if no pattern matches
}

async function fetchComments(videoId) {
  try {
    console.log('Fetching comments for video ID:', videoId);
    
    const url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=20&order=time&key=${API_KEY}`;
    console.log('YouTube API URL:', url.replace(API_KEY, 'API_KEY_HIDDEN'));
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('YouTube API error:', response.status, response.statusText, errorText);
      
      // Try to parse error for more specific information
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error && errorData.error.message) {
          console.error('Detailed error:', errorData.error.message);
          return { 
            error: errorData.error.message, 
            status: response.status,
            comments: []
          };
        }
      } catch (parseError) {
        console.error('Could not parse error response');
      }
      
      return { 
        error: `HTTP ${response.status}: ${response.statusText}`, 
        status: response.status,
        comments: []
      };
    }
    
    const data = await response.json();
    console.log('YouTube API response:', {
      totalResults: data.pageInfo?.totalResults || 0,
      itemsCount: data.items?.length || 0,
      nextPageToken: data.nextPageToken || 'none'
    });
    
    if (!data.items) {
      return {
        comments: [],
        totalResults: data.pageInfo?.totalResults || 0,
        info: 'No comments found for this video'
      };
    }
    
    const comments = data.items.map(item => {
      const snippet = item.snippet.topLevelComment.snippet;
      return {
        author: snippet.authorDisplayName,
        text: snippet.textDisplay,
        publishedAt: snippet.publishedAt,
        authorProfileImageUrl: snippet.authorProfileImageUrl
      };
    });
    
    return {
      comments,
      totalResults: data.pageInfo?.totalResults || 0,
      info: `Found ${comments.length} comments`
    };
    
  } catch (error) {
    console.error('Error fetching comments:', error);
    return {
      error: error.message,
      comments: []
    };
  }
}

export async function GET({ params, request }) {
  const { videoId: rawVideoId } = params;
  
  console.log('Raw video ID from params:', rawVideoId);
  
  if (!rawVideoId) {
    return new Response(JSON.stringify({ 
      error: 'Video ID is required' 
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!API_KEY) {
    console.error('Google API key not configured');
    return new Response(JSON.stringify({ 
      error: 'Google API key not configured' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Extract the actual video ID
  const videoId = extractVideoId(rawVideoId);
  console.log('Extracted video ID:', videoId);

  try {
    const result = await fetchComments(videoId);
    
    console.log('Comments fetched successfully:', result);
    
    return new Response(JSON.stringify({
      success: true,
      videoId,
      rawVideoId,
      comments: result.comments || [],
      count: (result.comments || []).length,
      totalResults: result.totalResults || 0,
      info: result.info || 'No additional info',
      error: result.error || null,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
    
  } catch (error) {
    console.error('API error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch comments',
      details: error.message,
      videoId,
      rawVideoId
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
