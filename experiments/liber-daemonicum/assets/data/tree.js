/* The Tree of the Stack.
 *
 * Ten stations from the wish to the silicon, and the twenty-two paths between
 * them. The old diagram arranges ten emanations on three pillars: one of force,
 * one of form, and one of balance between them. An agent stack has the same
 * shape and the same argument - everything that goes wrong in it is a failure
 * to reconcile what we want with what the machine will actually do.
 *
 * Positions are on a 0-1 grid; the renderer scales them.
 */

window.TREE = {
  pillars: { force:"What we want", form:"What is permitted", balance:"What actually happens" },
  nodes: [
    { n:1,  key:"intent",  title:"The Intent",      pillar:"balance", x:.50, y:.055,
      gloss:"The wish, before it is words. Nothing in the stack can see this layer, and every layer below is an attempt to guess it." },
    { n:2,  key:"prompt",  title:"The Prompt",      pillar:"force",   x:.76, y:.165,
      gloss:"The wish as language. The first lossy step, and the one most often blamed for failures that happened further down." },
    { n:3,  key:"context", title:"The Context",     pillar:"form",    x:.24, y:.165,
      gloss:"Everything the model is given besides the question. Larger than the prompt, less examined, and responsible for more behaviour." },
    { n:4,  key:"tools",   title:"The Tools",       pillar:"force",   x:.76, y:.365,
      gloss:"What the system may do rather than say. The boundary between an assistant and an actor, and the place where authorisation actually lives." },
    { n:5,  key:"limits",  title:"The Limits",      pillar:"form",    x:.24, y:.365,
      gloss:"Rate, timeout, budget, quota. The layer that says no. Unglamorous, and the only thing standing between a loop and a bill." },
    { n:6,  key:"model",   title:"The Model",       pillar:"balance", x:.50, y:.475,
      gloss:"The centre, and the only station you did not build. Reached by a name; what answers to that name may change without telling you." },
    { n:7,  key:"tokens",  title:"The Tokens",      pillar:"force",   x:.76, y:.625,
      gloss:"The unit of everything: of memory, of cost, of latency, of how much past the present turn can afford to carry." },
    { n:8,  key:"log",     title:"The Log",         pillar:"form",    x:.24, y:.625,
      gloss:"What the system says about itself. The only station that can testify, and the first sacrificed when disk runs short." },
    { n:9,  key:"process", title:"The Process",     pillar:"balance", x:.50, y:.775,
      gloss:"A pid, a working directory, an environment. The whole edifice above depends on this staying up, and it is the layer least often discussed." },
    { n:10, key:"metal",   title:"The Metal",       pillar:"balance", x:.50, y:.935,
      gloss:"Silicon, disk, a fan, a power bill, a datacentre with an address. Every abstraction above terminates here, and this one cannot be retried." }
  ],
  /* the twenty-two paths: each is a real dependency, not a decoration */
  paths: [
    { a:1,  b:2,  note:"wanting becomes asking" },
    { a:1,  b:3,  note:"wanting is read from history" },
    { a:1,  b:6,  note:"the direct hope: that it simply understands" },
    { a:2,  b:3,  note:"the question is placed among what is known" },
    { a:2,  b:4,  note:"asking becomes acting" },
    { a:2,  b:6,  note:"the question reaches the reasoner" },
    { a:3,  b:5,  note:"what is known must fit what is allowed" },
    { a:3,  b:6,  note:"the reasoner is told what it is working with" },
    { a:4,  b:5,  note:"every capability meets its permission" },
    { a:4,  b:6,  note:"the reasoner is told what it may do" },
    { a:4,  b:7,  note:"each call spends" },
    { a:5,  b:6,  note:"the reasoner is told when to stop" },
    { a:5,  b:8,  note:"a refusal is worth recording" },
    { a:6,  b:7,  note:"thought is billed by the word" },
    { a:6,  b:8,  note:"the reasoner testifies" },
    { a:6,  b:9,  note:"the thought needs something to run in" },
    { a:7,  b:8,  note:"spend is accounted" },
    { a:7,  b:9,  note:"the window is held in memory" },
    { a:8,  b:9,  note:"the record is written by a process" },
    { a:8,  b:10, note:"the record occupies disk" },
    { a:9,  b:10, note:"the process occupies a machine" },
    { a:7,  b:10, note:"the bill arrives at an address" }
  ]
};
