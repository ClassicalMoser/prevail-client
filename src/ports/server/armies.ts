import type { ArmyWriteBody } from '@classicalmoser/prevail-contracts';
import type { Army } from '@classicalmoser/prevail-rules/domain';

/**
 * Outbound port for owned army operations.
 * Commands return ids / void; queries return the Army read model.
 */
export interface Armies {
  list(): Promise<Army[]>;
  getById(id: string): Promise<Army>;
  /** Creates an empty army; returns its id (read via getById). */
  create(): Promise<string>;
  /** Replaces composition for `:id`; success has no body. */
  update(id: string, body: ArmyWriteBody): Promise<void>;
  archive(id: string): Promise<void>;
}
