import { createSignal } from 'solid-js';
import type { Accessor, Setter } from 'solid-js';

export const useName = (): {
  name: Accessor<string>;
  setName: Setter<string>;
} => {
  const [name, setName] = createSignal<string>('');
  return { name, setName };
};
