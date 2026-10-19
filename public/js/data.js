/* =========================================================
   Aqualume — catalogue, hotspots and builder data
   Swap these values for real stock, prices and photos.
   ========================================================= */
const CURRENCY = "$";

const px = (id, w = 800) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;
const pxVid = (id, file, w = 800) =>
  `https://images.pexels.com/videos/${id}/${file}?auto=compress&cs=tinysrgb&w=${w}`;

/* ---------- Illustrated product art (for items without photos) ---------- */
const ART = {
  jar: (lid, body, label) => `
    <svg viewBox="0 0 120 150" aria-hidden="true">
      <rect x="28" y="10" width="64" height="22" rx="6" fill="${lid}"/>
      <rect x="24" y="28" width="72" height="8" rx="3" fill="rgba(0,0,0,.25)"/>
      <path d="M22 40q0-6 6-6h64q6 0 6 6v92q0 10-10 10H32q-10 0-10-10z" fill="${body}"/>
      <rect x="30" y="64" width="60" height="46" rx="8" fill="#f7f3e8"/>
      <path d="M42 87c6-8 14-10 22-6l6-4-1 8 1 8-6-4c-8 4-16 2-22-2z" fill="${lid}"/>
      <text x="60" y="104" text-anchor="middle" font-family="Manrope,sans-serif" font-size="8" font-weight="700" fill="#0b2a28">${label}</text>
      <path d="M30 44h8v86h-8z" fill="rgba(255,255,255,.18)"/>
    </svg>`,
  bag: (color, label) => `
    <svg viewBox="0 0 120 150" aria-hidden="true">
      <path d="M26 18h68l6 10-4 108q0 8-8 8H32q-8 0-8-8L20 28z" fill="${color}"/>
      <path d="M26 18h68l-2 10H28z" fill="rgba(0,0,0,.2)"/>
      <circle cx="60" cy="74" r="24" fill="#f7f3e8"/>
      <path d="M46 74c5-7 12-9 19-5l5-4-1 9 1 9-5-4c-7 4-14 2-19-5z" fill="${color}"/>
      <text x="60" y="122" text-anchor="middle" font-family="Manrope,sans-serif" font-size="9" font-weight="800" fill="#f7f3e8">${label}</text>
      <path d="M30 32h6v100h-6z" fill="rgba(255,255,255,.15)"/>
    </svg>`,
  filter: () => `
    <svg viewBox="0 0 120 150" aria-hidden="true">
      <rect x="30" y="34" width="60" height="104" rx="12" fill="#1a2b2e"/>
      <rect x="26" y="20" width="68" height="22" rx="8" fill="#2f4a4f"/>
      <rect x="38" y="52" width="44" height="70" rx="6" fill="#7cf5d4" opacity=".2"/>
      <rect x="42" y="58" width="36" height="12" rx="3" fill="#7cf5d4" opacity=".55"/>
      <rect x="42" y="76" width="36" height="12" rx="3" fill="#7cf5d4" opacity=".4"/>
      <rect x="42" y="94" width="36" height="12" rx="3" fill="#7cf5d4" opacity=".25"/>
      <path d="M44 20V8h8v12M68 20V4h8v16" stroke="#2f4a4f" stroke-width="5" fill="none"/>
    </svg>`,
  light: () => `
    <svg viewBox="0 0 160 120" aria-hidden="true">
      <rect x="10" y="30" width="140" height="18" rx="6" fill="#1a2b2e"/>
      <rect x="16" y="46" width="128" height="4" rx="2" fill="#fff"/>
      <path d="M16 50h128l14 60H2z" fill="url(#lg)" opacity=".55"/>
      <path d="M22 30l-8-18M138 30l8-18" stroke="#2f4a4f" stroke-width="4"/>
      <defs><linearGradient id="lg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9fff8"/><stop offset="1" stop-color="#7cf5d4" stop-opacity="0"/></linearGradient></defs>
    </svg>`,
  heater: () => `
    <svg viewBox="0 0 120 150" aria-hidden="true">
      <rect x="48" y="8" width="24" height="22" rx="5" fill="#2f4a4f"/>
      <rect x="50" y="28" width="20" height="112" rx="10" fill="rgba(200,240,255,.35)" stroke="rgba(255,255,255,.5)"/>
      <rect x="55" y="40" width="10" height="88" rx="5" fill="#ff7a59"/>
      <circle cx="60" cy="19" r="5" fill="#7cf5d4"/>
    </svg>`,
  co2: () => `
    <svg viewBox="0 0 120 150" aria-hidden="true">
      <rect x="38" y="36" width="44" height="106" rx="20" fill="#3b4a4f"/>
      <rect x="44" y="20" width="32" height="20" rx="6" fill="#9aa9ad"/>
      <circle cx="60" cy="14" r="9" fill="#ff7a59"/>
      <text x="60" y="96" text-anchor="middle" font-family="Manrope,sans-serif" font-size="16" font-weight="800" fill="#e9f4f0">CO₂</text>
    </svg>`,
  tank: (w = 1) => `
    <svg viewBox="0 0 160 120" aria-hidden="true">
      <rect x="${20 - w * 8}" y="20" width="${120 + w * 16}" height="80" rx="4" fill="rgba(124,245,212,.12)" stroke="rgba(233,244,240,.55)" stroke-width="2"/>
      <path d="M${22 - w * 8} 84q40-10 ${58 + w * 8} -2t${58 + w * 8} 2v14H${22 - w * 8}z" fill="#cdb98f"/>
      <path d="M50 84c-2-20 4-36 0-50M58 84c2-18-2-30 4-44M110 84c0-16 6-24 2-36" stroke="#4fae6a" stroke-width="4" fill="none" stroke-linecap="round"/>
      <rect x="${20 - w * 8}" y="12" width="${120 + w * 16}" height="8" rx="2" fill="#1a2b2e"/>
      <rect x="${14 - w * 8}" y="100" width="${132 + w * 16}" height="8" rx="2" fill="#1a2b2e"/>
    </svg>`,
  stone: () => `
    <svg viewBox="0 0 160 120" aria-hidden="true">
      <path d="M20 100l18-46 22-14 18 20 14-30 26 18 22 52z" fill="#5d6b6a"/>
      <path d="M38 54l22-14 18 20-26 40H20z" fill="#76847f"/>
      <path d="M92 30l26 18 22 52H96z" fill="#4a5655"/>
    </svg>`,
  sand: () => `
    <svg viewBox="0 0 160 120" aria-hidden="true">
      <path d="M10 96q70-60 140 0z" fill="#d9c49a"/>
      <g fill="#b09a6c">${Array.from({ length: 26 }, (_, i) => `<circle cx="${30 + (i * 37) % 100}" cy="${80 + (i * 13) % 14}" r="${1 + (i % 3)}"/>`).join("")}</g>
    </svg>`,
};

