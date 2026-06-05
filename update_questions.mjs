import fs from 'fs';

const newData = {
  "GQ1": {
    "fact": "Nepal rises from 60 m in the Terai to 8,849 m at Everest's summit — all within just 200 km.",
    "why": "Your region sets the heating multiplier for your entire footprint."
  },
  "GQ2": {
    "fact": "About two-thirds of Nepali households still cook with firewood or dung.",
    "why": "Urban and rural areas have very different fuel access, which directly changes how we calculate your cooking emissions. https://dhsprogram.com/pubs/pdf/FR336/FR336.pdf"
  },
  "GQ3": {
    "fact": "Nepal's average household has 4.4 people, and sharing a home splits the carbon cost of cooking, heating, and appliances.",
    "why": "We divide shared household emissions by the number of members to arrive at each person's individual score. https://censusnepal.cbs.gov.np/"
  },
  "A1": {
    "fact": "A traditional mud, stone, or timber home carries about 40% less embodied carbon than a concrete one.",
    "why": "Building materials lock in carbon before you even move in, so home type affects your baseline footprint. https://www.sciencedirect.com/science/article/pii/S2666049024000057"
  },
  "A2": {
    "fact": "Every extra 10 m² of concrete floor locks in roughly 7,200 kg CO₂ over the building's lifetime.",
    "why": "Floor area scales all home-related emissions — larger homes use more materials, more heating, and more electricity. https://www.sciencedirect.com/science/article/pii/S2666049024000057"
  },
  "A3": {
    "fact": "Household air pollution from cooking fires kills around 3.2 million people globally each year and is Nepal's 4th-leading health risk factor.",
    "why": "Cooking fuel is usually the largest single emission source for a Nepali household. https://www.who.int/news-room/fact-sheets/detail/household-air-pollution-and-health"
  },
  "A4": {
    "fact": "An improved cookstove roughly halves the wood burned, and a rocket stove cuts it by about 60%.",
    "why": "Stove type is the key modifier on firewood emissions — the same family can have very different scores depending on what they cook on. https://www.cleancookingalliance.org/technology-and-fuels/stoves/"
  },
  "A5": {
    "fact": "Each standard 14.2 kg cylinder produces roughly the same emissions as driving a petrol car 4,000 km.",
    "why": "Standard cylinder sizes make this one of the most precise calculations in the survey. https://cen.org.np/uploads/doc/7756-final-baseline-study-on-fuel-economy-of-ldv-in-nepal-report-60b94185c44ff.pdf"
  },
  "A6": {
    "fact": "Over 80% of Nepal's crop residue burning happens between February and May, releasing around 4.1 million tonnes of CO₂ each year.",
    "why": "Agricultural burning is a common emission source that most carbon calculators miss entirely. https://pubmed.ncbi.nlm.nih.gov/32763722/"
  },
  "A7": {
    "fact": "Nepal's grid is about 99.8% hydropower — roughly 400 times cleaner than India's grid next door.",
    "why": "Nepal's clean grid means we can fairly credit electric cooking and heating as low-carbon choices. https://www.iea.org/data-and-statistics/data-tools/electricity-information"
  },
  "A8": {
    "fact": "A mountain home heating with coal emits about 4,500 kg CO₂ per season — seven times more than a Terai home.",
    "why": "Geography and fuel type together create the biggest variation in heating emissions, so we need both to calculate accurately. https://www.ipcc-nggip.iges.or.jp/public/2006gl/"
  },
  "B1": {
    "fact": "Swapping a 5 km car commute for a bicycle saves about 600 kg CO₂ per year.",
    "why": "Daily commuting happens 250+ days a year, so even a small change in mode has a large annual impact. https://ourworldindata.org/travel-carbon-footprint"
  },
  "B2": {
    "fact": "A petrol car driven 100–300 km per week emits around 4,000 kg CO₂ per year — more than six times the average Nepali's entire annual footprint.",
    "why": "Private vehicle distance is the single biggest transport variable, so we need kilometres driven to calculate it accurately. https://ourworldindata.org/travel-carbon-footprint"
  },
  "B3": {
    "fact": "Flying emits about 180 g CO₂ per passenger-km — nearly double the emissions of a long-distance bus for the same journey.",
    "why": "Flights have a very different emission rate from ground transport, so we track them separately. https://www.icao.int/environmental-protection/CarbonOffset/Pages/default.aspx"
  },
  "B4": {
    "fact": "A single long-haul return flight produces 1,500 to 3,000 kg CO₂ — up to five years' worth of an average Nepali's footprint.",
    "why": "For those who travel abroad, one flight can easily be the largest item in their entire carbon footprint. https://www.icao.int/environmental-protection/CarbonOffset/Pages/default.aspx"
  },
  "B5": {
    "fact": "A full bus splits its fuel emissions across about 40 passengers, making it far greener than travelling by private car.",
    "why": "We include bus travel to fairly credit those who choose the most carbon-efficient motorised option. https://ourworldindata.org/travel-carbon-footprint"
  },
  "C1": {
    "fact": "A vegetarian dal-bhat diet has roughly half the carbon footprint of a meat-heavy diet.",
    "why": "What you eat is the single biggest variable in food-related emissions. https://www.science.org/doi/full/10.1126/science.aaq0216"
  },
  "C2": {
    "fact": "If global food waste were a country, it would be the world's third-largest emitter, responsible for 8–10% of all greenhouse gases.",
    "why": "Wasted food carries all the carbon of producing it, for nothing. https://unfccc.int/news/food-loss-and-waste-account-for-8-10-of-annual-global-greenhouse-gas-emissions-cost-usd-1-trillion"
  },
  "C3": {
    "fact": "Transport and packaging typically account for a much smaller share of food emissions than production itself.",
    "why": "Supply chain length determines how much carbon is added through transport, storage, and packaging. https://www.science.org/doi/full/10.1126/science.aaq0216"
  },
  "C4": {
    "fact": "Flooded rice paddies are one of the planet's biggest methane sources, and methane is about 28 times more potent than CO₂.",
    "why": "Flooded paddy farming generates significant methane emissions that most calculators overlook. https://www.fao.org/newsroom/detail/Food-systems-account-for-more-than-one-third-of-global-greenhouse-gas-emissions/en"
  },
  "C5": {
    "fact": "A single cow or buffalo produces enough methane each year to equal about 1,500 kg CO₂, and livestock is Nepal's single largest source of greenhouse gases.",
    "why": "Livestock ownership is a major emission source for rural households that most calculators never ask about. (Nepal BUR1 2025, Table 22)"
  },
  "D1": {
    "fact": "Producing one cotton T-shirt requires about 2,700 litres of water — enough drinking water for one person for two and a half years.",
    "why": "Manufacturing drives most of the carbon in clothing, so the number of new items bought is the key figure. https://wwf.panda.org/wwf_news/?199832/Help-us-save-the-t-shirt"
  },
  "D2": {
    "fact": "Buying second-hand cuts a garment's carbon footprint by about 60%.",
    "why": "Second-hand purchases reuse what already exists, breaking the manufacturing cycle that creates most clothing emissions. https://www.researchgate.net/publication/383269526_Do_We_Save_the_Environment_by_Buying_Second-Hand_Clothes"
  },
  "D3": {
    "fact": "About 80% of a device's lifetime carbon comes from manufacturing it, not from using it.",
    "why": "Keeping devices longer is the most impactful electronics action, especially on Nepal's clean grid where usage emissions are minimal. https://www.apple.com/environment/pdf/products/iphone/iPhone_15_PER_Sept2023.pdf"
  },
  "D4": {
    "fact": "Plastic is made from fossil fuels and generates about 2 kg CO₂ for every kilogram produced.",
    "why": "Plastic production is a direct fossil-fuel consumption, giving it a carbon cost that adds up at the household level. https://www.ciel.org/wp-content/uploads/2021/10/Plastic-is-Carbon-Oct2021.pdf"
  },
  "E1": {
    "fact": "Organic waste rotting in open dumps releases methane, which traps about 28 times more heat than CO₂.",
    "why": "How waste is disposed of determines whether it releases CO₂ or the far more potent methane. https://www.ipcc-nggip.iges.or.jp/public/2006gl/"
  },
  "E2": {
    "fact": "Open burning releases about 2 kg CO₂ for every kilogram of waste, plus toxic fumes with no filter.",
    "why": "Trash burning is a common but often invisible emission source with direct health impacts for everyone nearby. https://www.ciel.org/wp-content/uploads/2021/10/Plastic-is-Carbon-Oct2021.pdf"
  },
  "E3": {
    "fact": "Nepal's non-sewered toilets emit an estimated 2,618 Gg CO₂ equivalent in methane each year — nearly double the country's entire official waste sector.",
    "why": "Sanitation type drives significant methane emissions that almost no household survey asks about. https://www.sciencedirect.com/science/article/pii/S026974912400962X"
  },
  "E4": {
    "fact": "In Nepal, most of the carbon related to bathing comes from heating the water, not the water itself.",
    "why": "Water heating is an overlooked energy use, and in Kathmandu reducing water use also matters for local water scarcity. https://www.wateraid.org/np/our-work"
  },
  "F1": {
    "fact": "One hour of video streaming produces about 36 g CO₂, mostly from data centres abroad rather than your local electricity.",
    "why": "Streaming carbon is driven by foreign server energy use, so it counts even though Nepal's electricity is nearly emissions-free. https://www.iea.org/energy-system/buildings/data-centres-and-data-transmission-networks"
  },
  "F2": {
    "fact": "A single AI query uses about 2.5 g CO₂ — roughly five to ten times more than a standard Google search.",
    "why": "AI tools are a new and fast-growing source of digital emissions that now belong in any up-to-date carbon calculator. https://www.iea.org/energy-system/buildings/data-centres-and-data-transmission-networks"
  },
  "F3": {
    "fact": "About 80% of a device's lifetime carbon comes from making it — manufacturing a smartphone produces around 70 kg CO₂, and a laptop around 300 kg.",
    "why": "On Nepal's hydro grid, device usage is nearly carbon-free, so the number of devices owned is what drives the score. https://www.apple.com/environment/pdf/products/iphone/iPhone_15_PER_Sept2023.pdf"
  },
  "F4": {
    "fact": "Every gigabyte of data transferred costs about 0.06 kg CO₂ in data centre and network energy.",
    "why": "Data use routes through energy-intensive foreign servers, so it carries a carbon cost regardless of Nepal's clean local grid. https://www.iea.org/energy-system/buildings/data-centres-and-data-transmission-networks"
  }
};

