"use client";

/**
 * 以下皆為 `@heroui/react/*` 官方元件；因 React 19 + RAC 型別缺欄位，匯出側以 `as any` 收口，
 * 避免 JSX 誤用不完整的 `*RootProps`。compound（Radio.Control、Modal.Backdrop 等）執行期不變。
 */
import { Accordion as AccordionRaw } from "@heroui/react/accordion";
import { Button as ButtonRaw } from "@heroui/react/button";
import { Card as CardRaw } from "@heroui/react/card";
import { Checkbox as CheckboxRaw } from "@heroui/react/checkbox";
import { Dropdown as DropdownRaw } from "@heroui/react/dropdown";
import { Input as InputRaw } from "@heroui/react/input";
import { Label as LabelRaw } from "@heroui/react/label";
import { Link as LinkRaw } from "@heroui/react/link";
import { Modal as ModalRaw } from "@heroui/react/modal";
import { Radio as RadioRaw } from "@heroui/react/radio";
import { RadioGroup as RadioGroupRaw } from "@heroui/react/radio-group";
import { Spinner as SpinnerRaw } from "@heroui/react/spinner";
import { Tabs as TabsRaw } from "@heroui/react/tabs";
import { TextArea as TextAreaRaw } from "@heroui/react/textarea";
import { TextField as TextFieldRaw } from "@heroui/react/textfield";

export type { Selection } from "@heroui/react";
export { useOverlayState } from "@heroui/react";

export const Accordion = AccordionRaw as any;
export const Button = ButtonRaw as any;
export const Checkbox = CheckboxRaw as any;
export const Dropdown = DropdownRaw as any;
export const Label = LabelRaw as any;
export const Link = LinkRaw as any;
export const Modal = ModalRaw as any;
export const Radio = RadioRaw as any;
export const RadioGroup = RadioGroupRaw as any;
export const TextField = TextFieldRaw as any;
export const Input = InputRaw as any;
export const TextArea = TextAreaRaw as any;

export const Card = CardRaw;
export const Spinner = SpinnerRaw;
export const Tabs = TabsRaw as any;
