import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/* =====================================================================
   SETTINGS (speed)
   ===================================================================== */
const MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
const PARALLEL_CALLS = 2;      // ek saath 2 calls, jo pehle sahi aaye wahi use hoga
const MAX_ROUNDS = 2;          // sab fail hone par sirf ek aur round
const CALL_TIMEOUT_MS = 12000; // Gemini 12 sec me na de to cancel
const MAX_OUTPUT_TOKENS = 300;
const HISTORY_SIZE = 60;       // server par yaad rakhe gaye pichhle reviews

/* =====================================================================
   BUSINESS PACK  (naye business/category ke liye sirf yahi hissa badlega)
   Client: Arth Coffee House & Restaurant, Clement Town, Dehradun
   ===================================================================== */
// Owner ka asli naam Vercel me OWNER_NAME env se daal dena. Tab tak "Arth team" use hoga.
const OWNER_NAME = process.env.OWNER_NAME || 'Arth team';
const SHOP_WORD = 'cafe';
const PRODUCT_WORD = 'food and coffee';

// Menu groups (iPhone ke MODEL_SERIES jaisa hi kaam):
// n = us group ka regex (review me in me se koi shabd hona chahiye), w = group ka weight,
// variants = us group ke dishes/drinks (naam, weight). Menu website se liya gaya hai.
// NOTE: key ka naam MODEL_SERIES / model rakha hai taaki frontend aur engine na badle.
const MODEL_SERIES = [
  { n: 'coffee|latte|mocha', w: 10, variants: [['Artisan Latte', 3], ['House Mocha', 3]] },
  { n: 'pizza',              w: 8,  variants: [['Wood-fired Pizza', 3]] },
  { n: 'momo',               w: 8,  variants: [['Steamed Momos', 3]] },
  { n: 'pasta|alfredo|arrabiata', w: 7, variants: [['Creamy Alfredo Pasta', 3], ['Arrabiata Pasta', 3]] },
  { n: 'burger',             w: 6,  variants: [['Classic Burger', 3]] },
  { n: 'shake|biscoff',      w: 6,  variants: [['Biscoff Shake', 3]] },
  { n: 'ramen|korean',       w: 5,  variants: [['Korean Ramen', 3]] },
  { n: 'mojito|mint',        w: 5,  variants: [['Mint Mojito', 3]] },
  { n: 'platter|creamy',     w: 3,  variants: [['Creamy Signature Platter', 3]] },
];


const SEO_KEYWORDS = [
  'cafe in Clement Town',
  'best cafe in Dehradun',
  'coffee house in Dehradun',
  'cafe near Graphic Era',
  'cafe in Clement Town Dehradun',
  'best coffee in Clement Town',
  'aesthetic cafe in Dehradun',
  'restaurant in Clement Town',
  'Korean ramen in Dehradun',
  'wood-fired pizza in Dehradun',
  'momos in Clement Town',
  'Biscoff shake in Dehradun',
  'cafe near Tulsi Tower Clement Town',
  'birthday party cafe in Dehradun',
  'cafe for friends in Dehradun',
  'best cafe near Graphic Era',
  'coffee and restaurant in Clement Town',
  'pasta in Dehradun',
  'budget friendly cafe in Dehradun',
  'cozy cafe in Dehradun',
];

