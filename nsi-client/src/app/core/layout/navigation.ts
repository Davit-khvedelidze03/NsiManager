export interface NavItem {
  /** კოდი, რომელიც ჩამონათვალის ღილაკზე ჩანს */
  label: string;
  /** სრული დასახელება ჩამონათვალში */
  title: string;
  path: string;
}

/** ცნობარების ჩამონათვალი header-ში. ახალი ცნობარის დამატებისას აქ ემატება ერთი ხაზი. */
export const NAV_ITEMS: NavItem[] = [
  { label: 'SP-122', title: '8-ნიშნა ნუმერაციის სისტემა სატვირთო ვაგონებისთვის', path: '/sp122' },
];
