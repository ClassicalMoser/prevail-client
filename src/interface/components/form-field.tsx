import type { JSX } from 'solid-js';
import { Label } from './label';

export const FormField = (props: {
  label: string;
  for: string;
  description?: string;
  children: JSX.Element;
}): JSX.Element => (
  <div class="flex flex-col gap-2">
    <Label for={props.for}>{props.label}</Label>
    {props.children}
    {props.description !== undefined ? (
      <p class="text-muted-foreground text-xs">{props.description}</p>
    ) : null}
  </div>
);
