/*
 * lexicon.js
 *
 * A reference lexicon of the Major Arcana, a selection of occult signs, and the
 * ten Sephiroth of the Tree of Life. Card titles follow Crowley's Thoth deck
 * where they depart from the older Marseille and Golden Dawn names; the letter
 * and path attributions follow the Golden Dawn assignment of the trumps to
 * paths 11 to 32. The glosses describe what the tradition holds, and the "jung"
 * fields offer readings in the vocabulary of analytical psychology. Nothing here
 * is asserted as fact about the world.
 */

window.TAROT = [
  {
    n: 0,
    name: "The Fool",
    hebrew: "Aleph",
    letter: "\u05D0",
    path: 11,
    attribution: "Air",
    trumps: "The unnumbered wanderer who steps from the cliff edge, drawn in the Thoth deck as the green spring of unformed potency. He is innocence before experience, and the zero out of which the whole sequence unfolds.",
    jung: "The puer aeternus at the threshold of the work, an ego still undivided from the unconscious and therefore free of it in a way it will never be again."
  },
  {
    n: 1,
    name: "The Magus",
    hebrew: "Beth",
    letter: "\u05D1",
    path: 12,
    attribution: "Mercury",
    trumps: "Hermes as maker of words and of worlds, will gathered into speech and gesture. His instruments mark the descent of creative power into the four suits.",
    jung: "The trickster intellect, Mercurius as the psyche's naming and shape shifting function: indispensable to consciousness and never wholly honest."
  },
  {
    n: 2,
    name: "The Priestess",
    hebrew: "Gimel",
    letter: "\u05D2",
    path: 13,
    attribution: "Moon",
    trumps: "Veiled keeper of the lunar mysteries, seated where the path of Gimel crosses the Abyss. She is memory, latency, and the word not yet spoken.",
    jung: "The anima in her first and most impersonal aspect, the inward reflecting surface on which unconscious contents become visible at all."
  },
  {
    n: 3,
    name: "The Empress",
    hebrew: "Daleth",
    letter: "\u05D3",
    path: 14,
    attribution: "Venus",
    trumps: "Daleth is the door of generation, and Venus the fertile field in which the seed of the Magus takes body. Abundance, form, and the maternal ordering of matter.",
    jung: "The Great Mother in her nourishing aspect: the matrix of feeling and relatedness by which the individual is fed, and by which it may also be swallowed."
  },
  {
    n: 4,
    name: "The Emperor",
    hebrew: "Heh",
    letter: "\u05D4",
    path: 15,
    attribution: "Aries",
    trumps: "The ram crowned sovereign of settled order, rulership by law and boundary. He is the paternal principle that measures, defines, and defends.",
    jung: "The father imago and the internalized authority of collective norms, at once the scaffolding of the ego and the first tyrant it must negotiate."
  },
  {
    n: 5,
    name: "The Hierophant",
    hebrew: "Vau",
    letter: "\u05D5",
    path: 16,
    attribution: "Taurus",
    trumps: "The teaching mouth of tradition and the mediator between the Aeons. Taurus lends him patience and the considerable weight of established rite.",
    jung: "The senex as transmitter of collective wisdom, the archetype of the teacher whose gift is form and whose characteristic danger is dogma."
  },
  {
    n: 6,
    name: "The Lovers",
    hebrew: "Zain",
    letter: "\u05D6",
    path: 17,
    attribution: "Gemini",
    trumps: "Zain, the sword of discrimination, presides over a marriage: analysis and union held within a single image. The alchemical wedding placed under the sign of the twins.",
    jung: "The coniunctio anticipated, the ego's encounter with the contrasexual other and its first real labour of holding opposites in relation."
  },
  {
    n: 7,
    name: "The Chariot",
    hebrew: "Cheth",
    letter: "\u05D7",
    path: 18,
    attribution: "Cancer",
    trumps: "An armoured charioteer bearing the Grail, drawn by the four kerubic beasts. Conquest achieved by containment rather than by force.",
    jung: "The disciplined vehicle of the ego: a triumph that depends upon what the enclosure carries and holds, not upon the speed at which it travels."
  },
  {
    n: 8,
    name: "Adjustment",
    hebrew: "Lamed",
    letter: "\u05DC",
    path: 22,
    attribution: "Libra",
    trumps: "Crowley's renaming of Justice: a dancing, masked figure of equilibrium who weighs act against consequence with no appeal to sentiment. The sword here means balance rather than punishment.",
    jung: "The compensatory function of the psyche, which restores proportion to a one sided attitude whether or not consciousness consents to the correction."
  },
  {
    n: 9,
    name: "The Hermit",
    hebrew: "Yod",
    letter: "\u05D9",
    path: 20,
    attribution: "Virgo",
    trumps: "Bearer of the hidden lamp, in whom the solitary Yod (the seed) and the shepherd's crook are joined. Withdrawal undertaken for the sake of ripening.",
    jung: "The introverted turn toward an inner light, where the wise old man appears as guide once the outer world has stopped answering."
  },
  {
    n: 10,
    name: "Fortune",
    hebrew: "Kaph",
    letter: "\u05DB",
    path: 21,
    attribution: "Jupiter",
    trumps: "The turning wheel of Jupiter, in which rise and fall are one motion. Less a card of luck than of the impersonal rhythm by which all fortunes revolve.",
    jung: "Fate apprehended as pattern: the recognition that psychic life moves in cycles the ego steers far less than it likes to imagine."
  },
  {
    n: 11,
    name: "Lust",
    hebrew: "Teth",
    letter: "\u05D8",
    path: 19,
    attribution: "Leo",
    trumps: "Crowley's title for Strength, showing the woman who rides the seven headed beast and raises the Grail aloft. Strength as joyous consent to the whole appetite of life rather than its subjugation.",
    jung: "Libido met and ridden instead of repressed, instinct affirmed and thereby made available to the personality as energy."
  },
  {
    n: 12,
    name: "The Hanged Man",
    hebrew: "Mem",
    letter: "\u05DE",
    path: 23,
    attribution: "Water",
    trumps: "Suspension by the foot in the element of water, a willing reversal of ordinary vision. The efficacy of this sacrifice lies entirely in its stillness.",
    jung: "Necessary regression and the surrender of an ego position, the suspended pause in which the transcendent function can begin to form."
  },
  {
    n: 13,
    name: "Death",
    hebrew: "Nun",
    letter: "\u05E0",
    path: 24,
    attribution: "Scorpio",
    trumps: "The scythe of the skeletal dancer, putrefaction understood as the condition of new growth. Transformation, rather than the end of things.",
    jung: "Ego death and the nigredo: the dissolution of an outlived identity, which is the price of any renewal that is not merely cosmetic."
  },
  {
    n: 14,
    name: "Art",
    hebrew: "Samekh",
    letter: "\u05E1",
    path: 25,
    attribution: "Sagittarius",
    trumps: "Crowley's name for Temperance. The royal marriage is set within the crucible, contraries mingled by patient labour beneath the arrow of Sagittarius.",
    jung: "The transcendent function itself: the third thing that appears when opposites are held together long enough to combine."
  },
  {
    n: 15,
    name: "The Devil",
    hebrew: "Ayin",
    letter: "\u05E2",
    path: 26,
    attribution: "Capricorn",
    trumps: "The goat of Capricorn upon the mountain, creative energy in its densest and most material guise. Bondage, seen clearly, turns out to be unexamined desire.",
    jung: "The shadow in its most fertile and least respectable form, the rejected instinct whose recovery returns stolen energy to the personality."
  },
  {
    n: 16,
    name: "The Tower",
    hebrew: "Peh",
    letter: "\u05E4",
    path: 27,
    attribution: "Mars",
    trumps: "Peh, the mouth, opened under Mars: the fortress of false structure broken by lightning. A destruction that clears ground rather than merely ruining it.",
    jung: "The sudden collapse of a defensive structure under pressure from within, catastrophe as the unconscious finally breaking through."
  },
  {
    n: 17,
    name: "The Star",
    hebrew: "Tzaddi",
    letter: "\u05E6",
    path: 28,
    attribution: "Aquarius",
    trumps: "A naked figure pours the waters beneath the night sky, grace arriving after ruin. Hope as the quiet gift that follows the fall of the Tower.",
    jung: "The renewal of hope after catastrophe, an intimation of the Self glimpsed at a great distance and by no means yet possessed."
  },
  {
    n: 18,
    name: "The Moon",
    hebrew: "Qoph",
    letter: "\u05E7",
    path: 29,
    attribution: "Pisces",
    trumps: "The dark path between the towers: illusion, dream, and the tidal pull of what cannot be seen plainly. The crisis of the threshold.",
    jung: "The night sea journey through fantasy and dread, in which the boundary between inner image and outer fact is deliberately obscured."
  },
  {
    n: 19,
    name: "The Sun",
    hebrew: "Resh",
    letter: "\u05E8",
    path: 30,
    attribution: "Sun",
    trumps: "Children dance in a walled garden beneath the risen disc. Consciousness restored, simplicity regained on the far side of the night.",
    jung: "The lucid ego in right relation to the Self: a clarity and joy that follow the descent instead of preceding it."
  },
  {
    n: 20,
    name: "The Aeon",
    hebrew: "Shin",
    letter: "\u05E9",
    path: 31,
    attribution: "Fire",
    trumps: "Crowley's replacement for the Last Judgement, announcing the passage of one age into another under the fiery letter Shin. Not a verdict, but a change of order.",
    jung: "The reorganization of the whole personality around a new centre, judgement experienced as the arrival of a different governing image."
  },
  {
    n: 21,
    name: "The Universe",
    hebrew: "Tau",
    letter: "\u05EA",
    path: 32,
    attribution: "Saturn",
    trumps: "The Thoth title for the World: the dancing girl, the serpent, and the whole created order framed as one figure. Completion, embodiment, the work made manifest.",
    jung: "The mandala of the realized Self, wholeness shown as a closed and living figure rather than as an accomplishment of the ego."
  }
];

