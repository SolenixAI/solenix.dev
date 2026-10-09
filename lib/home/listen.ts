// The listeners, observers and timers a page starts, kept so that detaching the page removes every one of them.
// A page attaches with on()/add() and detaches with stop(); nothing it started keeps running afterwards.
export function listener() {
  const off: (() => void)[] = [];
  return {
    on(target: EventTarget, type: string, fn: (e: any) => void, options?: AddEventListenerOptions) {
      target.addEventListener(type, fn, options);
      off.push(() => target.removeEventListener(type, fn, options));
    },
    add(stop: () => void) {
      off.push(stop);
    },
    stop() {
      off.splice(0).reverse().forEach((f) => f());
    },
  };
}
