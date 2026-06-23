import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@interface/components';
import { svgToDataUrl } from '@interface/lib/svgToDataUrl';
import type { JSX } from 'solid-js';
import { Show } from 'solid-js';

export const CardPreviewPanel = (props: {
  svg: string | undefined;
  errorMessage?: string;
}): JSX.Element => (
  <Show when={props.svg !== undefined || props.errorMessage !== undefined}>
    <Card>
      <CardHeader>
        <CardTitle>Preview</CardTitle>
      </CardHeader>
      <CardContent class="flex flex-col gap-4">
        <Show
          when={props.errorMessage === undefined}
          fallback={
            <p class="text-destructive text-sm">{props.errorMessage}</p>
          }
        >
          <Show when={props.svg}>
            {(svg) => (
              <img
                src={svgToDataUrl(svg())}
                alt="Card preview"
                class="mx-auto max-h-[480px] w-full max-w-md object-contain"
              />
            )}
          </Show>
        </Show>
      </CardContent>
    </Card>
  </Show>
);