let content = fs.readFileSync('c:/CFC/src/data/questions.js', 'utf8');

// The file exports questions array. We need to update the "en" fields in "fact" and "why" for each question block.
// A safe way is to regex replace the fact and why blocks, specifically the "en" values, block by block.

for (const [id, data] of Object.entries(newData)) {
  // Find the block for this id.
  // We look for: "id": "GQ1", ... "fact": { "en": "old", "np": "old" }, "why": { "en": "old", "np": "old" }
  
  // Regex to match the question object start and then replace its fact/why
  // To keep it simple, we'll parse the file by removing `export const questions = ` and then stringifying it back.
  // BUT the file has single quotes, functions, or anything else? It's pure JSON-like JS.
}

// Actually, evaluating the file might be easier, but let's just do a string replacement.
// We'll match `"id": "GQ1"` and then replace the next `"fact": { "en": "...", ` with `"fact": { "en": "NEW", `
// This is fragile. Better approach: eval the JS to get the array, modify it, and write it back as formatted JS.

import { pathToFileURL } from 'url';
const fileUrl = pathToFileURL('c:/CFC/src/data/questions.js').href;

import(fileUrl).then(module => {
  const questions = module.questions;
  
  questions.forEach(q => {
    if (newData[q.id]) {
      q.fact.en = newData[q.id].fact;
      q.why.en = newData[q.id].why;
    }
  });
  
  // Now we stringify the object. But JSON.stringify doesn't format it as cleanly as the original.
  // That's fine, we can format it decently.
  const newContent = "export const questions = " + JSON.stringify(questions, null, 2) + ";\n";
  
  fs.writeFileSync('c:/CFC/src/data/questions.js', newContent, 'utf8');
  console.log("Updated questions.js successfully!");
});
