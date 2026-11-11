
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/* =====================================================================
   SETTINGS (speed) - SAME ENGINE
   ===================================================================== */
const MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
const PARALLEL_CALLS = 2;
const MAX_ROUNDS = 2;
const CALL_TIMEOUT_MS = 12000;
const MAX_OUTPUT_TOKENS = 300;
const HISTORY_SIZE = 60;

/* =====================================================================
   BUSINESS PACK - ARTH COFFEE HOUSE
   Naye business/category ke liye sirf yahi section badlega
   ===================================================================== */

const OWNER_NAME = process.env.OWNER_NAME || '';
const PRODUCT_WORD = 'food or drinks';

const SEO_KEYWORDS = [
  'best cafe in Clement Town',
  'best cafe in Dehradun',
  'coffee shop in Clement Town',
  'restaurant in Clement Town',
  'cafe near Graphic Era University',
  'best coffee in Dehradun',
  'Arth Coffee House Dehradun',
  'best restaurant in Dehradun',
  'cafes near Graphic Era University',
  'coffee near Clement Town',
  'best pizza in Clement Town',
  'pasta in Dehradun',
  'best cafe near Graphic Era',
  'family restaurant in Clement Town',
  'food places in Dehradun',
  'Korean food in Dehradun',
  'momos in Clement Town',
  'best ambience cafe in Dehradun',
  'coffee and conversations in Dehradun',
  'restaurant near Bharuwala Colony',
];

// Topics: id, prompt text, mandatory review keyword check
const TOPICS = {
  ambience: {
    id: 'ambience',
    text: 'the cafe ambience, interior, lighting, seating and overall atmosphere',
    must: /ambien|interior|decor|decoration|lighting|vibe|atmosphere|sitting|seating|environment|mahaul|jagah/i,
  },
  food: {
    id: 'food',
    text: 'the food quality, taste, freshness and overall food experience',
    must: /food|taste|tasty|delicious|fresh|khana|dish|meal|flavour|flavor|quality/i,
  },
  coffee: {
    id: 'coffee',
    text: 'the coffee taste, aroma and coffee experience',
    must: /coffee|cappuccino|latte|mocha|espresso|caffeine|brew/i,
  },
  beverages: {
    id: 'beverages',
    text: 'the drinks, shakes, mojitos and refreshing beverages',
    must: /drink|beverage|shake|mojito|refresh|juice|tea|cold coffee/i,
  },
  staff: {
    id: 'staff',
    text: 'the staff behaviour, politeness and hospitality',
    must: /staff|behav|polite|friendly|helpful|nature|hospitality|service|attitude|baat/i,
  },
  service: {
    id: 'service',
    text: 'the service experience, order handling and attention given to customers',
    must: /service|order|wait|waiting|served|quick|time|staff|attention|response/i,
  },
  cleanliness: {
    id: 'cleanliness',
    text: 'the cleanliness and hygiene of the cafe',
    must: /clean|hygiene|hygienic|neat|tidy|fresh|safai|saaf/i,
  },
  pricing: {
    id: 'pricing',
    text: 'the pricing, value for money and overall affordability',
    must: /price|pricing|rate|cost|money|budget|afford|value|worth|paise|daam|pocket/i,
  },
  pizza: {
    id: 'pizza',
    text: 'the pizza taste, toppings, base and preparation',
    must: /pizza|topping|cheese|crust|base|baked/i,
  },
  pasta: {
    id: 'pasta',
    text: 'the pasta taste, sauce and preparation',
    must: /pasta|alfredo|arrabbiata|sauce|italian/i,
  },
  chinese: {
    id: 'chinese',
    text: 'the Chinese food, momos, noodles and their taste',
    must: /momo|noodle|chinese|manchurian|dumpling/i,
  },
  korean: {
    id: 'korean',
    text: 'the Korean food and Korean ramen experience',
    must: /korean|ramen/i,
  },
  desserts: {
    id: 'desserts',
    text: 'the dessert taste, presentation and overall dessert experience',
    must: /dessert|sweet|cake|brownie|pastry|ice cream|biscoff/i,
  },
  family: {
    id: 'family',
    text: 'the family dining experience and comfortable environment',
    must: /family|parents|children|kids|comfortable|dining|family time/i,
  },
  events: {
    id: 'events',
    text: 'the birthday celebration, party or group dining experience',
    must: /birthday|party|celebration|event|group|friends|gathering/i,
  },
};