/* ---------- Product catalogue ---------- */
const PRODUCTS = [
  // ——— Fish ———
  { id: "neon", cat: "fish", name: "Neon Tetra", latin: "Paracheirodon innesi", price: 2.5, img: px(36851956), badge: "Schooling", tags: ["Peaceful", "Beginner"],
    stats: { Size: "3.5 cm", Temp: "22–26°C", Care: "Easy" }, desc: "A living ribbon of electric blue and red. Keep 10+ for that mesmerising synchronized shoal.",
    builder: { bio: 1, temp: [22, 26], temper: "peaceful", minTank: 40 } },
  { id: "betta", cat: "fish", name: "Halfmoon Betta", latin: "Betta splendens", price: 18, img: px(2564496), badge: "Show grade", tags: ["Solo", "Beginner"],
    stats: { Size: "6 cm", Temp: "24–28°C", Care: "Easy" }, desc: "Flowing 180° fins like a silk gown. Each one is individually chosen for colour and form.",
    builder: { bio: 3, temp: [24, 28], temper: "semi", minTank: 20, solo: true } },
  { id: "discus", cat: "fish", name: "Pigeon Blood Discus", latin: "Symphysodon aequifasciatus", price: 65, img: px(9408370), badge: "Hot", hot: true, tags: ["Peaceful", "Expert"],
    stats: { Size: "15 cm", Temp: "28–30°C", Care: "Expert" }, desc: "The king of the aquarium. Warm, soft water and a calm tank bring out their incredible colour.",
    builder: { bio: 10, temp: [28, 30], temper: "peaceful", minTank: 200 } },
  { id: "angel", cat: "fish", name: "Altum Angelfish", latin: "Pterophyllum scalare", price: 14, img: px(36121158), tags: ["Semi-aggressive", "Intermediate"],
    stats: { Size: "15 cm", Temp: "24–29°C", Care: "Medium" }, desc: "Tall, elegant and curious. Angelfish glide between plant stems like they own the place.",
    builder: { bio: 6, temp: [24, 29], temper: "semi", minTank: 120 } },
  { id: "guppy", cat: "fish", name: "Fancy Guppy Trio", latin: "Poecilia reticulata", price: 9, img: px(36426327), tags: ["Peaceful", "Beginner"],
    stats: { Size: "5 cm", Temp: "22–28°C", Care: "Easy" }, desc: "Confetti in fish form. Hardy, active and endlessly colourful — the perfect first fish.",
    builder: { bio: 1.5, temp: [22, 28], temper: "peaceful", minTank: 40 } },
  { id: "goldfish", cat: "fish", name: "Ryukin Goldfish", latin: "Carassius auratus", price: 12, img: px(12245114), tags: ["Peaceful", "Coldwater"],
    stats: { Size: "15 cm", Temp: "18–23°C", Care: "Easy" }, desc: "Round-bodied with a high back and trailing fins. Loves cooler water and a big appetite.",
    builder: { bio: 8, temp: [18, 23], temper: "peaceful", minTank: 120 } },
  { id: "shrimp", cat: "fish", name: "Red Cherry Shrimp ×10", latin: "Neocaridina davidi", price: 22, img: px(10819615), tags: ["Peaceful", "Cleaner"],
    stats: { Size: "2.5 cm", Temp: "20–27°C", Care: "Easy" }, desc: "Tiny red janitors that graze algae all day. A colony will breed and fill your moss.",
    builder: { bio: 0.5, temp: [20, 27], temper: "peaceful", minTank: 20, prey: true } },
  { id: "axolotl", cat: "fish", name: "Leucistic Axolotl", latin: "Ambystoma mexicanum", price: 45, img: px(34945014), badge: "Rare", tags: ["Coldwater", "Solo"],
    stats: { Size: "25 cm", Temp: "15–20°C", Care: "Medium" }, desc: "The smiling walking fish. Keep cool and alone — they're unforgettable.",
    builder: { bio: 8, temp: [15, 20], temper: "peaceful", minTank: 120, solo: true } },

  { id: "goldbarb", cat: "fish", name: "Gold Barb ×6", latin: "Barbodes semifasciolatus", price: 15, img: pxVid(35442641, "pexels-photo-35442641.jpeg"), imgPos: "56% 74%", zoom: 2.6, badge: "In the video", tags: ["Peaceful", "Active"],
    stats: { Size: "7 cm", Temp: "18–24°C", Care: "Easy" }, desc: "The shimmering gold shoal weaving under the lotus. Hardy, playful and always on the move.",
    builder: { bio: 2, temp: [18, 24], temper: "peaceful", minTank: 80 } },
  { id: "pencilfish", cat: "fish", name: "Three-lined Pencilfish ×6", latin: "Nannostomus trifasciatus", price: 21, img: pxVid(35442641, "pexels-photo-35442641.jpeg"), imgPos: "40% 84%", zoom: 2.6, tags: ["Peaceful", "Schooling"],
    stats: { Size: "5 cm", Temp: "24–28°C", Care: "Medium" }, desc: "Slim, striped torpedoes that cruise just above the sand in a tight, graceful school.",
    builder: { bio: 1, temp: [24, 28], temper: "peaceful", minTank: 60 } },

  // ——— Koi & pond ———
  { id: "kohaku", cat: "koi", name: "Kohaku Koi", latin: "Cyprinus rubrofuscus", price: 120, img: px(28930013), badge: "Japan bred", tags: ["Pond", "Tosai"],
    stats: { Size: "20 cm", Temp: "4–28°C", Care: "Medium" }, desc: "Snow-white body with deep crimson hi markings — the foundation of every great koi pond." },
  { id: "showa", cat: "koi", name: "Showa Sanshoku", latin: "Cyprinus rubrofuscus", price: 160, img: pxVid(3582903, "free-video-3582903.jpg"), tags: ["Pond", "Nisai"],
    stats: { Size: "28 cm", Temp: "4–28°C", Care: "Medium" }, desc: "Bold black sumi wrapping red and white. Their pattern deepens beautifully with age." },
  { id: "ogon", cat: "koi", name: "Yamabuki Ogon", latin: "Cyprinus rubrofuscus", price: 95, img: pxVid(35838537, "pexels-photo-35838537.jpeg"), tags: ["Pond", "Friendly"],
    stats: { Size: "25 cm", Temp: "4–28°C", Care: "Easy" }, desc: "Solid metallic gold that glows under the surface. Usually the first to eat from your hand." },
  { id: "butterfly", cat: "koi", name: "Butterfly Koi", latin: "Cyprinus rubrofuscus", price: 75, img: pxVid(28730934, "beauty-natural-28730934.jpeg"), tags: ["Pond", "Long-fin"],
    stats: { Size: "30 cm", Temp: "4–28°C", Care: "Easy" }, desc: "Long flowing fins that trail like silk scarves as they cruise the pond." },
  { id: "koifood", cat: "food", name: "Koi Gold Sticks 2 kg", latin: "", price: 34, art: ART.bag("#c2410c", "KOI GOLD"), tags: ["Floating", "Colour"],
    stats: { Protein: "38%", Pack: "2 kg", Type: "Sticks" }, desc: "Floating sticks with spirulina and astaxanthin for brilliant reds and golds." },

  // ——— Monster fish ———
  { id: "arapaima", cat: "monster", name: "Arapaima", latin: "Arapaima gigas", price: 890, img: pxVid(37279512, "pexels-photo-37279512.jpeg"), badge: "By order", hot: true, tags: ["Giant", "Expert"],
    stats: { Size: "200 cm+", Temp: "24–29°C", Care: "Expert" }, desc: "One of the largest freshwater fish on Earth. An air-breathing living fossil for dedicated keepers." },
  { id: "sharkcat", cat: "monster", name: "Columbian Shark Catfish", latin: "Ariopsis seemanni", price: 38, img: pxVid(37279512, "pexels-photo-37279512.jpeg"), imgPos: "12% 70%", zoom: 3, tags: ["Schooling", "Brackish"],
    stats: { Size: "35 cm", Temp: "22–28°C", Care: "Medium" }, desc: "A sleek, shark-finned catfish that patrols the bottom. Best kept in groups in big tanks." },
  { id: "flowerhorn", cat: "monster", name: "Flowerhorn", latin: "Cichlasoma hybrid", price: 140, img: px(33632875), tags: ["Aggressive", "Solo"],
    stats: { Size: "30 cm", Temp: "26–30°C", Care: "Medium" }, desc: "That iconic nuchal hump and fierce personality. They recognise their owner.",
    builder: { bio: 14, temp: [26, 30], temper: "aggressive", minTank: 240, solo: true } },
  { id: "oscar", cat: "monster", name: "Tiger Oscar", latin: "Astronotus ocellatus", price: 28, img: px(2109800), tags: ["Aggressive", "Smart"],
    stats: { Size: "35 cm", Temp: "23–27°C", Care: "Medium" }, desc: "The 'water dog'. Oscars beg at the glass, rearrange décor, and have huge personalities.",
    builder: { bio: 14, temp: [23, 27], temper: "aggressive", minTank: 240 } },
  { id: "stingray", cat: "monster", name: "Motoro Stingray", latin: "Potamotrygon motoro", price: 420, img: px(26839175), tags: ["Bottom dweller", "Expert"],
    stats: { Size: "45 cm disc", Temp: "24–28°C", Care: "Expert" }, desc: "Glides over sand like a living leaf. Needs a wide footprint and pristine water." },
  { id: "gourami", cat: "monster", name: "Giant Gourami", latin: "Osphronemus goramy", price: 60, img: pxVid(34483250, "pexels-photo-34483250.jpeg"), tags: ["Gentle giant"],
    stats: { Size: "60 cm", Temp: "22–28°C", Care: "Medium" }, desc: "A calm, intelligent giant with expressive lips and a lifespan of 20 years." },

  // ——— Plants ———
  { id: "lotus", cat: "plants", name: "Red Tiger Lotus", latin: "Nymphaea zenkeri", price: 11, img: pxVid(35442641, "pexels-photo-35442641.jpeg"), imgPos: "38% 35%", zoom: 1.7, badge: "Centrepiece", tags: ["Bulb", "Easy"],
    stats: { Light: "Medium", Growth: "Fast", Place: "Mid" }, desc: "Mottled crimson leaves that steal the show. Grows from a bulb — no CO₂ needed.",
    builder: { plant: true, bio: -2 } },
  { id: "moss", cat: "plants", name: "Java Moss Mat", latin: "Taxiphyllum barbieri", price: 8, img: px(32437316), tags: ["Epiphyte", "Shrimp safe"],
    stats: { Light: "Low", Growth: "Medium", Place: "Wood/Rock" }, desc: "Tie it to driftwood for an ancient-forest look. Shrimp babies love to hide inside.",
    builder: { plant: true, bio: -1 } },
  { id: "vallis", cat: "plants", name: "Jungle Vallisneria", latin: "Vallisneria americana", price: 7, img: pxVid(34454615, "aquarium-aquascape-34454615.jpeg"), tags: ["Background", "Easy"],
    stats: { Light: "Low", Growth: "Fast", Place: "Back" }, desc: "Ribbon-like leaves that dance in the current. Creates a lush wall of green fast.",
    builder: { plant: true, bio: -2 } },
  { id: "anubias", cat: "plants", name: "Anubias Nana", latin: "Anubias barteri", price: 9, img: px(16060331), tags: ["Epiphyte", "Unkillable"],
    stats: { Light: "Low", Growth: "Slow", Place: "Fore/Mid" }, desc: "Glossy, near-indestructible leaves. Even cichlids leave it alone.",
    builder: { plant: true, bio: -1 } },
  { id: "lily", cat: "plants", name: "Hardy Water Lily", latin: "Nymphaea 'Marliacea'", price: 24, img: px(36002741), tags: ["Pond", "Flowering"],
    stats: { Light: "Full sun", Growth: "Medium", Place: "Pond" }, desc: "Shade for your koi and blooms all summer long. Pink, scented, and very forgiving." },
  { id: "carpet", cat: "plants", name: "Monte Carlo Carpet", latin: "Micranthemum tweediei", price: 13, img: px(37992842), tags: ["Carpet", "CO₂ recommended"],
    stats: { Light: "High", Growth: "Medium", Place: "Foreground" }, desc: "Tiny round leaves that knit into a bright green lawn across your substrate.",
    builder: { plant: true, bio: -2 } },

  // ——— Tanks ———
  { id: "tank60", cat: "tanks", name: "Nano Cube 60 L", latin: "Opti-white glass", price: 149, img: px(26611976), tags: ["Rimless", "All-in-one"],
    stats: { Size: "40×40×40", Glass: "6 mm", Lid: "Optional" }, desc: "Low-iron crystal glass with polished edges. Perfect for a shrimp or betta scape." },
  { id: "tank120", cat: "tanks", name: "Rimless 120 L", latin: "Opti-white glass", price: 289, img: px(31323661), badge: "Bestseller", tags: ["Rimless", "Planted"],
    stats: { Size: "80×35×45", Glass: "8 mm", Lid: "Optional" }, desc: "The aquascaper's favourite. Wide, shallow and made to show off a planted layout." },
  { id: "tank240", cat: "tanks", name: "Monster Tank 450 L", latin: "Braced, sump-ready", price: 1290, art: ART.tank(2), tags: ["Sump", "Large fish"],
    stats: { Size: "150×60×60", Glass: "12 mm", Lid: "Included" }, desc: "Built for giants. Pre-drilled for a sump and rated for big, powerful fish." },

  // ——— Food ———
  { id: "flakes", cat: "food", name: "Tropical Colour Flakes", latin: "", price: 9, art: ART.jar("#1e8f72", "#0f4c41", "COLOUR FLAKES"), tags: ["Daily", "All fish"],
    stats: { Protein: "46%", Pack: "100 g", Type: "Flake" }, desc: "Krill and spirulina flakes that bring out natural colour in tropical community fish." },
  { id: "pellets", cat: "food", name: "Cichlid Sinking Pellets", latin: "", price: 14, art: ART.jar("#c2410c", "#7c2d12", "CICHLID PRO"), tags: ["Sinking", "Large fish"],
    stats: { Protein: "48%", Pack: "250 g", Type: "Pellet" }, desc: "Dense, protein-rich pellets for oscars, flowerhorns and other big appetites." },
  { id: "bloodworm", cat: "food", name: "Frozen Bloodworm", latin: "", price: 6, art: ART.bag("#9f1239", "BLOODWORM"), tags: ["Frozen", "Treat"],
    stats: { Protein: "60%", Pack: "100 g", Type: "Frozen" }, desc: "Gamma-irradiated blister packs. Instant feeding frenzy, every time." },

  // ——— Equipment & décor ———
  { id: "canister", cat: "gear", name: "Canister Filter 1200 L/h", latin: "", price: 179, art: ART.filter(), tags: ["Silent", "Up to 400 L"],
    stats: { Flow: "1200 L/h", Power: "15 W", Media: "4 L" }, desc: "Whisper-quiet, multi-stage filtration with media baskets included." },
  { id: "led", cat: "gear", name: "Full-Spectrum Planted LED", latin: "", price: 129, art: ART.light(), badge: "App control", tags: ["Sunrise mode", "RGB"],
    stats: { Power: "48 W", Length: "90 cm", PAR: "High" }, desc: "Programmable sunrise, midday and moonlight. Grows carpets and makes reds pop." },
  { id: "co2", cat: "gear", name: "CO₂ Pro Kit", latin: "", price: 149, art: ART.co2(), tags: ["Solenoid", "Diffuser"],
    stats: { Cylinder: "2 L", Valve: "Needle", Timer: "Yes" }, desc: "Everything you need to inject CO₂ for jaw-dropping plant growth." },
  { id: "heater", cat: "gear", name: "Titanium Heater 200 W", latin: "", price: 39, art: ART.heater(), tags: ["Shatterproof", "±0.5°C"],
    stats: { Power: "200 W", Range: "18–34°C", Tank: "≤ 250 L" }, desc: "Accurate, unbreakable and controlled by an external thermostat." },
  { id: "spiderwood", cat: "gear", name: "Spiderwood Branch", latin: "", price: 29, img: pxVid(35442641, "pexels-photo-35442641.jpeg"), imgPos: "18% 32%", zoom: 1.9, tags: ["Hardscape", "Pre-soaked"],
    stats: { Length: "40–60 cm", Sinks: "Yes", pH: "Neutral" }, desc: "Twisting, root-like branches that build the 'drowned forest' look in this very tank." },
  { id: "rock", cat: "gear", name: "Dragon Stone Hardscape", latin: "", price: 32, art: ART.stone(), tags: ["Décor", "Per kg"],
    stats: { Type: "Ohko", Unit: "1 kg", pH: "Neutral" }, desc: "Craggy, textured stone that creates instant mountains and caves." },
  { id: "sand", cat: "gear", name: "Amazon River Sand 10 kg", latin: "", price: 26, art: ART.sand(), tags: ["Substrate", "Ray safe"],
    stats: { Grain: "0.5 mm", Bag: "10 kg", Colour: "Natural" }, desc: "Soft, rounded grains — safe for stingrays, corydoras and digging cichlids." },
];

