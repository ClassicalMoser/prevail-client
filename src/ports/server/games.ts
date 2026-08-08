import type { CreateVsBotGameBody } from '@classicalmoser/prevail-contracts';

/** Outbound port for game session HTTP commands. */
export interface Games {
  /** Creates a human-vs-bot game; returns the new game id. */
  createVsBot(body: CreateVsBotGameBody): Promise<string>;
}