const CHIPS = {
  'Cafe Ambience': {
    id: 'chip_ambience',
    text: 'the cafe ambience, interior and comfortable seating',
    must: /ambien|interior|decor|lighting|vibe|atmosphere|seating|environment/i,
  },
  'Food Quality': {
    id: 'chip_food',
    text: 'the food quality, taste and freshness',
    must: /food|taste|tasty|delicious|fresh|khana|dish|meal|quality/i,
  },
  'Coffee': {
    id: 'chip_coffee',
    text: 'the coffee taste and coffee experience',
    must: /coffee|cappuccino|latte|mocha|espresso|brew/i,
  },
  'Drinks & Shakes': {
    id: 'chip_beverages',
    text: 'the drinks, shakes and refreshing beverages',
    must: /drink|beverage|shake|mojito|refresh|juice|tea/i,
  },
  'Pizza & Pasta': {
    id: 'chip_italian',
    text: 'the pizza and pasta taste and preparation',
    must: /pizza|pasta|italian|alfredo|arrabbiata/i,
  },
  'Momos & Noodles': {
    id: 'chip_chinese',
    text: 'the momos and noodles experience',
    must: /momo|noodle|chinese|dumpling/i,
  },
  'Staff Behaviour': {
    id: 'chip_staff',
    text: 'the polite and friendly staff behaviour',
    must: /staff|behav|polite|friendly|helpful|hospitality|nature/i,
  },
  'Quick Service': {
    id: 'chip_service',
    text: 'the service and order handling',
    must: /service|order|wait|served|quick|time/i,
  },
  'Cleanliness': {
    id: 'chip_clean',
    text: 'the cafe cleanliness and hygiene',
    must: /clean|hygiene|hygienic|neat|tidy|safai/i,
  },
  'Value For Money': {
    id: 'chip_price',
    text: 'the pricing and value for money',
    must: /price|pricing|rate|cost|money|budget|value|worth|paise|daam/i,
  },
  'Desserts': {
    id: 'chip_desserts',
    text: 'the dessert taste and experience',
    must: /dessert|sweet|cake|brownie|pastry|biscoff/i,
  },
  'Family Dining': {
    id: 'chip_family',
    text: 'the comfortable family dining experience',
    must: /family|parents|children|kids|comfortable|dining/i,
  },
};

const ALL_TOPICS = [
  'ambience',
  'food',
  'coffee',
  'beverages',
  'staff',
  'service',
  'cleanliness',
  'pricing',
  'pizza',
  'pasta',
  'chinese',
  'korean',
  'desserts',
  'family',
  'events',
];

/* =====================================================================
   ENGINE - SAME FOR ALL BUSINESS CATEGORIES
   ===================================================================== */

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const chance = (p) => Math.random() < p;
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

function pickWeighted(items) {
  const total = items.reduce((s, i) => s + i.w, 0);
  let r = Math.random() * total;

  for (const i of items) {
    if ((r -= i.w) <= 0) return i;
  }

  return items[0];
}

// ~8 words = 1 line on phone
const LENGTHS = [
  { w: 12, lines: 1, min: 7, max: 11, rule: 'ONE short line, 7 to 10 words' },
  { w: 16, lines: 2, min: 13, max: 21, rule: 'TWO lines, 14 to 20 words' },
  { w: 30, lines: 3, min: 21, max: 31, rule: 'THREE lines, 22 to 30 words' },
  { w: 28, lines: 4, min: 30, max: 42, rule: 'FOUR lines, 32 to 40 words' },
  { w: 14, lines: 5, min: 40, max: 52, rule: 'FIVE lines, 42 to 50 words' },
];

function chooseLength(recent, minLines = 1) {
  const lens = recent.map((r) => r.lines).filter(Boolean);
  const l1 = lens[lens.length - 1];
  const l2 = lens[lens.length - 2];
  const l3 = lens[lens.length - 3];

  let pool = LENGTHS.filter((x) => x.lines >= minLines);
  const mid = (n) => n === 3 || n === 4;

  if (lens.length >= 3 && mid(l1) && mid(l2) && mid(l3)) {
    const f = pool.filter((x) => !mid(x.lines));
    if (f.length) pool = f;
  } else if (l1 && !mid(l1)) {
    const f = pool.filter((x) => mid(x.lines));
    if (f.length) pool = f;
  }

  if (l1 && l1 === l2) {
    const f = pool.filter((x) => x.lines !== l1);
    if (f.length) pool = f;
  }

  return pickWeighted(pool);
}

