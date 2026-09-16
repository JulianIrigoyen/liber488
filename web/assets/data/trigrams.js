/* The eight trigrams. Binary reads BOTTOM-FIRST, as lines are built and read.
   1 = yang (whole line), 0 = yin (broken line). */
window.TRIGRAMS = {
  "111": { zh:"乾", py:"Qián", en:"Heaven",   glyph:"☰", attr:"the creative",   image:"strength, initiative, the origin of motion" },
  "110": { zh:"兌", py:"Duì",  en:"Lake",     glyph:"☱", attr:"the joyous",     image:"open water, pleasure, speech, exchange" },
  "101": { zh:"離", py:"Lí",   en:"Fire",     glyph:"☲", attr:"the clinging",   image:"brightness, clarity, dependence on fuel" },
  "100": { zh:"震", py:"Zhèn", en:"Thunder",  glyph:"☳", attr:"the arousing",   image:"shock, sudden movement, the start of things" },
  "011": { zh:"巽", py:"Xùn",  en:"Wind",     glyph:"☴", attr:"the gentle",     image:"penetration, gradual influence, wood, roots" },
  "010": { zh:"坎", py:"Kǎn",  en:"Water",    glyph:"☵", attr:"the abysmal",    image:"danger, depth, the ravine, what must be waded" },
  "001": { zh:"艮", py:"Gèn",  en:"Mountain", glyph:"☶", attr:"keeping still",  image:"stillness, limit, the place where motion stops" },
  "000": { zh:"坤", py:"Kūn",  en:"Earth",    glyph:"☷", attr:"the receptive",  image:"yielding, support, capacity, what carries" }
};

/* The four line values a cast produces, and what each means.
   Coins:  6 = 1/8,  7 = 3/8,  8 = 3/8,  9 = 1/8
   Yarrow: 6 = 1/16, 7 = 5/16, 8 = 7/16, 9 = 3/16
   The two methods are not equivalent. Yarrow makes moving yang three times
   likelier than moving yin; coins make them equal. Practitioners who care
   about that difference care about it a great deal. */
window.LINE_VALUES = {
  6: { name:"old yin",     mark:"x", yang:false, moving:true,  becomes:true,
       note:"Yin at its extreme, turning into yang. A broken line that is about to close." },
  7: { name:"young yang",  mark:"",  yang:true,  moving:false, becomes:false,
       note:"Yang at rest. Whole, stable, not in motion." },
  8: { name:"young yin",   mark:"",  yang:false, moving:false, becomes:false,
       note:"Yin at rest. Broken, stable, not in motion." },
  9: { name:"old yang",    mark:"o", yang:true,  moving:true,  becomes:false,
       note:"Yang at its extreme, turning into yin. A whole line that is about to break." }
};
