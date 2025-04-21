import p5 from 'p5';

import './windowManagement';
import { sketch } from './snek';
import { validateLevelIds } from './levels/levelUtils';

validateLevelIds()

function main() {
    new p5(sketch)
}

main();
