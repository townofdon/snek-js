
import { Quote } from "./types";

const quotesByNietzche = `
Snek-life is an instinct for growth, for survival, for the accumulation
of forces, for power.

Many sneks are stubborn in pursuit of the path they have chosen, few in
pursuit of the goal.

The irrationality of a snek is no argument against its existence,
rather a condition of it.

A living snek seeks, above all, to discharge its strength. Snek-life is
will to power.

On the mountains of truth, sneks never climb in vain...
...
Either you will reach a point higher up today, or you will be training
your snek-powers so that you will be able to climb higher tomorrow.

What is happiness? The feeling that snek-power increases - that resistance
is overcome.

That which does not kill sneks makes sneks stronger.

A snek who has a why to live can bear almost any how.

He who cannot obey himself will be commanded. That is the nature
of living creatures.

In every real man a child is hidden that wants to play.

When you look into an abysss, the abysss also looks into you.

Whoever fights monsters should see to it that in the process
he does not become a snekster.

One must still have chaos in oneself to be able to give birth
to a dancing snek.

We should consider every day lost on which sneks have not
danced at least once.

Sneks should call every truth false which
was not accompanied by at least one laugh.
`;

const quotesByRWEmerson = `
Always do what snek-you is afraid to do.

Adopt the pacce of nature: her ssecret is patiencce.

It is not length of snek-life, but depth of snek-life.

Sneks' greatest glory is not in never failing, but in rising up every time sneks fail.

A hero is no braver than an ordinary man, but he is brave five minutes longer.

An ounce of snek-action is worth a ton of theory.
`;

const quotesByOscarWilde = `
The truth is rarely pure and never ssimple.

Snek-life is far too important a thing ever to talk seriously about.

Always forgive your snekemies - nothing annoys them so much.
`;

const quotesByThoreau = `
The price of anything is the amount of snek-life you exchange for it.

Not until we are lost do we begin to understand ourselves.

It's not what sneks look at that matters, it's what sneks see.
`

const quotesByJung = `
Knowing your own darkness is the best method for dealing with the darknesses of other snekies.

In all chaos there is a cosmos, in all disorder a secret order.

Who looks outside, dreams; who looks inside, awakes.

There is no birth of consciousness without pain.

Man needs difficulties; they are necessary for health.
`;

const quotesByFreud = `
Being entirely honest with oneself is a good exercise.

Sometimes a snek is just a snek.

Dreams are often most profound when they seem the most snekrazy.
`;

const quotesByPlato = `
For a man to conquer himself is the first and noblest of all victories.

Death is not the worst that can happen to men.

Man - a being in search of meaning.
`;

const quotesBySocrates = `
Let the snek that would move the world first move himself.
`;

const quotesByThales = `
The most difficult thing in life is to know yourself.
`;

const quotesByPlutarch = `
Sneks who aim at great deeds must also suffer greatly.

What sneks achieve inwardly will change outer reality.
`;

const quotesByHeraclitus = `
Nothing endures but change.

A snek cannot step into the same river twice.
`;

const quotesByAristotle = `
The energy of the mind is the essence of snek-life.
`;

const quotesByHemingway = `
Never mistake snek-motion for action.

Man is not made for defeat.
`;

const quotesByCamus = `
Men must live and create. Live to the point of tears.

A man without ethics is a wild beast loosed upon this world.

At any street corner the feeling of absurdity can strike any man in the face.
`

const quotesByHuxley = `
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
    .replace(/man\s/, 'snek ')
    .replace('man,', 'snek,')
    .replace(/Man\s/, 'Snek ')
    .replace(/men\s/, 'sneks ')
    .replace('men.', 'sneks.')
    .replace(/Men\s/, 'Sneks ')
    .replace('himself ', 'snekself ')
    .replace('himself.', 'snekself.')
    .replace('someone ', 'somesnek ')
    .replace('anyone ', 'anysnek ')
    .replace('everyone ', 'everysnek ')
    .replace('yourself', 'snekself')
    .replace('oneself ', 'snekself ')
    .replace('ourselves', 'snekselves')
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