// Topics: id, prompt text, aur check regex (review me in me se koi shabd hona chahiye)
const TOPICS = {
  location: {
    id: 'location',
    text: 'the location: easy to find in Clement Town, Dehradun at Tulsi Tower, Bharuwala Colony, convenient to reach and a nice spot to hang out',
    must: /clement|tulsi|bharuwala|dehradun|graphic era|location|jagah|rasta|nazdik|paas|easy to find|aasani|area/i,
  },
  ambience: {
    id: 'ambience',
    text: 'the ambience: cozy and aesthetic place with warm lighting, lovely decor and a calm vibe, nice to sit and relax',
    must: /ambience|ambiance|vibe|cozy|aesthetic|decor|interior|lighting|atmosphere|mahaul|sukoon|beautiful|peaceful|calm|lights/i,
  },
  coffee: {
    id: 'coffee',
    text: 'the coffee: freshly brewed, rich aroma and taste, well made latte or mocha',
    must: /coffee|latte|mocha|brew|aroma|cappuccino|espresso|cup|chai/i,
  },
  food: {
    id: 'food',
    text: 'the food: fresh, tasty and well cooked, good portion, came hot to the table',
    must: /food|taste|tasty|delicious|swad|fresh|portion|hot|khana|dish|flavour|flavor|yummy|mazedaar/i,
  },
  politeness: {
    id: 'politeness',
    text: 'the behaviour of the staff: polite, friendly, patient, explained the menu properly, no pressure',
    must: /staff|behav|polite|patient|friendly|samjhaya|baat|nature|service|respect|attend|team|humble|helpful/i,
  },
  pricing: {
    id: 'pricing',
    text: 'the price: reasonable for the quality and portion, worth the money, no hidden charges',
    must: /price|rate|daam|paise|budget|pocket|value|worth|reasonable|bill|sasta|saste|kimat|charges/i,
  },
  hygiene: {
    id: 'hygiene',
    text: 'cleanliness: clean tables, neat and tidy place, felt hygienic to eat here',
    must: /clean|hygien|neat|safai|saaf|tidy|washroom/i,
  },
  service: {
    id: 'service',
    text: 'the service: order came on time, staff was attentive, no long waiting',
    must: /service|quick|fast|time|wait|serve|jaldi|tez|attentive|prompt|order|late/i,
  },
  models: {
    id: 'models',
    text: 'the dishes and drinks from the menu (pizza, momos, pasta, burger, ramen, shakes, coffee) and how good the one he tried was',
    must: /pizza|momo|ramen|burger|shake|pasta|latte|mocha|mojito|platter|menu|dish|alfredo|arrabiata|biscoff/i,
  },
  hangout: {
    id: 'hangout',
    text: 'a great place to hang out with friends or family, comfortable seating, good for long conversations',
    must: /friends|family|hangout|hang out|chat|conversation|baat|dost|yaar|ghar|sit|seating|time spend|gup|parivar/i,
  },
  offers: {
    id: 'offers',
    text: 'the offers: nice deals like happy hours or a student discount, good value for the visit (do not mention exact numbers)',
    must: /offer|deal|discount|happy hour|student|value|saving|bachat|scheme/i,
  },
  party: {
    id: 'party',
    text: 'celebration: a small party or birthday celebrated here, good arrangement, the unlimited food option was a good deal (no exact price)',
    must: /party|birthday|celebrat|event|group|unlimited|occasion|function|arrangement/i,
  },
  ordering: {
    id: 'ordering',
    text: 'ordering: easy to order on WhatsApp or online, smooth pickup or delivery',
    must: /whatsapp|online|order|delivery|pickup|takeaway|parcel|app/i,
  },
  desserts: {
    id: 'desserts',
    text: 'desserts and shakes: a fresh dessert or thick Biscoff shake, a perfect sweet ending to the meal',
    must: /dessert|shake|biscoff|sweet|pastry|meetha|brownie|thick/i,
  },
  photos: {
    id: 'photos',
    text: 'the aesthetic look: lovely corners, great for photos and reels, very Instagram worthy',
    must: /photo|insta|reel|aesthetic|pic|click|picture|selfie|corner/i,
  },
};

