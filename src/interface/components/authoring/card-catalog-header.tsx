import { Button } from '@interface/components';
import type { JSX } from 'solid-js';

export const CardCatalogHeader = (props: {
  title: string;
  description: string;
  isCertifying: boolean;
  onCertify: () => void;
  isCreatingDraft: boolean;
  onCreateDraft: () => void;
}): JSX.Element => (
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 class="font-display text-3xl tracking-wide">{props.title}</h1>
      <p class="text-muted-foreground text-sm">{props.description}</p>
    </div>
    <div class="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="outline"
        disabled={props.isCertifying}
        onClick={props.onCertify}
      >
        {props.isCertifying ? 'Certifying…' : 'Certify Latest'}
      </Button>
      <Button
        type="button"
        disabled={props.isCreatingDraft}
        onClick={props.onCreateDraft}
      >
        {props.isCreatingDraft ? 'Creating…' : 'New Draft'}
      </Button>
    </div>
  </div>
);