const productById = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));

const CATEGORIES = [
  { id: "fish", name: "Live Fish", copy: "320+ tropical, coldwater & marine species", img: px(36426327, 900) },
  { id: "plants", name: "Aquatic Plants", copy: "Tissue-culture, pest-free, ready to plant", img: px(16060331, 900) },
  { id: "koi", name: "Koi & Pond", copy: "Japanese bloodlines, lilies & pond care", img: px(28930013, 900) },
  { id: "monster", name: "Monster Fish", copy: "Arowana, rays, oscars & true giants", img: px(33632875, 900) },
  { id: "tanks", name: "Aquariums", copy: "Rimless, nano, custom & monster builds", img: px(31323661, 900) },
  { id: "food", name: "Fish Food", copy: "Flakes, pellets, frozen & live cultures", art: ART.jar("#1e8f72", "#0f4c41", "COLOUR FLAKES"), artClass: "art--food" },
  { id: "gear", name: "Equipment", copy: "Filters, lights, CO₂, heaters & hardscape", art: ART.filter(), artClass: "art--gear" },
];

const FILTERS = [
  { id: "all", label: "All" },
  { id: "fish", label: "Fish" },
  { id: "plants", label: "Plants" },
  { id: "koi", label: "Koi" },
  { id: "monster", label: "Monster" },
  { id: "tanks", label: "Tanks" },
  { id: "food", label: "Food" },
  { id: "gear", label: "Gear" },
];