// Chips = keywords. Customer jo chip dabaye, review me wahi baat aani chahiye.
// text = Gemini ko kya batana hai, must = review me kaun se shabd hone chahiye (check)
// NOTE: landing page ke frontend me chips ke labels bilkul yahi hone chahiye.
const CHIPS = {
  'Cozy Ambience': { id: 'chip_ambience', text: 'the ambience is cozy and aesthetic, warm lighting and a calm vibe', must: /ambience|ambiance|vibe|cozy|aesthetic|decor|interior|lighting|atmosphere|mahaul|sukoon|beautiful|peaceful|calm|lights/i },
  'Great Coffee': { id: 'chip_coffee', text: 'the coffee was freshly brewed with rich aroma and taste', must: /coffee|latte|mocha|brew|aroma|cappuccino|espresso|cup/i },
  'Tasty Food': { id: 'chip_food', text: 'the food was fresh, tasty and came hot', must: /food|taste|tasty|delicious|swad|fresh|hot|khana|dish|flavour|flavor|yummy|mazedaar/i },
  'Signature Dishes': { id: 'chip_models', text: 'he tried a dish from the menu', must: /pizza|momo|ramen|burger|shake|pasta|latte|mocha|mojito|platter|menu|dish/i }, // text/must buildPrompt me set hota hai
  'Value for Money': { id: 'chip_price', text: 'the prices are reasonable and the food was worth the money, no hidden charges', must: /price|rate|daam|paise|budget|pocket|value|worth|reasonable|bill|sasta|saste|kimat/i },
  'Friendly Staff': { id: 'chip_staff', text: 'the staff was polite and friendly, explained the menu and did not pressure', must: /staff|behav|polite|patient|friendly|samjhaya|nature|respect|attend|team|humble|helpful/i },
  'Clean & Hygienic': { id: 'chip_hygiene', text: 'the place and tables were clean, neat and hygienic', must: /clean|hygien|neat|safai|saaf|tidy/i },
  'Quick Service': { id: 'chip_service', text: 'the service was quick, order came on time with no long waiting', must: /service|quick|fast|time|wait|serve|jaldi|tez|attentive|prompt|order/i },
  'Party & Events': { id: 'chip_party', text: 'a small party or celebration was done here with good arrangement, the unlimited food option was a good deal', must: /party|birthday|celebrat|event|group|unlimited|occasion|function|arrangement/i },
  'Clement Town': { id: 'chip_location', text: 'the cafe is easy to find in Clement Town, Dehradun, a nice spot to hang out', must: /clement|tulsi|bharuwala|dehradun|graphic era|location|jagah|rasta|nazdik|paas|easy to find|aasani/i },
};

const ALL_TOPICS = ['location', 'ambience', 'coffee', 'food', 'politeness', 'pricing', 'hygiene', 'service', 'models', 'hangout', 'offers', 'party', 'ordering', 'desserts', 'photos'];

// Likhne wale 13 type ke customers (class, umar, andaaz)
const PERSONAS = [
  { id: 'local', text: 'a simple local Dehradun person, speaks plain and easy, short sentences, no fancy words, a little loose grammar is fine' },
  { id: 'student', text: 'a college student from nearby, casual and slangy, quick typing style, energetic, cares about budget' },
  { id: 'friends', text: 'someone who came with a group of friends, fun and casual, talks about the hangout and the time they had' },
  { id: 'couple', text: 'a young person who came with their partner, soft and warm tone, cares about a calm vibe and good food' },
  { id: 'family', text: 'a middle class family person out for a meal with the family, practical, careful with money, honest and simple' },
  { id: 'professional', text: 'an educated working professional, polished and clear, well-structured sentences, calm and respectful tone' },
  { id: 'uncle', text: 'an older respectful person (uncle ji or aunty ji), polite, simple words, thanks and blesses the team' },
  { id: 'blunt', text: 'a straightforward no-nonsense person, few words, says only what mattered to him' },
  { id: 'foodie', text: 'a food lover who notices taste and presentation, describes the dish well in a simple way' },
  { id: 'coffeelover', text: 'a coffee lover who notices the brewing, aroma and balance, calm and clear' },
  { id: 'mother', text: 'a mother or housewife who came with kids or family, careful about cleanliness, warm tone' },
  { id: 'firsttimer', text: 'someone visiting for the first time after seeing it on Google Maps or Instagram, curious and a little excited' },
  { id: 'celebrator', text: 'someone who celebrated a birthday or a small occasion here, happy and thankful' },
];

