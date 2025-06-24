-- Sample articles for the news aggregator
INSERT INTO articles (
  title,
  normal,
  genz,
  alpha,
  image_url,
  category,
  published_at,
  original_url,
  slug,
  rss_source
) VALUES
(
  'Revolutionary AI Breakthrough Changes Everything',
  'Scientists at MIT have developed a new AI system that can process information 1000x faster than current models. This breakthrough could revolutionize how we interact with technology and solve complex problems. The research team published their findings in Nature, showing significant improvements in processing speed and accuracy across multiple domains.',
  'YOOO this new AI is absolutely INSANE 🤯✨ MIT scientists just dropped the most fire tech that''s literally 1000x faster than anything we''ve seen!! This is giving main character energy and I''m here for it 💅 The research is lowkey gonna change EVERYTHING and I can''t even... This hits different fr fr 🔥',
  'bruh this AI just straight up said "hold my energy drink" and became 1000x faster 💀 MIT really said "let''s break the internet today" and I respect the chaos energy ngl. this is some big brain moves that''s gonna make everyone else look sus af 🧠⚡ absolute gigachad move from the science bros',
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
  'Technology',
  NOW() - INTERVAL '2 hours',
  'https://techcrunch.com/ai-breakthrough',
  'revolutionary-ai-breakthrough-changes-everything',
  'TechCrunch'
),
(
  'Gaming Industry Sees Record-Breaking Year',
  'The gaming industry has reached unprecedented heights with $184 billion in global revenue this year. Mobile gaming continues to dominate with 52% market share, while console and PC gaming show strong growth. Major releases like the latest installments of popular franchises drove significant engagement across all platforms.',
  'Gaming is literally having its main character moment rn and we''re all here for it!! 🎮✨ $184 BILLION?? That''s giving serious wealth energy and honestly deserved. Mobile gaming said "I''m THAT girl" with 52% market share periodt 💅 The new game drops are hitting different this year no cap 🔥',
  'gaming really said "watch me flex on every other industry" with that $184B flex 💰 mobile gaming is straight up the final boss of entertainment rn. console and PC gaming: "am I a joke to you?" narrator: they were not 🎯 new games dropping harder than my grades this semester fr 📉🎮',
  'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800',
  'Gaming',
  NOW() - INTERVAL '4 hours',
  'https://gamespot.com/gaming-record-year',
  'gaming-industry-sees-record-breaking-year',
  'GameSpot'
),
(
  'Climate Summit Reaches Historic Agreement',
  'World leaders at COP29 have reached a groundbreaking agreement on carbon emissions reduction. The pact includes commitments from 195 countries to achieve net-zero emissions by 2050, with interim targets every five years. This represents the most ambitious climate action plan in history, backed by $500 billion in funding.',
  'NOT the world leaders actually coming through with climate action!! 🌍💚 195 countries said "we''re gonna save the planet and that''s on periodt" The $500 billion funding is giving very much "we''re serious about this" energy and honestly it''s about time bestie ✨ Net-zero by 2050 hits different when everyone''s actually committed 🌱',
  'world leaders really woke up and chose saving the planet today 🌍 195 countries in the group chat like "bet, let''s fix climate change" with that $500B backing. net-zero by 2050 is the ultimate glow-up for Earth ngl 🌱 mother nature about to be so proud of her children fr',
  'https://images.unsplash.com/photo-1569163139394-de4e4f43e4e3?w=800',
  'World',
  NOW() - INTERVAL '6 hours',
  'https://reuters.com/climate-summit-agreement',
  'climate-summit-reaches-historic-agreement',
  'Reuters'
),
(
  'Space Mission Discovers Earth-Like Planet',
  'NASA''s James Webb Space Telescope has identified an Earth-like exoplanet 100 light-years away with potential signs of life. The planet, designated K2-18b, shows evidence of water vapor and possible biosignatures in its atmosphere. This discovery marks a significant milestone in the search for extraterrestrial life.',
  'SPACE SAID "HOLD MY COSMIC LATTE" AND FOUND ANOTHER EARTH!! 🌍✨ NASA''s telescope really said "let me just casually find aliens" and I''m absolutely living for this energy 🛸 K2-18b is giving main planet energy 100 light-years away and honestly? Iconic behavior from the universe 💫',
  'NASA telescope really said "surprise! more planets with the homies" and found Earth 2.0 👽 K2-18b out here 100 light-years away living its best life with water and possible aliens. this is some serious space flex energy and I''m here for the intergalactic drama ☄️🌌',
  'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800',
  'Science',
  NOW() - INTERVAL '8 hours',
  'https://space.com/earth-like-planet-discovery',
  'space-mission-discovers-earth-like-planet',
  'Space.com'
),
(
  'New Social Media Platform Gains 50M Users',
  'A new social media platform focused on authentic connections has reached 50 million users in just three months. The app emphasizes real-time conversations and limits algorithmic content curation. Users report higher satisfaction rates compared to traditional platforms, citing reduced anxiety and more meaningful interactions.',
  'NEW SOCIAL APP JUST HIT DIFFERENT AND GOT 50M USERS!! 📱✨ Finally someone said "let''s make social media that doesn''t give us anxiety" and the people RESPONDED 🙌 Real conversations? In THIS economy? Revolutionary behavior honestly 💅 The algorithm said goodbye and good riddance bestie',
  'new social app really said "what if we made social media that doesn''t destroy your mental health" and 50M people said "SAY LESS" 📱 authentic connections are making a comeback and honestly it''s about time. algorithms in shambles rn 💀 this is giving hope for humanity vibes',
  'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800',
  'Technology',
  NOW() - INTERVAL '10 hours',
  'https://techcrunch.com/new-social-platform',
  'new-social-media-platform-gains-50m-users',
  'TechCrunch'
),
(
  'Electric Vehicle Sales Surpass Gas Cars',
  'For the first time in automotive history, electric vehicle sales have exceeded traditional gas-powered cars in major markets. Tesla, BYD, and other manufacturers report record-breaking quarterly sales. Government incentives and improved charging infrastructure contribute to this historic shift in transportation.',
  'ELECTRIC CARS SAID "WE''RE THE MAIN CHARACTER NOW" AND OUTSOLD GAS CARS!! 🚗⚡ Tesla and the crew really said "fossil fuels who?" and I''m absolutely here for this planet-saving energy 🌍✨ The charging infrastructure finally caught up and it''s giving future vibes fr 💚',
  'electric cars really hit gas cars with the "this you?" moment and took over the market 💀⚡ Tesla said "watch me end this whole industry''s career" and honestly respect the hustle. charging stations everywhere now so range anxiety is officially cancelled 🔋 mother earth is proud',
  'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800',
  'Technology',
  NOW() - INTERVAL '12 hours',
  'https://theverge.com/electric-vehicle-sales',
  'electric-vehicle-sales-surpass-gas-cars',
  'The Verge'
),
(
  'TikTok Introduces Revolutionary Creator Tools',
  'TikTok has launched a suite of AI-powered creator tools that automatically generate content ideas, optimize posting times, and enhance video quality. The platform reports 40% increase in creator engagement since the rollout. These tools are specifically designed to help emerging creators compete with established influencers.',
  'TIKTOK REALLY SAID "LET''S MAKE EVERYONE A MAIN CHARACTER" WITH THESE NEW TOOLS!! 🎥✨ AI helping us create content? We love to see the future supporting our creative era 💅 40% more engagement has me SCREAMING because finally the algorithm is working FOR us bestie!! This is giving everyone a chance to shine periodt 🌟',
  'TikTok devs really woke up and chose violence against struggling creators 😭 AI tools that actually HELP instead of replace us? revolutionary behavior ngl 🤖 40% engagement boost got creators everywhere doing victory laps. this is the glow-up the platform needed fr fr 📈✨',
  'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800',
  'Entertainment',
  NOW() - INTERVAL '14 hours',
  'https://variety.com/tiktok-creator-tools',
  'tiktok-introduces-revolutionary-creator-tools',
  'Variety'
),
(
  'Breakthrough in Quantum Computing Achieved',
  'Researchers at Google Quantum AI have successfully demonstrated error-corrected quantum computing at scale. Their new quantum processor can maintain coherent qubits for over 100 seconds, a 10x improvement over previous systems. This advancement brings practical quantum computing applications significantly closer to reality.',
  'GOOGLE QUANTUM TEAM JUST BROKE THE PHYSICS GAME AND I''M HERE FOR IT!! 🚀⚛️ 100 seconds of quantum coherence is giving "we just unlocked the universe cheat codes" energy and honestly iconic 💫 Quantum computing about to make regular computers look like ancient artifacts bestie ✨',
  'Google quantum devs really said "watch us bend reality" and made quantum computers work for 100 whole seconds 💀⚛️ regular computers everywhere shaking rn because the quantum bros just flexed harder than anyone expected. physics said "impossible" and Google said "bet" 🤯',
  'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800',
  'Science',
  NOW() - INTERVAL '16 hours',
  'https://nature.com/quantum-computing-breakthrough',
  'breakthrough-in-quantum-computing-achieved',
  'Nature'
);
