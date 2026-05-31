import type { JSX } from "solid-js";

type HandlerEvent<T, E extends Event> = E & {
  currentTarget: T;
  target: Element;
};

/**
 * Invokes a Solid `EventHandlerUnion` (function or `[fn, arg]` tuple) and
 * returns whether `preventDefault` was called on the event.
 */
export function callHandler<T, E extends Event>(
  event: HandlerEvent<T, E>,
  handler: JSX.EventHandlerUnion<T, E> | undefined,
): boolean {
  if (handler === undefined) {
    return event.defaultPrevented;
  }

  if (typeof handler === "function") {
    handler(event);
  } else {
    // BoundEventHandler uses numeric keys, not a tuple (see solid-js JSX types).
    handler[0](handler[1], event);
  }

  return event.defaultPrevented;
}
