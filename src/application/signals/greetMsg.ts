import { createSignal } from "solid-js";

export const useGreetMsg = () => {
  const [greetMsg, setGreetMsg] = createSignal<string>("");
  return { greetMsg, setGreetMsg };
};