/* ---------- Video hotspots ----------
   Coordinates are % of the VIDEO FRAME (0–100), not the screen, so markers stay
   on the same fish/plant at every screen size and crop.
   - path:  [[t, x, y], ...]  keyframes, t = 0..1 of the video's length (follows a real fish)
   - orbit: { cx, cy, rx, ry, speed, phase }  a slow drift (used in the crowded koi pond)
   - x, y:  a fixed point (plants, décor)
   Record new paths with the tracker: add ?track to the URL (or press Shift+T). */
const HOTSPOTS = {
  planted: [
    { product: "goldbarb", kind: "fish", label: "Gold Barbs",
      path: [[0, 55, 71], [0.21, 53, 73], [0.42, 51, 74], [0.62, 51, 72], [0.83, 50, 73]] },
    { product: "pencilfish", kind: "fish", label: "Pencilfish",
      path: [[0, 30, 82], [0.21, 36, 83], [0.42, 43, 83], [0.62, 55, 85], [0.83, 70, 79]] },
    { product: "lotus", kind: "plant", x: 44, y: 35, label: "Red Tiger Lotus" },
    { product: "spiderwood", kind: "plant", x: 20, y: 30, label: "Spiderwood" },
    { product: "anubias", kind: "plant", x: 31, y: 63, label: "Anubias Nana" },
  ],
  koi: [
    { product: "kohaku", kind: "fish", orbit: { cx: 30, cy: 62, rx: 9, ry: 7, speed: 0.035, phase: 0 }, label: "Kohaku" },
    { product: "showa", kind: "fish", orbit: { cx: 52, cy: 44, rx: 8, ry: 7, speed: 0.03, phase: 1.6 }, label: "Showa" },
    { product: "ogon", kind: "fish", orbit: { cx: 22, cy: 40, rx: 7, ry: 6, speed: 0.04, phase: 3 }, label: "Yamabuki Ogon" },
    { product: "butterfly", kind: "fish", orbit: { cx: 60, cy: 70, rx: 8, ry: 6, speed: 0.03, phase: 4.4 }, label: "Butterfly Koi" },
    { product: "koifood", kind: "plant", x: 78, y: 26, label: "Koi Gold Sticks" },
  ],
  monster: [
    { product: "arapaima", kind: "fish", label: "Arapaima",
      path: [[0, 43, 55], [0.19, 47, 55], [0.39, 52, 57], [0.58, 60, 57], [0.78, 67, 59], [0.97, 69, 59]] },
    { product: "sharkcat", kind: "fish", label: "Shark Catfish",
      path: [[0, 9, 68], [0.19, 12, 70], [0.39, 13, 72], [0.58, 15.5, 72], [0.78, 16.5, 72], [0.97, 17.5, 72]] },
    { product: "rock", kind: "plant", x: 72, y: 24, label: "Rock Backdrop" },
    { product: "sand", kind: "plant", x: 82, y: 76, label: "River Sand" },
  ],
};

