import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { supabaseClient } = await import('https://esm.sh/@supabase/supabase-js@2')
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY') || 'AIzaSyD-Zsfm8b7KE0GGFEA2hxQoswtHhCth1t8'
    
    const supabase = supabaseClient(supabaseUrl, supabaseServiceKey)

    // Fetch active RSS feeds
    const { data: feeds, error: feedsError } = await supabase
      .from('rss_feeds')
      .select('*')
      .eq('active', true)

    if (feedsError) throw feedsError

    console.log(`Processing ${feeds.length} RSS feeds`)

    const allArticles = []

    // Process each feed
    for (const feed of feeds) {
      try {
        console.log(`Processing feed: ${feed.name}`)
        
        // Fetch RSS feed with CORS proxy
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(feed.url)}`
        const response = await fetch(proxyUrl)
        const data = await response.json()
        
        if (!data.contents) continue

        // Parse RSS content (simplified parsing)
        const rssContent = data.contents
        const items = extractRSSItems(rssContent, feed)
        
        for (const item of items.slice(0, 3)) { // Process top 3 items per feed
          try {
            // Rewrite content using Gemini AI
            const rewrittenContent = await rewriteWithGemini(item.content, item.title, geminiApiKey)
            
            // Create article
            const articleData = {
              title: item.title,
              normal: rewrittenContent.normal,
              genz: rewrittenContent.genz,
              alpha: rewrittenContent.alpha,
              image_url: item.imageUrl || getDefaultImage(feed.category),
              category: feed.category,
              published_at: item.pubDate,
              original_url: item.link,
              slug: generateSlug(item.title),
              likes_normal: Math.floor(Math.random() * 50) + 10,
              likes_genz: Math.floor(Math.random() * 150) + 50,
              likes_alpha: Math.floor(Math.random() * 100) + 25,
              rss_source: feed.name
            }

            const { error: insertError } = await supabase
              .from('articles')
              .insert([articleData])

            if (insertError && !insertError.message.includes('duplicate key')) {
              console.error(`Error inserting article: ${insertError.message}`)
            } else {
              allArticles.push(articleData)
              console.log(`✅ Created article: ${item.title}`)
            }
          } catch (error) {
            console.error(`Error processing article: ${item.title}`, error)
          }
        }

        // Update feed last_fetched
        await supabase
          .from('rss_feeds')
          .update({ last_fetched: new Date().toISOString() })
          .eq('id', feed.id)

      } catch (error) {
        console.error(`Error processing feed ${feed.name}:`, error)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: allArticles.length,
        message: `Successfully processed ${allArticles.length} articles`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('RSS processing error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

// Helper functions
function extractRSSItems(rssContent: string, feed: any) {
  const items = []
  
  // Simple regex-based RSS parsing (for demo purposes)
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi
  const titleRegex = /<title[^>]*><!\[CDATA\[(.*?)\]\]><\/title>|<title[^>]*>(.*?)<\/title>/i
  const linkRegex = /<link[^>]*>(.*?)<\/link>/i
  const descRegex = /<description[^>]*><!\[CDATA\[(.*?)\]\]><\/description>|<description[^>]*>(.*?)<\/description>/i
  const pubDateRegex = /<pubDate[^>]*>(.*?)<\/pubDate>/i

  let match
  while ((match = itemRegex.exec(rssContent)) !== null) {
    const itemContent = match[1]
    
    const titleMatch = titleRegex.exec(itemContent)
    const linkMatch = linkRegex.exec(itemContent)
    const descMatch = descRegex.exec(itemContent)
    const pubDateMatch = pubDateRegex.exec(itemContent)

    if (titleMatch && linkMatch) {
      const title = (titleMatch[1] || titleMatch[2] || '').trim()
      const link = linkMatch[1].trim()
      const description = (descMatch?.[1] || descMatch?.[2] || '').trim()
      const pubDate = pubDateMatch?.[1] || new Date().toISOString()

      if (title.length > 10 && description.length > 50) {
        items.push({
          title: cleanText(title),
          content: cleanText(stripHtml(description)),
          link,
          pubDate,
          imageUrl: null
        })
      }
    }
  }

  return items
}

async function rewriteWithGemini(content: string, title: string, apiKey: string) {
  const prompt = `You are an expert news editor. Rewrite this breaking news article for 3 different audiences while keeping all facts accurate and current.

ARTICLE TITLE: ${title}
ARTICLE CONTENT: ${content}

Create exactly 3 versions:

1. NORMAL (Professional News): Write a clean, professional news summary. Use formal journalism language, focus on facts, include key details. Maximum 200 words. Start with the most important information.

2. GENZ (Social Media Style): Rewrite with TikTok/Instagram energy! Use emojis, modern slang like "bestie", "no cap", "fr fr", "periodt", "slay", "it's giving...", etc. Make it engaging and shareable. Include trending hashtags. Maximum 250 words.

3. ALPHA (Gaming/Discord Culture): Use gaming and internet culture language. Include terms like "based", "cringe", "W/L", "no cap", "fr", "poggers", "sus", "chad", "sigma", etc. Short, punchy sentences. Gaming/meme references welcome. Maximum 200 words.

IMPORTANT: Return ONLY a valid JSON object with exactly these keys: "normal", "genz", "alpha". No other text, explanations, or formatting.`

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text
    
    if (!generatedText) {
      throw new Error('No content generated from Gemini API')
    }
    
    // Extract JSON from the response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsedContent = JSON.parse(jsonMatch[0])
      
      if (parsedContent.normal && parsedContent.genz && parsedContent.alpha) {
        return {
          normal: parsedContent.normal.substring(0, 500),
          genz: parsedContent.genz.substring(0, 600),
          alpha: parsedContent.alpha.substring(0, 500)
        }
      }
    }
    
    throw new Error('Invalid JSON structure from Gemini API')
  } catch (error) {
    console.error('Error rewriting content with Gemini:', error)
    
    // Fallback content
    const shortContent = content.substring(0, 300)
    return {
      normal: `${title}\n\n${shortContent}... [Read more at source]`,
      genz: `OMG y'all! 😱 ${title} just dropped and I'm literally shook! ✨ ${shortContent.substring(0, 150)}... This is giving main character energy! 💅 #BreakingNews #Trending`,
      alpha: `BREAKING: ${title} 🔥 ${shortContent.substring(0, 120)}... This hits different ngl 💪 Major W for news today! #NewsW #Breaking`
    }
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim()
}

function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, ' ')
    .trim()
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 60)
}

function getDefaultImage(category: string): string {
  const defaultImages: Record<string, string> = {
    'Technology': 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
    'Gaming': 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=800',
    'Entertainment': 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=800',
    'Sports': 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=800',
    'Science': 'https://images.pexels.com/photos/2004161/pexels-photo-2004161.jpeg?auto=compress&cs=tinysrgb&w=800',
    'Business': 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
    'Lifestyle': 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800'
  }
  
  return defaultImages[category] || defaultImages['Technology']
}