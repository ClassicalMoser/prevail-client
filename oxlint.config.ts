import type { OxlintConfig } from 'oxlint';
import { createOxlintConfig } from 'classicalmoser-oxlint-config';
import { boundaries } from './boundaries.ts';

const config: OxlintConfig = createOxlintConfig({
  jsx: 'solid',
  boundaries,
});

export default config;