// 13 different customer personas
const PERSONAS = [
  { id: 'desi', text: 'a simple local person, speaks plain and casual, short sentences, no fancy words, a little loose grammar is fine' },
  { id: 'family', text: 'a middle class family person, practical, talks naturally about family dining when relevant' },
  { id: 'professional', text: 'an educated working professional, polished and clear, well-structured sentences, calm tone' },
  { id: 'young', text: 'a college-age youngster, casual and slangy, quick typing style, energetic' },
  { id: 'uncle', text: 'an older respectful person, polite, simple words, natural and warm tone' },
  { id: 'blunt', text: 'a straightforward no-nonsense person, few words, says only what mattered' },
  { id: 'budget', text: 'a budget-conscious customer, simple words, cares about value for money' },
  { id: 'business', text: 'a working professional who values good food and not wasting time' },
  { id: 'officer', text: 'a well-spoken senior person, formal and precise, values quality and service' },
  { id: 'mother', text: 'a mother choosing a place for family time, careful and warm in tone' },
  { id: 'firsttimer', text: 'someone visiting this cafe for the first time, natural and slightly curious' },
  { id: 'friend', text: 'someone visiting with friends, casual and conversational' },
  { id: 'foodie', text: 'a food-aware person who notices taste, preparation and presentation' },
];

const WRITING_STYLES = [
  'neat spelling and proper grammar',
  'casual WhatsApp-style typing, relaxed',
  'all small letters, casual typing, no capital letters',
  'simple and slightly rough, one tiny spelling slip is fine',
];

const HINGLISH_LEVELS = [
  'mostly Hindi words, only a few English words like food, coffee, price',
  'half Hindi, half English words',
  'Hindi grammar but many common English words mixed in',
];

const OPENERS = [
  'start with the food or drink',
  'start with the cafe or its location',
  'start with the ambience',
  'start with how you feel after the visit',
  'start with why you came here',
  'start in the middle of a thought, casually',
  'start with what you ordered',
  'start with the exact dish or drink you tried, only if supplied',
  'start with your plain verdict in your own words',
  'start with the overall experience',
  'start with the price or value, only if supplied',
  'start with a simple statement about the visit',
];

const ENDINGS = [
  'end with a small thanks',
  'end by saying you would tell friends or family',
  'end by saying you may visit again',
  'end with a short plain remark',
  'end with one line about the experience',
  'just stop naturally after your last point, no wrap-up line',
];

const BUYER_LINES = [
  'You visited the cafe.',
  'You visited the cafe with friends.',
  'You visited the cafe with family.',
  'You visited the cafe for food or drinks.',
  'You stopped by the cafe.',
];

const EXAMPLES = {
  ENGLISH: [
    'The place has a comfortable feel and the food was worth trying',
    'Had a relaxed time here, liked the atmosphere and the overall experience',
    'A nice place to spend some time, the service was good during my visit',
    'Visited with friends, enjoyed the time and liked the food',
  ],
  HINGLISH: [
    'ambience kaafi achha laga, aaram se baith kar time spend kiya',
    'food ka taste sahi tha, overall experience bhi achha raha',
    'friends ke saath aaye the, jagah ka vibe kaafi accha laga',
    'coffee achhi thi aur staff ka behaviour bhi polite tha',
  ],
};

/* =====================================================================
   DUPLICATION AND CONTENT RESTRICTIONS
   ===================================================================== */

const BANNED_OPENINGS = [
  'Great', 'Best', 'Amazing', 'Excellent', 'Highly recommend',
  'Bhai', 'Superb', 'Awesome', 'The staff here',
  'Outstanding', 'Fantastic', 'Wonderful', 'Perfect',
  'Must visit', 'Trust me',
];

const AI_PHRASES =
  /seamless|hassle[- ]free|top[- ]notch|look no further|go-to|game[- ]changer|one[- ]stop|unparalleled|exceptional|impeccable|commendable|must[- ]visit|highly recommended|hands down|truly|delighted|kudos|—|–/i;

const DANGLING = new Set([
  'to', 'aur', 'ki', 'ke', 'ka', 'se', 'me', 'mein', 'par', 'pe',
  'ko', 'toh', 'and', 'but', 'the', 'a', 'an', 'of', 'in', 'on',
  'for', 'with', 'at', 'that', 'so', 'if', 'or', 'because', 'jo',
  'jab', 'agar', 'lekin', 'ya', 'jaise', 'kyunki',
]);

