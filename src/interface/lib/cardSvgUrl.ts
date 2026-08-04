export type PublishedCardKind = 'command' | 'unit';

const CARD_ASSETS_BASE = 'https://assets.prevailgame.com/cards';

/** CDN URL for a published card SVG (`{uuid}_{semver}.svg`). */
export function cardSvgUrl(
  kind: PublishedCardKind,
  id: string,
  version: string,
): string {
  return `${CARD_ASSETS_BASE}/${kind}/svg/${id}_${version}.svg`;
}
