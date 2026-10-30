import { DamageType, DifficultyIndex, GameState, LoseMessage, Stats } from "./types";
import { shuffleArray } from "./utils";

let seen: Record<string, boolean> = {};

export const nextLoseMessage = (
    state:
    GameState,
    stats: Stats,
    difficultyIndex: DifficultyIndex,
    disableNormalLoseMessages: boolean,
    extraLoseMessages?: LoseMessage[]
) => {
    let relevantMessages: string[] = [];
    const candidates: LoseMessage[] = (extraLoseMessages || []).concat(disableNormalLoseMessages ? [] : LOSE_MESSAGES);
    for (let i = 0; i < 2 && relevantMessages.length === 0; i++) {
        if (!disableNormalLoseMessages && LOSE_MESSAGES_BY_DAMAGE_TYPE[state.lastHurtBy]) {
            relevantMessages = (LOSE_MESSAGES_BY_DAMAGE_TYPE[state.lastHurtBy] as string[])
                .filter(message => !seen[message]);
        } else if (relevantMessages.length === 0) {
            relevantMessages = candidates.filter(([message, callback]) => {
                if (seen[message]) return false;
                if (callback) return callback(state, stats, difficultyIndex);
                return true;
            }).map(([message]) => message);
        }
        if (relevantMessages.length === 0) {
            seen = {};
        }
    }
    if (relevantMessages.length === 0) {
        relevantMessages = ["Death smiles at us all. All we can do is smile back."];
    }
    const message = shuffleArray(relevantMessages)[Math.floor(Math.random() * relevantMessages.length)];
    seen[message] = true;
    return message;
}

