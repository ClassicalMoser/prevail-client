import { createSignal } from 'solid-js';
import type { Accessor, Setter } from 'solid-js';

export const useGreetMsg = (): {
  greetMsg: Accessor<string>;
  setGreetMsg: Setter<string>;
} => {
  const [greetMsg, setGreetMsg] = createSignal<string>('');
  return { greetMsg, setGreetMsg };
};
