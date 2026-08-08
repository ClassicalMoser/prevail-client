import type {
  FailValidationResult,
  GameEffectEvent,
  GameForVisibility,
  PlayerChoiceEvent,
  PlayerSide,
  ProjectedPlayerChoiceEvent,
} from '@classicalmoser/prevail-rules/domain';
import type { InGameSeatOutboundMessage } from '@classicalmoser/prevail-contracts';

/** Outbound seat WebSocket message (presentation stream). */
export type GameSeatOutbound = InGameSeatOutboundMessage<
  ProjectedPlayerChoiceEvent,
  GameEffectEvent,
  GameForVisibility<'whiteSeen'> | GameForVisibility<'blackSeen'>,
  FailValidationResult
>;

export interface GameSeatConnection {
  sendChoice: (choice: PlayerChoiceEvent) => void;
  close: () => void;
  /** Subscribe to parsed outbound envelopes; returns unsubscribe. */
  subscribe: (listener: (message: GameSeatOutbound) => void) => () => void;
  /** Subscribe to connection status changes; returns unsubscribe. */
  subscribeStatus: (
    listener: (status: GameSeatConnectionStatus) => void,
  ) => () => void;
}

export type GameSeatConnectionStatus =
  | 'connecting'
  | 'open'
  | 'closed'
  | 'error';

export interface GameSeatConnectArgs {
  gameId: string;
  side: PlayerSide;
  /** Fresh access token for the upgrade (query param). */
  getAccessToken: () => Promise<string | undefined>;
}

/** Outbound port for in-game seat WebSocket sessions. */
export interface GameSeat {
  connect(args: GameSeatConnectArgs): Promise<GameSeatConnection>;
}
