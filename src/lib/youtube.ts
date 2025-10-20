// Utility helpers for YouTube link handling and metadata fetch

export interface YouTubeVideoMeta {
  id: string
  title: string
  thumbnailUrl: string
  channelTitle: string
  privacyStatus?: string
}

export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null

  try {
    const normalized = url.trim()

    // youtu.be/<id>
    const shortMatch = normalized.match(/youtu\.be\/([\w-]{11})/)
    if (shortMatch?.[1]) return shortMatch[1]

    // youtube.com/shorts/<id>
    const shortsMatch = normalized.match(/youtube\.com\/(?:shorts|live)\/([\w-]{11})/)
    if (shortsMatch?.[1]) return shortsMatch[1]

    // youtube.com/watch?v=<id>
    const urlObj = new URL(normalized)
    const vParam = urlObj.searchParams.get('v')
    if (vParam && /^[\w-]{11}$/.test(vParam)) return vParam
  } catch (_) {
    // ignore parse errors
  }

  return null
}

export async function fetchYouTubeMeta(videoId: string, apiKey: string): Promise<YouTubeVideoMeta | null> {
  const endpoint = `https://www.googleapis.com/youtube/v3/videos?part=snippet,status&id=${videoId}&key=${apiKey}`
  const res = await fetch(endpoint)
  if (!res.ok) return null
  const data = await res.json()
  const item = data?.items?.[0]
  if (!item) return null

  return {
    id: videoId,
    title: item.snippet?.title ?? 'Untitled',
    thumbnailUrl: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || '',
    channelTitle: item.snippet?.channelTitle ?? 'Unknown channel',
    privacyStatus: item.status?.privacyStatus,
  }
}