const HINDI_WORDS = new Set([
  'hai', 'hain', 'nahi', 'nahin', 'bahut', 'bohot', 'bhot',
  'mera', 'meri', 'mere', 'mujhe', 'hume', 'aur', 'ki', 'ke',
  'ka', 'ko', 'se', 'par', 'pe', 'tha', 'thi', 'kiya', 'mila',
  'mil', 'gaya', 'gayi', 'liya', 'wala', 'wale', 'jo', 'kaafi',
  'accha', 'acha', 'achha', 'sach', 'yahan', 'yaha', 'kar',
  'karke', 'raha', 'rahe', 'rahi', 'laga', 'lagi', 'bilkul',
  'ekdum', 'sab', 'kuch', 'koi', 'phir', 'fir', 'bhi', 'toh',
  'lekin', 'isliye', 'abhi', 'dekh', 'dekha', 'diya', 'dikhaya',
  'samjhaya', 'sahi', 'dukaan', 'dukan', 'aap', 'aapne',
  'paise', 'kam', 'jyada', 'zyada', 'badhiya', 'mast', 'yaar',
  'mein', 'yeh', 'ye', 'woh', 'wo', 'ne', 'hu', 'hun', 'tak',
  'wahan', 'sabse', 'khana', 'khaya', 'piya', 'mahaul',
  'jagah', 'achhi', 'achha', 'pasand', 'khub', 'bohot',
]);

/* =====================================================================
   SERVER MEMORY - BEST EFFORT
   ===================================================================== */

const HISTORY = [];
const HITS = new Map();

const openingOf = (text) =>
  text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .join(' ');

const wordSet = (t) =>
  new Set(
    t.toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2)
  );

function tooSimilar(text, recentOpenings) {
  const open = openingOf(text);

  if (recentOpenings.includes(open)) return true;

  const ws = wordSet(text);

  for (const h of HISTORY) {
    if (h.open === open) return true;

    let inter = 0;
    for (const w of ws) {
      if (h.ws.has(w)) inter++;
    }

    const union = ws.size + h.ws.size - inter || 1;

    if (inter / union > 0.45) return true;
  }

  return false;
}

function remember(text) {
  HISTORY.push({
    open: openingOf(text),
    ws: wordSet(text),
  });

  while (HISTORY.length > HISTORY_SIZE) {
    HISTORY.shift();
  }
}

function rateLimited(request) {
  const ip = (
    request.headers.get('x-forwarded-for') || 'unknown'
  ).split(',')[0].trim();

  const now = Date.now();

  const arr = (HITS.get(ip) || []).filter(
    (t) => now - t < 5 * 60 * 1000
  );

  arr.push(now);
  HITS.set(ip, arr);

  if (HITS.size > 2000) {
    for (const [k, v] of HITS) {
      if (!v.some((t) => now - t < 5 * 60 * 1000)) {
        HITS.delete(k);
      }
    }
  }

  return arr.length > 25;
}

/* =====================================================================
   CLEANING AND VALIDATION
   ===================================================================== */

