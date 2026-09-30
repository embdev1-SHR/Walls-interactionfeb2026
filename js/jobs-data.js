/**
 * jobs-data.js — the occupations set, defined once
 * ══════════════════════════════════════════════════════════════════
 *
 * Eight vocational activities read from this one list:
 *
 *   Job Hats            headgear  -> worker
 *   Tools of the Trade  tools[]   -> worker
 *   Where Do They Work? place     -> worker
 *   Sounds of Work      sound     -> worker
 *   Who Do I Call?      call      -> worker  (and the number to dial)
 *   Dress the Worker    wears[]   -> worker
 *   A Day at Work       day[]     in order
 *   At the Shop         the shopkeeper entry, with the currency set
 *
 * One list rather than eight means a corrected Malayalam spelling or a
 * delivered photograph lands in every activity at once — the same reason
 * flower-data.js exists.
 *
 * ──────────────────────────────────────────────────────────────────
 * WEIGHTED TO WHAT THESE CHILDREN SEE
 *
 * The roster leans Kerala: a fisherman, a coconut climber, an auto driver
 * and a potter earn their places over the generic set you would get from a
 * western curriculum. A child who has watched someone climb a coconut palm
 * has something to attach the word to; "astronaut" teaches nothing here.
 *
 * ──────────────────────────────────────────────────────────────────
 * ART IS NOT DELIVERED YET
 *
 * No job photographs exist on disk. Every entry therefore carries an emoji
 * that is good enough to play with today, and an `img` slot that is null
 * until photographs are approved through asset-review. The activities read
 * `img` first and fall back to `emoji`, so the set works now and improves
 * when the art lands — never the other way round.
 *
 * ──────────────────────────────────────────────────────────────────
 * MALAYALAM WARNING
 *
 * These names were not written by a native speaker. Job titles are exactly
 * where a wrong register shows: several of these have a formal and a spoken
 * form, and the spoken one is usually what a child knows. They MUST be
 * proofed by a Malayalam-speaking teacher before the wall goes live, along
 * with the rest of the content.
 *
 * Emergency numbers are the Indian national ones and are checkable facts,
 * not translations — 100 police, 101 fire, 102 ambulance, 108 emergency.
 */
