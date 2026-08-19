
import p5 from 'p5';

import '../windowManagement';
import '../uiv2'

import { sketch } from './dev';
import { VERSION } from '@/constants';

function main() {
  new p5(sketch)
}

main();

console.log(`dev version: ${VERSION}`);