const WRITING_STYLES = [
  'neat spelling and proper grammar',
  'casual WhatsApp-style typing, relaxed',
  'all small letters, casual typing, no capital letters',
  'simple and slightly rough, one tiny spelling slip is fine',
];

const HINGLISH_LEVELS = [
  'mostly Hindi words, only a few English words like cafe, coffee, food, ambience',
  'half Hindi, half English words',
  'Hindi grammar but many common English words mixed in',
];

const OPENERS = [
  'start with the dish or drink you had',
  'start with the cafe or the area',
  'start with the staff or the service',
  'start with how you feel now',
  'start with why you came here',
  'start in the middle of a thought, casually',
  'start with what you were expecting before coming',
  'start with the exact item you ordered',
  'start by saying how you found this cafe (maps, instagram, friend or passing by)',
  'start with your plain verdict in your own words',
  'start with who you came with',
  'start with a simple statement about the whole experience',
];

const ENDINGS = [
  'end with a small thanks or blessing',
  'end by saying you would tell friends and family',
  'end by saying you will come here again',
  'end with a short plain remark about the meal',
  'end with one line about how you feel about the place',
  'just stop naturally after your last point, no wrap-up line',
];

// (engine me isi naam se use hota hai, isliye naam BUYER_LINES hi rakha)
const BUYER_LINES = [
  'You came with your friends.',
  'You came with your family.',
  'You came with your partner.',
  'You came alone for some quiet time.',
  'You came for a small celebration.',
];

// Sirf tone samjhane ke liye (copy nahi karna). Koi full stop nahi.
const EXAMPLES = {
  ENGLISH: [
    'Came with friends for a quick coffee and ended up staying for two hours, the corner seats and warm lights made it really easy to relax',
    'Ordered the pasta and a shake, both came hot and fresh, staff was patient and kept checking on us without hovering',
    'Found this place on maps and it turned out better than I expected, clean tables, quiet vibe and good coffee',
    'We celebrated my sisters birthday here, the team arranged everything nicely and the food was finished in no time',
  ],
  HINGLISH: [
    'dosto ke saath gaye the, coffee bhi badhiya thi aur baithne ki jagah bhi mast, time kab nikal gaya pata hi nahi chala',
    'maine pizza aur mojito mangaya, dono fresh the, staff ka behaviour bhi ekdum sahi raha, koi jaldi nahi machayi',
    'ghar walon ke saath dinner kiya, saaf safai aur khane ka swad dono pasand aaya, bachchon ko bhi maza aaya',
    'instagram pe dekha tha yahan aake sach me achha laga, lighting aur decor dono kaafi aesthetic hai, photos bhi mast aayi',
  ],
};