const MONSTER_RAIL = ["flowerhorn", "oscar", "stingray", "gourami"];

/* ---------- Tank builder ---------- */
const BUILDER_TANKS = [
  { id: "tank60", liters: 60, name: "60 L Nano Cube", ratio: "1 / 1", capacity: 20 },
  { id: "tank120", liters: 120, name: "120 L Rimless", ratio: "16 / 9", capacity: 42 },
  { id: "tank240", liters: 450, name: "450 L Monster", ratio: "5 / 2", capacity: 150 },
];
const BUILDER_ITEMS = PRODUCTS.filter((p) => p.builder);

const FISH_COLORS = {
  neon: ["#3ad0ff", "#ff3b4e"], betta: ["#c81e5a", "#5b2be0"], discus: ["#ff5a3d", "#ffd06b"], angel: ["#e8e3d0", "#22201c"],
  guppy: ["#ff8a3d", "#3ad0ff"], goldfish: ["#ff8c1a", "#ffd17a"], shrimp: ["#e1263c", "#ff6b6b"], axolotl: ["#ffd6e0", "#ff7aa2"],
  flowerhorn: ["#e2482d", "#2d7ee2"], oscar: ["#1b1b1b", "#ff7a2f"], goldbarb: ["#e8b53a", "#3a2a10"], pencilfish: ["#d9b98a", "#1b1b1b"],
};