function cleanReview(text) {
  return text
    .replace(/^["'`\s]+|["'`\s]+$/g, '')
    .replace(/\s*\n+\s*/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .replace(/\.{2,}/g, ' ')
    .replace(/\.\s+/g, ', ')
    .replace(/\.+$/g, '')
    .replace(/,\s*,/g, ',')
    .trim();
}

function fixCutOff(text) {
  let parts = text.trim()
    .replace(/[,\-\s]+$/g, '')
    .split(/\s+/);

  while (parts.length > 6) {
    const last = parts[parts.length - 1]
      .toLowerCase()
      .replace(/[^a-z]/g, '');

    if (!DANGLING.has(last)) break;

    parts.pop();

    parts = parts.join(' ')
      .replace(/[,\-\s]+$/g, '')
      .split(/\s+/);
  }

  return parts.join(' ');
}

function looksCutOff(text) {
  const last = text.split(/\s+/).pop()
    .toLowerCase()
    .replace(/[^a-z]/g, '');

  return DANGLING.has(last) || /[,\-]$/.test(text.trim());
}

function hindiCount(text) {
  return text.toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => HINDI_WORDS.has(w))
    .length;
}

function languageOk(text, language, words) {
  const h = hindiCount(text);

  if (language === 'HINGLISH') {
    return h >= Math.max(3, Math.floor(words * 0.2));
  }

  return h <= 2;
}

function startsBanned(text) {
  const t = text.trim().toLowerCase();

  return BANNED_OPENINGS.some(
    (b) => t.startsWith(b.toLowerCase())
  );
}

/* =====================================================================
   RANDOM SELECTION
   ===================================================================== */

function choosePersona(recent) {
  const last = recent.map((r) => r.voice)
    .filter(Boolean)
    .slice(-4);

  const pool = PERSONAS.filter(
    (v) => !last.includes(v.id)
  );

  return pick(pool.length ? pool : PERSONAS);
}

function chooseTopic(recent) {
  const last = recent.map((r) => r.topic)
    .filter(Boolean)
    .slice(-2);

  const pool = ALL_TOPICS.filter(
    (t) => !last.includes(t)
  );

  return TOPICS[pick(pool.length ? pool : ALL_TOPICS)];
}

function chosenChips(body) {
  const labels = Array.isArray(body.selectedChips)
    ? body.selectedChips
    : [];

  return labels
    .filter((l) => typeof l === 'string' && CHIPS[l])
    .slice(0, 3)
    .map((l) => ({ label: l, ...CHIPS[l] }));
}

function chooseFrom(list, key, recent, n = 3) {
  const last = recent.map((r) => r[key])
    .filter((v) => v !== undefined && v !== null)
    .slice(-n);

  const pool = list.filter((x) => !last.includes(x));

  return pick(pool.length ? pool : list);
}

/* =====================================================================
   GEMINI PROMPT BUILDER
   ===================================================================== */

function buildPrompt(body, recent) {
  const language =
    body.language === 'HINGLISH' ? 'HINGLISH' : 'ENGLISH';

  const businessName = String(
    body.businessName || 'Arth Coffee House & Restaurant'
  ).slice(0, 120);

  const category = String(
    body.category || 'Cafe, Coffee House, American and Asian Fusion Restaurant'
  ).slice(0, 200);

  const description = String(body.description || '').slice(0, 600);
  const city = String(body.city || 'Dehradun').slice(0, 120);

  // Customer ke actual experience ko hi use karna hai
  const customerExperience = String(
    body.customerExperience || ''
  ).slice(0, 1200);

  const chips = chosenChips(body);

  const minLines =
    chips.length >= 3 ? 4 :
    chips.length === 2 ? 3 : 1;

  const length = chooseLength(recent, minLines);
  const persona = choosePersona(recent);

  const topic = chips.length
    ? {
        id: chips[0].id,
        text: chips[0].text,
        must: chips[0].must,
      }
    : chooseTopic(recent);

  const extraChips = chips.slice(1);

  const opener = chooseFrom(
    OPENERS, 'opener', recent, 3
  );

  const ending = chooseFrom(
    ENDINGS, 'ending', recent, 2
  );

  const style = pick(WRITING_STYLES);
  const hinglishLevel = pick(HINGLISH_LEVELS);

  const buyerLine = chance(0.5)
    ? pick(BUYER_LINES) + ' '
    : '';

  const longEnough = length.lines >= 3;

  const mentionName = chance(0.4);
  const mentionStaff = topic.id === 'chip_staff'
    ? chance(0.5)
    : chance(0.15);

  const useEmoji = chance(0.08);

  const recentSeo = recent.map((r) => r.seo)
    .filter(Boolean)
    .slice(-8);

  const seoPool = SEO_KEYWORDS.filter(
    (k) => !recentSeo.includes(k)
  );

  const seo = chance(0.3)
    ? pick(seoPool.length ? seoPool : SEO_KEYWORDS)
    : null;

  const languageBlock =
    language === 'HINGLISH'
      ? `LANGUAGE (MOST IMPORTANT): Write in HINGLISH = Hindi sentences typed in English/Roman letters, like a local Dehradun customer on WhatsApp. Level: ${hinglishLevel}. Grammar must be Hindi (hai, tha, kiya, mila, nahi, bahut, aur, ke liye etc.). Product names and common food words can stay in English. Never write a full English sentence. Never use Devanagari.`
      : `LANGUAGE (MOST IMPORTANT): Write in simple natural English like an Indian customer. Do not use Hindi words.`;

  const examples = shuffle(EXAMPLES[language])
    .slice(0, 3)
    .map((e) => `- ${e}`)
    .join('\n');

  const prompt = `${languageBlock}

You are ${persona.text}. ${buyerLine}
You visited this cafe and are writing a Google Maps review.

BUSINESS:
${businessName}
Location: ${city}
Category: ${category}
About: ${description}

CUSTOMER'S ACTUAL EXPERIENCE:
${customerExperience || 'No additional customer experience was supplied. Do not invent specific food, drink, service or staff experiences.'}

Tone samples from other customers (only for feel, never copy words or structure):
${examples}

THIS REVIEW:
- Main topic: ${topic.text}. The review must clearly be about this.
${extraChips.length
  ? `- ALSO naturally cover these points: ${extraChips.map((c) => c.text).join('; ')}. Only if supported by the customer's actual experience.`
  : '- Stick to the main topic only.'}
- Writing style: ${style}.
- Opening: ${opener}.
${longEnough ? `- Ending: ${ending}.` : ''}
- Length: ${length.rule}. Stay inside this range.
${mentionName ? `- Mention the business name "${businessName}" once, naturally.` : '- Do not repeat the full business name.'}
${seo ? `- If it fits naturally and is truthful, include the phrase "${seo}".` : ''}
${mentionStaff && OWNER_NAME ? `- Mention "${OWNER_NAME}" only if the customer experience supports it.` : '- Do not invent or name any person.'}
${useEmoji ? '- One emoji at the very end is allowed.' : '- No emojis.'}

HARD RULES:
- Write only from the customer's actual experience and supplied information.
- Never claim the customer ordered, ate or drank a specific item unless supplied.
- Never invent taste, food quality, coffee quality, staff behaviour, cleanliness, waiting time or service.
- Never invent prices, discounts, offers, events, reservations or promises.
- Business description is background information, NOT proof of the customer's personal experience.
- Do not turn business marketing claims into personal customer experiences.
- Do not invent a visit with family, friends or children.
- Do not force SEO keywords.
- ONE single paragraph. No line breaks, bullets or title.
- Do NOT use a full stop (.) anywhere. Use commas, "aur"/"and", or just flow.
- Never start with: ${BANNED_OPENINGS.join(', ')}.
- Sound like a real customer, not an advertisement.
- No hashtags, slogans, keyword stuffing or dashes.
- Avoid polished marketing words (seamless, hassle-free, top-notch, exceptional).
- Do not use the word "wholesale".
- End with a COMPLETE thought. Never stop mid-sentence.
- Output only the review text.`.replace(/\n{3,}/g, '\n\n')
    .replace(/\n\n(- )/g, '\n$1');

  return {
    prompt,
    length,
    persona,
    topic,
    extraChips,
    opener,
    ending,
    seo,
    language,
  };
}

/* =====================================================================
   GEMINI API
   ===================================================================== */

async function callGemini(apiKey, payload, signal) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal,
    }
  );

  const data = await res.json();

  return { res, data };
}

/* =====================================================================
   ONE GENERATION ATTEMPT + VALIDATION
   ===================================================================== */

async function attempt(apiKey, body, recent, signal) {
  const built = buildPrompt(body, recent);

  const {
    prompt,
    length,
    persona,
    topic,
    extraChips,
    opener,
    ending,
    seo,
    language,
  } = built;

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `Write the Google review draft for ${body.businessName || 'Arth Coffee House'} now.`,
          },
        ],
      },
    ],
    systemInstruction: {
      parts: [{ text: prompt }],
    },
    generationConfig: {
      temperature: 1.0,
      topP: 0.95,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      thinkingConfig: {
        thinkingBudget: 0,
      },
    },
  };

  try {
    let { res, data } = await callGemini(
      apiKey,
      payload,
      signal
    );

    if (
      !res.ok &&
      /thinking/i.test(data?.error?.message || '')
    ) {
      delete payload.generationConfig.thinkingConfig;

      ({ res, data } = await callGemini(
        apiKey,
        payload,
        signal
      ));
    }

    if (!res.ok) {
      return {
        ok: false,
        error: data?.error?.message || 'Gemini API request failed.',
      };
    }

    const candidate = data.candidates?.[0];
    const parts = candidate?.content?.parts || [];

    const raw = parts
      .filter((p) => !p.thought)
      .map((p) => p.text || '')
      .join('');

    const review = fixCutOff(cleanReview(raw));

    const words = review
      .split(/\s+/)
      .filter(Boolean).length;

    if (!review) {
      return { ok: false, error: 'Empty response from Gemini.' };
    }

    if (candidate?.finishReason === 'MAX_TOKENS') {
      return { ok: false, error: 'Response was cut off.' };
    }

    if (looksCutOff(review)) {
      return { ok: false, error: 'Review ended mid-sentence.' };
    }

    if (words > length.max + 8) {
      return { ok: false, error: 'Review too long.' };
    }

    if (words < Math.floor(length.min * 0.75)) {
      return { ok: false, error: 'Review too short.' };
    }

    if (/[ऀ-ॿ]/.test(review)) {
      return { ok: false, error: 'Devanagari used.' };
    }

    if (/wholesale/i.test(review)) {
      return { ok: false, error: 'Banned word used.' };
    }

    if (AI_PHRASES.test(review)) {
      return { ok: false, error: 'Robotic phrase used.' };
    }

    if (startsBanned(review)) {
      return { ok: false, error: 'Banned opening used.' };
    }

    if (!languageOk(review, language, words)) {
      return { ok: false, error: 'Wrong language style.' };
    }

    if (!topic.must.test(review)) {
      return { ok: false, error: 'Review missed the selected topic.' };
    }

    if (
      extraChips.some((c) => !c.must.test(review))
    ) {
      return { ok: false, error: 'Review missed a selected keyword.' };
    }

    const recentOpenings = recent
      .map((r) => r.open)
      .filter(Boolean);

    if (tooSimilar(review, recentOpenings)) {
      return { ok: false, error: 'Too similar to an earlier review.' };
    }

    return {
      ok: true,
      review,
      meta: {
        lines: length.lines,
        voice: persona.id,
        topic: topic.id,
        opener,
        ending,
        seo: seo || null,
        open: openingOf(review),
      },
    };

  } catch (e) {
    return {
      ok: false,
      error: e?.name === 'AbortError'
        ? 'aborted'
        : e?.message || 'Request failed.',
      aborted: e?.name === 'AbortError',
    };
  }
}

/* =====================================================================
   FIRST VALID RESULT
   ===================================================================== */

function firstValid(tasks) {
  return new Promise((resolve) => {
    let pending = tasks.length;
    let firstError = null;
    let settled = false;

    for (const t of tasks) {
      t.then((r) => {
        if (settled) return;

        if (r.ok) {
          settled = true;
          resolve(r);
          return;
        }

        if (!r.aborted && !firstError) {
          firstError = r.error;
        }

        pending--;

        if (pending === 0 && !settled) {
          settled = true;

          resolve({
            ok: false,
            error: firstError || 'Failed to generate review draft.',
          });
        }
      }).catch((e) => {
        if (settled) return;

        if (!firstError) {
          firstError = e?.message || 'Request failed.';
        }

        pending--;

        if (pending === 0 && !settled) {
          settled = true;
          resolve({
            ok: false,
            error: firstError,
          });
        }
      });
    }
  });
}

/* =====================================================================
   POST API
   ===================================================================== */

export async function POST(request) {
  try {
    const body = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API Key not configured.' },
        { status: 500 }
      );
    }

    if (rateLimited(request)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a minute.' },
        { status: 429 }
      );
    }

    const recent = (
      Array.isArray(body.recentLengths)
        ? body.recentLengths
        : []
    )
      .filter((r) => r && typeof r === 'object')
      .slice(-6);

    let lastError = 'Failed to generate review draft.';

    for (let round = 0; round < MAX_ROUNDS; round++) {
      const controller = new AbortController();

      const timer = setTimeout(
        () => controller.abort(),
        CALL_TIMEOUT_MS
      );

      const winner = await firstValid(
        Array.from(
          { length: PARALLEL_CALLS },
          () => attempt(
            apiKey,
            body,
            recent,
            controller.signal
          )
        )
      );

      clearTimeout(timer);

      // Stop the remaining parallel request
      controller.abort();

      if (winner.ok) {
        remember(winner.review);

        return NextResponse.json({
          review: winner.review,
          meta: winner.meta,
        });
      }

      lastError = winner.error;
    }

    throw new Error(lastError);

  } catch (error) {
    console.error(
      'API Review Generation Error:',
      error
    );

    return NextResponse.json(
      {
        error:
          error.message ||
          'Failed to generate review draft.',
      },
      { status: 500 }
    );
  }
}
