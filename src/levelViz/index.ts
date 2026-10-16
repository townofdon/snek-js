
import p5 from 'p5';

import { sketch } from './levelViz';
import { VERSION } from '@/constants';

function main() {
  new p5(sketch)
}

main();

console.log(`dev version: ${VERSION}`);
