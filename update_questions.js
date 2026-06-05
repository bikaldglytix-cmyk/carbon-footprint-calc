import fs from 'fs';

const extraData = {
  'GQ1': {
    why: { en: 'Geography dictates heating needs and transport difficulty.', np: 'भूगोलले घर तताउने आवश्यकता र यातायातको कठिनाइ निर्धारण गर्छ।' },
    relatedTo: 'A6', relatedText: { en: 'Links to Winter Heating (A6)', np: 'जाडोमा घर तताउने (A6) सँग सम्बन्धित' }
  },
  'GQ2': {
    why: { en: 'Urban and rural areas have different access to clean fuels and public transit.', np: 'सहर र गाउँमा सफा इन्धन र सार्वजनिक यातायातको पहुँच फरक हुन्छ।' },
    relatedTo: 'A3', relatedText: { en: 'Links to Cooking Fuel (A3)', np: 'खाना पकाउने इन्धन (A3) सँग सम्बन्धित' }
  },
  'A1': {
    why: { en: 'Building a house is a one-time event, but its material footprint is large and lasts the life of the building.', np: 'घर बनाउने एक पटकको काम हो, तर यसको भौतिक प्रभाव ठूलो हुन्छ र घर रहुन्जेल रहन्छ।' },
    relatedTo: 'A2', relatedText: { en: 'Links to Home Size (A2)', np: 'घरको आकार (A2) सँग सम्बन्धित' }
  },
  'A2': {
    why: { en: 'The size of a home directly scales the amount of materials (cement, steel, brick) needed for construction.', np: 'घरको आकारले निर्माणको लागि आवश्यक सामग्रीको मात्रा निर्धारण गर्छ।' },
    relatedTo: 'A1', relatedText: { en: 'Links to Home Construction (A1)', np: 'घर निर्माण (A1) सँग सम्बन्धित' }
  },
  'A3': {
    why: { en: 'Cooking is a daily activity. The fuel used heavily impacts indoor air quality and carbon emissions.', np: 'खाना पकाउने इन्धनले घरभित्रको हावा र कार्बन उत्सर्जनमा ठूलो असर गर्छ।' },
    relatedTo: 'A4', relatedText: { en: 'Links to Stove Type (A4)', np: 'चुलोको प्रकार (A4) सँग सम्बन्धित' }
  },
  'A4': {
    why: { en: 'The efficiency of the stove determines how much fuel is wasted as smoke.', np: 'चुलोको दक्षताले कति इन्धन धुवाँ बनेर खेर जान्छ भन्ने निर्धारण गर्छ।' },
    relatedTo: 'A3', relatedText: { en: 'Links to Cooking Fuel (A3)', np: 'खाना पकाउने इन्धन (A3) सँग सम्बन्धित' }
  },
  'A5': {
    why: { en: 'LPG is imported fossil fuel; reducing its use directly cuts national emissions.', np: 'एलपीजी आयातित जीवाश्म इन्धन हो; यसको प्रयोग घटाउँदा राष्ट्रिय उत्सर्जन घट्छ।' },
    relatedTo: 'A3', relatedText: { en: 'Links to Cooking Fuel (A3)', np: 'खाना पकाउने इन्धन (A3) सँग सम्बन्धित' }
  },
  'A6': {
    why: { en: 'Agricultural fires release black carbon, which settles on Himalayan glaciers and accelerates melting.', np: 'कृषि फोहोर जलाउँदा निस्कने कालो कार्बनले हिमाल पग्लन मद्दत गर्छ।' },
    relatedTo: 'E2', relatedText: { en: 'Links to Trash Burning (E2)', np: 'फोहोर जलाउने (E2) सँग सम्बन्धित' }
  },
  'A7': {
    why: { en: 'While Nepal\'s grid is clean hydropower, energy conservation still matters for peak loads.', np: 'नेपालको बिजुली सफा भए पनि, ऊर्जा बचत महत्त्वपूर्ण छ।' },
    relatedTo: 'F1', relatedText: { en: 'Links to Digital Video Streaming (F1)', np: 'भिडियो स्ट्रिमिङ (F1) सँग सम्बन्धित' }
  },
  'A8': {
    why: { en: 'Winter heating requires massive energy. Using firewood releases large amounts of CO2.', np: 'जाडोमा घर तताउन धेरै ऊर्जा लाग्छ, र दाउराले धेरै CO2 निकाल्छ।' },
    relatedTo: 'GQ1', relatedText: { en: 'Links to Geographic Region (GQ1)', np: 'भौगोलिक क्षेत्र (GQ1) सँग सम्बन्धित' }
  },
  'B1': {
    why: { en: 'Daily commuting is a major chunk of an individual\'s transport footprint.', np: 'दैनिक यात्रा व्यक्तिगत यातायात छापको मुख्य हिस्सा हो।' },
    relatedTo: 'B2', relatedText: { en: 'Links to Vehicle Ownership (B2)', np: 'सवारीसाधन स्वामित्व (B2) सँग सम्बन्धित' }
  },
  'B2': {
    why: { en: 'Owning a petrol/diesel vehicle locks you into years of fossil fuel consumption.', np: 'निजी गाडीले वर्षौंसम्म जीवाश्म इन्धन खपत गराउँछ।' },
    relatedTo: 'B1', relatedText: { en: 'Links to Daily Commute (B1)', np: 'दैनिक यात्रा (B1) सँग सम्बन्धित' }
  },
  'B3': {
    why: { en: 'Air travel is the most carbon-intensive form of transport per kilometer.', np: 'हवाई यात्रा प्रति किलोमिटर सबैभन्दा बढी कार्बन उत्सर्जन गर्ने यातायात हो।' },
    relatedTo: 'B5', relatedText: { en: 'Links to Long-Distance Bus (B5)', np: 'लामो दूरीको बस (B5) सँग सम्बन्धित' }
  },
  'B4': {
    why: { en: 'A single international flight can emit more CO2 than months of normal living.', np: 'एउटा अन्तर्राष्ट्रिय उडानले महिनौंको साधारण जीवनभन्दा बढी CO2 निकाल्न सक्छ।' },
    relatedTo: 'B3', relatedText: { en: 'Links to Domestic Flights (B3)', np: 'आन्तरिक उडान (B3) सँग सम्बन्धित' }
  },
  'B5': {
    why: { en: 'Buses are the backbone of Nepal\'s transport, offering a lower-carbon alternative to flying.', np: 'बसहरू हवाई उडानभन्दा कम कार्बन उत्सर्जन गर्ने विकल्प हुन्।' },
    relatedTo: 'B3', relatedText: { en: 'Links to Domestic Flights (B3)', np: 'आन्तरिक उडान (B3) सँग सम्बन्धित' }
  },
  'C1': {
    why: { en: 'Meat production requires far more land, water, and feed than plant-based foods.', np: 'मासु उत्पादन गर्न वनस्पतिभन्दा धेरै जमिन र पानी लाग्छ।' },
    relatedTo: 'C2', relatedText: { en: 'Links to Red Meat Frequency (C2)', np: 'रातो मासुको आवृत्ति (C2) सँग सम्बन्धित' }
  },
  'C2': {
    why: { en: 'Ruminant animals (cows, buffalo, goats, sheep) release methane during digestion.', np: 'गाई, राँगा र बाख्राले पाचनको क्रममा मिथेन निकाल्छन्।' },
    relatedTo: 'C6', relatedText: { en: 'Links to Livestock Ownership (C6)', np: 'पशुपालन (C6) सँग सम्बन्धित' }
  },
  'C3': {
    why: { en: 'Food waste in landfills rots anaerobically, producing methane.', np: 'फोहोरमा खाना कुहिँदा मिथेन बन्छ।' },
    relatedTo: 'E1', relatedText: { en: 'Links to Waste Management (E1)', np: 'फोहोर व्यवस्थापन (E1) सँग सम्बन्धित' }
  },
  'C4': {
    why: { en: 'Imported and packaged food travels thousands of miles, adding "food miles" to your footprint.', np: 'आयातित खाना हजारौं माइल यात्रा गर्छ, जसले उत्सर्जन बढाउँछ।' },
    relatedTo: 'D4', relatedText: { en: 'Links to Single-Use Plastics (D4)', np: 'एकल प्रयोगको प्लास्टिक (D4) सँग सम्बन्धित' }
  },
  'C5': {
    why: { en: 'Flooded rice paddies lack oxygen, causing microbes to release methane.', np: 'पानी जमेको धानखेतका जीवाणुहरूले मिथेन निकाल्छन्।' },
    relatedTo: 'C6', relatedText: { en: 'Links to Livestock Ownership (C6)', np: 'पशुपालन (C6) सँग सम्बन्धित' }
  },
  'C6': {
    why: { en: 'Livestock directly emit methane, a greenhouse gas 28 times stronger than CO2.', np: 'पशुपालनले CO2 भन्दा २८ गुणा शक्तिशाली मिथेन ग्यास निकाल्छ।' },
    relatedTo: 'C2', relatedText: { en: 'Links to Red Meat Diet (C2)', np: 'रातो मासुको आहार (C2) सँग सम्बन्धित' }
  },
  'D1': {
    why: { en: '"Fast fashion" involves massive water use, chemical dyes, and international shipping.', np: '"फास्ट फेसन" ले धेरै पानी, रसायन र अन्तर्राष्ट्रिय ढुवानी प्रयोग गर्छ।' },
    relatedTo: 'D2', relatedText: { en: 'Links to Second-Hand Buying (D2)', np: 'सेकेन्डह्याण्ड खरिद (D2) सँग सम्बन्धित' }
  },
  'D2': {
    why: { en: 'Reusing items stops the need for new manufacturing, bypassing massive emissions.', np: 'सामानको पुनः प्रयोगले नयाँ उत्पादनको उत्सर्जनलाई रोक्छ।' },
    relatedTo: 'D1', relatedText: { en: 'Links to Buying New Clothes (D1)', np: 'नयाँ लुगा खरिद (D1) सँग सम्बन्धित' }
  },
  'D3': {
    why: { en: 'E-waste and rare earth metal mining for electronics devastate ecosystems.', np: 'इलेक्ट्रोनिक्सको लागि खानी उत्खननले पारिस्थितिक प्रणाली नष्ट गर्छ।' },
    relatedTo: 'F3', relatedText: { en: 'Links to Device Ownership (F3)', np: 'उपकरण स्वामित्व (F3) सँग सम्बन्धित' }
  },
  'D4': {
    why: { en: 'Plastic never truly degrades; it breaks into microplastics and is made entirely from oil.', np: 'प्लास्टिक कहिल्यै कुहिँदैन, यो तेलबाट बनेको हुन्छ।' },
    relatedTo: 'E2', relatedText: { en: 'Links to Burning Plastic (E2)', np: 'प्लास्टिक जलाउने (E2) सँग सम्बन्धित' }
  },
  'E1': {
    why: { en: 'Proper waste management prevents methane leaks from landfills.', np: 'उचित फोहोर व्यवस्थापनले मिथेन चुहावट रोक्छ।' },
    relatedTo: 'C3', relatedText: { en: 'Links to Food Waste (C3)', np: 'खाद्य फोहोर (C3) सँग सम्बन्धित' }
  },
  'E2': {
    why: { en: 'Open burning of waste is one of the leading causes of toxic air in South Asia.', np: 'खुल्ला फोहोर जलाउनु दक्षिण एसियामा वायु प्रदूषणको मुख्य कारण हो।' },
    relatedTo: 'A6', relatedText: { en: 'Links to Burning Crop Residue (A6)', np: 'कृषि फोहोर जलाउने (A6) सँग सम्बन्धित' }
  },
  'E3': {
    why: { en: 'Human waste breaks down into methane if not properly composted or treated.', np: 'मानव मलमुत्र राम्ररी प्रशोधन गरिएन भने मिथेन बन्छ।' },
    relatedTo: 'E1', relatedText: { en: 'Links to Solid Waste Management (E1)', np: 'फोहोर व्यवस्थापन (E1) सँग सम्बन्धित' }
  },
  'E4': {
    why: { en: 'Heating water requires a lot of energy. Shorter showers save water and power.', np: 'पानी तताउन धेरै ऊर्जा लाग्छ। कम पानी प्रयोग गर्दा ऊर्जा बच्छ।' },
    relatedTo: 'A7', relatedText: { en: 'Links to Electric Usage (A7)', np: 'विद्युत् खपत (A7) सँग सम्बन्धित' }
  },
  'F1': {
    why: { en: 'Streaming requires massive data centers that consume gigawatts of electricity globally.', np: 'स्ट्रिमिङको लागि विशाल डाटा सेन्टरहरू चाहिन्छ जसले धेरै बिजुली खपत गर्छन्।' },
    relatedTo: 'F4', relatedText: { en: 'Links to Mobile Data Usage (F4)', np: 'मोबाइल डाटा खपत (F4) सँग सम्बन्धित' }
  },
  'F2': {
    why: { en: 'AI models require intense computational power and specialized water-cooled servers.', np: 'AI मोडेलहरूलाई धेरै कम्प्युटिङ शक्ति र सर्भर चिस्याउने पानी चाहिन्छ।' },
    relatedTo: 'F1', relatedText: { en: 'Links to Video Streaming (F1)', np: 'भिडियो स्ट्रिमिङ (F1) सँग सम्बन्धित' }
  },
  'F3': {
    why: { en: 'Every device you own required mining, manufacturing, and shipping from across the world.', np: 'प्रत्येक उपकरणले खानी, उत्पादन र अन्तर्राष्ट्रिय ढुवानीको माग गर्दछ।' },
    relatedTo: 'D3', relatedText: { en: 'Links to Buying New Electronics (D3)', np: 'नयाँ इलेक्ट्रोनिक्स खरिद (D3) सँग सम्बन्धित' }
  },
  'F4': {
    why: { en: 'Cell towers and 4G/5G networks use vast amounts of energy to beam data to your phone.', np: 'सेल टावर र 4G/5G नेटवर्कहरूले धेरै ऊर्जा खपत गर्छन्।' },
    relatedTo: 'F1', relatedText: { en: 'Links to Video Streaming (F1)', np: 'भिडियो स्ट्रिमिङ (F1) सँग सम्बन्धित' }
  }
};

const rawFile = fs.readFileSync('./src/data/questions.js', 'utf8');

// We'll extract the JSON string part roughly
const match = rawFile.match(/export const questions = (\[.*\]);/s);
if (match) {
  let questions;
  try {
     // Using eval safely here since we control the source file
     questions = eval(match[1]);
  } catch(e) {
     console.error("Eval failed", e);
     process.exit(1);
  }

  questions = questions.map(q => {
    if (extraData[q.id]) {
      return {
        ...q,
        why: extraData[q.id].why,
        relatedTo: extraData[q.id].relatedTo,
        relatedText: extraData[q.id].relatedText
      };
    }
    return q;
  });

  const newContent = `export const questions = ${JSON.stringify(questions, null, 2)};\n`;
  fs.writeFileSync('./src/data/questions.js', newContent);
  console.log("Updated questions.js successfully!");
} else {
  console.log("Could not parse questions.js");
}
