
import { Quote } from "./types";

const quotesByNietzche = `
// The most intelligent men, like the strongest, find their happiness
// where others would find only disaster...
// ...
// In the labyrinth, in being
// hard with themselves and with others, in effort...
// ...
// Their delight is
// self-mastery; in them asceticism becomes second nature, a necessity,
// as instinct.

Life is an instinct for growth, for survival, for the accumulation
of forces, for power.

One will not go far wrong if one attributes extreme actions to
vanity, average ones to habit, and petty ones to fear.

Many are stubborn in pursuit of the path they have chosen, few in
pursuit of the goal.

The irrationality of a thing is no argument against its existence,
rather a condition of it.

A living being seeks, above all, to discharge its strength. Life is
will to power.

// A man who is very busy seldom changes his opinions.

// Every step forward is made at the cost of mental and physical pain
// to someone.

On the mountains of truth you never climb in vain...
...
Either you will reach a point higher up today, or you will be training
your powers so that you will be able to climb higher tomorrow.

// Nobody dies nowadays of fatal truths: there are too many antidotes
// to them.

// Without music, life would be a mistake.

What is happiness? The feeling that power increases - that resistance
is overcome.

That which does not kill us makes us stronger.

He who has a why to live can bear almost any how.

He who cannot obey himself will be commanded. That is the nature
of living creatures.

The future influences the present just as much as the past.

In every real man a child is hidden that wants to play.

When you look into an abyss, the abyss also looks into you.

The doer alone learneth.

Whoever fights monsters should see to it that in the process
he does not become a monster.

One must still have chaos in oneself to be able to give birth
to a dancing star.

He who would learn to fly one day must first learn to stand and
walk and run and climb and dance; one cannot fly into flying.

// Fear is the mother of morality.

The growth of wisdom may be gauged exactly by the diminution of ill
temper.

And we should consider every day lost on which we have not
danced at least once...
...
And we should call every truth false which
was not accompanied by at least one laugh.
`;

const quotesByRWEmerson = `
Always do what you are afraid to do.

Adopt the pace of nature: her secret is patience.

It is not length of life, but depth of life.

The creation of a thousand forests is in one acorn.

Our greatest glory is not in never failing, but in rising up every time we fail.

A hero is no braver than an ordinary man, but he is brave five minutes longer.

Every wall is a door.

An ounce of action is worth a ton of theory.
`;

const quotesByOscarWilde = `
The truth is rarely pure and never simple.

Success is a science; if you have the conditions, you get the result.

Life is far too important a thing ever to talk seriously about.

Always forgive your enemies - nothing annoys them so much.
`;

const quotesByThoreau = `
The price of anything is the amount of life you exchange for it.

Not until we are lost do we begin to understand ourselves.

It's not what you look at that matters, it's what you see.
`

const quotesByJung = `
Knowing your own darkness is the best method for dealing with the darknesses of other people.

In all chaos there is a cosmos, in all disorder a secret order.

Who looks outside, dreams; who looks inside, awakes.

There is no birth of consciousness without pain.

Man needs difficulties; they are necessary for health.
`;

const quotesByFreud = `
Being entirely honest with oneself is a good exercise.

Sometimes a cigar is just a cigar.

Dreams are often most profound when they seem the most crazy.
`;

const quotesByPlato = `
Courage is knowing what not to fear.

For a man to conquer himself is the first and noblest of all victories.

Death is not the worst that can happen to men.

There is no harm in repeating a good thing.

Man - a being in search of meaning.
`;

const quotesBySocrates = `
Let him that would move the world first move himself.

Wisdom begins in wonder.
`;

const quotesByThales = `
The most difficult thing in life is to know yourself.
`;

const quotesByPlutarch = `
Those who aim at great deeds must also suffer greatly.

The mind is not a vessel to be filled but a fire to be kindled.

What we achieve inwardly will change outer reality.
`;

const quotesByHeraclitus = `
Nothing endures but change.

You cannot step into the same river twice.
`;

const quotesByAristotle = `
The energy of the mind is the essence of life.

Well begun is half done.
`;

const quotesByHemingway = `
The shortest answer is doing the thing.

Never mistake motion for action.

Man is not made for defeat.
`;

const quotesByCamus = `
Men must live and create. Live to the point of tears.

A man without ethics is a wild beast loosed upon this world.

At any street corner the feeling of absurdity can strike any man in the face.
`

const quotesByHuxley = `
Experience teaches only the teachable.

Experience is not what happens to you; it's what you do with what happens to you.

Speed, it seems to me, provides the one genuinely modern pleasure.

Man approaches the unattainable truth through a succession of errors.

Man is an intelligence in servitude to his organs.

A man may be a pessimistic determinist before lunch and an optimistic believer in the will's freedom after it.
`

const quotesByDarwin = `
Man tends to increase at a greater rate than his means of subsistence.
`


function compileQuotes(quotesInput: string, author: string): Quote[] {
  const quotes: Quote[] = [];
  const lines = quotesInput.split('\n');
  let currentText: string = '';

  lines.forEach(line => {
    if (/^\/\//.test(line.trim())) {
      return;
    }
    if (line.trim() === '') {
      if (currentText.length > 0) {
        const message = currentText.split(' ... ').map(text => STR(text));
        quotes.push({
          message,
          author,
        });
        currentText = '';
      }
      return;
    }
    currentText += ' ' + line;
  });

  return quotes;
}

function STR(text: string) {
  return text.trim()
    .replace(/\n/g, ' ')
    .replace(/\s\s+/g, ' ')
    .replace('man ', 'snek ')
    .replace('men ', 'sneks ')
    .replace('Man ', 'Snek ')
    .replace('Men ', 'Sneks ')
    .replace('mankind ', 'snek-kind ')
    .replace('Mankind ', 'Snek-kind ')
    ;
}

export const quotes: Quote[] = [
  ...compileQuotes(quotesByNietzche, 'F. Nietzche'),
  ...compileQuotes(quotesByJung, 'C. Jung'),
  ...compileQuotes(quotesByFreud, 'S. Freud'),
  ...compileQuotes(quotesByOscarWilde, 'O. Wilde'),
  ...compileQuotes(quotesByRWEmerson, 'R. W. Emerson'),
  ...compileQuotes(quotesByThoreau, 'H. D. Thoreau'),
  ...compileQuotes(quotesByHemingway, 'E. Hemingway'),
  ...compileQuotes(quotesByCamus, 'A. Camus'),
  ...compileQuotes(quotesByHuxley, 'A. Huxley'),
  ...compileQuotes(quotesByDarwin, 'C. Darwin'),
  ...compileQuotes(quotesByPlato, 'Plato'),
  ...compileQuotes(quotesBySocrates, 'Socrates'),
  ...compileQuotes(quotesByThales, 'Thales'),
  ...compileQuotes(quotesByPlutarch, 'Plutarch'),
  ...compileQuotes(quotesByHeraclitus, 'Heraclitus'),
  ...compileQuotes(quotesByAristotle, 'Aristotle'),
];

