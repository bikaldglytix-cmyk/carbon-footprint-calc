import fs from 'fs';

// 1. UPDATE QUESTIONS.JS
const qFile = './src/data/questions.js';
let rawQ = fs.readFileSync(qFile, 'utf8');

const match = rawQ.match(/export const questions = (\[.*\]);/s);
if (match) {
  let questions = eval(match[1]);
  
  // Create mapping for shifted IDs
  const idMap = {
    'A1': 'A3', 'A2': 'A4', 'A3': 'A5', 'A4': 'A6', 'A5': 'A7', 'A6': 'A8'
  };

  // Update existing questions first
  questions = questions.map(q => {
    let newId = idMap[q.id] || q.id;
    let newRelatedTo = idMap[q.relatedTo] || q.relatedTo;
    
    // Also update any relatedText that might reference old A1-A6
    let newRelatedTextEn = q.relatedText?.en || '';
    let newRelatedTextNp = q.relatedText?.np || '';
    for (const [oldId, newTarget] of Object.entries(idMap)) {
      newRelatedTextEn = newRelatedTextEn.replace(`(${oldId})`, `(${newTarget})`);
      newRelatedTextNp = newRelatedTextNp.replace(`(${oldId})`, `(${newTarget})`);
    }

    // Specific update for new A3 options based on region
    let options = q.options;
    if (newId === 'A3') {
        // Was old A1 (Cooking fuel). Wait, the options for firewood in the prompt says:
        // "Firewood / दाउरा — Urban 0 kg, Semi-urban 450 kg, Rural Hills/Terai 1,000 kg, Rural Highland/Mountain 1,450 kg"
        // This is exactly what was there before!
    }

    return {
      ...q,
      id: newId,
      relatedTo: newRelatedTo,
      relatedText: q.relatedText ? {
        en: newRelatedTextEn,
        np: newRelatedTextNp
      } : undefined,
      options: options
    };
  });

  // Insert new A1 and A2 at the correct position (after GQ2, before A3)
  const a1 = {
    id: "A1",
    category: { en: "Home & Energy", np: "घर र ऊर्जा" },
    q: { en: "What is your home mainly built from? (one-time construction emissions, shown per year)", np: "तपाईंको घर मुख्यतया केले बनेको हो?" },
    story: { en: "The walls that shelter us...", np: "हामीलाई आश्रय दिने पर्खालहरू..." },
    fact: { en: "Embodied emissions from building materials represent a large share of a home’s lifetime footprint.", np: "निर्माण सामग्रीबाट हुने उत्सर्जनले घरको जीवनभरको कार्बन छापको ठूलो हिस्सा ओगट्छ।" },
    why: { en: "Building a house is a one-time event, but its material footprint is large and lasts the life of the building.", np: "घर बनाउने एक पटकको काम हो, तर यसको भौतिक प्रभाव ठूलो हुन्छ र घर रहुन्जेल रहन्छ।" },
    relatedTo: "A2",
    relatedText: { en: "Links to Home Size (A2)", np: "घरको आकार (A2) सँग सम्बन्धित" },
    options: [
      { id: "concrete", label: { en: "Modern concrete (cement, brick, steel)", np: "आधुनिक कंक्रिट (सिमेन्ट, इँटा, स्टिल)" }, parts: { home: 0.8 } },
      { id: "traditional", label: { en: "Traditional (mud, stone, timber)", np: "परम्परागत (माटो, ढुङ्गा, काठ)" }, parts: { home: 0.4 } },
      { id: "dontknow", label: { en: "Don't know", np: "थाहा छैन" }, parts: { home: 0.8 } }
    ]
  };

  const a2 = {
    id: "A2",
    category: { en: "Home & Energy", np: "घर र ऊर्जा" },
    q: { en: "How big is your home?", np: "तपाईंको घर कति ठूलो छ?" },
    story: { en: "The space we live in...", np: "हामी बस्ने ठाउँ..." },
    fact: { en: "The average Nepali dwelling size is 55.3 m².", np: "नेपालमा औसत घरको आकार ५५.३ वर्ग मिटर छ।" },
    why: { en: "The size of a home directly scales the amount of materials needed for construction.", np: "घरको आकारले निर्माणको लागि आवश्यक सामग्रीको मात्रा निर्धारण गर्छ।" },
    relatedTo: "A1",
    relatedText: { en: "Links to Home Construction (A1)", np: "घर निर्माण (A1) सँग सम्बन्धित" },
    options: [
      { id: "national_avg", label: { en: "National average (55 m²)", np: "राष्ट्रिय औसत (५५ m²)" }, parts: { home: 0.5 } },
      { id: "rooms_1", label: { en: "1 room", np: "१ कोठा" }, parts: { home: 0.1 } },
      { id: "rooms_2", label: { en: "2 rooms", np: "२ कोठा" }, parts: { home: 0.2 } },
      { id: "rooms_3", label: { en: "3 rooms", np: "३ कोठा" }, parts: { home: 0.3 } },
      { id: "rooms_4", label: { en: "4 rooms", np: "४ कोठा" }, parts: { home: 0.4 } },
      { id: "rooms_5", label: { en: "5 rooms", np: "५ कोठा" }, parts: { home: 0.5 } },
      { id: "rooms_6plus", label: { en: "6+ rooms", np: "६+ कोठा" }, parts: { home: 0.7 } }
    ]
  };

  // Find index of GQ2
  const gq2Index = questions.findIndex(q => q.id === 'GQ2');
  questions.splice(gq2Index + 1, 0, a1, a2);

  const newContent = `export const questions = ${JSON.stringify(questions, null, 2)};\n`;
  fs.writeFileSync(qFile, newContent);
  console.log("Updated questions.js");
}

