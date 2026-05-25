import p5 from 'p5';

import './windowManagement';
import './uiv2'
import { sketch } from './snek';
import { validateLevels } from './levels/levelUtils';

validateLevels()

function main() {
    new p5(sketch)
}

main();