(function (global) {
  'use strict';

  var IMG = '../assets/new/images/jobs/';   // nothing here yet; see header

  /* `sound` names the recording each job needs for Sounds of Work. It is a
     shopping list for the audio pass, not a file that exists. */
  var JOBS = {
    doctor: {
      id: 'doctor', emoji: '🧑‍⚕️', img: null,
      label: { en: 'Doctor', ml: 'ഡോക്ടർ' },
      does:  { en: 'Treats people who are unwell', ml: 'രോഗികളെ ചികിത്സിക്കുന്നു' },
      place: { en: 'Hospital', ml: 'ആശുപത്രി', emoji: '🏥' },
      hat:   { en: 'Head mirror', ml: 'തലക്കണ്ണാടി', emoji: '🪞' },
      wears: ['white coat', 'stethoscope', 'mask'],
      tools: [
        { en: 'Stethoscope', ml: 'സ്റ്റെതസ്കോപ്പ്', emoji: '🩺' },
        { en: 'Thermometer', ml: 'തെർമോമീറ്റർ',   emoji: '🌡️' }
      ],
      sound: 'heartbeat through a stethoscope',
      call:  { when: { en: 'Someone is unwell', ml: 'ആർക്കോ സുഖമില്ല' }, number: '102' },
      day: [
        { en: 'Puts on the white coat',   ml: 'വെള്ള കോട്ട് ധരിക്കുന്നു' },
        { en: 'Listens to the patient',   ml: 'രോഗിയെ പരിശോധിക്കുന്നു' },
        { en: 'Writes the medicine down', ml: 'മരുന്ന് എഴുതിക്കൊടുക്കുന്നു' },
        { en: 'The patient gets better',  ml: 'രോഗി സുഖം പ്രാപിക്കുന്നു' }
      ]
    },

    nurse: {
      id: 'nurse', emoji: '👩‍⚕️', img: null,
      label: { en: 'Nurse', ml: 'നഴ്സ്' },
      does:  { en: 'Looks after patients', ml: 'രോഗികളെ പരിചരിക്കുന്നു' },
      place: { en: 'Hospital', ml: 'ആശുപത്രി', emoji: '🏥' },
      hat:   { en: "Nurse's cap", ml: 'നഴ്സ് തൊപ്പി', emoji: '👒' },
      wears: ['uniform', 'gloves', 'apron'],
      tools: [
        { en: 'Bandage', ml: 'ബാൻഡേജ്', emoji: '🩹' },
        { en: 'Syringe', ml: 'സിറിഞ്ച്', emoji: '💉' }
      ],
      sound: 'hospital monitor beep',
      call:  { when: { en: 'Someone is hurt', ml: 'ആർക്കോ പരിക്കേറ്റു' }, number: '102' },
      day: [
        { en: 'Checks the ward',        ml: 'വാർഡ് പരിശോധിക്കുന്നു' },
        { en: 'Gives the medicine',     ml: 'മരുന്ന് നൽകുന്നു' },
        { en: 'Dresses the wound',      ml: 'മുറിവ് കെട്ടുന്നു' },
        { en: 'Writes in the register', ml: 'രജിസ്റ്ററിൽ എഴുതുന്നു' }
      ]
    },

    teacher: {
      id: 'teacher', emoji: '👩‍🏫', img: null,
      label: { en: 'Teacher', ml: 'അധ്യാപിക / ടീച്ചർ' },
      does:  { en: 'Teaches in school', ml: 'സ്കൂളിൽ പഠിപ്പിക്കുന്നു' },
      place: { en: 'School', ml: 'സ്കൂൾ', emoji: '🏫' },
      hat:   { en: 'Graduation cap', ml: 'ബിരുദത്തൊപ്പി', emoji: '🎓' },
      wears: ['saree or shirt', 'ID card'],
      tools: [
        { en: 'Chalk', ml: 'ചോക്ക്', emoji: '🖍️' },
        { en: 'Book',  ml: 'പുസ്തകം', emoji: '📖' }
      ],
      sound: 'school bell',
      call:  null,
      day: [
        { en: 'Rings the bell',      ml: 'മണി അടിക്കുന്നു' },
        { en: 'Writes on the board', ml: 'ബോർഡിൽ എഴുതുന്നു' },
        { en: 'The children read',   ml: 'കുട്ടികൾ വായിക്കുന്നു' },
        { en: 'Corrects the books',  ml: 'പുസ്തകങ്ങൾ തിരുത്തുന്നു' }
      ]
    },

    farmer: {
      id: 'farmer', emoji: '🧑‍🌾', img: null,
      label: { en: 'Farmer', ml: 'കർഷകൻ' },
      does:  { en: 'Grows our food', ml: 'ഭക്ഷണം വിളയിക്കുന്നു' },
      place: { en: 'Paddy field', ml: 'വയൽ', emoji: '🌾' },
      hat:   { en: 'Straw hat', ml: 'വൈക്കോൽ തൊപ്പി', emoji: '👒' },
      wears: ['mundu', 'towel'],
      tools: [
        { en: 'Hoe',    ml: 'തൂമ്പ',   emoji: '⛏️' },
        { en: 'Sickle', ml: 'അരിവാൾ', emoji: '🌾' }
      ],
      sound: 'water running into a field',
      call:  null,
      day: [
        { en: 'Ploughs the field', ml: 'വയൽ ഉഴുതുന്നു' },
        { en: 'Sows the seed',     ml: 'വിത്ത് വിതയ്ക്കുന്നു' },
        { en: 'Waters the crop',   ml: 'വെള്ളം നനയ്ക്കുന്നു' },
        { en: 'Harvests the rice', ml: 'നെല്ല് കൊയ്യുന്നു' }
      ]
    },

    fisherman: {
      id: 'fisherman', emoji: '🎣', img: null,
      label: { en: 'Fisherman', ml: 'മത്സ്യത്തൊഴിലാളി' },
      does:  { en: 'Catches fish in the sea', ml: 'കടലിൽ മീൻ പിടിക്കുന്നു' },
      place: { en: 'Sea', ml: 'കടൽ', emoji: '🌊' },
      hat:   { en: 'Cloth head wrap', ml: 'തലക്കെട്ട്', emoji: '🧢' },
      wears: ['mundu', 'life jacket'],
      tools: [
        { en: 'Net',  ml: 'വല',   emoji: '🕸️' },
        { en: 'Boat', ml: 'വള്ളം', emoji: '🛶' }
      ],
      sound: 'waves and an outboard motor',
      call:  null,
      day: [
        { en: 'Pushes the boat out', ml: 'വള്ളം കടലിലിറക്കുന്നു' },
        { en: 'Casts the net',       ml: 'വല വീശുന്നു' },
        { en: 'Pulls in the fish',   ml: 'മീൻ വലിച്ചെടുക്കുന്നു' },
        { en: 'Sells at the market', ml: 'ചന്തയിൽ വിൽക്കുന്നു' }
      ]
    },

    police: {
      id: 'police', emoji: '👮', img: null,
      label: { en: 'Police officer', ml: 'പോലീസ്' },
      does:  { en: 'Keeps us safe', ml: 'നമ്മെ സുരക്ഷിതരാക്കുന്നു' },
      place: { en: 'Police station', ml: 'പോലീസ് സ്റ്റേഷൻ', emoji: '🚓' },
      hat:   { en: 'Police cap', ml: 'പോലീസ് തൊപ്പി', emoji: '🧢' },
      wears: ['uniform', 'belt', 'badge'],
      tools: [
        { en: 'Whistle', ml: 'വിസിൽ', emoji: '📣' },
        { en: 'Baton',   ml: 'ലാത്തി', emoji: '🏑' }
      ],
      sound: 'police whistle',
      call:  { when: { en: 'Something is stolen', ml: 'എന്തെങ്കിലും മോഷ്ടിക്കപ്പെട്ടു' }, number: '100' },
      day: [
        { en: 'Stands on duty',      ml: 'ഡ്യൂട്ടിയിൽ നിൽക്കുന്നു' },
        { en: 'Directs the traffic', ml: 'ഗതാഗതം നിയന്ത്രിക്കുന്നു' },
        { en: 'Helps a lost child',  ml: 'വഴിതെറ്റിയ കുട്ടിയെ സഹായിക്കുന്നു' },
        { en: 'Writes the report',   ml: 'റിപ്പോർട്ട് എഴുതുന്നു' }
      ]
    },

    firefighter: {
      id: 'firefighter', emoji: '🧑‍🚒', img: null,
      label: { en: 'Firefighter', ml: 'അഗ്നിശമന സേനാംഗം' },
      does:  { en: 'Puts out fires', ml: 'തീ അണയ്ക്കുന്നു' },
      place: { en: 'Fire station', ml: 'അഗ്നിശമന നിലയം', emoji: '🚒' },
      hat:   { en: 'Fire helmet', ml: 'അഗ്നിശമന ഹെൽമറ്റ്', emoji: '⛑️' },
      wears: ['fire suit', 'boots', 'gloves'],
      tools: [
        { en: 'Hose',        ml: 'ഹോസ്',    emoji: '🚿' },
        { en: 'Extinguisher', ml: 'അഗ്നിശമനി', emoji: '🧯' }
      ],
      sound: 'fire engine siren',
      call:  { when: { en: 'There is a fire', ml: 'തീപിടിത്തം ഉണ്ടായി' }, number: '101' },
      day: [
        { en: 'The alarm rings',     ml: 'അലാറം മുഴങ്ങുന്നു' },
        { en: 'Climbs into the truck', ml: 'വണ്ടിയിൽ കയറുന്നു' },
        { en: 'Sprays the water',    ml: 'വെള്ളം ചീറ്റുന്നു' },
        { en: 'The fire is out',     ml: 'തീ അണഞ്ഞു' }
      ]
    },

    cook: {
      id: 'cook', emoji: '🧑‍🍳', img: null,
      label: { en: 'Cook', ml: 'പാചകക്കാരൻ' },
      does:  { en: 'Cooks the food', ml: 'ഭക്ഷണം പാകം ചെയ്യുന്നു' },
      place: { en: 'Kitchen', ml: 'അടുക്കള', emoji: '🍳' },
      hat:   { en: "Chef's hat", ml: 'പാചകത്തൊപ്പി', emoji: '👨‍🍳' },
      wears: ['apron', 'chef coat'],
      tools: [
        { en: 'Ladle', ml: 'തവി',  emoji: '🥄' },
        { en: 'Pan',   ml: 'ചട്ടി', emoji: '🍳' }
      ],
      sound: 'sizzling in a pan',
      call:  null,
      day: [
        { en: 'Washes the vegetables', ml: 'പച്ചക്കറി കഴുകുന്നു' },
        { en: 'Lights the stove',      ml: 'അടുപ്പ് കത്തിക്കുന്നു' },
        { en: 'Stirs the curry',       ml: 'കറി ഇളക്കുന്നു' },
        { en: 'Serves the meal',       ml: 'ഭക്ഷണം വിളമ്പുന്നു' }
      ]
    },

    carpenter: {
      id: 'carpenter', emoji: '🪚', img: null,
      label: { en: 'Carpenter', ml: 'ആശാരി' },
      does:  { en: 'Makes things from wood', ml: 'മരം കൊണ്ട് സാധനങ്ങൾ ഉണ്ടാക്കുന്നു' },
      place: { en: 'Workshop', ml: 'പണിശാല', emoji: '🪵' },
      hat:   { en: 'Hard hat', ml: 'സുരക്ഷാ തൊപ്പി', emoji: '⛑️' },
      wears: ['apron', 'goggles'],
      tools: [
        { en: 'Saw',    ml: 'അറക്കവാൾ', emoji: '🪚' },
        { en: 'Hammer', ml: 'ചുറ്റിക',  emoji: '🔨' }
      ],
      sound: 'a saw cutting wood',
      call:  null,
      day: [
        { en: 'Measures the wood', ml: 'മരം അളക്കുന്നു' },
        { en: 'Saws it to size',   ml: 'മുറിക്കുന്നു' },
        { en: 'Nails it together', ml: 'ആണിയടിച്ച് ചേർക്കുന്നു' },
        { en: 'The chair is ready', ml: 'കസേര തയ്യാറായി' }
      ]
    },

    tailor: {
      id: 'tailor', emoji: '🧵', img: null,
      label: { en: 'Tailor', ml: 'തയ്യൽക്കാരൻ' },
      does:  { en: 'Stitches our clothes', ml: 'വസ്ത്രങ്ങൾ തയ്ക്കുന്നു' },
      place: { en: 'Tailor shop', ml: 'തയ്യൽക്കട', emoji: '🏪' },
      hat:   null,
      wears: ['measuring tape'],
      tools: [
        { en: 'Scissors',       ml: 'കത്രിക',      emoji: '✂️' },
        { en: 'Sewing machine', ml: 'തയ്യൽ മെഷീൻ', emoji: '🪡' }
      ],
      sound: 'a sewing machine',
      call:  null,
      day: [
        { en: 'Measures the cloth', ml: 'തുണി അളക്കുന്നു' },
        { en: 'Cuts the cloth',     ml: 'തുണി മുറിക്കുന്നു' },
        { en: 'Stitches it',        ml: 'തയ്ക്കുന്നു' },
        { en: 'The shirt is ready', ml: 'ഷർട്ട് തയ്യാറായി' }
      ]
    },

    barber: {
      id: 'barber', emoji: '💈', img: null,
      label: { en: 'Barber', ml: 'ബാർബർ' },
      does:  { en: 'Cuts hair', ml: 'മുടി വെട്ടുന്നു' },
      place: { en: 'Barber shop', ml: 'ബാർബർ ഷോപ്പ്', emoji: '💈' },
      hat:   null,
      wears: ['apron'],
      tools: [
        { en: 'Comb',     ml: 'ചീപ്പ്',  emoji: '🪮' },
        { en: 'Scissors', ml: 'കത്രിക', emoji: '✂️' }
      ],
      sound: 'electric clippers',
      call:  null,
      day: [
        { en: 'Seats the customer', ml: 'ആളെ ഇരുത്തുന്നു' },
        { en: 'Puts on the cloth',  ml: 'തുണി ഇടുന്നു' },
        { en: 'Cuts the hair',      ml: 'മുടി വെട്ടുന്നു' },
        { en: 'Shows the mirror',   ml: 'കണ്ണാടി കാണിക്കുന്നു' }
      ]
    },

    driver: {
      id: 'driver', emoji: '🧑‍✈️', img: null,
      label: { en: 'Driver', ml: 'ഡ്രൈവർ' },
      does:  { en: 'Takes people where they need to go', ml: 'ആളുകളെ കൊണ്ടുപോകുന്നു' },
      place: { en: 'Road', ml: 'റോഡ്', emoji: '🛣️' },
      hat:   { en: 'Driver cap', ml: 'ഡ്രൈവർ തൊപ്പി', emoji: '🧢' },
      wears: ['uniform', 'seat belt'],
      tools: [
        { en: 'Steering wheel', ml: 'സ്റ്റിയറിങ്',  emoji: '🛞' },
        { en: 'Auto rickshaw',  ml: 'ഓട്ടോറിക്ഷ', emoji: '🛺' }
      ],
      sound: 'an auto rickshaw horn',
      call:  null,
      day: [
        { en: 'Checks the vehicle',  ml: 'വണ്ടി പരിശോധിക്കുന്നു' },
        { en: 'Picks up the people', ml: 'ആളുകളെ കയറ്റുന്നു' },
        { en: 'Drives carefully',    ml: 'ശ്രദ്ധയോടെ ഓടിക്കുന്നു' },
        { en: 'Drops them safely',   ml: 'സുരക്ഷിതമായി ഇറക്കുന്നു' }
      ]
    },

    postman: {
      id: 'postman', emoji: '📮', img: null,
      label: { en: 'Postman', ml: 'പോസ്റ്റ്മാൻ' },
      does:  { en: 'Brings the letters', ml: 'കത്തുകൾ എത്തിക്കുന്നു' },
      place: { en: 'Post office', ml: 'പോസ്റ്റ് ഓഫീസ്', emoji: '🏤' },
      hat:   { en: 'Postman cap', ml: 'പോസ്റ്റ്മാൻ തൊപ്പി', emoji: '🧢' },
      wears: ['khaki uniform', 'shoulder bag'],
      tools: [
        { en: 'Letter bag', ml: 'തപാൽ സഞ്ചി', emoji: '💼' },
        { en: 'Bicycle',    ml: 'സൈക്കിൾ',   emoji: '🚲' }
      ],
      sound: 'a bicycle bell',
      call:  null,
      day: [
        { en: 'Sorts the letters',   ml: 'കത്തുകൾ തരംതിരിക്കുന്നു' },
        { en: 'Fills the bag',       ml: 'സഞ്ചി നിറയ്ക്കുന്നു' },
        { en: 'Rides to the houses', ml: 'വീടുകളിലേക്ക് പോകുന്നു' },
        { en: 'Hands over the post', ml: 'കത്ത് കൈമാറുന്നു' }
      ]
    },

    shopkeeper: {
      id: 'shopkeeper', emoji: '🧑‍💼', img: null,
      label: { en: 'Shopkeeper', ml: 'കച്ചവടക്കാരൻ' },
      does:  { en: 'Sells things in the shop', ml: 'കടയിൽ സാധനം വിൽക്കുന്നു' },
      place: { en: 'Shop', ml: 'കട', emoji: '🏪' },
      hat:   null,
      wears: ['apron'],
      tools: [
        { en: 'Weighing scale', ml: 'തുലാസ്',  emoji: '⚖️' },
        { en: 'Money',          ml: 'പണം',    emoji: '💰' }
      ],
      sound: 'coins on a counter',
      call:  null,
      /* At the Shop reuses the approved currency artwork rather than its own. */
      usesCurrency: true,
      day: [
        { en: 'Opens the shop',     ml: 'കട തുറക്കുന്നു' },
        { en: 'Weighs the goods',   ml: 'സാധനം തൂക്കുന്നു' },
        { en: 'Takes the money',    ml: 'പണം വാങ്ങുന്നു' },
        { en: 'Gives the change',   ml: 'ബാക്കി കൊടുക്കുന്നു' }
      ]
    },

    electrician: {
      id: 'electrician', emoji: '🔌', img: null,
      label: { en: 'Electrician', ml: 'ഇലക്ട്രീഷ്യൻ' },
      does:  { en: 'Mends the lights and wires', ml: 'വൈദ്യുതി നന്നാക്കുന്നു' },
      place: { en: 'Anywhere with wiring', ml: 'വീടുകളിലും കടകളിലും', emoji: '💡' },
      hat:   { en: 'Safety helmet', ml: 'സുരക്ഷാ ഹെൽമറ്റ്', emoji: '⛑️' },
      wears: ['gloves', 'tool belt'],
      tools: [
        { en: 'Tester', ml: 'ടെസ്റ്റർ', emoji: '🪛' },
        { en: 'Pliers', ml: 'പ്ലയർ',   emoji: '🔧' }
      ],
      sound: 'a drill',
      call:  { when: { en: 'The light has gone out', ml: 'വെളിച്ചം പോയി' }, number: null },
      day: [
        { en: 'Switches off the power', ml: 'കറന്റ് ഓഫ് ചെയ്യുന്നു' },
        { en: 'Checks the wire',        ml: 'വയർ പരിശോധിക്കുന്നു' },
        { en: 'Fixes the connection',   ml: 'കണക്ഷൻ നന്നാക്കുന്നു' },
        { en: 'The light works again',  ml: 'വെളിച്ചം വീണ്ടും വന്നു' }
      ]
    },

    gardener: {
      id: 'gardener', emoji: '🌱', img: null,
      label: { en: 'Gardener', ml: 'തോട്ടക്കാരൻ' },
      does:  { en: 'Looks after the plants', ml: 'ചെടികൾ പരിപാലിക്കുന്നു' },
      place: { en: 'Garden', ml: 'പൂന്തോട്ടം', emoji: '🌳' },
      hat:   { en: 'Sun hat', ml: 'വെയിൽ തൊപ്പി', emoji: '👒' },
      wears: ['gloves', 'boots'],
      tools: [
        { en: 'Watering can', ml: 'വെള്ളക്കൂജ', emoji: '🪣' },
        { en: 'Spade',        ml: 'കൈക്കോട്ട്', emoji: '🔨' }
      ],
      sound: 'water from a watering can',
      call:  null,
      day: [
        { en: 'Digs the soil',      ml: 'മണ്ണ് കിളയ്ക്കുന്നു' },
        { en: 'Plants the sapling', ml: 'തൈ നടുന്നു' },
        { en: 'Waters it',          ml: 'വെള്ളം ഒഴിക്കുന്നു' },
        { en: 'The flower blooms',  ml: 'പൂവ് വിരിയുന്നു' }
      ]
    },

    coconutClimber: {
      id: 'coconutClimber', emoji: '🥥', img: null,
      label: { en: 'Coconut climber', ml: 'തെങ്ങുകയറ്റക്കാരൻ' },
      does:  { en: 'Climbs the palm and brings down coconuts', ml: 'തെങ്ങിൽ കയറി തേങ്ങ ഇടുന്നു' },
      place: { en: 'Coconut grove', ml: 'തെങ്ങിൻതോപ്പ്', emoji: '🌴' },
      hat:   { en: 'Cloth head wrap', ml: 'തലക്കെട്ട്', emoji: '🧢' },
      wears: ['mundu', 'climbing rope'],
      tools: [
        { en: 'Climbing rope', ml: 'കയർ',   emoji: '🪢' },
        { en: 'Machete',       ml: 'വെട്ടുകത്തി', emoji: '🔪' }
      ],
      sound: 'a coconut falling',
      call:  null,
      day: [
        { en: 'Ties the rope',        ml: 'കയർ കെട്ടുന്നു' },
        { en: 'Climbs the palm',      ml: 'തെങ്ങിൽ കയറുന്നു' },
        { en: 'Cuts the coconuts',    ml: 'തേങ്ങ വെട്ടുന്നു' },
        { en: 'Gathers them below',   ml: 'താഴെ ശേഖരിക്കുന്നു' }
      ]
    },

    potter: {
      id: 'potter', emoji: '🏺', img: null,
      label: { en: 'Potter', ml: 'കുശവൻ' },
      does:  { en: 'Makes pots from clay', ml: 'കളിമണ്ണിൽ പാത്രം ഉണ്ടാക്കുന്നു' },
      place: { en: 'Pottery', ml: 'കളിമൺപണിശാല', emoji: '🏺' },
      hat:   null,
      wears: ['apron'],
      tools: [
        { en: "Potter's wheel", ml: 'ചക്രം',   emoji: '⭕' },
        { en: 'Clay',           ml: 'കളിമണ്ണ്', emoji: '🟤' }
      ],
      sound: 'a potter’s wheel turning',
      call:  null,
      day: [
        { en: 'Kneads the clay',    ml: 'കളിമണ്ണ് കുഴയ്ക്കുന്നു' },
        { en: 'Turns the wheel',    ml: 'ചക്രം കറക്കുന്നു' },
        { en: 'Shapes the pot',     ml: 'പാത്രം രൂപപ്പെടുത്തുന്നു' },
        { en: 'Bakes it in the kiln', ml: 'ചൂളയിൽ ചുടുന്നു' }
      ]
    }
  };

  var ORDER = [
    'doctor', 'nurse', 'teacher', 'farmer', 'fisherman', 'police',
    'firefighter', 'cook', 'carpenter', 'tailor', 'barber', 'driver',
    'postman', 'shopkeeper', 'electrician', 'gardener', 'coconutClimber', 'potter'
  ];

  function all() { return ORDER.map(function (k) { return JOBS[k]; }); }

  /* Each activity takes only the jobs that can actually answer it, so a round
     never offers a worker whose hat, tool or sound does not exist. A set that
     can produce an unanswerable question is worse than a smaller set. */
  function withHat()   { return all().filter(function (j) { return !!j.hat; }); }
  function withTools() { return all().filter(function (j) { return j.tools && j.tools.length; }); }
  function withCall()  { return all().filter(function (j) { return !!j.call; }); }
  function withSound() { return all().filter(function (j) { return !!j.sound; }); }

  /** Distinct workplaces, for Where Do They Work? */
  function places() {
    var seen = {}, out = [];
    all().forEach(function (j) {
      if (!j.place || seen[j.place.en]) return;
      seen[j.place.en] = 1;
      out.push(j.place);
    });
    return out;
  }

  /** The sound recordings this module still needs, for the audio pass. */
  function soundList() {
    return withSound().map(function (j) { return { id: j.id, needs: j.sound }; });
  }

  global.JOBS_DATA = {
    JOBS: JOBS, ORDER: ORDER, all: all,
    withHat: withHat, withTools: withTools, withCall: withCall, withSound: withSound,
    places: places, soundList: soundList,
    IMG: IMG
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = global.JOBS_DATA;
})(typeof window !== 'undefined' ? window : globalThis);
