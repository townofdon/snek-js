import p5 from 'p5';

import { sketch } from './snek';

function main() {
    // const sketch = (p: p5) => {
    //     p.setup = setup;
    //     p.draw = draw;
    // }
    new p5(sketch)
}

main();
