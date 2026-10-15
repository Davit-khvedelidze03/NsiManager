"""
SP-122-ის Excel-ის ფაილის გარდაქმნა ბაზაში ჩასატვირთად.

რას აკეთებს:
  1. კითხულობს Excel-ს (.xlsx; ძველი .xls ჯერ Excel-ში შეინახეთ .xlsx-ად)
  2. აღადგენს დაზიანებულ ხაზებს: ფაილში ერთ უჯრაში (row 113, naz_rus)
     66 სხვა ჩანაწერი იყო ტექსტად ჩასმული, ერთი კი ორ ხაზზე იყო გაყოფილი
  3. ასუფთავებს: ზედმეტი ჰარები, 'NULL' ტექსტი → ცარიელი, '32.0' → 32
  4. naz_gr-ს ძველი კოდირებიდან (Georgian-PS, რუსულ ასოებად ნაჩვენები)
     გადაიყვანს ნამდვილ ქართულ ტექსტში: 'ГАбЦТЦЛЙ' → 'დახურული'
  5. ამოწმებს: 8-ნიშნა ნომრები, ng ≤ vg, დუბლიკატები, ციფრობრივი დიაპაზონების გადაფარვა
  6. ქმნის: sp122_clean.csv (ყველა სვეტი) და ../04_import_real_data.sql (ბაზისთვის)

გაშვება:  python3 convert_sp122.py <ფაილი.xlsx>
საჭიროა: pip install openpyxl
"""
import csv
import sys
from collections import Counter
from pathlib import Path

import openpyxl

COLS = ['ng', 'vg', 'ng3', 'vg3', 'ng4', 'vg4', 'ng5', 'vg5', 'ng6', 'vg6', 'ng7', 'vg7',
        'kol', 'uch_rod', 'ves', 'udl', 'dm', 'prg', 'utv', 'rod', 'spec',
        'naz_rus', 'naz_gr', 'naz_ge', 'negab', 'n_slujb', 'nomp', 'nomd', 'nomk', 'nomkrp', 'prkey']

# ჩვენს dbo.[SP-122] ცხრილში შემავალი სვეტები
TABLE_COLS = ['prkey', 'ng', 'vg', 'kol', 'ves', 'udl', 'dm', 'prg', 'utv', 'rod',
              'spec', 'negab', 'n_slujb', 'naz_gr', 'naz_rus']
NUMERIC = {'prkey', 'ng', 'vg', 'ves', 'spec', 'negab', 'n_slujb'}

# Georgian-PS: ბაიტები 0xC0.. ამ რიგით (არქაული ასოების ჩათვლით)
GEORGIAN_PS = 'აბგდევზჱთიკლმნჲოპჟრსტჳუფქღყშჩცძწჭხჴჯჰჵ'


def georgian_ps_to_unicode(text):
    out = []
    for ch in text:
        code = ch.encode('cp1251')[0] if ord(ch) > 127 else None
        if code is not None and 0xC0 <= code < 0xC0 + len(GEORGIAN_PS):
            out.append(GEORGIAN_PS[code - 0xC0])
        elif ch == '\\':
            out.append('/')  # ძველ ფაილში აბრევიატურისთვის: 'ნ\\ვაგ' → 'ნ/ვაგ'
        else:
            out.append(ch)
    return ''.join(out)


def read_records(path):
    """Excel-ის ხაზები → ჩანაწერები (დაზიანებული უჯრის აღდგენით)."""
    sheet = openpyxl.load_workbook(path, read_only=True, data_only=True).worksheets[0]
    rows = list(sheet.iter_rows(values_only=True))
    if [str(h).strip() for h in rows[0][:len(COLS)]] != COLS:
        sys.exit(f'მოულოდნელი სათაურები: {rows[0]}')

    rows = [list(r[:len(COLS)]) for r in rows[1:]]
    records, i = [], 0
    naz_rus = COLS.index('naz_rus')
    while i < len(rows):
        row = rows[i]
        cell = row[naz_rus]
        if isinstance(cell, str) and '\n' in cell:
            # უჯრაში ჩასმული ჩანაწერები (ველები ტაბით, ხაზები ახალი ხაზით)
            lines = cell.split('\n')
            records.append(row[:naz_rus] + lines[0].split('\t'))
            records.extend(line.split('\t') for line in lines[1:-1])
            # ბოლო ჩანაწერის დასასრული შემდეგ Excel-ის ხაზზეა
            head = lines[-1].split('\t')
            tail = rows[i + 1]
            records.append(head[:-1] + [head[-1] + str(tail[0])] + tail[1:len(COLS) - len(head) + 1])
            i += 2
            continue
        if any(v not in (None, '') for v in row):
            records.append(row)
        i += 1

    bad = [r for r in records if len(r) != len(COLS)]
    if bad:
        sys.exit(f'ჩანაწერი არასწორი სვეტების რაოდენობით: {bad[0]}')
    return [dict(zip(COLS, r)) for r in records]


def clean(value):
    if value is None:
        return None
    if isinstance(value, float) and value.is_integer():
        return int(value)
    if isinstance(value, str):
        value = value.strip()
        if value in ('', 'NULL'):
            return None
        try:
            number = float(value)
            return int(number) if number.is_integer() else number
        except ValueError:
            return value
    return value


