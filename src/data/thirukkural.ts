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
    english: "Accumulate wealth; it is the sharpest weapon to cut down the pride of your foes.",
    topic: "The Sharpest Weapon",
    category: "BULLISH",
    explanationTamil: "பகைவரின் செருக்கை அழிக்கும் கூர்மையான ஆயுதம் பொருளைச் சேர்த்தலே; அதைவிட மேலான ஆயுதம் வேறொன்றும் இல்லை.",
    explanationEnglish: "Accumulating wealth is the most effective strategic move to neutralize the pride and influence of your competitors.",
  },
  {
    number: 619,
    tamil: "தெய்வத்தான் ஆகா தெனினும் முயற்சிதன்\nமெய்வருத்தக் கூலி தரும்.",
    transliteration: "Deivaththaan aagaa theninum muyarchithan\nMeivarththak kooli tharum.",
    english: "Though fate be against it, effort will yield the wages of the body's toil.",
    topic: "Hard Work Never Fails",
    category: "BULLISH",
    explanationTamil: "ஊழ் தடுத்தாலும், ஒருவன் செய்யும் விடாமுயற்சி அவன் உழைப்பிற்கு ஏற்ற பலனைத் தப்பாமல் தரும்.",
    explanationEnglish: "Even if external market conditions are unfavorable, consistent and disciplined effort ensures you receive your rightful rewards.",
  },
  {
    number: 594,
    tamil: "ஆக்கம் அதர்வினாய்ச் செல்லும் அசைவிலா\nஊக்க முடையா னுழை.",
    transliteration: "Aakkam adharvinaich chellum asaivilaa\nOokka mudaiyaanuzhai.",
    english: "Wealth will find its own way to the man of unfailing energy.",
    topic: "Attracting Wealth",
    category: "BULLISH",
    explanationTamil: "தளராத ஊக்கம் உடையவனிடம் செல்வம் தானே வழிகேட்டுச் செல்லும்; அவன் தேடிப் போகத் தேவையில்லை.",
    explanationEnglish: "Prosperity and opportunity naturally gravitate toward those who possess unshakeable determination and focus.",
  },
  {
    number: 611,
    tamil: "அருமை உடைத்தென்று அசாவாமை வேண்டும்\nபெருமை முயற்சி தரும்.",
    transliteration: "Arumai udaithendru asavaamai vendum\nPerumai muyarchi tharum.",
    english: "Say not, 'It is too hard'; effort will bring the greatness of mind necessary for success.",
    topic: "The Power of Effort",
    category: "BULLISH",
    explanationTamil: "‘இச்செயல் செய்தற்கு அரியது’ என்று நினைத்துச் சோர்வடையக் கூடாது; விடா முயற்சியே அதைச் செய்து முடிக்கும் பெருமையைத் தரும்.",
    explanationEnglish: "Don't be intimidated by high barriers to entry; consistent effort provides the competitive edge and stature needed for success.",
  },
  {
    number: 666,
    tamil: "எண்ணிய எண்ணியாங்கு எய்துப எண்ணியார்\nதிண்ணியர் ஆகப் பெறின்.",
    transliteration: "Enniya enniyaangu eidhuba enniyaar\nThinniyar aahap perin.",
    english: "What they have thought, they will attain as they thought it, if they who thought it are resolute.",
    topic: "Resoluteness",
    category: "BULLISH",
    explanationTamil: "எண்ணியதை அடைய நினைப்பவர் உறுதியுடையவராக இருந்தால், அவர் நினைத்ததை நினைத்தபடியே அடைவர்.",
    explanationEnglish: "If an investor or leader remains steadfast in their analysis and conviction, they will achieve their target exactly as planned.",
  },

  // --- BEARISH / CAUTION (Focus on Risk Management, Patience, and Capital Preservation) ---
  {
    number: 463,
    tamil: "ஆக்கம் கருதி முதலிழக்கும் செய்வினை\nஊக்கார் அறிவுடை யார்.",
    transliteration: "Aakkam karudhi mudhalilakkum seyvinai\nOokkaar arivudai yaar.",
    english: "The wise will not, in the hope of profit, undertake a work which will destroy their capital.",
    topic: "Capital Preservation",
    category: "BEARISH",
    explanationTamil: "எதிர்கால லாபத்தை மட்டும் கருதி, கையிலிருக்கும் முதலையே இழக்க நேரிடும் செயலில் அறிவுடையார் ஈடுபடமாட்டார்கள்.",
    explanationEnglish: "Wise risk management dictates that one should never gamble their principal capital for the sake of speculative higher returns.",
  },
  {
    number: 467,
    tamil: "எண்ணித் துணிக கருமம் துணிந்தபின்\nஎண்ணுவம் என்பது இழுக்கு.",
    transliteration: "Ennith thunika karumam thunindhapin\nEnnuvam enbadhu izhukku.",
    english: "Think and then undertake a work; to say 'We will think' after having undertaken it, is a disgrace.",
    topic: "Think and Act",
    category: "BEARISH",
    explanationTamil: "ஒரு செயலைத் தொடங்கும் முன் தீர ஆராய வேண்டும்; தொடங்கிய பின் ஆராயலாம் என்பது பெரிய குற்றமாகும்.",
    explanationEnglish: "Perform thorough due diligence before taking a position; hesitating or second-guessing after deployment leads to failure.",
  },
  {
    number: 471,
    tamil: "வினைவலியும் தன்வலியும் மாற்றான் வலியும்\nதுணைவலியும் தூக்கிச் செயல்.",
    transliteration: "Vinaivaliyum thanvaliyum maatraan valiyum\nThunaivaliyum thookkuch cheyal.",
    english: "Act after weighing the strength of the deed, your own strength, the enemy's strength, and the strength of the allies.",
    topic: "Strategic Balance",
    category: "BEARISH",
    explanationTamil: "செயலின் வலிமை, தன் வலிமை, எதிரியின் வலிமை, இருவருக்கும் துணையாக இருப்பவர் வலிமை ஆகியவற்றை ஆராய்ந்து செயல்பட வேண்டும்.",
    explanationEnglish: "Assess the difficulty of the task, your personal resources, the competition, and the external macroeconomic conditions before acting.",
  },
  {
    number: 475,
    tamil: "பீலிபெய் சாகாடும் அச்சிறும் அப்பண்டம்\nசாலா மிகுத்துப் பெயின்.",
    transliteration: "Peilipei saahaadum achchirum appanddam\nSaala mihuththup peyin.",
    english: "The axle of the cart will break even with peacock feathers, if they are loaded in excess.",
    topic: "The Danger of Excess",
    category: "BEARISH",
    explanationTamil: "மயில் இறகு மென்மையானது என்றாலும், வண்டி தாங்காத அளவுக்கு அதை ஏற்றினால் வண்டியின் அச்சு முறியும்.",
    explanationEnglish: "Even small, low-risk positions can lead to systemic failure if they are layered with excessive leverage beyond your capital limits.",
  },
  {
    number: 481,
    tamil: "பகல்வெல்லும் கூகையைக் காக்கை இகல்வெல்லும்\nவேந்தர்க்கு வேண்டும் பொழுது.",
    transliteration: "Pahalvellum koohaiyaik kaakkai ihalvellum\nVendharkku vendum pozhudhu.",
    english: "The crow can defeat the owl in the daytime; so a king needs a suitable time to defeat his enemy.",
    topic: "Wait for the Right Time",
    category: "BEARISH",
    explanationTamil: "வலிமையான ஆந்தையைப் பகலில் காகம் வென்றுவிடும்; அதுபோல ஆக்ரோஷமான சூழலிலும் சரியான நேரத்திற்காகப் பொறுத்திருக்க வேண்டும்.",
    explanationEnglish: "Even a small investor can outperform the giants if they choose the right market cycle and time their entry strategically.",
  },
  {
    number: 484,
    tamil: "ஞாலம் கருதினுங் கைகூடுங் காலம்\nகருதி இடத்தாற் செயின்.",
    transliteration: "Gnaalam karudhinum kaikoodum kaalam\nKarudhi idaththaar seyin.",
    english: "The whole world may be won if one acts at the right time and in the right place.",
    topic: "Market Timing",
    category: "BEARISH",
    explanationTamil: "சரியான காலத்தையும் இடத்தையும் அறிந்து செயல்பட்டால், இந்த உலகம் முழுவதையும் கூட நம்மால் வெல்ல முடியும்.",
    explanationEnglish: "Global dominance or market mastery is possible if you accurately identify the right time and the optimal conditions to strike.",
  },

  // --- NEUTRAL / STEADY (Focus on Knowledge, Learning, and Emotional Balance) ---
  {
    number: 391,
    tamil: "கற்க கசடறக் கற்பவை கற்றபின்\nநிற்க அதற்குத் தக.",
    transliteration: "Karka kasadarak karpavai katrapin\nNirka adharkkuth thaga.",
    english: "Learn thoroughly what should be learned; and having learned, let your conduct be worthy of your learning.",
    topic: "True Learning",
    category: "NEUTRAL",
    explanationTamil: "கற்க வேண்டியவற்றைத் தடையின்றித் தெளிவாகக் கற்க வேண்டும்; கற்ற பிறகு அந்த அறிவின் படி நடக்க வேண்டும்.",
    explanationEnglish: "The ultimate goal of learning market fundamental and technical analysis is to actually apply that knowledge with discipline.",
  },
  {
    number: 421,
    tamil: "அறிவு அற்றம் காக்கும் கருவி செறுவார்க்கும்\nஉள்ளழிக்கல் ஆகா அரண்.",
    transliteration: "Arivu atram kaakkum karuvi cheruvaarkkum\nUllazhikkal aagaa aran.",
    english: "Wisdom is a weapon that wards off destruction; it is an inner fortress which enemies cannot destroy.",
    topic: "Wisdom as a Shield",
    category: "NEUTRAL",
    explanationTamil: "அறிவு என்பது அழிவு வராமல் காக்கும் கருவியாகும்; அது பகைவரால் அழிக்க முடியாத மிகச்சிறந்த அரணாகும்.",
    explanationEnglish: "Knowledge is your primary risk management tool; it protects you from ruin and provides a mental fortress that market volatility cannot shake.",
  },
  {
    number: 423,
    tamil: "எப்பொருள் யார்யார்வாய்க் கேட்பினும் அப்பொருள்\nமெய்ப்பொருள் காண்பது அறிவு.",
    transliteration: "Epporul yaaryaarvaik ketpinum apporul\nMeipporul kaanbadhu arivu.",
    english: "To discern the true essence of everything, from whomsoever it is heard, is wisdom.",
    topic: "Critical Thinking",
    category: "NEUTRAL",
    explanationTamil: "யார் எதைச் சொன்னாலும், அதை அப்படியே நம்பாமல் அதன் உண்மையான பொருளை ஆராய்ந்து அறிவதே அறிவாகும்.",
    explanationEnglish: "Do not follow the herd or media hype blindly. True wisdom is identifying the underlying data and reality behind every market rumor.",
  },
  {
    number: 396,
    tamil: "தொட்டனைத் தூறும் மணற்கேணி மாந்தர்க்குக்\nகற்றனைத் தூறும் அறிவு.",
    transliteration: "Thottanaith thoorum manarkeni maandharkkuk\nKatranaith thoorum arivu.",
    english: "Water flows from a well in the sand in proportion to the depth to which it is dug; so knowledge flows as one studies.",
    topic: "Continuous Growth",
    category: "NEUTRAL",
    explanationTamil: "மணற்கேணியில் தோண்டத் தோண்ட நீர் ஊறுவது போல, மனிதர்களுக்குக் கற்கக் கற்க அறிவு வளரும்.",
    explanationEnglish: "Your edge in the market is proportional to the depth of your research. The more you study, the more opportunities you will uncover.",
  },

  // --- GENERAL (Universal Wisdom and Foundation) ---
  {
    number: 1,
    tamil: "அகர முதல எழுத்தெல்லாம் ஆதி\nபகவன் முதற்றே உலகு.",
    transliteration: "Agara mudhala ezhuththellaam aadhibagavan\nMudhatre ulagu.",
    english: "As all letters have the letter 'A' as their first, so the world has the Eternal God as its first.",
    topic: "The Beginning",
    category: "GENERAL",
    explanationTamil: "எழுத்துக்கள் எல்லாம் 'அ' என்னும் எழுத்தைத் தொடக்கமாகக் கொண்டிருப்பதைப் போலவே, உலகம் இறைவனைத் தொடக்கமாகக் கொண்டுள்ளது.",
    explanationEnglish: "Just as every system has a fundamental starting point, all market outcomes are rooted in basic economic laws and human psychology.",
  },
  {
    number: 760,
    tamil: "கொடையளி செங்கோல் குடியோம்பல் நான்கும்\nஉடையானாம் வேந்தர்க்கு ஒளி.",
    transliteration: "Kodaiyali sengol kudiyombal naankum\nUdaiyaanam vendharkku oli.",
    english: "He is a light among kings who possesses these four things: gifts, grace, a scepter of justice, and care for his subjects.",
    topic: "Righteous Wealth",
    category: "GENERAL",
    explanationTamil: "ஈகை, கருணை, நீதி தவறாத ஆட்சி, மக்கள் நலம் பேணுதல் ஆகிய நான்கும் உடையவரே மிகச்சிறந்த தலைவராவர்.",
    explanationEnglish: "Success is meaningful only when it is built on four pillars: generosity, empathy, ethical conduct, and social responsibility.",
  },
  {
    number: 111,
    tamil: "தகுதி எனவொன்று நன்றே பகுதியால்\nபாற்பட்டு ஒழுகப் பெறின்.",
    transliteration: "Thaguthi enavondru nandre pahudhiyaal\nPaarpattu ozhukap perin.",
    english: "Justice is a virtue if it acts impartially towards all sectors (enemies, strangers, and friends).",
    topic: "Character",
    category: "GENERAL",
    explanationTamil: "பகைவர், அயலார், நண்பர் எனப் பிரிக்காமல் நடுநிலையோடு செயல்படுவதே ஒழுக்கமான வாழ்வாகும்.",
    explanationEnglish: "Objectivity is paramount. Whether you are bullish or bearish, seeing the market without bias or emotional attachment is the key to longevity.",
  }
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
