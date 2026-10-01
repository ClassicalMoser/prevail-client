import type { ArmyWriteBody } from '@classicalmoser/prevail-contracts';
import type { Army } from '@classicalmoser/prevail-rules/domain';

/**
 * Outbound port for owned army operations.
 * Commands return ids / void; queries return the Army read model.
 */
export interface Armies {
  /** Owned armies for the signed-in player. */
  list(): Promise<Army[]>;
  /** One owned army. Rejects when `id` is not owned. */
  getById(id: string): Promise<Army>;
  /** Creates an empty army; returns its id (read via getById). */
  create(): Promise<string>;
  /** Replaces composition for `:id`; success has no body. */
  update(id: string, body: ArmyWriteBody): Promise<void>;
  /** Hide an owned army from the active list. */
  archive(id: string): Promise<void>;
}
