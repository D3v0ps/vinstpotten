export interface Case {
  klass: string;
  where: string;
  shirts: number;
  summa: number;
  goal: string;
  quote: string;
  person: string;
  accent: string;
}

export const CASES: Case[] = [
  {
    klass: '8B · Norsborgsskolan',
    where: 'Stockholm',
    shirts: 412,
    summa: 28748,
    goal: 'Klassresa till Berlin',
    quote: 'Vi sålde slut på fyra veckor. Roligaste skolprojektet hittills.',
    person: 'Mira, klassrepresentant',
    accent: '#7B5E89',
  },
  {
    klass: 'IK Brage P14',
    where: 'Borlänge',
    shirts: 287,
    summa: 19998,
    goal: 'Cup-resa, Gothia 2026',
    quote: 'Tröjorna var slutsålda före första matchen. Föräldrar köpte fyra var.',
    person: 'Karim, lagledare',
    accent: '#3D5A4A',
  },
  {
    klass: 'Hammarö ridklubb',
    where: 'Värmland',
    shirts: 198,
    summa: 13818,
    goal: 'Ny ridbana',
    quote: 'Snabbare än vi hann skicka ut bankuppgifter.',
    person: 'Annika, ordförande',
    accent: '#A85C3F',
  },
];
