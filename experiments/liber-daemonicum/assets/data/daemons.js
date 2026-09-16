/* The Hierarchy of Daemons.
 *
 * The Ars Goetia lists seventy-two spirits with a rank, an office, a number of
 * legions, a form, and a caution about how the summoning goes wrong. A process
 * table lists the same five things and calls them different words. This roster
 * follows the older format because the older format has a column the newer one
 * is missing: what it costs you when you call it badly.
 *
 * Ranks, mapped honestly:
 *   King      - supervises others and survives them
 *   Duke      - does the work
 *   President - holds knowledge, changes nothing
 *   Marquis   - carries speech across a boundary
 *   Earl      - observes and reports
 *   Knight    - performs one act and departs
 */

window.DAEMONS = [
{ id:"init", rank:"King", legions:"1", office:"The First Process",
  form:"Appears as a single digit. Every other daemon on the machine is a descendant of this one, and it is a descendant of nothing.",
  governs:"Adoption of the orphaned. When a parent dies without reaping its children, they are given to this one.",
  caution:"It cannot be killed, and the machine cannot outlive it. A signal sent here that would fell any other process is simply ignored. Do not mistake that for strength you can borrow." },

{ id:"process-manager", rank:"King", legions:"varies", office:"The Resurrector",
  form:"A god-daemon that outlives the things it supervises. Keeps a list, and restores from the list.",
  governs:"Restart, resurrection, and the memory of what was running before the last reboot.",
  caution:"It restores the list it was told to save, not the state of the machine when it fell. A process started by hand and never written to the list will not come back, and nobody will notice until the day it is needed." },

{ id:"intake", rank:"Marquis", legions:"one per channel", office:"The Ear at the Boundary",
  form:"Sits at the edge of the system, where another company's protocol becomes yours.",
  governs:"The admission of speech from outside, and the refusal of speech that should not be admitted.",
  caution:"It will refuse anything bearing the mark of a machine, including your own. An agent that tries to speak to itself through its own front door is silently ignored - not rejected, not logged, simply dropped. Hours are lost here, always to the same cause: the reply arrives nowhere and no error is raised." },

{ id:"durable-store", rank:"President", legions:"0", office:"The Keeper of the Record",
  form:"A single file that holds everything and does nothing with it.",
  governs:"What survives the restart. Nothing else on the machine is promised to.",
  caution:"It is the only daemon that is more useful asleep than awake. If it answers and the rest do not, you have lost time. If the rest answer and it does not, you have lost the day - and you will not find out until you go looking for a record that was never written." },

{ id:"replay-loop", rank:"Duke", legions:"1 every 15s", office:"The Pulse",
  form:"A timer. The least impressive daemon in the hierarchy and the one whose absence is hardest to see.",
  governs:"The carrying of work from where it was recorded to where it will be done.",
  caution:"When it stops, nothing reports as broken. Every other process stays green, the queue grows quietly, and the first notice you get is a person asking why they were ignored. Watch the age of the oldest undispatched item, never the uptime of this process." },

{ id:"brain", rank:"Duke", legions:"1 per turn", office:"The Reasoner",
  form:"Borrowed. It lives elsewhere and is reached by a name; what answers to that name may change without notice.",
  governs:"Judgment, and the cost of judgment.",
  caution:"The most expensive daemon and the only one billed by the word. It will fail differently depending on which name you called - the same request, routed to a neighbouring name, may be refused outright by the tier you are on rather than by the model itself. Read the refusal before you conclude the model is at fault." },

{ id:"delivery", rank:"Marquis", legions:"one per reply", office:"The Mouth",
  form:"The last step, and the only one whose failure wastes everything before it.",
  governs:"The return of the answer to the one who asked.",
  caution:"A failure here costs the full price of the work and delivers none of it. When it recovers, do not re-run the pipeline - the answers are already made and waiting. Re-running pays twice for one thought." },

{ id:"watchdog", rank:"Earl", legions:"0", office:"The Eye",
  form:"Observes the others and speaks only about them. Has no opinion of its own and no authority over anything.",
  governs:"Report, alarm, and the record of how a thing failed.",
  caution:"It names what it has seen by a short prefix of a hash, not by the name the thing calls itself. Searching the record for the identifier it showed you will match nothing, ever, no matter how correct the query. You must hash each candidate and compare - the id in the alarm is a fingerprint, not an address." },

{ id:"workspace", rank:"Duke", legions:"1", office:"The Hands",
  form:"The only daemon permitted to change anything outside itself.",
  governs:"Files, commands, and every irreversible act the system is capable of.",
  caution:"It is the one you should be most reluctant to grant and the one most often granted first, because without it nothing visible happens. Everything else in this hierarchy can be wrong and recoverable. This one can be wrong and final." },

{ id:"control-master", rank:"Knight", legions:"1, shared", office:"The Shared Road",
  form:"A single opened path that many later journeys travel without reopening.",
  governs:"Reuse of a connection already paid for.",
  caution:"Summon it once and let everything ride on it. Call the far gate again and again instead, each time fresh, and the gate will bar you - not for a moment, but for long minutes, and not because anything is broken. The machine on the other side is well. You have simply been judged to be knocking too often." },

{ id:"cron", rank:"Earl", legions:"as scheduled", office:"The Keeper of Appointments",
  form:"Wakes, acts, and sleeps, with no knowledge of whether the last waking succeeded.",
  governs:"Work that must happen whether or not anybody asked for it.",
  caution:"It has no memory and no conscience. A job that failed every night for a month will be started again tonight with exactly the same confidence as the first time. Nothing here will tell you; that is the Eye's office, and only if you asked for it." },

{ id:"oom-killer", rank:"—", legions:"—", office:"The Reaper",
  form:"Not a daemon. It does not run, it does not wait, it has no process of its own. It is a decision the kernel makes when there is nothing left to give.",
  governs:"Which of your daemons dies so that the machine may continue.",
  caution:"It chooses the largest, which is almost always the one doing the real work. There is no negotiation, no signal you can catch, and no entry in your application log - only a process that was there and then was not. When a daemon vanishes without a word of explanation, look here first, in the kernel's own record, not in yours." }
];
