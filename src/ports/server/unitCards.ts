import type { CertificationResults } from '@classicalmoser/prevail-contracts';
import type { UnitType } from '@classicalmoser/prevail-rules/domain';

/** Outbound port for unit card operations. */
export interface UnitCards {
  getCurrent(): Promise<UnitType[]>;
  getById(id: string): Promise<UnitType>;
  getByIds(ids: readonly string[]): Promise<UnitType[]>;
  createDraft(): Promise<string>;
  publishVersion(card: UnitType): Promise<UnitType>;
  certifyLatest(): Promise<CertificationResults>;
  preview(card: UnitType): Promise<string>;
}
