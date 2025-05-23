
export function requireElementById<T>(id: string) {
  const element = document.getElementById(id) as T;
  if (!element) throw new Error(`Unable to find element with id "${id}"`);
  return element;
}

export const parseElementLevelNum = (element: HTMLButtonElement) => {
  if (!element?.dataset?.level) return -1;
  return parseInt(element.dataset?.level || '', 10) || -1;
}

export class DOM {
  private static prev: HTMLElement;

  static select(element: HTMLElement | null | undefined, preventScroll = false) {
    if (!element) return;
    if (document.activeElement && document.activeElement !== element) {
      document.activeElement.classList.remove('active');
    }
    element.focus({ preventScroll });
    const didFocusWork = document.activeElement === element;
    if (didFocusWork) {
      element.classList.add('active');
      if (DOM.prev && DOM.prev !== element) DOM.deselect(DOM.prev);
      DOM.prev = element;
    } else {
      element.classList.remove('active');
      if (DOM.prev && DOM.prev !== element) DOM.select(DOM.prev);
    }
  }

  static deselect(element: HTMLElement | null | undefined) {
    if (!element) return;
    element.blur();
    element.classList.remove('active');
  }
}
