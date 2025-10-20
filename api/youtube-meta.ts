// Vercel Serverless Function: Fetch YouTube metadata securely
import type { VercelRequest, VercelResponse } from '@vercel/node'

function extractYouTubeVideoId(url: string): string | null {
  try {
    const normalized = url.trim()
    const short = normalized.match(/youtu\.be\/([\w-]{11})/)
    if (short?.[1]) return short[1]
    const shorts = normalized.match(/youtube\.com\/(?:shorts|live)\/([\w-]{11})/)
    if (shorts?.[1]) return shorts[1]
    const u = new URL(normalized)
    const v = u.searchParams.get('v')
    if (v && /^[\w-]{11}$/.test(v)) return v
  } catch (_) {}
  return null
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { url } = req.query
  const inputUrl = Array.isArray(url) ? url[0] : url
  if (!inputUrl) {
    return res.status(400).json({ error: 'Missing url parameter' })
  }

  const videoId = extractYouTubeVideoId(inputUrl)
  if (!videoId) {
    return res.status(400).json({ error: 'Invalid YouTube URL' })
  }

  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'Server missing YOUTUBE_API_KEY' })
  }

  const endpoint = `https://www.googleapis.com/youtube/v3/videos?part=snippet,status&id=${videoId}&key=${apiKey}`
  const ytRes = await fetch(endpoint)
  if (!ytRes.ok) {
    return res.status(ytRes.status).json({ error: 'YouTube API error' })
  }
  const data = await ytRes.json()
  const item = data?.items?.[0]
  if (!item) {
    return res.status(404).json({ error: 'Video not found' })
  }

  return res.status(200).json({
    id: videoId,
    title: item.snippet?.title ?? 'Untitled',
    thumbnailUrl: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || '',
    channelTitle: item.snippet?.channelTitle ?? 'Unknown channel',
    privacyStatus: item.status?.privacyStatus,
  })
}


