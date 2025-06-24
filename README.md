# GenZ & Alpha AI News Aggregator

A modern, AI-powered news aggregator that transforms traditional news into Gen-Z and Alpha generation styles. Built with React, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Features

- **AI-Powered Content**: Rewrites news articles in 3 distinct tones:
  - **Normal**: Professional summary (100 words max)
  - **Gen-Z**: TikTok-style with emojis and modern slang
  - **Alpha**: Discord/gaming style with memes and short format

- **Interactive Engagement**:
  - Like articles in any style
  - Comment system with name/email
  - Share functionality
  - Real-time reactions

- **Modern UI/UX**:
  - Mobile-first responsive design
  - Smooth animations and micro-interactions
  - Glassmorphism effects
  - Dark theme optimized for younger audiences

- **Performance**:
  - Infinite scroll loading
  - Intersection Observer API
  - Optimized for mobile devices

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Framer Motion
- **Database**: Supabase
- **AI**: Gemini API / OpenAI GPT-3.5
- **Icons**: Lucide React
- **Deployment**: Vercel

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Gemini API key or OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd genz-alpha-news-aggregator
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Fill in your Supabase and AI API credentials in `.env`.

4. Set up Supabase database:

Create the following tables in your Supabase dashboard:

```sql
-- Articles table
CREATE TABLE articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  normal TEXT NOT NULL,
  genz TEXT NOT NULL,
  alpha TEXT NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  original_url TEXT,
  slug TEXT UNIQUE NOT NULL,
  likes_normal INTEGER DEFAULT 0,
  likes_genz INTEGER DEFAULT 0,
  likes_alpha INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments table
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  text TEXT NOT NULL,
  style_version TEXT CHECK (style_version IN ('normal', 'genz', 'alpha')),
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Likes table
CREATE TABLE likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  user_ip TEXT NOT NULL,
  style_version TEXT CHECK (style_version IN ('normal', 'genz', 'alpha')),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(article_id, user_ip, style_version)
);

-- Enable RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Articles are viewable by everyone" ON articles FOR SELECT USING (true);
CREATE POLICY "Comments are viewable by everyone" ON comments FOR SELECT USING (true);
CREATE POLICY "Anyone can insert comments" ON comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert likes" ON likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Likes are viewable by everyone" ON likes FOR SELECT USING (true);
```

5. Start the development server:
```bash
npm run dev
```

## 📱 Usage

### For Users

1. **Browse Articles**: Scroll through the infinite feed of AI-rewritten news
2. **Switch Styles**: Use the toggle tabs to switch between Normal, Gen-Z, and Alpha versions
3. **Engage**: Like articles, leave comments, and share content
4. **Filter**: Use trending and latest filters to find relevant content

### For Admins

The system is designed to automatically:
1. Fetch RSS feeds daily
2. Process content through AI APIs
3. Store rewritten articles in the database
4. Present them in the user interface

## 🔧 Configuration

### AI Prompt Template

The system uses this prompt structure for content rewriting:

```javascript
const prompt = `You are an expert editor. Rewrite this article for 3 audiences:
1. Professional summary (100 words max)
2. Gen-Z version (TikTok tone, emojis, hashtags)
3. Alpha version (Discord slang, short, emojis)

Input: ${rssContent}

Output: JSON with 'normal', 'genz', 'alpha' keys`;
```

### RSS Feeds

Add your RSS feed URLs to the system. The application will:
- Fetch feeds daily
- Extract article content
- Process through AI APIs
- Store in database

## 🎨 Design System

### Colors
- **Primary**: Purple to Pink gradient
- **Secondary**: Teal, Orange accents
- **Neutral**: Gray scales optimized for dark theme

### Typography
- **Font**: Inter (Google Fonts)
- **Hierarchy**: Clear distinction between headings and body text
- **Line Height**: 150% for body, 120% for headings

### Components
- **NewsCard**: Main article display with style switching
- **ToggleTabs**: Style switcher with smooth animations
- **ReactionBar**: Like, comment, share interactions
- **CommentBox**: User comment input system

## 🚀 Deployment

The application is optimized for Vercel deployment:

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## 📊 Performance

- **Lighthouse Score**: 90+ on all metrics
- **Core Web Vitals**: Optimized for mobile
- **Bundle Size**: Code-split and optimized
- **Loading**: Infinite scroll with intersection observer

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Supabase for the backend infrastructure
- Vercel for hosting and deployment
- OpenAI/Google for AI capabilities
- The React and TypeScript communities

---

Built with ❤️ for the next generation of news consumers.