import type {
  CardListItem,
  CertificationResults,
} from '@classicalmoser/prevail-contracts';
import type { UnitType } from '@classicalmoser/prevail-rules/domain';

/** Outbound port for unit card operations. */
export interface UnitCards {
  /** Catalog rows, including drafts the caller may open. */
  getAll(): Promise<CardListItem[]>;
  /** Current published unit cards. */
  getCurrent(): Promise<UnitType[]>;
  /** One card, draft or published, by id. */
  getById(id: string): Promise<UnitType>;
  /** The cards for `ids`, in the order the server returns them. */
  getByIds(ids: readonly string[]): Promise<UnitType[]>;
  /** Open an empty draft. Returns its id. */
  createDraft(): Promise<string>;
  /** Publish `card` as the next version. Returns the stored card. */
  publishVersion(card: UnitType): Promise<UnitType>;
  /** Certify the latest version of each unit card. */
  certifyLatest(): Promise<CertificationResults>;
  /** Delete drafts that were never given content. */
  deleteEmpty(): Promise<void>;
  /** Render a preview image for an unsaved card. Returns a URL. */
  preview(card: UnitType): Promise<string>;
}
