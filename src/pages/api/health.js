// Health check endpoint for monitoring
export async function GET() {
  try {
    // Check if environment variables are set
    const apiKey = import.meta.env.GOOGLE_API_KEY;
    const cronSecret = import.meta.env.CRON_SECRET;
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: {
        hasApiKey: !!apiKey,
        hasCronSecret: !!cronSecret,
      },
      endpoints: {
        videos: '/api/videos',
        updateVideos: '/api/update-videos',
        health: '/api/health'
      }
    };

    // Test basic functionality
    try {
      const { videos } = await import('../../data/videos.js');
      health.fallbackData = {
        available: true,
        videoCount: videos?.length || 0
      };
    } catch (error) {
      health.fallbackData = {
        available: false,
        error: 'Static data not accessible'
      };
    }

    return new Response(JSON.stringify(health, null, 2), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