const LOSE_MESSAGES: LoseMessage[] = [
    ["Now that was an interesting move...", (state, stats, difficulty) => difficulty <= 2],
    ["I came here to chew bubble gum and play SNEK.<br/><br/>And I'm all outa bubble gum.", (state, stats, difficulty) => true],
    ["The real key is to not do that thing you just did.", (state, stats, difficulty) => difficulty <= 3],
    ["Why did you do that?", (state, stats, difficulty) => difficulty <= 2],
    ["That was a killer move.", (state, stats, difficulty) => difficulty <= 3],
    ["You should really try not doing that...", (state, stats, difficulty) => difficulty <= 2],
    ["Have you ever considered a career as a reptile?", (state, stats, difficulty) => difficulty <= 2],
    ["Ok, be honest, how realistic are the graphics?", (state, stats, difficulty) => difficulty <= 2],
    ["I wanted to make a snake joke but I'm too constricted.", (state, stats, difficulty) => difficulty <= 2],
    ["Don't think too hard about the symbolism of snakes eating apples.", (state, stats, difficulty) => difficulty <= 2],
    ["Your sense of timing is impeccable.", (state, stats, difficulty) => difficulty <= 2],
    ["That's gonna leave a mark...", (state, stats, difficulty) => difficulty <= 2],
    ["Snek, rattle and roll...", (state, stats, difficulty) => difficulty <= 2],
    ["Don't forget to call your mamba....", (state, stats, difficulty) => difficulty <= 2],
    ["I must scale back on lizard puns.", (state, stats, difficulty) => difficulty <= 2],
    ["Sounds like you need an antihisstamine.", (state, stats, difficulty) => difficulty <= 2],
    ["Take a moment to basilisk in the glory.", (state, stats, difficulty) => difficulty <= 2],
    ["Fangs for trying!", (state, stats, difficulty) => difficulty <= 2],
    ["That reminded me of Mamba no. 5", (state, stats, difficulty) => difficulty <= 2],
    ["That came back to bite you in the asp.", (state, stats, difficulty) => difficulty <= 2],
    ["Asp-ire to do better, friend.", (state, stats, difficulty) => difficulty <= 2],
    // ["Every time a snek dies, a dragon gets its wings."],
    ["You act as if you don't have legs or something.", (state, stats, difficulty) => difficulty <= 2],
    ["Cheer up, it was bound to happen sooner or later.", (state, stats, difficulty) => difficulty <= 2],
    ["You look like a person that meets their problems head on.", (state, stats, difficulty) => difficulty <= 2],
    ["You took that hit like Rocky Bal-boa.", (state, stats, difficulty) => difficulty <= 2],
    ["Life can be so cold-blooded sometimes.", (state, stats, difficulty) => difficulty <= 2],
    ["I bet you're mad as a snek right now.", (state, stats, difficulty) => difficulty <= 2],
    ["Sneks around the world mourn your demise.", (state, stats, difficulty) => difficulty <= 2],
    ["Fate is a cruel mistress...", (state, stats, difficulty) => difficulty <= 2],
    ["I came. I saw. I ran into a wall.", (state, stats, difficulty) => difficulty <= 2 && state.lastHurtBy === DamageType.HitBarrier],

    ["I think you just invented a new knot...", (state) => state.lastHurtBy === DamageType.HitSelf],
    ["Really got yourself coiled up there, huh.", (state, stats, difficulty) => state.isTrapped],

    ["What happened? I was napping.", (state, stats, difficulty) => difficulty <= 2],
    ["Can you garter up the courage to try again?", (state, stats, difficulty) => difficulty <= 2 && stats.numDeaths >= 2],
    ["You're a viper and a fighter, baby", (state, stats, difficulty) => difficulty <= 2 && stats.numDeaths >= 3],
    ["You appear very dead-icated.", (state, stats, difficulty) => difficulty <= 2 && stats.numDeaths >= 1],
    ["Does this game hiss you off?", (state, stats, difficulty) => difficulty <= 2 && stats.numDeaths >= 4],
    ["Well don't have a hissy fit...", (state, stats, difficulty) => difficulty <= 2 && stats.numDeaths >= 5],
    ["I can see you are not easily rattled...", (state, stats, difficulty) => difficulty <= 2 && stats.numDeaths >= 4],
    ["Are you going to coil up and despair?", (state, stats, difficulty) => difficulty <= 2 && stats.numDeaths >= 2],
    ["Beating this game must adder to you a lot...", (state, stats, difficulty) => difficulty <= 2 && stats.numDeaths >= 5],
    ["In soviet russia, wall hit you!", (state, stats, difficulty) => difficulty <= 1 && (state.lastHurtBy === DamageType.HitBarrier || state.lastHurtBy === DamageType.HitDoor)],
    ["C'mon! You got this!", (state, stats, difficulty) => difficulty <= 2 && stats.numLevelsCleared <= 1],
    ["Hey, don't blame me...", (state, stats, difficulty) => difficulty <= 2 && stats.numLevelsCleared >= 2],
    ["Way to snatch defeat from the jaws of victory...", (state, stats) => stats.numLevelsCleared >= 3],
    ["That move from 10 seconds ago is really what did you in...", (state, stats, difficulty) => difficulty <= 2 && stats.numLevelsCleared >= 3],
    ["Aw snap, just when it was beginning to get interesting...", (state, stats, difficulty) => stats.numLevelsCleared >= 3],
    ["You've got swag, yo", (state, stats, difficulty) => difficulty <= 2 && stats.numLevelsCleared >= 3],
    ["The SNEK is strong with this one...", (state, stats, difficulty) => difficulty <= 2 && stats.numLevelsCleared >= 4],
    ["You just met the infamous run-ender. How do you feel?", (state, stats, difficulty) => stats.numLevelsCleared >= 5],
    ["I dare you to try again.", (state, stats, difficulty) => difficulty <= 2 && stats.numLevelsCleared >= 1 && stats.numLevelsCleared <= 6],
    ["It was a good run while it lasted!", (state, stats, difficulty) => stats.numLevelsCleared >= 5],
    ["Snek! Snek! Snek! Snek!", (state, stats, difficulty) => difficulty <= 2 && stats.numLevelsCleared >= 10],
    ["Don't you just hate it when you run into something?", (state, stats, difficulty) => difficulty <= 2 && stats.numLevelsCleared <= 7 && state.lastHurtBy !== DamageType.HitSelf],
    ["And they call&nbsp;&nbsp;M E&nbsp;&nbsp;the clumsy one?", (state, stats, difficulty) => difficulty <= 2 && state.lastHurtBy === DamageType.HitSelf],
    ["What? You want an award or something?", (state, stats, difficulty) => difficulty <= 2 && stats.numLevelsCleared >= 9],
    ["How's that tail taste?", (state, stats, difficulty) => difficulty <= 2 && state.lastHurtBy === DamageType.HitSelf],
    ["You think this is bad... have you tried ULTRA yet?", (state, stats, difficulty) => difficulty === 3],
    ["Snek hit wall. Snek go boom.", (state, stats, difficulty) => difficulty <= 2 && (state.lastHurtBy === DamageType.HitBarrier || state.lastHurtBy === DamageType.HitDoor)],
    ["Gotta hand it to you, those were some impressive moves.", (state, stats, difficulty) => stats.numLevelsCleared >= 5 && difficulty >= 2],
    ["You've got the moves like Jagger.", (state, stats, difficulty) => difficulty <= 2 && stats.numLevelsCleared >= 4],
    ["You're a pro at this.", (state, stats) => stats.numLevelsCleared >= 7],
    ["You're a card-carrying resident genius if I say so myself.", (state, stats, difficulty) => stats.numLevelsCleared >= 5 && difficulty <= 2],
    ["You tread where few others have ever dared.", (state, stats, difficulty) => stats.numLevelsCleared >= 15 && difficulty >= 3],
    ["Impressive... most impressive...", (state, stats) => stats.numLevelsCleared >= 5],
    ["You have the reflexes of a ninja house cat.", (state, stats, difficulty) => difficulty <= 2 && stats.numLevelsCleared >= 5],
    ["You have the reflexes of an amazonian sloth.", (state, stats, difficulty) => difficulty > 2 && stats.numLevelsCleared >= 5],
    ["You have the survival instinct of a turnip.", (state, stats, difficulty) => difficulty > 2 && stats.numLevelsCleared >= 5],
    ["Your reaction time is slower than a vat of molasses.", (state, stats, difficulty) => difficulty > 2 && stats.numLevelsCleared >= 5],
    ["You will go down in hiss-tory", (state, stats) => stats.numLevelsCleared >= 10],
    ["Holy snek, you're still playing this game?!", (state, stats) => stats.totalGameTimeElapsed >= 1000 * 60 * 30],
    ["I can tell you're going places.", (state, stats) => stats.totalGameTimeElapsed >= 1000 * 60 * 20],
    ["Snek? Snek!<br />Sneeeeeek!!!!!", (state, stats, difficulty) => difficulty <= 2 && stats.numLevelsCleared >= 3],

    ["What, you expected this to be easy?", (state, stats, difficulty) => difficulty === 3],
    ["Who knew your fate would arrive so soon?", (state, stats, difficulty) => difficulty === 3],
    ["That was a grave mistake.", (state, stats, difficulty) => difficulty === 3],
    ["Planning your funeral<br />will be a big undertaking.", (state, stats, difficulty) => difficulty === 3],
    ["Sadly I cannot attend your funeral.<br /><br />I'm not a mourning person.", (state, stats, difficulty) => difficulty === 3],
    ["This humor is a little dark...<br /><br />is it tomb much for you?", (state, stats, difficulty) => difficulty === 3],
    ["We are only pawns in the game of Snek.", (state, stats, difficulty) => difficulty === 3],
    ["Behold, the scales of justice.", (state, stats, difficulty) => difficulty === 3],
    ["Your twitch factor is off the charts.", (state, stats, difficulty) => difficulty === 3 && stats.numLevelsCleared >= 5],
    ["Hey, you're getting good at this...", (state, stats, difficulty) => difficulty === 3 && stats.numLevelsCleared >= 4],
    ["Heck, even I'm impressed.", (state, stats, difficulty) => difficulty === 3 && stats.numLevelsCleared >= 7],
    ["You show a lot of spirit.", (state, stats, difficulty) => difficulty === 3],
    ["What is it like on the other side?", (state, stats, difficulty) => difficulty === 3],
    ["Is it curtain call already?", (state, stats, difficulty) => difficulty === 3],
    ["Say it ain't so.", (state, stats, difficulty) => difficulty === 3],
    ["Vengeance has been visited upon you.", (state, stats, difficulty) => difficulty === 3],

    ["I guess you don't have the moves like Jagger.", (state, stats, difficulty) => difficulty >= 3 && stats.numLevelsCleared === 0],
    ["What a tragic end to such riveting gameplay.", (state, stats, difficulty) => difficulty >= 3],
    ["You were doomed from the gecko.", (state, stats, difficulty) => difficulty >= 3 && stats.numLevelsCleared < 2],
    ["Maybe your grampa wants to play...", (state, stats, difficulty) => difficulty >= 3 && stats.numLevelsCleared === 0],
    ["Oof. That's gonna leave a mark.", (state, stats, difficulty) => difficulty >= 3],

    ["Do we play SNEK?<br/>Or does SNEK play us?", (state, stats, difficulty) => difficulty >= 4],
    ["This isn't a Metroidvania...<br/>It's a SNEK-troidvania!", (state, stats, difficulty) => difficulty >= 4],
    ["What do you think this is? Pokemon?", (state, stats, difficulty) => difficulty >= 4],
    ["Hey, this ain't Candy Crush.", (state, stats, difficulty) => difficulty >= 4],
    ["Hey, this ain't Farmville.", (state, stats, difficulty) => difficulty >= 4],
    ["What do you think this is? Mario Kart?", (state, stats, difficulty) => difficulty >= 4],
    ["Don't forget to hydrate.", (state, stats, difficulty) => difficulty >= 4],
    ["Shame, what a pity.<br/><br/>What. A. pity.", (state, stats, difficulty) => difficulty >= 4],
    ["I get choked up just thinking about it.", (state, stats, difficulty) => difficulty >= 4],
    ["I feel something, you might call it empathy...", (state, stats, difficulty) => difficulty >= 4],
    ["Oh no.<br/>Not our swashbuckling protagonist.<br/>It can't be.", (state, stats, difficulty) => difficulty >= 4],
    ["On the bright side, you didn't experience loss of life&nbsp;&nbsp;a n d&nbsp;&nbsp;limb.", (state, stats, difficulty) => difficulty >= 4],
    ["I mean, I saw what just happened. That was just unfair.", (state, stats, difficulty) => difficulty >= 4],
    ["Do you grapple with your own mortality?", (state, stats, difficulty) => difficulty >= 4],
    ["This is lunacy. This is madness!<br/><br/>This is SNEK!!!!", (state, stats, difficulty) => difficulty >= 4],
    ["Your reaction time is questionable.", (state, stats, difficulty) => difficulty >= 4],
    ["Are you starting to question your life decisions?", (state, stats, difficulty) => difficulty >= 4],
    ["Fate, it seems, has finally caught up with you.", (state, stats, difficulty) => difficulty >= 4 && stats.numLevelsCleared >= 2],
    ["Yea... it's called ultra for a reason...", (state, stats, difficulty) => difficulty >= 4 && stats.numLevelsCleared <= 1],
    ["The definition of insanity is trying snek over and over and expecting different results.", (state, stats, difficulty) => difficulty === 4],
    ["Really didn't expect you to make it this far...", (state, stats, difficulty) => stats.numLevelsCleared >= 3 && difficulty >= 4],
    ["What are you, part lizard or something?", (state, stats, difficulty) => stats.numLevelsCleared >= 4 && difficulty >= 4],
    ["Didn't know we had a pro gamer on our hands...<br/>What? I genuinely mean that!", (state, stats, difficulty) => stats.numLevelsCleared >= 8 && difficulty >= 4],
    ["You're a pro.<br/><br/>At dying.", (state, stats, difficulty) => stats.numDeaths >= 3 && difficulty >= 4],
    ["Phew... that was intense...", (state, stats, difficulty) => difficulty >= 4],
    ["I believe in you.<br/><br/>Continuing to die a lot.", (state, stats, difficulty) => difficulty >= 4],
    ["I hear slow reaction time is caused by clogged neurons.", (state, stats, difficulty) => difficulty >= 4],
    ["You gotta be ULTRA stubborn to play this game.", (state, stats, difficulty) => difficulty >= 4 && stats.numDeaths >= 5],
    ["Focus. Harness your reptilian brain.", (state, stats, difficulty) => difficulty >= 4 && stats.numLevelsCleared <= 0],
    ["Do not try to overcome the snek.<br/>Become the snek.", (state, stats, difficulty) => difficulty >= 4],
    ["You cannot out-snek snek.", (state, stats, difficulty) => difficulty >= 4],
    ["Alas, your reign of terror has come to an end.", (state, stats, difficulty) => difficulty >= 4 && stats.numLevelsCleared >= 3],
    ["Annals shall be written of your great deeds.", (state, stats, difficulty) => difficulty >= 4 && stats.numLevelsCleared >= 2],
    ["Tales of your deeds shall resound across the lands.", (state, stats, difficulty) => difficulty >= 4 && stats.numLevelsCleared >= 2],
    ["This is more tragic than Romeo & Juliet.", (state, stats, difficulty) => difficulty >= 4],
    ["Such discourtesy, for your victory to be snatched away so suddenly.", (state, stats, difficulty) => difficulty >= 4 && stats.numLevelsCleared >= 1],
    ["Pay no mind to those<br/>who revel in your misfortune.", (state, stats, difficulty) => difficulty >= 4],
    ["A thin line exists<br/>between the stout-hearted<br/>and the foolhardy.", (state, stats, difficulty) => difficulty >= 4],
    ["Wow, you're really getting good.<br/><br/>...<br/><br/>At running into things.", (state, stats, difficulty) => difficulty >= 4],
    // ["Holy snek, batman.", (state, stats, difficulty) => difficulty >= 4],
    ["\"You will not surely die\" -<br />that was just metaphor.", (state, stats, difficulty) => difficulty >= 4],
    ["This reminds us that life is fragile.<br/><br/>And also not to run into things.", (state, stats, difficulty) => difficulty >= 4],
    ["Ashes to ashes.<br/><br/>Dust to dust.<br/><br/>Snek to wall.", (state, stats, difficulty) => difficulty >= 4 && state.lastHurtBy !== DamageType.HitSelf],
    ["That collision kinda looked intentional. Not gonna lie.", (state, stats, difficulty) => difficulty >= 4 && state.lastHurtBy === DamageType.HitBarrier],
    ["The snek overlords demand tribute.", (state, stats, difficulty) => difficulty >= 4],
    ["Your sacrifice will not be in vain.", (state, stats, difficulty) => difficulty >= 4],
    ["What can men do against such reckless snek?", (state, stats, difficulty) => difficulty >= 4],
    ["There never was much hope.<br/>Just a snek's hope.", (state, stats, difficulty) => difficulty >= 4],
    ["By all means... continue your headlong descent into madness.", (state, stats, difficulty) => difficulty >= 4 && stats.numDeaths >= 3],
    ["Um, maybe dial down the difficulty?", (state, stats, difficulty) => difficulty >= 4 && stats.numDeaths >= 5 && stats.numLevelsCleared === 0],
]

