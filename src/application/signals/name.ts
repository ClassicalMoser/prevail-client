import { createSignal } from "solid-js";

export const useName = () => {
  const [name, setName] = createSignal<string>("");
  return { name, setName };
};
