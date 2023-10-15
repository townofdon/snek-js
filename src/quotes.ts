
export const quotes: (string | string[])[] = [

[
STR(`
The most intelligent men, like the strongest, find their happiness
where others would find only disaster...
`),
STR(`
In the labyrinth, in being
hard with themselves and with others, in effort...
`),
STR(`
Their delight is
self-mastery; in them asceticism becomes second nature, a necessity,
as instinct.
`),
],

STR(`
Life is an instinct for growth, for survival, for the accumulation
of forces, for power.
`),
STR(`
One will not go far wrong if one attributes extreme actions to
vanity, average ones to habit, and petty ones to fear.
`),
STR(`
Many are stubborn in pursuit of the path they have chosen, few in
pursuit of the goal.
`),
STR(`
The irrationality of a thing is no argument against its existence,
rather a condition of it.
`),
STR(`
A living being seeks, above all, to discharge its strength. Life is
will to power.
`),
STR(`
A man who is very busy seldom changes his opinions.
`),
STR(`
Every step forward is made at the cost of mental and physical pain
to someone.
`),

[
STR(`
On the mountains of truth you never climb in vain...
`),
STR(`
Either you will
reach a point higher up today, or you will be training your powers
so that you will be able to climb higher tomorrow
`),
],

STR(`
Nobody dies nowadays of fatal truths: there are too many antidotes
to them.
`),
STR(`
Without music, life would be a mistake.
`),
STR(`
What is happiness? The feeling that power increases - that resistance
is overcome.
`),
STR(`
That which does not kill us makes us stronger.
`),
STR(`
He who has a why to live can bear almost any how.
`),
STR(`
He who cannot obey himself will be commanded. That is the nature
of living creatures.
`),
STR(`
The future influences the present just as much as the past.
`),
STR(`
In every real man a child is hidden that wants to play.
`),
STR(`
When you look into an abyss, the abyss also looks into you.
`),
STR(`
The doer alone learneth.
`),
STR(`
Whoever fights monsters should see to it that in the process
he does not become a monster.
`),
STR(`
One must still have chaos in oneself to be able to give birth
to a dancing star.
`),
STR(`
He who would learn to fly one day must first learn to stand and
walk and run and climb and dance; one cannot fly into flying.
`),
STR(`
Fear is the mother of morality.
`),
STR(`
The growth of wisdom may be gauged exactly by the diminution of ill
temper.
`),

[
STR(`
And we should consider every day lost on which we have not
danced at least once...
`),
STR(`
And we should call every truth false which
was not accompanied by at least one laugh.
`),
],

]

function STR(text: string) {
  return text.trim().replace(/\n/g, ' ');
}

