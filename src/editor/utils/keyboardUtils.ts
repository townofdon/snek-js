
interface KeyboardOptions {
  ctrlKey?: boolean,
  shiftKey?: boolean,
  altKey?: boolean,
}

export enum SpecialKey {
  Backspace = 'backspace',
  Escape = 'escape',
  Tab = 'tab',
  Space = 'space',
  Enter = 'enter',
  Delete = 'delete',
  ArrowUp = 'ArrowUp',
  ArrowDown = 'ArrowDown',
  ArrowLeft = 'ArrowLeft',
  ArrowRight = 'ArrowRight',
}

export function isNumberPressed(ev: KeyboardEvent, num: number, opts: KeyboardOptions = {}): boolean {
  if (!areOptionsSatisfied(ev, opts)) return false;
  return findNumberPressed(ev) === num;
}

export function isCharPressed(ev: KeyboardEvent, char: string, opts: KeyboardOptions = {}): boolean {
  if (!areOptionsSatisfied(ev, opts)) return false;
  return findCharPressed(ev) === char;
}

function areOptionsSatisfied(ev: KeyboardEvent, opts: KeyboardOptions = {}): boolean {
  const isControlPressed = ev.metaKey || ev.ctrlKey; // meta key is CMD key on mac
  const isShiftPressed = ev.shiftKey;
  const isAltKeyPressed = ev.altKey;
  if (opts.ctrlKey && !isControlPressed) return false;
  if (opts.shiftKey && !isShiftPressed) return false;
  if (opts.altKey && !isAltKeyPressed) return false;
  return true;
}

export function findNumberPressed(ev: KeyboardEvent): number {
  if (ev.key === '0' || ev.code === 'Digit0' || ev.code === 'Numpad0' || ev.keyCode === 48 || ev.keyCode === 96) return 0;
  if (ev.key === '1' || ev.code === 'Digit1' || ev.code === 'Numpad1' || ev.keyCode === 49 || ev.keyCode === 97) return 1;
  if (ev.key === '2' || ev.code === 'Digit2' || ev.code === 'Numpad2' || ev.keyCode === 50 || ev.keyCode === 98) return 2;
  if (ev.key === '3' || ev.code === 'Digit3' || ev.code === 'Numpad3' || ev.keyCode === 51 || ev.keyCode === 99) return 3;
  if (ev.key === '4' || ev.code === 'Digit4' || ev.code === 'Numpad4' || ev.keyCode === 52 || ev.keyCode === 100) return 4;
  if (ev.key === '5' || ev.code === 'Digit5' || ev.code === 'Numpad5' || ev.keyCode === 53 || ev.keyCode === 101) return 5;
  if (ev.key === '6' || ev.code === 'Digit6' || ev.code === 'Numpad6' || ev.keyCode === 54 || ev.keyCode === 102) return 6;
  if (ev.key === '7' || ev.code === 'Digit7' || ev.code === 'Numpad7' || ev.keyCode === 55 || ev.keyCode === 103) return 7;
  if (ev.key === '8' || ev.code === 'Digit8' || ev.code === 'Numpad8' || ev.keyCode === 56 || ev.keyCode === 104) return 8;
  if (ev.key === '9' || ev.code === 'Digit9' || ev.code === 'Numpad9' || ev.keyCode === 57 || ev.keyCode === 105) return 9;
  return -1;
}