/* =====================================================================
   ENGINE  (sab categories me same rahega)
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

// Model chunna: pichhle 3 me aaya hua model dobara nahi, naye models zyada
function pickModel(recentModels) {
  const flat = [];
  for (const sr of MODEL_SERIES) {
    const total = sr.variants.reduce((a, v) => a + v[1], 0);
    for (const [name, vw] of sr.variants) {
      if (recentModels.includes(name)) continue;
      flat.push({ name, series: sr.n, w: sr.w * (vw / total) });
    }
  }
  return pickWeighted(flat);
}

// ~8 words = 1 line on phone
const LENGTHS = [
  { w: 12, lines: 1, min: 7,  max: 11, rule: 'ONE short line, 7 to 10 words' },
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

function choosePersona(recent) {
  const last = recent.map((r) => r.voice).filter(Boolean).slice(-4);
  const pool = PERSONAS.filter((v) => !last.includes(v.id));
  return pick(pool.length ? pool : PERSONAS);
}

function chooseTopic(recent) {
  const last = recent.map((r) => r.topic).filter(Boolean).slice(-2);
  const pool = ALL_TOPICS.filter((t) => !last.includes(t));
  return TOPICS[pick(pool.length ? pool : ALL_TOPICS)];
}

// Customer ne jo chips chune (max 3) unhe nikalo
function chosenChips(body) {
  const labels = Array.isArray(body.selectedChips) ? body.selectedChips : [];
  return labels.filter((l) => typeof l === 'string' && CHIPS[l]).slice(0, 3).map((l) => ({ label: l, ...CHIPS[l] }));
}

function chooseFrom(list, key, recent, n = 3) {
  const last = recent.map((r) => r[key]).filter((v) => v !== undefined && v !== null).slice(-n);
  const pool = list.filter((x) => !last.includes(x));
  return pick(pool.length ? pool : list);
}

const BANNED_OPENINGS = [
  'Great', 'Best', 'Amazing', 'Excellent', 'Highly recommend', 'Bhai', 'Superb', 'Awesome', 'The staff here',
  'Outstanding', 'Fantastic', 'Wonderful', 'Perfect', 'Must visit', 'Trust me',
];

const AI_PHRASES = /seamless|hassle[- ]free|top[- ]notch|look no further|go-to|game[- ]changer|one[- ]stop|unparalleled|exceptional|impeccable|commendable|must[- ]visit|highly recommended|hands down|truly|delighted|kudos|—|–/i;

const DANGLING = new Set([
  'to', 'aur', 'ki', 'ke', 'ka', 'se', 'me', 'mein', 'par', 'pe', 'ko', 'toh',
  'and', 'but', 'the', 'a', 'an', 'of', 'in', 'on', 'for', 'with', 'at', 'that',
  'so', 'if', 'or', 'because', 'jo', 'jab', 'agar', 'lekin', 'ya', 'jaise', 'kyunki',
]);

// NOTE: 'the' yahan se hata diya (English me bahut aata hai, galat reject karta tha)
const HINDI_WORDS = new Set([
  'hai', 'hain', 'nahi', 'nahin', 'bahut', 'bohot', 'bhot', 'mera', 'meri', 'mere', 'mujhe', 'hume',
  'aur', 'ki', 'ke', 'ka', 'ko', 'se', 'par', 'pe', 'tha', 'thi', 'kiya', 'mila', 'mil', 'gaya', 'gayi',
  'liya', 'wala', 'wale', 'jo', 'kaafi', 'accha', 'acha', 'achha', 'sach', 'yahan', 'yaha', 'kar', 'karke', 'raha',
  'rahe', 'rahi', 'laga', 'lagi', 'bilkul', 'ekdum', 'sab', 'kuch', 'koi', 'phir', 'fir', 'bhi', 'toh', 'lekin',
  'isliye', 'abhi', 'dekh', 'dekha', 'diya', 'dikhaya', 'samjhaya', 'sahi', 'dukaan', 'dukan', 'aap', 'aapne',
  'paise', 'kam', 'jyada', 'zyada', 'badhiya', 'mast', 'yaar', 'mein', 'yeh', 'ye', 'woh', 'wo', 'ne', 'hu', 'hun', 'tak', 'wahan', 'sabse',
]);

/* ------------------ yaadasht (server par, best-effort) ------------------ */
const HISTORY = []; // { open, ws }
const HITS = new Map(); // ip -> [timestamps]

const openingOf = (text) => text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean).slice(0, 3).join(' ');
const wordSet = (t) => new Set(t.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 2));

function tooSimilar(text, recentOpenings) {
  const open = openingOf(text);
  if (recentOpenings.includes(open)) return true;
  const ws = wordSet(text);
  for (const h of HISTORY) {
    if (h.open === open) return true;
    let inter = 0;
    for (const w of ws) if (h.ws.has(w)) inter++;
    const union = ws.size + h.ws.size - inter || 1;
    if (inter / union > 0.45) return true;
  }
  return false;
}