type LoseMessageDamageType = (
    | DamageType.HitMine
    | DamageType.HitLock
    | DamageType.QuantumEntanglement
    | DamageType.Electrocution
    | DamageType.SawCut
    | DamageType.SawCut
    | DamageType.Explosive
    | DamageType.Burn
    | DamageType.SpikePierce
);
const LOSE_MESSAGES_BY_DAMAGE_TYPE: Record<LoseMessageDamageType, string[]> = {
    [DamageType.HitMine]: [
        "I think that was a tactical error.",
        "Pst... those aren't edible.",
        "You are blowing this way out of proportion.",
        "That really blew up in your face.",
        "At least you went out in style.",
        "I don't recommend a career with the bomb squad.",
        "\"Mine\": a noun, not a possessive article.",
        "I can tell you're a pro at Minesweeper.",
        "Helpful Mnemonic:<br/>\"Minesweeper, not Mine-eater\".",
        "You're like a bull in a china shop.<br/>If the china shop had mines in it.",
    ],
    [DamageType.HitLock]: [
        "YOU... SHALL NOT PASS.<br/>Or something like that.",
        "Need to call a locksmith?",
        "Try knocking next time.",
        "There's gotta be a key fob around here somewhere...",
        "That gate isn't going to magically open itself.",
        "What? Did you expect you were going to phase through a solid object?",
        "Left home without the keys again, huh?",
        "Behind every locked door there is a snek who ran into it.",
    ],
    [DamageType.QuantumEntanglement]: [
        "You caused a rift in the snektime continuum.",
        "Attempting to be in two places at once can have disastrous results.",
        "Quantum entangle yourself lately?",
        "After a million years of being stuck in an infinite portal, you discover the horrifying truth that time loops back on itself.",
        "We couldn't have you soft-locking the game, now.",
    ],
    [DamageType.Explosive]: [
        "That was a blast.",
        "Your fame really blew up.",
        "Lights fuse. Doesn't run away.",
        "You've been promoted to cautionary tale.",
        "Your speedrun strat needs work.",
        "I just love dramatic endings.",
        "Short fuse, huh?",
        "Sorry, I was cowering behind a rock. What happened?",
        "Snek + Explosion = No more snek.",
        "We can pretend that didn't just happen.",
        "What? I can't hear anything with this racket going on.",
    ],
    [DamageType.Electrocution]: [
        "Are you shocked?",
        "You really know how to complete a circuit.",
        "Maybe stay away from the scary laser beams next time.",
        "Nikola Tesla would like to have a word.",
        "You look better with no eyebrows anyways.",
        "You weren't supposed to be the science experiment...",
        "You conducted yourself well.",
        "You really bridged the gap.",
        "That's one way to exit the level...",
        "You were positively grounded.",
        "I'm sensing good energy from you.",
        "You put up a strong resistance.",
        "You really lit up the room.",
        "You've reached peak conductivity.",
        "That really brought out your inner skeleton.",
        "That was a shocking lack of survival instinct.",
    ],
    [DamageType.SpikePierce]: [
        "Time for snek shish kebab!",
        "Throw anotha SNEK on the barbie!",
        "Looks like you got yourself skewered, there.",
        "Spikes in video games are practically canon at this point.",
        "Honest question - what did you think was going to happen?",
        "You must have an affinity for pointy things.",
        "Here lies Snek, who plowed headlong into obvious hazards.",
        "That was a piercing mistake.",
        "You seem to be snagged on something...",
        "Bet you'll think twice before trying that again...",
        "I'm not one to say 'I told you so', buuut...",
        "Straight to the point, I see.",
        "Consider avoiding the stabby bits next time.",
        "Now you can be part of the decor.",
        "You really nailed it.",
        "Point taken?",
    ],
    [DamageType.SawCut]: [
        "Well, that ended poorly.",
        "Yep. That just happened.",
        "Let's... not talk about what just happened.",
        "Well that escalated quickly.",
        "You seem very detached lately.",
        "That took real courage to open up like that.",
        "Didn't see the spinning blade and think to yourself, \"danger\"?",
        "Too much gore? There's always Candy Crush.",
        "I'm sure the doctor will be able to patch you up in no time.",
        "Look on the bright side:<br/>Now you can be two different places at once.",
        "Just look at the mess you made.",
        "'Tis but a flesh wound!",
        "Now I have to clean up this mess. Thanks.",
        "That outcome was... predictable.",
    ],
    [DamageType.Burn]: [
        "Mmmm, smoked Snek.",
        "Ah, grilled to perfection.",
        "No, you look good with no eyebrows, actually.",
        "Now we're cooking with gasoline.",
        "What's got you all hot and bothered?",
        "Not gonna lie, that last round was pretty fire.",
        "Someone call the fire department.",
        "Maybe don't consider a career as a firefighter.",
        "Maybe bring a fire hose next time.",
        "Maybe stay away from the big scary flame thrower next time.",
    ]
} satisfies Record<LoseMessageDamageType, string[]>;