interface PlantInfoBlock {
  title: string;
  body: string;
}

export interface PlantInfo {
  about: PlantInfoBlock;
  likes: PlantInfoBlock;
  care: PlantInfoBlock;
}

const plantDatabase: Record<string, PlantInfo> = {
  Monstera: {
    about: {
      title: "About Monstera",
      body: "Native to Central American rainforests, Monstera deliciosa is famous for its dramatic split leaves. In the wild it climbs trees toward the canopy, and indoors it can grow several feet tall with proper support.",
    },
    likes: {
      title: "What it likes",
      body: "Bright, indirect light and warm temperatures between 18–27 °C. It thrives in humidity above 50 % and appreciates a moss pole or trellis to climb.",
    },
    care: {
      title: "How to care",
      body: "Water when the top 5 cm of soil feels dry — roughly every 7–10 days. Wipe leaves monthly to remove dust. Feed with a balanced liquid fertiliser every 2–4 weeks during spring and summer.",
    },
  },
  Pothos: {
    about: {
      title: "About Pothos",
      body: "Epipremnum aureum, commonly called Pothos or Devil's Ivy, is one of the most forgiving houseplants. Its trailing vines can reach several metres, making it perfect for shelves and hanging baskets.",
    },
    likes: {
      title: "What it likes",
      body: "Low to bright indirect light — it tolerates dim corners better than most plants. Average room humidity is fine, though it appreciates occasional misting.",
    },
    care: {
      title: "How to care",
      body: "Let the top layer of soil dry between waterings, roughly every 5–7 days. Trim leggy vines to encourage bushier growth. Propagates easily in water from stem cuttings.",
    },
  },
  Succulent: {
    about: {
      title: "About Succulents",
      body: "Succulents are a diverse group of plants that store water in their thick, fleshy leaves. Originating from arid regions worldwide, they come in an incredible range of shapes, colours and textures.",
    },
    likes: {
      title: "What it likes",
      body: "Bright, direct sunlight for at least 6 hours a day. Well-draining sandy or gritty soil and low humidity. They prefer warm days and cooler nights.",
    },
    care: {
      title: "How to care",
      body: "Water deeply but infrequently — every 10–14 days in summer, less in winter. Always let soil dry completely. Avoid getting water on leaves to prevent rot. Minimal fertiliser needed.",
    },
  },
  "Boston Fern": {
    about: {
      title: "About Boston Fern",
      body: "Nephrolepis exaltata is a lush, arching fern native to tropical forests. Its feathery fronds make it a classic choice for hanging baskets and shaded porches.",
    },
    likes: {
      title: "What it likes",
      body: "Indirect light and high humidity — bathrooms are ideal. It prefers cool to moderate temperatures (15–24 °C) and consistently moist but not soggy soil.",
    },
    care: {
      title: "How to care",
      body: "Water every 2–3 days to keep soil evenly moist. Mist daily or place on a pebble tray for humidity. Trim brown fronds at the base. Feed monthly in the growing season.",
    },
  },
  "Peace Lily": {
    about: {
      title: "About Peace Lily",
      body: "Spathiphyllum is prized for its elegant white blooms and glossy dark leaves. Native to tropical Americas, it's also known for its air-purifying qualities.",
    },
    likes: {
      title: "What it likes",
      body: "Low to medium indirect light — one of the few flowering plants that blooms in shade. Warm, humid conditions between 18–26 °C. It will droop dramatically when thirsty, then bounce right back.",
    },
    care: {
      title: "How to care",
      body: "Water when the top inch of soil dries, roughly every 5–7 days. Wipe leaves to keep them glossy. Fertilise monthly in spring and summer. Remove spent flowers at the base.",
    },
  },
  "Snake Plant": {
    about: {
      title: "About Snake Plant",
      body: "Sansevieria trifasciata (now Dracaena trifasciata) is a striking, virtually indestructible plant with stiff, sword-like leaves. It's a top pick for beginners and offices alike.",
    },
    likes: {
      title: "What it likes",
      body: "Anything from low light to bright indirect sun. It tolerates drought, dry air and neglect. Ideal temperatures are 15–30 °C.",
    },
    care: {
      title: "How to care",
      body: "Water sparingly — every 2–3 weeks, letting soil dry completely. Overwatering is the main killer. Dust leaves occasionally. Fertilise lightly once or twice during the growing season.",
    },
  },
  "Aloe Vera": {
    about: {
      title: "About Aloe Vera",
      body: "Aloe barbadensis is a succulent known for the soothing gel inside its thick leaves. It has been used for centuries in skincare and traditional medicine.",
    },
    likes: {
      title: "What it likes",
      body: "Bright, indirect to direct sunlight. Sandy, well-draining soil and warm temperatures. It stores plenty of water in its leaves, so it prefers dry conditions.",
    },
    care: {
      title: "How to care",
      body: "Water deeply every 2 weeks, allowing the soil to dry completely. Use a terracotta pot for better drainage. Avoid cold drafts. Harvest outer leaves for gel when needed.",
    },
  },
  "Fiddle Leaf": {
    about: {
      title: "About Fiddle Leaf Fig",
      body: "Ficus lyrata is a statement houseplant known for its large, violin-shaped leaves. Native to West Africa, it can become a dramatic indoor tree with the right care.",
    },
    likes: {
      title: "What it likes",
      body: "Bright, consistent indirect light — avoid moving it often. Warm, stable temperatures (18–25 °C) and moderate humidity. It dislikes cold draughts and sudden changes.",
    },
    care: {
      title: "How to care",
      body: "Water when the top 5 cm of soil is dry, roughly every 7–10 days. Wipe large leaves to remove dust. Rotate the pot monthly for even growth. Feed every 4 weeks in spring and summer.",
    },
  },
  "ZZ Plant": {
    about: {
      title: "About ZZ Plant",
      body: "Zamioculcas zamiifolia has glossy, dark-green leaflets on graceful arching stems. Native to East Africa, it stores water in potato-like rhizomes, making it extremely drought-tolerant.",
    },
    likes: {
      title: "What it likes",
      body: "Low to bright indirect light — it handles neglect and dim offices well. Average room temperature and humidity. No special requirements.",
    },
    care: {
      title: "How to care",
      body: "Water every 2–3 weeks, only when soil is fully dry. Overwatering causes root rot. Dust leaves for a shine. Virtually pest-free. Minimal fertiliser once or twice a year.",
    },
  },
  Orchid: {
    about: {
      title: "About Orchids",
      body: "Phalaenopsis, the moth orchid, is the most common indoor orchid. With proper care, it re-blooms for months, producing elegant sprays of flowers in many colours.",
    },
    likes: {
      title: "What it likes",
      body: "Bright, indirect light — an east-facing window is ideal. Warm days (20–28 °C) and slightly cooler nights. High humidity around 50–70 %.",
    },
    care: {
      title: "How to care",
      body: "Water weekly by soaking the bark medium for 10 minutes, then drain fully. Never let roots sit in water. Feed with orchid fertiliser every 2 weeks. Cut spent flower spikes above a node to encourage re-bloom.",
    },
  },
  Calathea: {
    about: {
      title: "About Calathea",
      body: "Calathea species are prized for their stunning patterned foliage. Often called prayer plants, their leaves fold upward at night. Native to Brazilian rainforests.",
    },
    likes: {
      title: "What it likes",
      body: "Medium indirect light — direct sun scorches the leaves. High humidity (60 %+), warm temperatures, and filtered or distilled water (they're sensitive to minerals).",
    },
    care: {
      title: "How to care",
      body: "Keep soil consistently moist but never waterlogged, watering every 4–5 days. Mist regularly or use a humidifier. Feed monthly with diluted fertiliser in the growing season.",
    },
  },
  "Rubber Plant": {
    about: {
      title: "About Rubber Plant",
      body: "Ficus elastica features bold, glossy leaves in deep green or burgundy. Once used to produce natural rubber, it's now a popular low-maintenance indoor tree.",
    },
    likes: {
      title: "What it likes",
      body: "Bright, indirect light for best colour. Tolerates lower light but grows slower. Prefers warm, stable temperatures and moderate humidity.",
    },
    care: {
      title: "How to care",
      body: "Water every 7–10 days when the top soil dries. Wipe leaves with a damp cloth to maintain their shine. Prune to shape. Feed monthly in spring and summer.",
    },
  },
  "Bird of Paradise": {
    about: {
      title: "About Bird of Paradise",
      body: "Strelitzia reginae brings a tropical vibe indoors with its large, banana-like leaves. In bright enough conditions, mature plants may produce their iconic bird-shaped flowers.",
    },
    likes: {
      title: "What it likes",
      body: "Bright, direct to indirect light — at least 6 hours daily. Warm temperatures (18–30 °C), good airflow, and moderate to high humidity.",
    },
    care: {
      title: "How to care",
      body: "Water every 7–10 days, allowing the top half of soil to dry. Clean large leaves with a damp cloth. Fertilise every 2 weeks in the growing season. Repot when rootbound.",
    },
  },
  "Spider Plant": {
    about: {
      title: "About Spider Plant",
      body: "Chlorophytum comosum is a cheerful, fast-growing plant that produces baby 'spiderettes' on long runners. It's one of NASA's top air-purifying plants.",
    },
    likes: {
      title: "What it likes",
      body: "Bright, indirect light but tolerates low light. Average room temperature and humidity. It's very adaptable and hard to kill.",
    },
    care: {
      title: "How to care",
      body: "Water when the top inch of soil is dry, about weekly. Brown tips often mean tap water chemicals — try filtered water. Propagate spiderettes in water or soil.",
    },
  },
  Jade: {
    about: {
      title: "About Jade Plant",
      body: "Crassula ovata is a slow-growing succulent with thick, woody stems and oval leaves. Often called the money tree, it can live for decades and develop a bonsai-like shape.",
    },
    likes: {
      title: "What it likes",
      body: "Bright light with some direct sun. Well-draining soil and low humidity. It prefers warm days and cooler nights, similar to its native South Africa.",
    },
    care: {
      title: "How to care",
      body: "Water every 2 weeks, letting soil dry fully. Reduce watering in winter. Avoid wetting leaves. Feed sparingly in spring and summer. Prune to shape as desired.",
    },
  },
  Philodendron: {
    about: {
      title: "About Philodendron",
      body: "With over 400 species, Philodendrons range from trailing vines to large upright plants. Their heart-shaped leaves and easy care make them all-time favourites.",
    },
    likes: {
      title: "What it likes",
      body: "Medium to bright indirect light. Warm temperatures (18–27 °C) and moderate humidity. They climb in nature, so a support or trailing spot works well.",
    },
    care: {
      title: "How to care",
      body: "Water when the top 2–3 cm of soil dries, roughly every 5–7 days. Yellow leaves usually mean overwatering. Feed monthly in the growing season. Wipe leaves occasionally.",
    },
  },
  Lavender: {
    about: {
      title: "About Lavender",
      body: "Lavandula is a fragrant Mediterranean herb beloved for its purple flowers and calming scent. It's traditionally used in aromatherapy, cooking and sachets.",
    },
    likes: {
      title: "What it likes",
      body: "Full sun — at least 6–8 hours of direct light. Well-draining, slightly alkaline soil. Good air circulation and low humidity. It's drought-tolerant once established.",
    },
    care: {
      title: "How to care",
      body: "Water sparingly, every 7–10 days, letting soil dry between waterings. Prune after flowering to maintain shape. Avoid rich fertilisers — lean soil produces more fragrant oils.",
    },
  },
  Dracaena: {
    about: {
      title: "About Dracaena",
      body: "Dracaena is a large genus of striking foliage plants, from the slender Marginata to the broad-leaved Fragrans. They bring architectural height to any room.",
    },
    likes: {
      title: "What it likes",
      body: "Medium to bright indirect light. Average room humidity and temperatures (18–27 °C). Sensitive to fluoride — use filtered water if possible.",
    },
    care: {
      title: "How to care",
      body: "Water every 10–14 days, allowing the top half of soil to dry. Remove yellowing lower leaves — it's natural shedding. Feed monthly in spring and summer.",
    },
  },
  Croton: {
    about: {
      title: "About Croton",
      body: "Codiaeum variegatum dazzles with bold leaves in reds, oranges, yellows and greens. Native to Southeast Asia, it's one of the most colourful houseplants available.",
    },
    likes: {
      title: "What it likes",
      body: "Bright, direct to indirect light — more light means more vivid colours. Warm, humid conditions (20–30 °C). It dislikes being moved or exposed to cold draughts.",
    },
    care: {
      title: "How to care",
      body: "Keep soil consistently moist, watering every 4–5 days. Mist regularly for humidity. Feed every 2 weeks in the growing season. Leaf drop usually signals a sudden environmental change.",
    },
  },
  Begonia: {
    about: {
      title: "About Begonia",
      body: "Begonias are a vast genus with thousands of varieties, from flowering to foliage types. Their asymmetric leaves and vibrant blooms add colour to any collection.",
    },
    likes: {
      title: "What it likes",
      body: "Bright, indirect light. Moderate warmth (18–24 °C) and humidity. Good air circulation helps prevent powdery mildew. Well-draining potting mix.",
    },
    care: {
      title: "How to care",
      body: "Water when the top inch of soil is dry, every 4–5 days. Avoid wetting leaves to prevent fungal issues. Pinch back leggy growth. Feed every 2 weeks during the growing season.",
    },
  },
  Hoya: {
    about: {
      title: "About Hoya",
      body: "Hoya, known as the wax plant, produces clusters of star-shaped, fragrant flowers. With thick, waxy leaves and trailing vines, it's both low-maintenance and rewarding.",
    },
    likes: {
      title: "What it likes",
      body: "Bright, indirect light for best blooming. Warm temperatures and moderate humidity. It likes being slightly rootbound, which actually encourages flowering.",
    },
    care: {
      title: "How to care",
      body: "Water every 7–10 days, allowing soil to dry between waterings. Don't remove old flower stalks — new blooms emerge from the same spot. Feed monthly in the growing season.",
    },
  },
  Anthurium: {
    about: {
      title: "About Anthurium",
      body: "Anthurium andraeanum is known for its glossy, heart-shaped spathes in red, pink or white. Native to Colombian rainforests, it blooms almost year-round indoors.",
    },
    likes: {
      title: "What it likes",
      body: "Bright, indirect light. Warm temperatures (20–28 °C) and high humidity (60 %+). Well-draining, airy potting mix similar to orchid bark blends.",
    },
    care: {
      title: "How to care",
      body: "Water when the top 2 cm of soil dries, roughly weekly. Mist or use a pebble tray for humidity. Feed every 6 weeks with a phosphorus-rich fertiliser for more blooms.",
    },
  },
  Ctenanthe: {
    about: {
      title: "About Ctenanthe",
      body: "Ctenanthe is a prayer plant relative with beautifully patterned leaves that fold at night. Less common than Calathea, it's equally stunning and slightly more forgiving.",
    },
    likes: {
      title: "What it likes",
      body: "Medium indirect light — avoid direct sun. High humidity and warm, stable temperatures. Like its Calathea cousins, it prefers filtered water.",
    },
    care: {
      title: "How to care",
      body: "Keep soil evenly moist, watering every 3–4 days. Mist frequently or group with other humidity-loving plants. Feed monthly in spring and summer with diluted fertiliser.",
    },
  },
};

export function getPlantInfo(plantName: string): PlantInfo {
  if (plantDatabase[plantName]) {
    return plantDatabase[plantName];
  }

  // Fallback for unknown plants
  return {
    about: {
      title: `About ${plantName}`,
      body: `${plantName} is a beautiful houseplant that can brighten any space. Each plant has its own personality — observe yours over time to learn its unique needs and rhythms.`,
    },
    likes: {
      title: "What it likes",
      body: "Most houseplants enjoy bright, indirect light and consistent watering. Check specific care guides for your variety to find its ideal conditions.",
    },
    care: {
      title: "How to care",
      body: "Water when the top layer of soil feels dry. Ensure good drainage to prevent root rot. Dust leaves regularly and fertilise during the growing season for best results.",
    },
  };
}