function remember(text) {
  HISTORY.push({ open: openingOf(text), ws: wordSet(text) });
  while (HISTORY.length > HISTORY_SIZE) HISTORY.shift();
}

function rateLimited(request) {
  const ip = (request.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
  const now = Date.now();
  const arr = (HITS.get(ip) || []).filter((t) => now - t < 5 * 60 * 1000);
  arr.push(now);
  HITS.set(ip, arr);
  if (HITS.size > 2000) {
    for (const [k, v] of HITS) if (!v.some((t) => now - t < 5 * 60 * 1000)) HITS.delete(k);
  }
  return arr.length > 25; // 5 minute me 25 se zyada nahi
}

/* ------------------ safai aur checks ------------------ */
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

// Adhoora ending ho to dobara Gemini ko bulane ke bajaye code se kaat do
function fixCutOff(text) {
  let parts = text.trim().replace(/[,\-\s]+$/g, '').split(/\s+/);
  while (parts.length > 6) {
    const last = parts[parts.length - 1].toLowerCase().replace(/[^a-z]/g, '');
    if (!DANGLING.has(last)) break;
    parts.pop();
    parts = parts.join(' ').replace(/[,\-\s]+$/g, '').split(/\s+/);
  }
  return parts.join(' ');
}

function looksCutOff(text) {
  const last = text.split(/\s+/).pop().toLowerCase().replace(/[^a-z]/g, '');
  return DANGLING.has(last) || /[,\-]$/.test(text.trim());
}

function hindiCount(text) {
  return text.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter((w) => HINDI_WORDS.has(w)).length;
}

function languageOk(text, language, words) {
  const h = hindiCount(text);
  if (language === 'HINGLISH') return h >= Math.max(3, Math.floor(words * 0.2));
  return h <= 2;
}

function startsBanned(text) {
  const t = text.trim().toLowerCase();
  return BANNED_OPENINGS.some((b) => t.startsWith(b.toLowerCase()));
}

/* ------------------ Gemini ko jaane wali command ------------------ */
function buildPrompt(body, recent) {
  const language = body.language === 'HINGLISH' ? 'HINGLISH' : 'ENGLISH';
  const businessName = String(body.businessName || '').slice(0, 120);
  const category = String(body.category || '').slice(0, 200);
  const description = String(body.description || '').slice(0, 600);
  const city = String(body.city || '').slice(0, 120);

  const recentModels = recent.map((r) => r.model).filter(Boolean).slice(-3);
  let chips = chosenChips(body);
  const hasModelChip = chips.some((c) => c.id === 'chip_models');
  const picked = hasModelChip || chance(0.45) ? pickModel(recentModels) : null;
  const model = picked ? picked.name : null;
  if (hasModelChip) {
    chips = chips.map((c) =>
      c.id === 'chip_models'
        ? { ...c, text: `he tried the ${picked.name} and liked it`, must: new RegExp(picked.series, 'i') }
        : c
    );
  }
  const minLines = chips.length >= 3 ? 4 : chips.length === 2 ? 3 : 1;
  const length = chooseLength(recent, minLines);
  const persona = choosePersona(recent);
  const topic = chips.length
    ? { id: chips[0].id, text: chips[0].text, must: chips[0].must }
    : chooseTopic(recent);
  const extraChips = chips.slice(1);
  const opener = chooseFrom(OPENERS, 'opener', recent, 3);
  const ending = chooseFrom(ENDINGS, 'ending', recent, 2);
  const style = pick(WRITING_STYLES);
  const hinglishLevel = pick(HINGLISH_LEVELS);
  const buyerLine = chance(0.5) ? pick(BUYER_LINES) + ' ' : '';

  const longEnough = length.lines >= 3;
  const secondPoint = !extraChips.length && length.lines >= 4 && chance(0.5);
  const mentionName = chance(0.4);
  const mentionStaff = topic.id === 'politeness' ? chance(0.5) : chance(0.15);
  const useEmoji = chance(0.08);

  const recentSeo = recent.map((r) => r.seo).filter(Boolean).slice(-8);
  const seoPool = SEO_KEYWORDS.filter((k) => !recentSeo.includes(k));
  const seo = chance(0.3) ? pick(seoPool.length ? seoPool : SEO_KEYWORDS) : null;


  const languageBlock =
    language === 'HINGLISH'
      ? `LANGUAGE (MOST IMPORTANT): Write in HINGLISH = Hindi sentences typed in English/Roman letters, like a Delhi person on WhatsApp. Level: ${hinglishLevel}. Grammar must be Hindi (hai, tha, kiya, mila, nahi, bahut, aur, ke liye, wala etc.). Product names and keywords can stay in English. Never write a full English sentence. Never use Devanagari.`
      : `LANGUAGE (MOST IMPORTANT): Write in simple natural English like an Indian customer. Do not use Hindi words.`;

  const examples = shuffle(EXAMPLES[language]).slice(0, 3).map((e) => `- ${e}`).join('\n');

  const prompt = `${languageBlock}

You are ${persona.text}. ${buyerLine}You visited this ${SHOP_WORD} and had ${PRODUCT_WORD}, and you are writing a Google Maps review.
Business: ${businessName} (${city}) | ${category}
About: ${description}

Tone samples from other customers (only for feel, never copy words or structure):
${examples}

THIS REVIEW:
- Main topic: ${topic.text}. The review must clearly be about this.
${extraChips.length ? `- ALSO naturally cover these points (all of them): ${extraChips.map((c) => c.text).join('; ')}.` : secondPoint ? '- You may add one small extra point at the end, from any other area.' : '- Stick to the main topic only.'}
- Writing style: ${style}.
- Opening: ${opener}.
${longEnough ? `- Ending: ${ending}.` : ''}
- Length: ${length.rule}. Stay inside this range.
${mentionName ? `- Mention the cafe name "${businessName}" once, naturally.` : '- Do not repeat the full cafe name.'}
${seo ? `- If it fits naturally, include the phrase "${seo}".` : ''}
${model ? (hasModelChip ? `- Mention ${model} by name.` : `- You may mention ${model}.`) : ''}
${mentionStaff ? `- Mention the owner/staff "${OWNER_NAME}" once, naturally.` : '- Do not name any person.'}
${useEmoji ? '- One emoji at the very end is allowed.' : '- No emojis.'}

HARD RULES:
- ONE single paragraph. No line breaks, bullets or title.
- Do NOT use a full stop (.) anywhere. Use commas, "aur"/"and", or just flow.
- Never start with: ${BANNED_OPENINGS.join(', ')}.
- Sound like a real customer, not an advertisement. No hashtags, slogans, keyword stuffing, no dashes. Avoid polished marketing words (seamless, hassle-free, top-notch, exceptional).
- Do not invent facts: only talk about what the main topic says. No other cafe or area names, no exact prices, no discount percentages, no health or hygiene certificate claims.
- Do not use the word "wholesale".
- End with a COMPLETE thought. Never stop mid-sentence.
- Output only the review text.`.replace(/\n{3,}/g, '\n\n').replace(/\n\n(- )/g, '\n$1');

  return { prompt, length, persona, topic, extraChips, opener, ending, seo, model, language };
}

async function callGemini(apiKey, payload, signal) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal,
    }
  );
  const data = await res.json();
  return { res, data };
}

