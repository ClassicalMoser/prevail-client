import type { Accessor } from "solid-js";
import { createSignal, onCleanup } from "solid-js";
import { isServer } from "solid-js/web";

export const useIsMobile = (): Accessor<boolean> => {
  if (isServer) {
    return () => false;
  }

  const mql = globalThis.matchMedia("(max-width: 767px)");
  const [state, setState] = createSignal(mql.matches);
  const update = () => setState(mql.matches);
  mql.addEventListener("change", update);
  onCleanup(() => {
    mql.removeEventListener("change", update);
  });
  return state;
};