function findCharPressed(ev: KeyboardEvent): string {
  const num = findNumberPressed(ev);
  if (num !== -1) return String(num);
  if (ev.key === 'a' || ev.code === 'KeyA' || ev.keyCode === 65) return 'a';
  if (ev.key === 'b' || ev.code === 'KeyB' || ev.keyCode === 66) return 'b';
  if (ev.key === 'c' || ev.code === 'KeyC' || ev.keyCode === 67) return 'c';
  if (ev.key === 'd' || ev.code === 'KeyD' || ev.keyCode === 68) return 'd';
  if (ev.key === 'e' || ev.code === 'KeyE' || ev.keyCode === 69) return 'e';
  if (ev.key === 'f' || ev.code === 'KeyF' || ev.keyCode === 70) return 'f';
  if (ev.key === 'g' || ev.code === 'KeyG' || ev.keyCode === 71) return 'g';
  if (ev.key === 'h' || ev.code === 'KeyH' || ev.keyCode === 72) return 'h';
  if (ev.key === 'i' || ev.code === 'KeyI' || ev.keyCode === 73) return 'i';
  if (ev.key === 'j' || ev.code === 'KeyJ' || ev.keyCode === 74) return 'j';
  if (ev.key === 'k' || ev.code === 'KeyK' || ev.keyCode === 75) return 'k';
  if (ev.key === 'l' || ev.code === 'KeyL' || ev.keyCode === 76) return 'l';
  if (ev.key === 'm' || ev.code === 'KeyM' || ev.keyCode === 77) return 'm';
  if (ev.key === 'n' || ev.code === 'KeyN' || ev.keyCode === 78) return 'n';
  if (ev.key === 'o' || ev.code === 'KeyO' || ev.keyCode === 79) return 'o';
  if (ev.key === 'p' || ev.code === 'KeyP' || ev.keyCode === 80) return 'p';
  if (ev.key === 'q' || ev.code === 'KeyQ' || ev.keyCode === 81) return 'q';
  if (ev.key === 'r' || ev.code === 'KeyR' || ev.keyCode === 82) return 'r';
  if (ev.key === 's' || ev.code === 'KeyS' || ev.keyCode === 83) return 's';
  if (ev.key === 't' || ev.code === 'KeyT' || ev.keyCode === 84) return 't';
  if (ev.key === 'u' || ev.code === 'KeyU' || ev.keyCode === 85) return 'u';
  if (ev.key === 'v' || ev.code === 'KeyV' || ev.keyCode === 86) return 'v';
  if (ev.key === 'w' || ev.code === 'KeyW' || ev.keyCode === 87) return 'w';
  if (ev.key === 'x' || ev.code === 'KeyX' || ev.keyCode === 88) return 'x';
  if (ev.key === 'y' || ev.code === 'KeyY' || ev.keyCode === 89) return 'y';
  if (ev.key === 'z' || ev.code === 'KeyZ' || ev.keyCode === 90) return 'z';
  if (ev.key === '`' || ev.code === 'Backquote' || ev.keyCode === 192) return '`';
  if (ev.key === '-' || ev.code === 'Minus' || ev.keyCode === 189) return '-';
  if (ev.key === '=' || ev.code === 'Equals' || ev.keyCode === 187) return '=';
  if (ev.key === '-' || ev.code === 'NumpadSubtract' || ev.keyCode === 109) return '-';
  if (ev.key === '+' || ev.code === 'NumpadAdd' || ev.keyCode === 107) return '+';
  if (ev.key === '[' || ev.code === 'BracketLeft' || ev.keyCode === 219) return '[';
  if (ev.key === ']' || ev.code === 'BracketRight' || ev.keyCode === 221) return ']';
  if (ev.key === 'Backspace' || ev.code === 'Backspace' || ev.keyCode === 221) return SpecialKey.Backspace;
  if (ev.key === 'Escape' || ev.code === 'Escape' || ev.keyCode === 27) return SpecialKey.Escape;
  if (ev.key === ' ' || ev.code === 'Space' || ev.keyCode === 32) return SpecialKey.Space;
  if (ev.key === 'Enter' || ev.code === 'Enter' || ev.code === 'NumpadEnter' || ev.keyCode === 13) return SpecialKey.Enter;
  if (ev.key === 'Delete' || ev.code === 'Delete' || ev.keyCode === 46) return SpecialKey.Delete;
  if (ev.key === 'ArrowUp' || ev.code === 'ArrowUp' || ev.keyCode === 38) return SpecialKey.ArrowUp;
  if (ev.key === 'ArrowDown' || ev.code === 'ArrowDown' || ev.keyCode === 40) return SpecialKey.ArrowDown;
  if (ev.key === 'ArrowLeft' || ev.code === 'ArrowLeft' || ev.keyCode === 37) return SpecialKey.ArrowLeft;
  if (ev.key === 'ArrowRight' || ev.code === 'ArrowRight' || ev.keyCode === 39) return SpecialKey.ArrowRight;
  return ''
}