/* ------------------ ek koshish: likhwao + check karo ------------------ */
async function attempt(apiKey, body, recent, signal) {
  const built = buildPrompt(body, recent);
  const { prompt, length, persona, topic, extraChips, opener, ending, seo, model, language } = built;

  const payload = {
    contents: [{ role: 'user', parts: [{ text: `Write the review for ${body.businessName} now.` }] }],
    systemInstruction: { parts: [{ text: prompt }] },
    generationConfig: {
      temperature: 1.0,
      topP: 0.95,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      thinkingConfig: { thinkingBudget: 0 },
    },
  };

  try {
    let { res, data } = await callGemini(apiKey, payload, signal);

    if (!res.ok && /thinking/i.test(data?.error?.message || '')) {
      delete payload.generationConfig.thinkingConfig;
      ({ res, data } = await callGemini(apiKey, payload, signal));
    }
    if (!res.ok) return { ok: false, error: data?.error?.message || 'Gemini API request failed.' };

    const candidate = data.candidates?.[0];
    const parts = candidate?.content?.parts || [];
    const raw = parts.filter((p) => !p.thought).map((p) => p.text || '').join('');
    const review = fixCutOff(cleanReview(raw));
    const words = review.split(/\s+/).filter(Boolean).length;

    if (!review) return { ok: false, error: 'Empty response from Gemini.' };
    if (candidate?.finishReason === 'MAX_TOKENS') return { ok: false, error: 'Response was cut off.' };
    if (looksCutOff(review)) return { ok: false, error: 'Review ended mid-sentence.' };
    if (words > length.max + 8) return { ok: false, error: 'Review too long.' };
    if (words < Math.floor(length.min * 0.75)) return { ok: false, error: 'Review too short.' };
    if (/[ऀ-ॿ]/.test(review)) return { ok: false, error: 'Devanagari used.' };
    if (/wholesale/i.test(review)) return { ok: false, error: 'Banned word used.' };
    if (AI_PHRASES.test(review)) return { ok: false, error: 'Robotic phrase used.' };
    if (startsBanned(review)) return { ok: false, error: 'Banned opening used.' };
    if (!languageOk(review, language, words)) return { ok: false, error: 'Wrong language style.' };
    if (!topic.must.test(review)) return { ok: false, error: 'Review missed the selected topic.' };
    if (extraChips.some((c) => !c.must.test(review))) return { ok: false, error: 'Review missed a selected keyword.' };
    const recentOpenings = recent.map((r) => r.open).filter(Boolean);
    if (tooSimilar(review, recentOpenings)) return { ok: false, error: 'Too similar to an earlier review.' };

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
        model: model || null,
        open: openingOf(review),
      },
    };
  } catch (e) {
    return { ok: false, error: e?.name === 'AbortError' ? 'aborted' : e?.message || 'Request failed.', aborted: e?.name === 'AbortError' };
  }
}

