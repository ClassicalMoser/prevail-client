import type {
  CardListItem,
  CertificationResults,
} from '@classicalmoser/prevail-contracts';
import type { CommandCard } from '@classicalmoser/prevail-rules/domain';

/** Outbound port for command card operations. */
export interface CommandCards {
  /** Catalog rows, including drafts the caller may open. */
  getAll(): Promise<CardListItem[]>;
  /** Current published command cards. */
  getCurrent(): Promise<CommandCard[]>;
  /** One card, draft or published, by id. */
  getById(id: string): Promise<CommandCard>;
  /** The cards for `ids`, in the order the server returns them. */
  getByIds(ids: readonly string[]): Promise<CommandCard[]>;
  /** Open an empty draft. Returns its id. */
  createDraft(): Promise<string>;
  /** Publish `card` as the next version. Returns the stored card. */
  publishVersion(card: CommandCard): Promise<CommandCard>;
  /** Certify the latest version of each command card. */
  certifyLatest(): Promise<CertificationResults>;
  /** Delete drafts that were never given content. */
  deleteEmpty(): Promise<void>;
  /** Render a preview image for an unsaved card. Returns a URL. */
  preview(card: CommandCard): Promise<string>;
}