// 2. UPDATE EMISSION-FACTORS.JSON
const efFile = './src/data/emission-factors.json';
let ef = JSON.parse(fs.readFileSync(efFile, 'utf8'));

// Shift A1-A6 to A3-A8
const newQuestionsEF = {};
for (const [key, value] of Object.entries(ef.questions)) {
  if (['A1', 'A2', 'A3', 'A4', 'A5', 'A6'].includes(key)) {
    const newKey = `A${parseInt(key[1]) + 2}`;
    
    // Update internal references like isMultiplierFor
    if (value.isMultiplierFor === 'A1_firewood') {
        value.isMultiplierFor = 'A3_firewood';
    }

    newQuestionsEF[newKey] = value;
  } else {
    newQuestionsEF[key] = value;
  }
}

// Add A1 and A2
newQuestionsEF['A1'] = {
  options: {
    concrete: { id: "concrete", value: 790 },
    traditional: { id: "traditional", value: 475 },
    dontknow: { id: "dontknow", value: 790 }
  }
};
newQuestionsEF['A2'] = {
  isMultiplierFor: "A1",
  options: {
    national_avg: { id: "national_avg", multiplier: 1.0 },
    rooms_1: { id: "rooms_1", multiplier: 1/4.8 },
    rooms_2: { id: "rooms_2", multiplier: 2/4.8 },
    rooms_3: { id: "rooms_3", multiplier: 3/4.8 },
    rooms_4: { id: "rooms_4", multiplier: 4/4.8 },
    rooms_5: { id: "rooms_5", multiplier: 5/4.8 },
    rooms_6plus: { id: "rooms_6plus", multiplier: 6.5/4.8 }
  }
};

// Sort keys alphabetically so it looks nice
const sortedKeys = Object.keys(newQuestionsEF).sort((a, b) => {
  // Sort GQ first, then A, B, C etc
  if (a.startsWith('GQ') && !b.startsWith('GQ')) return -1;
  if (!a.startsWith('GQ') && b.startsWith('GQ')) return 1;
  return a.localeCompare(b);
});
ef.questions = {};
for (const k of sortedKeys) {
  ef.questions[k] = newQuestionsEF[k];
}

fs.writeFileSync(efFile, JSON.stringify(ef, null, 2));
console.log("Updated emission-factors.json");

// 3. UPDATE update_questions.js
let uqFile = './update_questions.js';
let uqContent = fs.readFileSync(uqFile, 'utf8');

const uqIdMap = {
    'A1': 'A3', 'A2': 'A4', 'A3': 'A5', 'A4': 'A6', 'A5': 'A7', 'A6': 'A8'
};

// Replace keys in extraData
for (const old of ['A6', 'A5', 'A4', 'A3', 'A2', 'A1']) { // reverse order to avoid A1 -> A3 -> A5
    uqContent = uqContent.replace(new RegExp(`'${old}': {`, 'g'), `'${uqIdMap[old]}': {`);
}
// Replace references in relatedTo
for (const old of ['A6', 'A5', 'A4', 'A3', 'A2', 'A1']) {
    uqContent = uqContent.replace(new RegExp(`relatedTo: '${old}'`, 'g'), `relatedTo: '${uqIdMap[old]}'`);
    uqContent = uqContent.replace(new RegExp(`\\(${old}\\)`, 'g'), `(${uqIdMap[old]})`);
}

// Add A1 and A2 to extraData
const extraDataInsert = `
  'A1': {
    why: { en: 'Building a house is a one-time event, but its material footprint is large and lasts the life of the building.', np: 'घर बनाउने एक पटकको काम हो, तर यसको भौतिक प्रभाव ठूलो हुन्छ र घर रहुन्जेल रहन्छ।' },
    relatedTo: 'A2', relatedText: { en: 'Links to Home Size (A2)', np: 'घरको आकार (A2) सँग सम्बन्धित' }
  },
  'A2': {
    why: { en: 'The size of a home directly scales the amount of materials (cement, steel, brick) needed for construction.', np: 'घरको आकारले निर्माणको लागि आवश्यक सामग्रीको मात्रा निर्धारण गर्छ।' },
    relatedTo: 'A1', relatedText: { en: 'Links to Home Construction (A1)', np: 'घर निर्माण (A1) सँग सम्बन्धित' }
  },`;

uqContent = uqContent.replace(`const extraData = {`, `const extraData = {${extraDataInsert}`);
fs.writeFileSync(uqFile, uqContent);
console.log("Updated update_questions.js");