// Jo pehle sahi result de, wahi lo
function firstValid(tasks) {
  return new Promise((resolve) => {
    let pending = tasks.length;
    let firstError = null;
    for (const t of tasks) {
      t.then((r) => {
        if (r.ok) return resolve(r);
        if (!r.aborted && !firstError) firstError = r.error;
        if (--pending === 0) resolve({ ok: false, error: firstError || 'Failed to generate review draft.' });
      });
    }
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API Key not configured.' }, { status: 500 });
    }
    if (rateLimited(request)) {
      return NextResponse.json({ error: 'Too many requests. Please wait a minute.' }, { status: 429 });
    }

    const recent = (Array.isArray(body.recentLengths) ? body.recentLengths : [])
      .filter((r) => r && typeof r === 'object')
      .slice(-6);

    let lastError = 'Failed to generate review draft.';

    for (let round = 0; round < MAX_ROUNDS; round++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), CALL_TIMEOUT_MS);

      const winner = await firstValid(
        Array.from({ length: PARALLEL_CALLS }, () => attempt(apiKey, body, recent, controller.signal))
      );

      clearTimeout(timer);
      controller.abort(); // bacha hua dusra call band

      if (winner.ok) {
        remember(winner.review);
        return NextResponse.json({ review: winner.review, meta: winner.meta });
      }
      lastError = winner.error;
    }

    throw new Error(lastError);
  } catch (error) {
    console.error('API Review Generation Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate review draft.' },
      { status: 500 }
    );
  }
}
