import { Sp122Field } from './sp122';

/**
 * ველის ტიპი:
 *   wagon   — 8-ნიშნა ვაგონის ნომერი
 *   decimal — რიცხვი, მაქს. 2 ათწილადით
 *   integer — მთელი რიცხვი
 *   text    — ტექსტი
 */
export type FieldKind = 'wagon' | 'decimal' | 'integer' | 'text';

export interface FieldDef {
  key: Sp122Field;
  label: string;
  kind: FieldKind;
  required?: boolean;
  maxLength?: number;
  /** ფორმაში ორი სვეტის სიგანე */
  wide?: boolean;
}

/** ველები იმ თანმიმდევრობით, როგორც ფორმასა და ცხრილში ჩანს. */
export const SP122_FIELDS: FieldDef[] = [
  { key: 'ng', label: 'ვაგონის ნომრის ქვედა ზღვარი', kind: 'wagon', required: true, maxLength: 8 },
  { key: 'vg', label: 'ვაგონის ნომრის ზედა ზღვარი', kind: 'wagon', required: true, maxLength: 8 },
  { key: 'kol', label: 'ღერძების რაოდენობა', kind: 'text', maxLength: 10 },
  { key: 'ves', label: 'ტარას წონა', kind: 'decimal' },
  { key: 'udl', label: 'პირობითი სიგრძე', kind: 'text', maxLength: 10 },
  { key: 'dm', label: 'ფიზიკური სიგრძე (მმ)', kind: 'text', maxLength: 10 },
  { key: 'prg', label: 'ტვირთამწეობის ზღვარი', kind: 'text', maxLength: 10 },
  { key: 'utv', label: 'ვაგონის პირობითი ტიპის კოდი', kind: 'text', maxLength: 10 },
  { key: 'rod', label: 'ვაგონის სახეობა', kind: 'text', maxLength: 10 },
  { key: 'spec', label: 'სპეციალიზაცია', kind: 'integer' },
  { key: 'negab', label: 'არაგაბარიტულობა', kind: 'integer' },
  { key: 'nSlujb', label: 'მომსახურების ვადა', kind: 'integer' },
  { key: 'nazGr', label: 'დამატებითი მახასიათებელი (ქართულად)', kind: 'text', maxLength: 500, wide: true },
  { key: 'nazRus', label: 'დამატებითი მახასიათებელი (რუსულად)', kind: 'text', maxLength: 500, wide: true },
];