window.SYMBOLS = [
  {
    glyph: "☉",
    name: "Sol",
    cat: "Planetary",
    meaning: "The Sun, sovereign of the planets: vitality, gold, the heart of the horoscope and the centre of the alchemical work.",
    jung: "The Self as luminous centre, and the light by which consciousness knows itself."
  },
  {
    glyph: "☽",
    name: "Luna",
    cat: "Planetary",
    meaning: "The Moon, silver and mutable, governing tides, reflection, growth and the imaginative faculty.",
    jung: "The receptive, image making psyche and the anima's changing face."
  },
  {
    glyph: "☿",
    name: "Mercury",
    cat: "Planetary",
    meaning: "The messenger and psychopomp, ruling language, commerce, travel and the volatile spirit that unites the fixed and the fleeting.",
    jung: "Mercurius as the trickster and as the very medium of transformation."
  },
  {
    glyph: "♀",
    name: "Venus",
    cat: "Planetary",
    meaning: "Copper and the green ray: love, harmony, desire and the attractive force that draws separate things into union.",
    jung: "Eros as the function of relatedness, and the anima in her personal aspect."
  },
  {
    glyph: "♂",
    name: "Mars",
    cat: "Planetary",
    meaning: "Iron and the red ray: severity, courage, conflict and the necessary work of cutting away.",
    jung: "Aggression as available energy, the shadow's fire when it is owned rather than projected."
  },
  {
    glyph: "♃",
    name: "Jupiter",
    cat: "Planetary",
    meaning: "Tin and the greater benefic: expansion, mercy, lawful authority and the abundance that follows right order.",
    jung: "The generous, ordering father image and the psyche's impulse toward meaning and scope."
  },
  {
    glyph: "♄",
    name: "Saturn",
    cat: "Planetary",
    meaning: "Lead, time and limit: the boundary of the manifest world, sorrow, discipline and the prima materia of the alchemists.",
    jung: "The senex, and the encounter with limitation that makes individuation concrete rather than imaginary."
  },
  {
    glyph: "⚷",
    name: "Chiron",
    cat: "Planetary",
    meaning: "A modern addition to the planetary series, taken as the wounded teacher who mediates between the animal and the civilised.",
    jung: "The wounded healer, competence built upon an injury that never quite closes."
  },
  {
    glyph: "⚸",
    name: "Black Moon Lilith",
    cat: "Planetary",
    meaning: "The lunar apogee, treated in later astrology as the point of what has been exiled or refused.",
    jung: "The repressed feminine and the shadow of respectability."
  },
  {
    glyph: "♈",
    name: "Aries",
    cat: "Zodiacal",
    meaning: "Cardinal fire, ruled by Mars: initiation, the first thrust of spring and undivided assertion.",
    jung: "The ego's first act of separation, will before reflection."
  },
  {
    glyph: "♉",
    name: "Taurus",
    cat: "Zodiacal",
    meaning: "Fixed earth, ruled by Venus: stability, husbandry, sensual pleasure and the patient holding of ground.",
    jung: "Embodied sensation and the value of what endures."
  },
  {
    glyph: "♊",
    name: "Gemini",
    cat: "Zodiacal",
    meaning: "Mutable air, ruled by Mercury: duality, exchange, curiosity and the restless traffic of ideas.",
    jung: "The divided psyche discovering itself as two, and the motif of the twins."
  },
  {
    glyph: "♋",
    name: "Cancer",
    cat: "Zodiacal",
    meaning: "Cardinal water, ruled by the Moon: enclosure, nurture, memory and the protection of the vulnerable.",
    jung: "The maternal container, and the longing to return to it."
  },
  {
    glyph: "♌",
    name: "Leo",
    cat: "Zodiacal",
    meaning: "Fixed fire, ruled by the Sun: radiance, sovereignty, courage and generous display.",
    jung: "The solar ego at its most confident, near to inflation and near to nobility."
  },
  {
    glyph: "♍",
    name: "Virgo",
    cat: "Zodiacal",
    meaning: "Mutable earth, ruled by Mercury: discrimination, service, harvest and the purification of the material.",
    jung: "The analytic and refining function that separates the usable from the merely abundant."
  },
  {
    glyph: "♎",
    name: "Libra",
    cat: "Zodiacal",
    meaning: "Cardinal air, ruled by Venus: balance, justice, relationship and the weighing of one thing against another.",
    jung: "The instinct for equilibrium between opposing claims, inner and outer alike."
  },
  {
    glyph: "♏",
    name: "Scorpio",
    cat: "Zodiacal",
    meaning: "Fixed water, ruled by Mars (and in modern practice by Pluto): death, regeneration, secrecy and the depths.",
    jung: "The descent into the unconscious where dissolution and renewal are one process."
  },
  {
    glyph: "♐",
    name: "Sagittarius",
    cat: "Zodiacal",
    meaning: "Mutable fire, ruled by Jupiter: the loosed arrow, pilgrimage, philosophy and the search for a horizon.",
    jung: "The teleological pull of meaning, the psyche aimed at something beyond itself."
  },
  {
    glyph: "♑",
    name: "Capricorn",
    cat: "Zodiacal",
    meaning: "Cardinal earth, ruled by Saturn: ambition, structure, the climb, and the goat that thrives on hard ground.",
    jung: "The disciplined ascent through limitation, with the Devil's card as its shadow."
  },
  {
    glyph: "♒",
    name: "Aquarius",
    cat: "Zodiacal",
    meaning: "Fixed air, ruled by Saturn (and in modern practice by Uranus): the water bearer, reform, abstraction and the good of the collective.",
    jung: "The individual in relation to the group mind, differentiation pursued for others as well as for oneself."
  },
  {
    glyph: "♓",
    name: "Pisces",
    cat: "Zodiacal",
    meaning: "Mutable water, ruled by Jupiter (and in modern practice by Neptune): dissolution, compassion, dream and the sea that has no edges.",
    jung: "The oceanic feeling in which ego boundaries soften, for good and for ill."
  },
  {
    glyph: "\u05E9",
    name: "Fire",
    cat: "Elemental",
    meaning: "The first element, drawn as an upright triangle and attributed to the letter Shin: heat, will, and the power that consumes and purifies.",
    jung: "Desire and libido in their rawest form, the heat that drives any transformation."
  },
  {
    glyph: "\u05DE",
    name: "Water",
    cat: "Elemental",
    meaning: "Drawn as an inverted triangle and attributed to the letter Mem: receptivity, feeling, solution and the washing away of form.",
    jung: "The unconscious as a body of water, and feeling as a way of valuing."
  },
  {
    glyph: "\u05D0",
    name: "Air",
    cat: "Elemental",
    meaning: "Drawn as an upright triangle crossed by a bar and attributed to the letter Aleph: breath, intellect, mediation between fire and water.",
    jung: "Thinking as the discriminating function, and spirit understood as breath."
  },
  {
    glyph: "\u05EA",
    name: "Earth",
    cat: "Elemental",
    meaning: "Drawn as an inverted triangle crossed by a bar and attributed to the letter Tau: body, fixity, and the ground in which all the rest is realised.",
    jung: "Sensation and embodiment, the reality principle that keeps the work from becoming a fantasy."
  },
  {
    glyph: "S",
    name: "Sulphur",
    cat: "Alchemical",
    meaning: "One of the three principles, signed by a triangle above a cross: the active, fiery soul of a substance and the male seed of the work.",
    jung: "The burning intensity of desire, which Jung read as the soul's passion and its compulsion."
  },
  {
    glyph: "L",
    name: "Sal (Salt)",
    cat: "Alchemical",
    meaning: "The third principle, signed by a circle divided by a horizontal line: the fixed, bodily residue that remains after burning and washing.",
    jung: "The bitter wisdom left by experience, what Jung associated with the salt of feeling and of remembered suffering."
  },
  {
    glyph: "V",
    name: "Vitriol",
    cat: "Alchemical",
    meaning: "The green lion and universal solvent, read as the acrostic Visita Interiora Terrae Rectificando Invenies Occultum Lapidem.",
    jung: "The injunction to descend into one's own interior and to find the stone there, not elsewhere."
  },
  {
    glyph: "P",
    name: "Prima Materia",
    cat: "Alchemical",
    meaning: "The unformed first matter, variously signed and deliberately never fixed: the base, despised substance from which the stone is raised.",
    jung: "The unregarded psychic material at the beginning of analysis, which is precisely where the value lies."
  },
  {
    glyph: "⚛",
    name: "Quintessence",
    cat: "Alchemical",
    meaning: "The fifth essence beyond the four elements, here borrowed in the atom sign: the subtle unity from which the elements are held to derive.",
    jung: "The unifying centre inferred behind the fourfold, the quaternity resolved into one."
  },
  {
    glyph: "☯",
    name: "Coniunctio",
    cat: "Alchemical",
    meaning: "The marriage of opposites, figured in the East Asian sign of paired and interpenetrating principles: sun and moon, fixed and volatile, made one.",
    jung: "The coniunctio oppositorum, the central image of individuation and of the transference."
  },
  {
    glyph: "✡",
    name: "Hexagram",
    cat: "Kabbalistic",
    meaning: "Two interlaced triangles, taken in ceremonial practice as the macrocosm and the union of the planetary forces about the solar centre.",
    jung: "A figure of achieved symmetry, above and below reflecting one another without collapsing into one."
  },
  {
    glyph: "\u05D9",
    name: "Yod",
    cat: "Kabbalistic",
    meaning: "The smallest letter and the first of the Tetragrammaton, attributed to the Father and to the seed of every form.",
    jung: "The germinal point of an intuition, the least visible beginning of something decisive."
  },
  {
    glyph: "\u05D4",
    name: "Heh",
    cat: "Kabbalistic",
    meaning: "The second letter of the Name, attributed to the Mother and to Binah, the understanding that gives shape to the seed.",
    jung: "The maternal vessel in which an intuition becomes intelligible."
  },
  {
    glyph: "\u05D5",
    name: "Vau",
    cat: "Kabbalistic",
    meaning: "The third letter of the Name, the connecting hook, attributed to the Son and to the six sephiroth about Tiphareth.",
    jung: "The mediating centre that links what is above with what is below."
  },
  {
    glyph: "⚚",
    name: "Caduceus",
    cat: "Hermetic",
    meaning: "The staff of Hermes with its twin serpents, borne by the guide of souls and taken as an emblem of the reconciled opposites along a single axis.",
    jung: "Two instinctual currents aligned about a conscious centre, the classic image of the psychopomp."
  },
  {
    glyph: "☸",
    name: "Rota",
    cat: "Hermetic",
    meaning: "The spoked wheel, used as an emblem of the Rota Mundi and of the cyclical turning of the year, the ages and the soul's course.",
    jung: "A mandala in motion, wholeness experienced as recurrence rather than as arrival."
  },
  {
    glyph: "✞",
    name: "Rose Cross",
    cat: "Hermetic",
    meaning: "The cross of the four elements bearing the rose at its centre, the central device of the Rosicrucian and Golden Dawn currents.",
    jung: "The quaternity with a flowering centre, a Western symbol of the Self in explicitly Christian dress."
  },
  {
    glyph: "☦",
    name: "Cross of the Elements",
    cat: "Hermetic",
    meaning: "A barred cross whose arms are read as the four elements or the four directions, marking the point where they intersect.",
    jung: "The fourfold structure of orientation, and the centre implied by any set of four."
  }
];

