import type { SeatSelection } from '@application/play/selection/core/types';

export function initialIssueCommandSelection(): SeatSelection {
  return {
    kind: 'issueCommand',
    command: undefined,
    selected: [],
    lineStart: undefined,
    legalUnitCoordinates: [],
  };
}
