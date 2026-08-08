import { svgToDataUrl } from '@interface/lib';
import { Card, CardContent, CardHeader, CardTitle } from '../card';
import type { Accessor, JSX } from 'solid-js';
import { Show } from 'solid-js';

export const CardPreviewPanel = (props: {
  svg: Accessor<string | undefined>;
  errorMessage?: Accessor<string | undefined>;
}): JSX.Element => (
  <Show
    when={props.svg() !== undefined || props.errorMessage?.() !== undefined}
  >
    <Card>
      <CardHeader>
        <CardTitle>Preview</CardTitle>
      </CardHeader>
      <CardContent class="flex flex-col gap-4">
        <Show
          when={props.errorMessage?.() === undefined}
          fallback={
            <p class="text-destructive text-sm">{props.errorMessage?.()}</p>
          }
        >
          <Show when={props.svg()}>
            {(svg) => (
              <img
                src={svgToDataUrl(svg())}
                alt="CommandCard preview"
                class="mx-auto max-h-[480px] w-full max-w-md object-contain"
              />
            )}
          </Show>
        </Show>
      </CardContent>
    </Card>
  </Show>
);
