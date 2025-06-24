import { createClient } from '@supabase/supabase-js';

// You'll need to get your service_role key from Supabase Dashboard > Settings > API
// Replace this with your actual service_role key (it starts with "eyJ..." and is much longer)
const supabaseUrl = 'https://fdnvfdkhhwdpkyomsvoq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkbnZmZGtoaHdkcGt5b21zdm9xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODE5NzM1MywiZXhwIjoyMDYzNzczMzUzfQ.dvbEOUkfEG-hucg4N-pBvCVO7DgGvpa6Hg3OE7YUajc'; // Get this from Supabase Dashboard

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Same sample articles array as before...
const sampleArticles = [
  {
    title: 'Revolutionary AI Breakthrough Changes Everything',
    normal: 'Scientists at MIT have developed a new AI system that can process information 1000x faster than current models. This breakthrough could revolutionize how we interact with technology and solve complex problems. The research team published their findings in Nature, showing significant improvements in processing speed and accuracy across multiple domains.',
    genz: 'YOOO this new AI is absolutely INSANE 🤯✨ MIT scientists just dropped the most fire tech that\'s literally 1000x faster than anything we\'ve seen!! This is giving main character energy and I\'m here for it 💅 The research is lowkey gonna change EVERYTHING and I can\'t even... This hits different fr fr 🔥',
    alpha: 'bruh this AI just straight up said "hold my energy drink" and became 1000x faster 💀 MIT really said "let\'s break the internet today" and I respect the chaos energy ngl. this is some big brain moves that\'s gonna make everyone else look sus af 🧠⚡ absolute gigachad move from the science bros',
    image_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
    category: 'Technology',
    published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    original_url: 'https://techcrunch.com/ai-breakthrough',
    slug: 'revolutionary-ai-breakthrough-changes-everything',
    rss_source: 'TechCrunch'
  },
  {
    title: 'Gaming Industry Sees Record-Breaking Year',
    normal: 'The gaming industry has reached unprecedented heights with $184 billion in global revenue this year. Mobile gaming continues to dominate with 52% market share, while console and PC gaming show strong growth. Major releases like the latest installments of popular franchises drove significant engagement across all platforms.',
    genz: 'Gaming is literally having its main character moment rn and we\'re all here for it!! 🎮✨ $184 BILLION?? That\'s giving serious wealth energy and honestly deserved. Mobile gaming said "I\'m THAT girl" with 52% market share periodt 💅 The new game drops are hitting different this year no cap 🔥',
    alpha: 'gaming really said "watch me flex on every other industry" with that $184B flex 💰 mobile gaming is straight up the final boss of entertainment rn. console and PC gaming: "am I a joke to you?" narrator: they were not 🎯 new games dropping harder than my grades this semester fr 📉🎮',
    image_url: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800',
    category: 'Gaming',
    published_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    original_url: 'https://gamespot.com/gaming-record-year',
    slug: 'gaming-industry-sees-record-breaking-year',
    rss_source: 'GameSpot'
  },
  {
    title: 'Climate Summit Reaches Historic Agreement',
    normal: 'World leaders at COP29 have reached a groundbreaking agreement on carbon emissions reduction. The pact includes commitments from 195 countries to achieve net-zero emissions by 2050, with interim targets every five years. This represents the most ambitious climate action plan in history, backed by $500 billion in funding.',
    genz: 'NOT the world leaders actually coming through with climate action!! 🌍💚 195 countries said "we\'re gonna save the planet and that\'s on periodt" The $500 billion funding is giving very much "we\'re serious about this" energy and honestly it\'s about time bestie ✨ Net-zero by 2050 hits different when everyone\'s actually committed 🌱',
    alpha: 'world leaders really woke up and chose saving the planet today 🌍 195 countries in the group chat like "bet, let\'s fix climate change" with that $500B backing. net-zero by 2050 is the ultimate glow-up for Earth ngl 🌱 mother nature about to be so proud of her children fr',
    image_url: 'https://images.unsplash.com/photo-1569163139394-de4e4f43e4e3?w=800',
    category: 'World',
    published_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    original_url: 'https://reuters.com/climate-summit-agreement',
    slug: 'climate-summit-reaches-historic-agreement',
    rss_source: 'Reuters'
  },
  {
    title: 'Space Mission Discovers Earth-Like Planet',
    normal: 'NASA\'s James Webb Space Telescope has identified an Earth-like exoplanet 100 light-years away with potential signs of life. The planet, designated K2-18b, shows evidence of water vapor and possible biosignatures in its atmosphere. This discovery marks a significant milestone in the search for extraterrestrial life.',
    genz: 'SPACE SAID "HOLD MY COSMIC LATTE" AND FOUND ANOTHER EARTH!! 🌍✨ NASA\'s telescope really said "let me just casually find aliens" and I\'m absolutely living for this energy 🛸 K2-18b is giving main planet energy 100 light-years away and honestly? Iconic behavior from the universe 💫',
    alpha: 'NASA telescope really said "surprise! more planets with the homies" and found Earth 2.0 👽 K2-18b out here 100 light-years away living its best life with water and possible aliens. this is some serious space flex energy and I\'m here for the intergalactic drama ☄️🌌',
    image_url: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800',
    category: 'Science',
    published_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    original_url: 'https://space.com/earth-like-planet-discovery',
    slug: 'space-mission-discovers-earth-like-planet',
    rss_source: 'Space.com'
  },
  {
    title: 'New Social Media Platform Gains 50M Users',
    normal: 'A new social media platform focused on authentic connections has reached 50 million users in just three months. The app emphasizes real-time conversations and limits algorithmic content curation. Users report higher satisfaction rates compared to traditional platforms, citing reduced anxiety and more meaningful interactions.',
    genz: 'NEW SOCIAL APP JUST HIT DIFFERENT AND GOT 50M USERS!! 📱✨ Finally someone said "let\'s make social media that doesn\'t give us anxiety" and the people RESPONDED 🙌 Real conversations? In THIS economy? Revolutionary behavior honestly 💅 The algorithm said goodbye and good riddance bestie',
    alpha: 'new social app really said "what if we made social media that doesn\'t destroy your mental health" and 50M people said "SAY LESS" 📱 authentic connections are making a comeback and honestly it\'s about time. algorithms in shambles rn 💀 this is giving hope for humanity vibes',
    image_url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800',
    category: 'Technology',
    published_at: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    original_url: 'https://techcrunch.com/new-social-platform',
    slug: 'new-social-media-platform-gains-50m-users',
    rss_source: 'TechCrunch'
  },
  {
    title: 'Electric Vehicle Sales Surpass Gas Cars',
    normal: 'For the first time in automotive history, electric vehicle sales have exceeded traditional gas-powered cars in major markets. Tesla, BYD, and other manufacturers report record-breaking quarterly sales. Government incentives and improved charging infrastructure contribute to this historic shift in transportation.',
    genz: 'ELECTRIC CARS SAID "WE\'RE THE MAIN CHARACTER NOW" AND OUTSOLD GAS CARS!! 🚗⚡ Tesla and the crew really said "fossil fuels who?" and I\'m absolutely here for this planet-saving energy 🌍✨ The charging infrastructure finally caught up and it\'s giving future vibes fr 💚',
    alpha: 'electric cars really hit gas cars with the "this you?" moment and took over the market 💀⚡ Tesla said "watch me end this whole industry\'s career" and honestly respect the hustle. charging stations everywhere now so range anxiety is officially cancelled 🔋 mother earth is proud',
    image_url: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800',
    category: 'Technology',
    published_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    original_url: 'https://theverge.com/electric-vehicle-sales',
    slug: 'electric-vehicle-sales-surpass-gas-cars',
    rss_source: 'The Verge'
  },
  {
    title: 'TikTok Introduces Revolutionary Creator Tools',
    normal: 'TikTok has launched a suite of AI-powered creator tools that automatically generate content ideas, optimize posting times, and enhance video quality. The platform reports 40% increase in creator engagement since the rollout. These tools are specifically designed to help emerging creators compete with established influencers.',
    genz: 'TIKTOK REALLY SAID "LET\'S MAKE EVERYONE A MAIN CHARACTER" WITH THESE NEW TOOLS!! 🎥✨ AI helping us create content? We love to see the future supporting our creative era 💅 40% more engagement has me SCREAMING because finally the algorithm is working FOR us bestie!! This is giving everyone a chance to shine periodt 🌟',
    alpha: 'TikTok devs really woke up and chose violence against struggling creators 😭 AI tools that actually HELP instead of replace us? revolutionary behavior ngl 🤖 40% engagement boost got creators everywhere doing victory laps. this is the glow-up the platform needed fr fr 📈✨',
    image_url: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800',
    category: 'Entertainment',
    published_at: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
    original_url: 'https://variety.com/tiktok-creator-tools',
    slug: 'tiktok-introduces-revolutionary-creator-tools',
    rss_source: 'Variety'
  },
  {
    title: 'Breakthrough in Quantum Computing Achieved',
    normal: 'Researchers at Google Quantum AI have successfully demonstrated error-corrected quantum computing at scale. Their new quantum processor can maintain coherent qubits for over 100 seconds, a 10x improvement over previous systems. This advancement brings practical quantum computing applications significantly closer to reality.',
    genz: 'GOOGLE QUANTUM TEAM JUST BROKE THE PHYSICS GAME AND I\'M HERE FOR IT!! 🚀⚛️ 100 seconds of quantum coherence is giving "we just unlocked the universe cheat codes" energy and honestly iconic 💫 Quantum computing about to make regular computers look like ancient artifacts bestie ✨',
    alpha: 'Google quantum devs really said "watch us bend reality" and made quantum computers work for 100 whole seconds 💀⚛️ regular computers everywhere shaking rn because the quantum bros just flexed harder than anyone expected. physics said "impossible" and Google said "bet" 🤯',
    image_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800',
    category: 'Science',
    published_at: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
    original_url: 'https://nature.com/quantum-computing-breakthrough',
    slug: 'breakthrough-in-quantum-computing-achieved',
    rss_source: 'Nature'
  }
];

async function insertWithServiceKey() {
  try {
    console.log('🚀 Starting to insert sample articles using service key...');
    
    // First, check existing articles
    const { data: existingArticles, error: checkError } = await supabase
      .from('articles')
      .select('id');
    
    if (checkError) {
      console.error('❌ Error checking existing articles:', checkError);
      return;
    }
    
    console.log(`📊 Current articles in database: ${existingArticles.length}`);
    
    // Insert all articles at once
    const { data, error } = await supabase
      .from('articles')
      .insert(sampleArticles)
      .select();
    
    if (error) {
      console.error('❌ Error inserting articles:', error);
    } else {
      console.log(`✅ Successfully inserted ${data.length} articles!`);
      console.log('🎉 Articles added:');
      data.forEach((article, index) => {
        console.log(`  ${index + 1}. ${article.title} (${article.category})`);
      });
    }
    
    // Verify final count
    const { data: finalCount } = await supabase
      .from('articles')
      .select('id');
    
    console.log(`📈 Total articles in database now: ${finalCount.length}`);
    
  } catch (err) {
    console.error('❌ Exception:', err);
  }
}

// Run the insertion
insertWithServiceKey();
