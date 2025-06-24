import { useState, useEffect } from 'react';
import { Article, getArticles } from '../lib/supabase';

// Enhanced news data service with automatic publishing
export const useNewsData = (userInterests: string[] = [], preferredStyle: string = 'normal') => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchArticles = async (offset: number = 0) => {
    setLoading(true);
    try {
      const { data, error } = await getArticles(20, offset, userInterests);
      
      if (error) throw error;
      
      if (data) {
        if (offset === 0) {
          setArticles(data);
        } else {
          setArticles(prev => [...prev, ...data]);
        }
        
        setHasMore(data.length === 20);
      } else {
        // Generate comprehensive mock data if database is empty
        const mockData = await generateComprehensiveNewsData(userInterests, offset);
        if (offset === 0) {
          setArticles(mockData);
        } else {
          setArticles(prev => [...prev, ...mockData]);
        }
        setHasMore(mockData.length === 20);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      // Fallback to comprehensive mock data
      const mockData = await generateComprehensiveNewsData(userInterests, offset);
      if (offset === 0) {
        setArticles(mockData);
      } else {
        setArticles(prev => [...prev, ...mockData]);
      }
      setHasMore(mockData.length === 20);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchArticles(articles.length);
    }
  };

  // Refresh articles manually
  const refreshArticles = async () => {
    console.log('🔄 Manually refreshing articles...');
    await fetchArticles(0);
  };

  useEffect(() => {
    fetchArticles(0);
    
    // Auto-refresh every 5 minutes for live updates
    const interval = setInterval(() => {
      console.log('⏰ Auto-refreshing articles...');
      fetchArticles(0);
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [userInterests, preferredStyle]);

  return { articles, loading, hasMore, loadMore, refreshArticles };
};

// Comprehensive mock data generator for 100+ articles across all categories
const generateComprehensiveNewsData = async (interests: string[], offset: number): Promise<Article[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const categories = ['Technology', 'Gaming', 'Entertainment', 'Sports', 'Science', 'Business', 'Lifestyle', 'Health', 'Politics', 'World'];
  
  const newsTemplates = {
    Technology: [
      {
        title: 'OpenAI Releases GPT-5 with Revolutionary Multimodal Capabilities',
        normal: 'OpenAI has unveiled GPT-5, featuring advanced multimodal capabilities that can process text, images, audio, and video simultaneously. The new model demonstrates significant improvements in reasoning, coding, and creative tasks, with enhanced safety measures and reduced hallucinations. The release marks a significant milestone in artificial intelligence development.',
        genz: "Y'all, OpenAI just dropped GPT-5 and I'm literally DECEASED! 😭✨ This AI can handle EVERYTHING - text, pics, videos, audio - like it's giving omnipotent energy! The reasoning skills are absolutely sending me! This is the future bestie! 🤖💅 Safety features are chef's kiss too! #GPT5 #AIRevolution #TechTok #FutureIsNow",
        alpha: "GPT-5 just dropped and it's absolutely CRACKED 🔥 Multimodal = OP buff. Can process everything = no cap. Reasoning skills maxed out. Safety measures = responsible AI development. OpenAI not holding back fr 💪 AI evolution speedrun any% complete #GPT5W #AIGod #TechSupremacy"
      },
      {
        title: 'Apple Vision Pro 2 Announced with 8K Display and Neural Processing',
        normal: 'Apple has announced the Vision Pro 2, featuring dual 8K micro-OLED displays, advanced neural processing unit, and improved battery life. The device promises seamless AR/VR experiences with enhanced hand tracking and eye movement detection. Pre-orders begin next month with shipping in Q2 2025.',
        genz: "Apple Vision Pro 2 is here and it's giving MAIN CHARACTER ENERGY! 🥽✨ 8K displays? Neural processing? Hand tracking that actually works? Apple said 'let me show you the future' and we're obsessed! This is about to change everything bestie! Pre-ordering ASAP! 💜 #VisionPro2 #AppleEvent #TechQueen",
        alpha: "Vision Pro 2 = absolute unit 🚀 8K displays = visual perfection unlocked. Neural processing = brain-level AI. Hand tracking not scuffed anymore. Battery life buffed significantly. Apple flexing hard on competition 💪 VR/AR game changed forever #AppleW #VisionPro2 #TechGod"
      },
      {
        title: 'Tesla Unveils Fully Autonomous Robotaxi Fleet',
        normal: 'Tesla has officially launched its fully autonomous robotaxi service in select cities, featuring Level 5 self-driving capabilities. The fleet operates 24/7 with no human intervention required, marking a significant milestone in autonomous vehicle technology. The service will expand to 50 cities by end of 2025.',
        genz: "Tesla robotaxis are literally EVERYWHERE now and I'm living for it! 🚗✨ No drivers needed? Full autonomy? Elon really said 'let me revolutionize transportation' and delivered! This is giving sci-fi movie vibes fr! Can't wait for it to come to my city! 🤖 #TeslaRobotaxi #FutureIsNow #TransportationRevolution",
        alpha: "Tesla robotaxi fleet = transportation revolution complete 🚗 Level 5 autonomy = driving skills obsolete. 24/7 operation = efficiency maxed. 50 cities by 2025 = rapid expansion confirmed. Elon delivering on promises fr 💪 Human drivers in shambles #TeslaW #AutonomousSupremacy #ElonW"
      },
      {
        title: 'Meta Launches Advanced AI Avatars for Metaverse',
        normal: 'Meta has introduced next-generation AI avatars that can replicate human emotions and expressions in real-time. The avatars use advanced machine learning to create photorealistic representations and natural conversations. The technology will be integrated across all Meta platforms.',
        genz: "Meta's new AI avatars are absolutely SENDING ME! 😍✨ They look so real it's actually scary but in the best way! Real-time emotions? Natural convos? The metaverse is about to be SO much better! This is giving Black Mirror but make it cute! 🤖💅 #MetaAvatars #Metaverse #AIAvatars",
        alpha: "Meta AI avatars = uncanny valley conquered 🤖 Photorealistic rendering = graphics card crying. Real-time emotions = NPC behavior upgraded. Cross-platform integration = ecosystem domination. Meta not playing around fr 💪 Virtual reality just got real #MetaW #AIAvatars #MetaverseSupremacy"
      }
    ],
    Gaming: [
      {
        title: 'PlayStation 6 Specs Revealed: 16K Gaming and Ray Tracing 3.0',
        normal: 'Sony has officially revealed PlayStation 6 specifications, including support for 16K gaming at 240fps, Ray Tracing 3.0 technology, and a custom AMD Zen 5 processor. The console features 32GB GDDR7 RAM and a 4TB NVMe SSD with 25GB/s transfer speeds. Launch is scheduled for holiday 2025.',
        genz: "PS6 SPECS JUST DROPPED AND I'M LITERALLY SHAKING! 😱🎮 16K at 240fps? Ray Tracing 3.0? Sony really said 'let me end this whole console war' and I'm here for it! The specs are absolutely UNHINGED! 2025 can't come fast enough! Already saving up bestie! 💎 #PS6 #PlayStation #ConsoleWars #Gaming",
        alpha: "PS6 specs = absolutely mental 🤯 16K 240fps confirmed. Ray Tracing 3.0 = visual perfection. 32GB GDDR7 = memory overflow. 25GB/s SSD = loading screens deleted from existence. Holiday 2025 = Christmas sorted. Sony going full send 🏆 #PS6Leak #SonyW #ConsoleSupremacy #NextGen"
      },
      {
        title: 'Grand Theft Auto 6 Release Date Confirmed for 2025',
        normal: 'Rockstar Games has officially confirmed that Grand Theft Auto 6 will release in fall 2025 for PlayStation 5, Xbox Series X/S, and PC. The game features a massive open world spanning multiple cities with unprecedented detail and realism. A new trailer showcases the game\'s revolutionary graphics engine.',
        genz: "GTA 6 FINALLY HAS A RELEASE DATE AND I'M CRYING! 😭🎮 Fall 2025 bestie! Multiple cities? Insane graphics? Rockstar really took their time and it's about to be ICONIC! This is literally the game of the decade! The trailer has me DECEASED! ✨ #GTA6 #RockstarGames #Gaming #GOTY",
        alpha: "GTA 6 release date confirmed = gaming community saved 🎮 Fall 2025 = patience finally rewarded. Multiple cities = open world perfection. Graphics engine = reality simulator. Rockstar development time = worth the wait fr 💪 Gaming industry about to peak #GTA6W #RockstarGod #OpenWorldKing"
      },
      {
        title: 'Nintendo Switch 2 Leaked with 4K OLED Display',
        normal: 'Leaked specifications for the Nintendo Switch 2 reveal a 7-inch 4K OLED display, NVIDIA Tegra X2 processor, and backwards compatibility with original Switch games. The console is expected to launch in early 2025 with enhanced performance and battery life.',
        genz: "NINTENDO SWITCH 2 LEAKS ARE HERE AND I'M OBSESSED! 🎮✨ 4K OLED screen? Backwards compatibility? Nintendo really said 'let me give you everything' and we're living! Early 2025 can't come soon enough! My wallet is ready! 💸 #NintendoSwitch2 #Nintendo #Gaming #Leaks",
        alpha: "Switch 2 leaks = Nintendo W incoming 🎮 4K OLED = visual upgrade confirmed. Tegra X2 = performance boost unlocked. Backwards compatibility = library preserved. Early 2025 = hype train departing. Nintendo not missing fr 💪 Portable gaming evolved #NintendoW #Switch2 #PortableGaming"
      }
    ],
    Entertainment: [
      {
        title: 'Marvel Announces Phase 6 with Multiverse Saga Conclusion',
        normal: 'Marvel Studios has officially announced Phase 6 of the MCU, concluding the Multiverse Saga with "Avengers: Secret Wars" and "Fantastic Four: First Steps". The phase will introduce the X-Men and feature crossovers with previous Marvel universes. Production begins in 2025.',
        genz: "MARVEL PHASE 6 IS HERE AND I'M LITERALLY CRYING! 😭✨ Secret Wars? X-Men? Multiverse conclusion? Kevin Feige really said 'let me give you everything you want' and we're absolutely living for it! This is cinema bestie! Can't wait for X-Men! 🎬 #MarvelPhase6 #MCU #SecretWars #XMen",
        alpha: "Marvel Phase 6 = cinema perfection 🎬 Secret Wars confirmed = multiverse W. X-Men finally joining = character roster OP. Fantastic Four = first family returns. Feige not missing fr 💪 MCU supremacy continues #MarvelW #Phase6 #CinemaGod #MultiverseSaga"
      },
      {
        title: 'Netflix Announces Live-Action Avatar: The Last Airbender Season 2',
        normal: 'Netflix has greenlit a second season of the live-action Avatar: The Last Airbender series following the success of season one. The new season will adapt the Earth Kingdom storyline with returning cast members and new additions. Production starts in early 2025.',
        genz: "AVATAR SEASON 2 IS CONFIRMED AND I'M LITERALLY SCREAMING! 😭🔥 Earth Kingdom arc incoming! The cast is returning! Netflix really listened to the fans and delivered! This show has my whole heart! Ba Sing Se here we come! ✨ #Avatar #Netflix #ATLA #EarthKingdom",
        alpha: "Avatar S2 confirmed = Netflix W 🔥 Earth Kingdom arc = Toph incoming. Cast returning = continuity preserved. Fan feedback = actually listened to. Production 2025 = hype maintained. Live-action adaptation not scuffed #NetflixW #Avatar #ATLA #EarthKingdom"
      }
    ],
    Sports: [
      {
        title: 'FIFA World Cup 2026 Venues Finalized Across North America',
        normal: 'FIFA has announced the final list of venues for the 2026 World Cup, featuring 16 stadiums across the United States, Canada, and Mexico. The tournament will be the largest in World Cup history with 48 teams participating. Ticket sales begin in early 2025.',
        genz: "WORLD CUP 2026 VENUES ARE SET AND I'M SO READY! ⚽✨ 16 stadiums across North America? 48 teams? This is about to be the BIGGEST World Cup ever! Already planning my stadium tour bestie! Ticket sales can't come soon enough! 🎫 #WorldCup2026 #FIFA #Soccer #Football",
        alpha: "World Cup 2026 venues confirmed = football festival incoming ⚽ 48 teams = tournament expanded. 16 stadiums = maximum coverage. North America hosting = accessibility unlocked. Ticket sales 2025 = preparation time. FIFA going big fr 💪 #WorldCup2026 #FIFA #Football"
      }
    ],
    Science: [
      {
        title: 'NASA Confirms Water on Mars with New Rover Discovery',
        normal: 'NASA\'s latest Mars rover has discovered substantial water ice deposits beneath the planet\'s surface, confirming long-held theories about Martian water reserves. The discovery could significantly impact future Mars colonization plans and our understanding of the planet\'s history.',
        genz: "NASA FOUND WATER ON MARS AND I'M LITERALLY SHOOK! 🚀💧 This changes EVERYTHING for space exploration! Mars colonization just got so much more real! Science is absolutely serving right now! The future is looking so bright! ✨ #NASA #Mars #SpaceExploration #Science",
        alpha: "Mars water confirmed = colonization unlocked 🚀 NASA rover = discovery machine. Water ice deposits = survival resources secured. Mars settlement = actually possible now. Space exploration = next level achieved fr 💪 Red planet not so hostile #NASAW #Mars #SpaceColonization"
      }
    ],
    Business: [
      {
        title: 'Amazon Announces $50 Billion Investment in AI Infrastructure',
        normal: 'Amazon has committed $50 billion to expand its AI infrastructure over the next five years, including new data centers and quantum computing research. The investment aims to maintain Amazon\'s competitive edge in cloud computing and artificial intelligence services.',
        genz: "Amazon dropping $50 BILLION on AI and I'm here for this energy! 💰🤖 They're really about to dominate the AI game even more! Cloud computing queen behavior! This is giving tech empire vibes and I'm obsessed! ✨ #Amazon #AI #TechInvestment #CloudComputing",
        alpha: "Amazon $50B AI investment = market domination confirmed 💰 Data centers = infrastructure maxed. Quantum computing = next-gen unlocked. Cloud competition = eliminated. Bezos empire expanding fr 💪 Tech supremacy secured #AmazonW #AI #CloudSupremacy"
      }
    ],
    Lifestyle: [
      {
        title: 'TikTok Launches Professional Creator Fund with $1 Billion Budget',
        normal: 'TikTok has announced a new Creator Fund with a $1 billion budget to support professional content creators. The program offers monthly payments, production resources, and marketing support for qualifying creators with over 100,000 followers.',
        genz: "TIKTOK CREATOR FUND IS GETTING A BILLION DOLLAR GLOW UP! 💰✨ Monthly payments? Production support? They're really investing in creators and I'm living for it! Time to step up my content game bestie! This is huge for the creator economy! 🎬 #TikTok #CreatorFund #ContentCreator",
        alpha: "TikTok $1B creator fund = content economy boosted 💰 Monthly payments = creator income secured. Production resources = quality content unlocked. 100k followers = barrier to entry. Creator economy = officially mainstream #TikTokW #CreatorEconomy #ContentSupremacy"
      }
    ],
    Health: [
      {
        title: 'Revolutionary Gene Therapy Cures Type 1 Diabetes in Clinical Trial',
        normal: 'A groundbreaking gene therapy treatment has successfully cured Type 1 diabetes in 95% of patients during Phase 3 clinical trials. The treatment reprograms immune cells to stop attacking insulin-producing cells, offering hope for millions of diabetes patients worldwide.',
        genz: "GENE THERAPY JUST CURED DIABETES AND I'M CRYING HAPPY TEARS! 😭💉 95% success rate? This is literally life-changing for so many people! Science is absolutely SERVING right now! Medical breakthroughs hitting different! ✨ #GeneTherapy #Diabetes #MedicalBreakthrough #Science",
        alpha: "Gene therapy diabetes cure = medical W 💉 95% success rate = treatment perfected. Immune system reprogramming = biology hacked. Millions of patients = lives changed. Medical science = next level unlocked fr 💪 Healthcare revolution incoming #MedicalW #GeneTherapy #DiabetesCure"
      }
    ],
    Politics: [
      {
        title: 'Global Climate Summit Reaches Historic Carbon Neutrality Agreement',
        normal: 'World leaders at the Global Climate Summit have reached a historic agreement to achieve carbon neutrality by 2040, five years ahead of previous targets. The agreement includes $500 billion in funding for renewable energy projects and climate adaptation measures.',
        genz: "CLIMATE SUMMIT JUST DELIVERED AND I'M SO PROUD! 🌍✨ Carbon neutrality by 2040? $500 billion for renewables? World leaders really said 'let's save the planet' and I'm here for it! This gives me so much hope for our future! 💚 #ClimateSummit #ClimateAction #Sustainability",
        alpha: "Climate summit = planet saved 🌍 Carbon neutrality 2040 = timeline accelerated. $500B renewable funding = green energy maxed. World leaders = actually cooperating. Climate action = finally serious fr 💪 Earth preservation unlocked #ClimateW #Sustainability #GreenEnergy"
      }
    ],
    World: [
      {
        title: 'Japan Launches World\'s First Commercial Fusion Power Plant',
        normal: 'Japan has successfully launched the world\'s first commercial fusion power plant, marking a historic milestone in clean energy production. The facility can power 200,000 homes and represents a breakthrough in sustainable energy technology.',
        genz: "JAPAN JUST LAUNCHED A FUSION POWER PLANT AND I'M LITERALLY SHOOK! ⚡✨ Clean energy queen behavior! 200,000 homes powered by fusion? This is giving sci-fi movie vibes but it's REAL! The future is literally here bestie! 🔬 #FusionPower #Japan #CleanEnergy #Science",
        alpha: "Japan fusion plant = energy revolution complete ⚡ Commercial fusion = sci-fi made real. 200k homes powered = clean energy scaled. Sustainable technology = breakthrough achieved. Energy crisis = solution found fr 💪 Nuclear fusion unlocked #JapanW #FusionPower #CleanEnergy"
      }
    ]
  };

  // Filter by user interests or show all if no interests
  const relevantCategories = interests.length > 0 
    ? categories.filter(cat => interests.some(interest => 
        cat.toLowerCase().includes(interest.toLowerCase())
      ))
    : categories;

  const articles: Article[] = [];
  const articlesPerBatch = 20;

  // Generate articles from each category
  for (let i = 0; i < articlesPerBatch; i++) {
    const categoryIndex = (offset + i) % relevantCategories.length;
    const category = relevantCategories[categoryIndex];
    const templates = newsTemplates[category as keyof typeof newsTemplates] || newsTemplates.Technology;
    const templateIndex = Math.floor((offset + i) / relevantCategories.length) % templates.length;
    const template = templates[templateIndex];
    const articleIndex = offset + i;
    
    articles.push({
      id: `article-${articleIndex}`,
      title: template.title,
      normal: template.normal,
      genz: template.genz,
      alpha: template.alpha,
      image_url: getRandomNewsImage(category),
      category: category,
      published_at: new Date(Date.now() - (articleIndex * 30 * 60 * 1000)).toISOString(), // 30 minutes apart
      slug: template.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      likes_normal: Math.floor(Math.random() * 200) + 50,
      likes_genz: Math.floor(Math.random() * 500) + 100,
      likes_alpha: Math.floor(Math.random() * 300) + 75,
      original_url: `https://example.com/news/${articleIndex}`,
      rss_source: getRSSSource(category),
      created_at: new Date().toISOString()
    });
  }

  return articles;
};

const getRandomNewsImage = (category: string): string => {
  const imageMap: Record<string, string[]> = {
    'Technology': [
      'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2004161/pexels-photo-2004161.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'Gaming': [
      'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1174746/pexels-photo-1174746.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/194511/pexels-photo-194511.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'Entertainment': [
      'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3709369/pexels-photo-3709369.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'Sports': [
      'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1171084/pexels-photo-1171084.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'Science': [
      'https://images.pexels.com/photos/2004161/pexels-photo-2004161.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/256262/pexels-photo-256262.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'Business': [
      'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'Lifestyle': [
      'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'Health': [
      'https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3845810/pexels-photo-3845810.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'Politics': [
      'https://images.pexels.com/photos/1550337/pexels-photo-1550337.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/6077326/pexels-photo-6077326.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1550340/pexels-photo-1550340.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    'World': [
      'https://images.pexels.com/photos/87651/earth-blue-planet-globe-planet-87651.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1550337/pexels-photo-1550337.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=800'
    ]
  };

  const images = imageMap[category] || imageMap['Technology'];
  return images[Math.floor(Math.random() * images.length)];
};

const getRSSSource = (category: string): string => {
  const sourceMap: Record<string, string[]> = {
    'Technology': ['TechCrunch', 'The Verge', 'Wired', 'Ars Technica', 'Engadget', 'CNET', 'TechRadar'],
    'Gaming': ['IGN', 'GameSpot', 'Polygon', 'Kotaku', 'PC Gamer', 'GamesRadar', 'Eurogamer'],
    'Entertainment': ['Variety', 'Entertainment Weekly', 'The Hollywood Reporter', 'Rolling Stone', 'Deadline', 'TMZ'],
    'Sports': ['ESPN', 'Sports Illustrated', 'Bleacher Report', 'The Athletic', 'CBS Sports', 'Fox Sports'],
    'Science': ['Science Daily', 'Popular Science', 'Scientific American', 'Nature', 'New Scientist', 'Live Science'],
    'Business': ['Forbes', 'Inc.com', 'Harvard Business Review', 'Fast Company', 'Business Insider', 'Fortune'],
    'Lifestyle': ['BuzzFeed', 'Mashable', 'Vice', 'Complex', 'Refinery29', 'Hypebeast'],
    'Health': ['WebMD', 'Healthline', 'Medical News Today', 'Mayo Clinic', 'Harvard Health'],
    'Politics': ['Politico', 'The Hill', 'NPR Politics', 'Axios', 'Washington Post Politics'],
    'World': ['BBC News', 'Reuters', 'Associated Press', 'CNN', 'Al Jazeera', 'The Guardian']
  };

  const sources = sourceMap[category] || sourceMap['Technology'];
  return sources[Math.floor(Math.random() * sources.length)];
};