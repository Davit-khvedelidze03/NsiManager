/** SP-122-ის ჩანაწერი (NsiManager.Api/Models/Sp122.cs). */
export interface Sp122 {
  prkey: number;
  ng: number;
  vg: number;
  kol: string | null;
  ves: number | null;
  udl: string | null;
  dm: string | null;
  prg: string | null;
  utv: string | null;
  rod: string | null;
  spec: number | null;
  negab: number | null;
  nSlujb: number | null;
  nazGr: string | null;
  nazRus: string | null;
}

/** დამატება / რედაქტირება (NsiManager.Api/Dtos/Sp122Request.cs). */
export type Sp122Request = Omit<Sp122, 'prkey'>;

/** ფორმის ველების სახელები — ყველა სვეტი prkey-ის გარდა. */
export type Sp122Field = keyof Sp122Request;
