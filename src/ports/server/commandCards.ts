import type {
  CardListItem,
  CertificationResults,
} from '@classicalmoser/prevail-contracts';
import type { CommandCard } from '@classicalmoser/prevail-rules/domain';

/** Outbound port for command card operations. */
export interface CommandCards {
  getAll(): Promise<CardListItem[]>;
  getCurrent(): Promise<CommandCard[]>;
  getById(id: string): Promise<CommandCard>;
  getByIds(ids: readonly string[]): Promise<CommandCard[]>;
  createDraft(): Promise<string>;
  publishVersion(card: CommandCard): Promise<CommandCard>;
  certifyLatest(): Promise<CertificationResults>;
  deleteEmpty(): Promise<void>;
  preview(card: CommandCard): Promise<string>;
}
