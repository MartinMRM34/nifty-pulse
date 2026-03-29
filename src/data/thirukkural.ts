import { ThirukkuralVerse } from "@/types";

/**
 * Curated verses from the Porulpaal (Book of Wealth) of Thirukkural.
 * Categorized by market sentiment for context-aware selection.
 * Structured strictly in Kural Venba format: 4 words in the top line, 3 words in the bottom.
 */
export const THIRUKKURAL_VERSES: ThirukkuralVerse[] = [
  // --- BULLISH / MOMENTUM (Focus on Effort, Growth, and Opportunity) ---
  {
    number: 759,
    tamil: "செய்க பொருளைச் செறுநர் செருக்கறுக்கும்\nஎஃகதனிற் கூரிய தில்.",
    transliteration: "Seyka porulaich cherunar cherukkurukkum\nEqkadhanir kooriya dhil.",
    english: "Gather wealth; it is the sharpest weapon to cut down the pride of foes.",
    topic: "The Sharpest Weapon",
    category: "BULLISH",
  },
  {
    number: 619,
    tamil: "தெய்வத்தான் ஆகா தெனினும் முயற்சிதன்\nமெய்வருத்தக் கூலி தரும்.",
    transliteration: "Deivaththaan aagaa theninum muyarchithan\nMeivarththak kooli tharum.",
    english: "Even if fate denies success, the effort of one's own body will yield its reward.",
    topic: "Hard Work Never Fails",
    category: "BULLISH",
  },
  {
    number: 594,
    tamil: "ஆக்கம் அதர்வினாய்ச் செல்லும் அசைவிலா\nஊக்க முடையா னுழை.",
    transliteration: "Aakkam adharvinaich chellum asaivilaa\nOokka mudaiyaanuzhai.",
    english: "Fortune itself will ask the way and go to the man with unflagging energy.",
    topic: "Attracting Wealth",
    category: "BULLISH",
  },
  {
    number: 611,
    tamil: "அருமை உடைத்தென்று அயாவாமை வேண்டும்\nபெருமை முயற்சி தரும்.",
    transliteration: "Arumai udaithendru ayavaamai vendum\nPerumai muyarchi tharum.",
    english: "Never say 'this is too hard'; effort will bring the greatness of success.",
    topic: "The Power of Effort",
    category: "BULLISH",
  },
  {
    number: 666,
    tamil: "எண்ணிய எண்ணியாங்கு எய்துப எண்ணியார்\nதிண்ணியர் ஆகப் பெறின்.",
    transliteration: "Enniya enniyaangu eidhuba enniyaar\nThinniyar aahap perin.",
    english: "Great goals are attained as they were planned, if the thinkers remain resolute.",
    topic: "Resoluteness",
    category: "BULLISH",
  },

  // --- BEARISH / CAUTION (Focus on Risk Management, Patience, and Capital Preservation) ---
  {
    number: 463,
    tamil: "ஆக்கம் கருதி முதலிழக்கும் செய்வினை\nஊக்கார் அறிவுடை யார்.",
    transliteration: "Aakkam karudhi mudhalilakkum seyvinai\nOokkaar arivudai yaar.",
    english: "The wise never risk their capital in pursuit of uncertain gains.",
    topic: "Capital Preservation",
    category: "BEARISH",
  },
  {
    number: 467,
    tamil: "எண்ணித் துணிக கருமம் துணிந்தபின்\nஎண்ணுவம் என்பது இழுக்கு.",
    transliteration: "Ennith thunika karumam thunindhapin\nEnnuvam enbadhu izhukku.",
    english: "Deliberate before you begin; to hesitate after committing is folly.",
    topic: "Think and Act",
    category: "BEARISH",
  },
  {
    number: 471,
    tamil: "வினைவலியும் தன்வலியும் மாற்றான் வலியும்\nதுணைவலியும் தூக்கிச் செயல்.",
    transliteration: "Vinaivaliyum thanvaliyum maatraan valiyum\nThunaivaliyum thookkuch cheyal.",
    english: "Weigh the strength of the task, your own strength, and the market's strength before acting.",
    topic: "Strategic Balance",
    category: "BEARISH",
  },
  {
    number: 475,
    tamil: "பீலிபெய் சாகாடும் அச்சிறும் அப்பண்டம்\nசால மிகுத்துப் பெயின்.",
    transliteration: "Peilipei saahaadum achchirum appanddam\nSaala mihuththup peyin.",
    english: "Even peacock feathers can break an axle if the load is too great.",
    topic: "The Danger of Excess",
    category: "BEARISH",
  },
  {
    number: 481,
    tamil: "பகல்வெல்லும் கூகையைக் காக்கை இகல்வெல்லும்\nவேந்தர்க்கு வேண்டும் பொழுது.",
    transliteration: "Pahalvellum koohaiyaik kaakkai ihalvellum\nVendharkku vendum pozhudhu.",
    english: "A crow can defeat an owl in daylight; a leader needs the right time for victory.",
    topic: "Wait for the Right Time",
    category: "BEARISH",
  },
  {
    number: 484,
    tamil: "ஞாலம் கருதினும் கைகூடும் காலம்\nகருதி இடத்தாற் செயின்.",
    transliteration: "Gnaalam karudhinum kaikoodum kaalam\nKarudhi idaththaar seyin.",
    english: "One may win the whole world if the right time and the right place are chosen.",
    topic: "Market Timing",
    category: "BEARISH",
  },

  // --- NEUTRAL / STEADY (Focus on Knowledge, Learning, and Emotional Balance) ---
  {
    number: 391,
    tamil: "கற்க கசடறக் கற்பவை கற்றபின்\nநிற்க அதற்குத் தக.",
    transliteration: "Karka kasadarak karpavai katrapin\nNirka adharkkuth thaga.",
    english: "Learn deeply and flawlessly; once learned, live according to that knowledge.",
    topic: "True Learning",
    category: "NEUTRAL",
  },
  {
    number: 421,
    tamil: "அறிவு அற்றம் காக்கும் கருவி செறுவார்க்கும்\nஉள்ளழிக்கல் ஆகா அரண்.",
    transliteration: "Arivu atram kaakkum karuvi cheruvaarkkum\nUllazhikkal aagaa aran.",
    english: "Wisdom is the tool that saves from ruin; a fortress that no foe can destroy.",
    topic: "Wisdom as a Shield",
    category: "NEUTRAL",
  },
  {
    number: 423,
    tamil: "எப்பொருள் யார்யார்வாய்க் கேட்பினும் அப்பொருள்\nமெய்ப்பொருள் காண்பது அறிவு.",
    transliteration: "Epporul yaaryaarvaik ketpinum apporul\nMeipporul kaanbadhu arivu.",
    english: "To discern the truth from whatever source it comes is the mark of wisdom.",
    topic: "Critical Thinking",
    category: "NEUTRAL",
  },
  {
    number: 396,
    tamil: "தொட்டனைத் தூறும் மணற்கேணி மாந்தர்க்குக்\nகற்றனைத் தூறும் அறிவு.",
    transliteration: "Thottanaith thoorum manarkeni maandharkkuk\nKatranaith thoorum arivu.",
    english: "As water flows from a well that is dug deep, so knowledge flows as one studies.",
    topic: "Continuous Growth",
    category: "NEUTRAL",
  },

  // --- GENERAL (Universal Wisdom and Foundation) ---
  {
    number: 1,
    tamil: "அகர முதல எழுத்தெல்லாம் ஆதிபகவன்\nமுதற்றே உலகு.",
    transliteration: "Agara mudhala ezhuththellaam aadhibagavan\nMudhatre ulagu.",
    english: "As 'A' is the first of all letters, so is the Eternal Spirit the first of the world.",
    topic: "The Beginning",
    category: "GENERAL",
  },
  {
    number: 760,
    tamil: "கொடையளி செங்கோல் குடியோம்பல் நான்கும்\nஉடையானாம் வேந்தர்க்கு ஒளி.",
    transliteration: "Kodaiyali sengol kudiyombal naankum\nUdaiyaanam vendharkku oli.",
    english: "Charity, compassion, justice, and care for the people — these give a ruler true radiance.",
    topic: "Righteous Wealth",
    category: "GENERAL",
  },
  {
    number: 111,
    tamil: "தகவிலன் தக்கன் என்பது அவரவர்\nஎச்சத்தாற் காணப் படும்.",
    transliteration: "Thakavilan thakkan enbadhu avaravar\nEchchaththaar kaanap padum.",
    english: "The worthy and the unworthy are discerned by their offspring.",
    topic: "Character",
    category: "GENERAL",
  },
];

/**
 * Returns a Thirukkural verse for today, optionally filtered by market signal.
 */
export function getTodayVerse(category?: ThirukkuralVerse["category"]): ThirukkuralVerse {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  let pool = THIRUKKURAL_VERSES;

  if (category) {
    const filtered = THIRUKKURAL_VERSES.filter((v) => v.category === category);
    if (filtered.length > 0) {
      pool = filtered;
    }
  }

  return pool[dayOfYear % pool.length];
}