window.SEPHIROTH = [
  {
    n: 1,
    name: "Kether",
    title: "The Crown",
    planet: "First Swirlings",
    virtue: "Attainment, the completion of the Great Work",
    vice: "",
    jung: "The Self at the limit of representation, a centre that can be circled and never depicted.",
    x: 50,
    y: 6
  },
  {
    n: 2,
    name: "Chokmah",
    title: "Wisdom",
    planet: "The Zodiac",
    virtue: "Devotion",
    vice: "Wilfulness",
    jung: "Undifferentiated creative force, the archetypal masculine as pure impulse before it has taken any shape.",
    x: 78,
    y: 18
  },
  {
    n: 3,
    name: "Binah",
    title: "Understanding",
    planet: "Saturn",
    virtue: "Silence",
    vice: "Avarice",
    jung: "The forming, limiting maternal principle, which makes a formless energy knowable by giving it edges.",
    x: 22,
    y: 18
  },
  {
    n: 4,
    name: "Chesed",
    title: "Mercy",
    planet: "Jupiter",
    virtue: "Obedience",
    vice: "Bigotry, hypocrisy, tyranny",
    jung: "The benevolent ordering authority within, generous where it is answerable and oppressive where it is not.",
    x: 78,
    y: 36
  },
  {
    n: 5,
    name: "Geburah",
    title: "Severity",
    planet: "Mars",
    virtue: "Courage and energy",
    vice: "Cruelty, wanton destruction",
    jung: "The necessary aggression of the psyche, which prunes an overgrown life and can as easily lay it waste.",
    x: 22,
    y: 36
  },
  {
    n: 6,
    name: "Tiphareth",
    title: "Beauty",
    planet: "Sun",
    virtue: "Devotion to the Great Work",
    vice: "Pride",
    jung: "The solar centre of the personality, the Self as it can actually be experienced, with inflation as its nearest hazard.",
    x: 50,
    y: 48
  },
  {
    n: 7,
    name: "Netzach",
    title: "Victory",
    planet: "Venus",
    virtue: "Unselfishness",
    vice: "Lust, unchastity",
    jung: "The feeling function and the enduring pull of desire, which carries the personality forward and can also enslave it.",
    x: 78,
    y: 64
  },
  {
    n: 8,
    name: "Hod",
    title: "Splendour",
    planet: "Mercury",
    virtue: "Truthfulness",
    vice: "Falsehood, dishonesty",
    jung: "The intellect in its ordering and naming work, admirable while it serves the whole and deceitful when it serves itself.",
    x: 22,
    y: 64
  },
  {
    n: 9,
    name: "Yesod",
    title: "The Foundation",
    planet: "Moon",
    virtue: "Independence",
    vice: "Idleness",
    jung: "The image making layer of the psyche, the treasury of dream and fantasy through which everything higher must pass to reach the world.",
    x: 50,
    y: 78
  },
  {
    n: 10,
    name: "Malkuth",
    title: "The Kingdom",
    planet: "Earth",
    virtue: "Discrimination",
    vice: "Avarice, inertia",
    jung: "Embodied, ordinary life: the only place where any of the foregoing can be said to have actually happened.",
    x: 50,
    y: 94
  }
];

if (typeof module !== "undefined") module.exports = { TAROT: window.TAROT, SYMBOLS: window.SYMBOLS, SEPHIROTH: window.SEPHIROTH };
