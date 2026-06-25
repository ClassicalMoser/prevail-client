import type {
  CardListItem,
  CertificationResults,
} from '@classicalmoser/prevail-contracts';
import type { Card } from '@classicalmoser/prevail-rules/domain';

/** Outbound port for command card operations. */
export interface CommandCards {
  getAll(): Promise<CardListItem[]>;
  getCurrent(): Promise<Card[]>;
  getById(id: string): Promise<Card>;
  getByIds(ids: readonly string[]): Promise<Card[]>;
  createDraft(): Promise<string>;
  publishVersion(card: Card): Promise<Card>;
  certifyLatest(): Promise<CertificationResults>;
  deleteEmpty(): Promise<void>;
  preview(card: Card): Promise<string>;
}
