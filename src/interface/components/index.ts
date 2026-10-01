/**
 * Zaidan-based UI primitives (vega preset).
 * Styles: src/styles/zaidan-vega.css — components: zaidan.carere.dev/r/kobalte
 */
import { Badge, badgeVariants } from './badge';
import type { BadgeProps } from './badge';
import { Button, buttonVariants } from './button';
import type { ButtonProps } from './button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './card';
import { CardGallery } from './card-browser';
import { Checkbox, CheckboxLabel } from './checkbox';
import type { CheckboxLabelProps, CheckboxProps } from './checkbox';
import { FormField } from './form-field';
import { Input } from './input';
import type { InputProps } from './input';
import {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
} from './native-select';
import type { NativeSelectProps } from './native-select';
import { Separator } from './separator';
import type { SeparatorProps } from './separator';
import {
  AnchoredPublishedCardPreview,
  AppNav,
  ArmyCardThumb,
  ArmyCommandCardsSection,
  ArmyCompositionHeader,
  ArmyEditorForm,
  ArmyUnitsSection,
  CardCatalogPage,
  CardPreviewPanel,
  CommandCardForm,
  EditorToolbar,
  FaceDownCardThumb,
  PublishedCardFace,
  PublishedCardThumb,
  UnitCardForm,
} from './authoring';
import type { CardCatalogItem, PublishedCardFaceSize } from './authoring';

export {
  Badge,
  badgeVariants,
  type BadgeProps,
  Button,
  buttonVariants,
  type ButtonProps,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardGallery,
  Checkbox,
  CheckboxLabel,
  type CheckboxLabelProps,
  type CheckboxProps,
  FormField,
  Input,
  type InputProps,
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
  type NativeSelectProps,
  Separator,
  type SeparatorProps,
  AnchoredPublishedCardPreview,
  AppNav,
  ArmyCardThumb,
  ArmyCommandCardsSection,
  ArmyCompositionHeader,
  ArmyEditorForm,
  ArmyUnitsSection,
  CardCatalogPage,
  CardPreviewPanel,
  CommandCardForm,
  EditorToolbar,
  FaceDownCardThumb,
  PublishedCardFace,
  PublishedCardThumb,
  UnitCardForm,
  type CardCatalogItem,
  type PublishedCardFaceSize,
};
