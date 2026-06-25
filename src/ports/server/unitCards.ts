import type {
  CardListItem,
  CertificationResults,
} from '@classicalmoser/prevail-contracts';
import type { UnitType } from '@classicalmoser/prevail-rules/domain';

/** Outbound port for unit card operations. */
export interface UnitCards {
  getAll(): Promise<CardListItem[]>;
  getCurrent(): Promise<UnitType[]>;
  getById(id: string): Promise<UnitType>;
  getByIds(ids: readonly string[]): Promise<UnitType[]>;
  createDraft(): Promise<string>;
  publishVersion(card: UnitType): Promise<UnitType>;
  certifyLatest(): Promise<CertificationResults>;
  deleteEmpty(): Promise<void>;
  preview(card: UnitType): Promise<string>;
}