def digit_groups(n):
    """ვაგონის ნომრის ციფრობრივი ჯგუფები: 3 პირველი, მე-4, მე-5, მე-6, მე-7 (მე-8 საკონტროლოა)."""
    return [n // 100000, n // 10000 % 10, n // 1000 % 10, n // 100 % 10, n // 10 % 10]


def validate(records):
    errors = []
    for r in records:
        ng, vg = r['ng'], r['vg']
        if not (isinstance(ng, int) and isinstance(vg, int)
                and 10_000_000 <= ng <= 99_999_999 and 10_000_000 <= vg <= 99_999_999):
            errors.append(f'{ng}–{vg}: არ არის 8-ნიშნა')
        elif any(a > b for a, b in zip(digit_groups(ng), digit_groups(vg))):
            errors.append(f'{ng}–{vg}: ციფრობრივი დიაპაზონი არასწორია')

    pairs = Counter((r['ng'], r['vg']) for r in records)
    errors += [f'{ng}–{vg}: დუბლიკატი' for (ng, vg), n in pairs.items() if n > 1]
    keys = Counter(r['prkey'] for r in records)
    errors += [f'prkey {k}: დუბლიკატი' for k, n in keys.items() if n > 1 or k is None]

    ordered = sorted(records, key=lambda r: (r['ng'], r['vg']))
    for i, a in enumerate(ordered):
        for b in ordered[i + 1:]:
            if b['ng'] > a['vg']:
                break
            if all(x1 <= y2 and y1 <= x2 for (x1, x2), (y1, y2) in zip(
                    zip(digit_groups(a['ng']), digit_groups(a['vg'])),
                    zip(digit_groups(b['ng']), digit_groups(b['vg'])))):
                errors.append(f"{a['ng']}–{a['vg']} და {b['ng']}–{b['vg']}: ერთსა და იმავე ვაგონს ფარავს")
    return errors


def sql_value(column, value):
    if value is None:
        return 'NULL'
    if column in NUMERIC:
        return str(value)
    return "N'" + str(value).replace("'", "''") + "'"


def write_sql(records, path):
    batch = 500  # SQL Server: ერთ INSERT ... VALUES-ში მაქსიმუმ 1000 ხაზი
    col_list = ', '.join(TABLE_COLS)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(f"""/* =====================================================================
   SP-122 — რეალური მონაცემების ჩატვირთვა ({len(records)} ჩანაწერი)
   შექმნილია ავტომატურად: database/sp122/import/convert_sp122.py
   ყურადღება: ცხრილის არსებული ჩანაწერები (სატესტოები) იშლება და
   იცვლება ფაილის მონაცემებით. ყველაფერი ერთ ტრანზაქციაშია.
   ===================================================================== */
USE NSI;
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRANSACTION;

DELETE FROM dbo.[SP-122];

SET IDENTITY_INSERT dbo.[SP-122] ON;   -- prkey-ები ორიგინალიდან ინახება
""")
        for start in range(0, len(records), batch):
            chunk = records[start:start + batch]
            f.write(f'\nINSERT INTO dbo.[SP-122] ({col_list}) VALUES\n')
            f.write(',\n'.join(
                '(' + ', '.join(sql_value(c, r[c]) for c in TABLE_COLS) + ')' for r in chunk))
            f.write(';\n')
        f.write(f"""
SET IDENTITY_INSERT dbo.[SP-122] OFF;

-- საბოლოო შემოწმება: რაოდენობა და ციფრობრივი გადაფარვები
IF (SELECT COUNT(*) FROM dbo.[SP-122]) <> {len(records)}
BEGIN
    THROW 50001, N'ჩანაწერების რაოდენობა არ ემთხვევა', 1;
END

IF EXISTS (
    SELECT 1
    FROM dbo.[SP-122] a
    JOIN dbo.[SP-122] b ON a.prkey < b.prkey AND a.ng <= b.vg AND a.vg >= b.ng
    WHERE a.ng / 100000      <= b.vg / 100000      AND b.ng / 100000      <= a.vg / 100000
      AND a.ng / 10000 % 10  <= b.vg / 10000 % 10  AND b.ng / 10000 % 10  <= a.vg / 10000 % 10
      AND a.ng / 1000 % 10   <= b.vg / 1000 % 10   AND b.ng / 1000 % 10   <= a.vg / 1000 % 10
      AND a.ng / 100 % 10    <= b.vg / 100 % 10    AND b.ng / 100 % 10    <= a.vg / 100 % 10
      AND a.ng / 10 % 10     <= b.vg / 10 % 10     AND b.ng / 10 % 10     <= a.vg / 10 % 10
)
BEGIN
    THROW 50002, N'ჩატვირთულ მონაცემებში ციფრობრივი გადაფარვაა', 1;
END

COMMIT TRANSACTION;

-- ახალი ჩანაწერების prkey ყველაზე დიდი არსებულის შემდეგ გაგრძელდება
DBCC CHECKIDENT (N'dbo.[SP-122]', RESEED);

SELECT COUNT(*) AS imported FROM dbo.[SP-122];
GO
""")


def write_csv(records, path):
    with open(path, 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=COLS)
        writer.writeheader()
        writer.writerows(records)


def main():
    if len(sys.argv) != 2:
        sys.exit('გამოყენება: python3 convert_sp122.py <ფაილი.xlsx>')
    here = Path(__file__).resolve().parent

    records = [{c: clean(v) for c, v in r.items()} for r in read_records(sys.argv[1])]
    for r in records:
        if r['naz_gr']:
            r['naz_gr'] = georgian_ps_to_unicode(r['naz_gr'])
    records.sort(key=lambda r: (r['ng'], r['vg']))

    errors = validate(records)
    if errors:
        print(f'ნაპოვნია {len(errors)} პრობლემა:')
        print('\n'.join(errors[:50]))
        sys.exit(1)

    write_csv(records, here / 'sp122_clean.csv')
    write_sql(records, here.parent / '04_import_real_data.sql')
    print(f'მზადაა: {len(records)} ჩანაწერი → sp122_clean.csv, ../04_import_real_data.sql')


if __name__ == '__main__':
    main()
