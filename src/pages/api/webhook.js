// Webhook endpoint for real-time YouTube updates
import fetch from 'node-fetch';

const API_KEY = import.meta.env.GOOGLE_API_KEY;
const WEBHOOK_SECRET = import.meta.env.WEBHOOK_SECRET || import.meta.env.CRON_SECRET;
const UPLOADS_PLAYLIST_ID = 'UUHHvk-VDgD8pP2AN2AmX8FQ';

// Fetch comments for a video
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

// Verify webhook signature (basic security)
function verifyWebhookSignature(body, signature, secret) {
  // Implementation depends on your webhook provider
  // For now, we'll just check if signature matches secret
  return signature === secret;
}

export async function POST({ request }) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-hub-signature') || 
                     request.headers.get('authorization')?.replace('Bearer ', '');
    
    // Verify webhook authenticity
    if (!WEBHOOK_SECRET || !signature || !verifyWebhookSignature(body, signature, WEBHOOK_SECRET)) {
      return new Response(JSON.stringify({ error: 'Unauthorized webhook' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse webhook payload
    let webhookData;
    try {
      webhookData = JSON.parse(body);
    } catch {
      // Handle XML or other formats if needed
      console.log('Non-JSON webhook payload received');
      return new Response(JSON.stringify({ message: 'Webhook received' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Process webhook data
    console.log('Webhook received:', webhookData);

    // Check if this is a new video upload
    if (webhookData.videoId || webhookData.video_id) {
      const videoId = webhookData.videoId || webhookData.video_id;
      console.log('New video detected:', videoId);
      
      // Trigger immediate cache refresh
      try {
        const updateResponse = await fetch(`${new URL(request.url).origin}/api/update-videos`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${WEBHOOK_SECRET}`,
            'User-Agent': 'Webhook-Triggered-Update'
          }
        });
        
        if (updateResponse.ok) {
          console.log('Cache updated successfully via webhook trigger');
        } else {
          console.error('Failed to update cache via webhook');
        }
      } catch (error) {
        console.error('Error triggering cache update:', error);
      }
    }

    return new Response(JSON.stringify({ 
      message: 'Webhook processed successfully',
      timestamp: new Date().toISOString(),
      processed: true
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response(JSON.stringify({ 
      error: 'Webhook processing failed',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle GET requests (for webhook verification)
export async function GET({ request }) {
  const url = new URL(request.url);
  const challenge = url.searchParams.get('hub.challenge');
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');

  // YouTube webhook verification
  if (mode === 'subscribe' && token === WEBHOOK_SECRET && challenge) {
    console.log('Webhook verification successful');
    return new Response(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  return new Response(JSON.stringify({
    message: 'Webhook endpoint',
    timestamp: new Date().toISOString(),
    endpoints: {
      POST: 'Process webhook notifications',
      GET: 'Webhook verification'
    }
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
