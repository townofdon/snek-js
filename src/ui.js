
// eslint-disable-next-line no-unused-vars
class UI {
    static drawTitle(title, textColor, offset, hasShadow, uiElements) {
        const p = createP(title);
        p.style('font-size', '6em');
        p.style('letter-spacing', '65px');
        p.style('color', textColor);
        p.style('line-height', '1em');
        p.style('font-family', "'Monofett', monospace");
        p.style('white-space', 'nowrap');
        if (hasShadow) {
            p.style('text-shadow', '6px 6px 3px black');
        }
        p.position(84 + offset, 7 + offset);
        p.parent("main");
        uiElements.push(p);
    }

    static drawLevelName(levelName, textColor, uiElements) {
        const p = createP(levelName);
        p.position(0, 0);
        p.style('font-size', '1em');
        p.style('color', textColor);
        p.style('background-color', 'rgba(0,0,0, 0.5)');
        p.style('line-height', '1em');
        p.style('white-space', 'nowrap');
        p.style('top', 'inherit');
        p.style('left', 'inherit');
        p.style('bottom', '0');
        p.style('right', '22px');
        p.style('margin', '0');
        p.style('padding', '3px');
        p.style('padding-left', '8px');
        p.style('padding-right', '8px');
        p.style('text-align', 'right');
        p.parent("main");
        uiElements.push(p);
    }

    static drawButton(textStr, x, y, onClick, uiElements) {
        const button = createButton(textStr);
        button.position(x, y);
        button.mousePressed(onClick);
        button.parent("main");
        uiElements.push(button);
    }

    static drawText(textStr, fontSize, y, uiElements) {
        const element = createP(textStr);
        element.style('font-size', fontSize);
        element.style('color', '#fff');
        element.style('text-shadow', '0px 3px 3px black');
        element.style('width', '100%');
        element.style('text-align', 'center');
        element.position(0, y);
        element.parent("main");
        uiElements.push(element);
    }

    static drawDarkOverlay(uiElements) {
        let div = createDiv();
        div.style('position', 'absolute');
        div.style('top', '0');
        div.style('bottom', '0');
        div.style('left', '0');
        div.style('right', '0');
        div.style('background-color', 'rgb(7 11 15 / 52%)');
        div.parent("main");
        uiElements.push(div);
    }
}



