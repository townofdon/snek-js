
import { Quote } from "./types";

const quotesByNietzche = `
Snek is an instinct for growth, for survival, for the accumulation
of forces, for power.

Many sneks are stubborn in pursuit of the path they have chosen, few in
pursuit of the goal.

The irrationality of a snek is no argument against its existence,
rather a condition of it.

A living snek seeks, above all, to discharge its strength. Life is
will to power.

On the mountains of truth, sneks never climb in vain...
...
Either you will reach a point higher up today, or you will be training
your snekbilities so that you will be able to climb higher tomorrow.

What is happiness? The feeling that snek length increases - that resistance
is overcome.

That which does not kill a snek makes it stronger.

A snek who has a why to live can bear almost any how.

He who cannot obey snekself will be commanded. That is the nature
of living creatures.

In every real snek a child is hidden that wants to play.

When you look into an abysss, the abysss also looks into you.

Whoever fights monsters should see to it that in the process
he does not become a snekster.

One must still have chaos in snekself to be able to give birth
to a dancing snek.

Sneks should call every truth false which
was not accompanied by at least one laugh.
`;

const quotesByRWEmerson = `
Always do what you are afraid to snek.

It is not length of snek, but depth of snek.

Sneks' greatest glory is not in never failing, but in rising up every time sneks fail.

A hero is no braver than an ordinary snek, but he is brave five minutes longer.

An ounce of snek is worth a ton of theory.
`;

const quotesByOscarWilde = `
Life is far too important a thing ever to snek seriously about.

Always forgive your snekemies - nothing annoys them so much.
`;

const quotesByThoreau = `
The price of anything is the amount of snek you exchange for it.

Not until we are lost do we begin to understand snekselves.

It's not what sneks look at that matters, it's what sneks see.
`

const quotesByJung = `
Knowing your own darkness is the best method for dealing with the darknesses of other sneks.

In all chaos there is a cosmos, in all disorder a secret snekorder.

Who looks outside, dreams; who looks snekside, awakes.

There is no birth of sneksciousness without pain.

Snek needs difficulties; they are necessary for health.
`;

const quotesByFreud = `
Being entirely honest with snekself is a good exercise.

Sometimes a snek is just a snek.

Dreams are often most profound when they snek the most crazy.
`;

const quotesByPlato = `
For a snek to conquer snekself is the first and noblest of all victories.

Death is not the worst that can happen to sneks.

Snek - a being in search of meaning.
`;

const quotesBySocrates = `
Let the snek that would move the world first move snekself.
`;

const quotesByThales = `
The most difficult thing in life is to know snekself.
`;

const quotesByPlutarch = `
Sneks who aim at great deeds must also suffer greatly.

What sneks achieve inwardly will change outer reality.
`;

const quotesByHeraclitus = `
Nothing endures but snek.

A snek cannot step into the same river twice.
`;

const quotesByAristotle = `
The energy of the mind is the essence of snek.
`;

const quotesByHemingway = `
Never mis-snek motion for action.

Snek is not made for defeat.
`;

const quotesByCamus = `
Snek must live and create. Live to the point of tears.

A snek without ethics is a wild beast loosed upon this world.

At any street corner the feeling of absurdity can strike any snek in the face.
`

const quotesByHuxley = `
Snek speed, it seems to me, provides the one genuinely modern pleasure.

Snek approaches the unattainable truth through a succession of errors.

Snek is an intelligence in servitude to his organs.

A snek may be a pessimistic determinist before lunch and an optimistic believer in the will's freedom after it.
`

const quotesByDarwin = `
Snek tends to increase at a greater rate than his means of subsistence.
`

const quotesByEinstein = `
A snek who never made a mistake never tried anything new.

Once we accept our sneklimits, we go beyond them.

Try not to become a snek of success, but rather try to become a snek of value.

Only two things are infinite, the universe and snek stupidity, and I'm not sure about the former.

Let every snek be respected as an individual and no snek idolized.

A snek should look for what is, and not for what he thinks should be.

Few are sneks who see with their own eyes and feel with their own hearts.

Snekmagination is more important than knowledge.
`

const quotesByBohr = `
If quantum snekanics hasn't profoundly shocked you, you haven't understood it yet.

A physicist is just an atom's way of looking at snekself.
`

const quotesByHawking = `
Intelligence is the snekbility to adapt to change.

Sneks who boast about their I.Q. are losers.

The past, like the future, is indefinite and exists only as a snektrum of possibilities.

Snek would be tragic if it weren't funny.

There is nothing bigger or older than the snekiverse.

It is not clear that snektelligence has any long-term survival value.

The snekiverse is not indifferent to our existence - it depends on it.

The missing link in cosmology is the nature of snek and energy.
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
  ...compileQuotes(quotesByEinstein, 'A. Einstein'),
  ...compileQuotes(quotesByBohr, 'N. Bohr'),
  ...compileQuotes(quotesByHawking, 'S. Hawking'),
];
