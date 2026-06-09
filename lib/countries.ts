import { Question } from '@/data/questions';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Country {
  name: { common: string; official: string };
  translations: { ara?: { common: string; official: string } };
  capital?: string[];
  continents: string[];
  currencies?: Record<string, { name: string; symbol: string }>;
  languages?: Record<string, string>;
  borders?: string[];
  flag: string;        // emoji flag
  cca3: string;        // 3-letter code
}

// ─── Module-level cache (survives page navigations) ──────────────────────────

let cachedCountries: Country[] | null = null;
let fetchPromise: Promise<Country[]> | null = null;

export async function getCountries(): Promise<Country[]> {
  if (cachedCountries) return cachedCountries;
  if (fetchPromise) return fetchPromise;

  fetchPromise = fetch(
    'https://restcountries.com/v3.1/all?fields=name,translations,capital,continents,currencies,languages,borders,flag,cca3',
    { next: { revalidate: 86400 } }   // 9 fields — within the API's 10-field limit
  )
    .then((r) => r.json())
    .then((data: Country[]) => {
      // Keep only countries with a capital and a name
      cachedCountries = data.filter(
        (c) => c.capital?.length && c.name.common
      );
      fetchPromise = null;
      return cachedCountries;
    });

  return fetchPromise;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function pick<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

/** Get display name for a country in the requested language */
function countryName(c: Country, lang: 'en' | 'ar'): string {
  if (lang === 'ar') return c.translations.ara?.common ?? c.name.common;
  return c.name.common;
}

/** Pick 3 wrong countries whose answer field differs from the correct one */
function wrongOptions(
  all: Country[],
  exclude: Country,
  getVal: (c: Country) => string | undefined,
  correctVal: string,
  lang: 'en' | 'ar',
  count = 3
): string[] {
  const pool = shuffle(
    all.filter((c) => c.cca3 !== exclude.cca3 && getVal(c) !== correctVal && getVal(c))
  );
  return pool.slice(0, count).map((c) => getVal(c) as string);
}

// ─── Continent translations ───────────────────────────────────────────────────

const continentAr: Record<string, string> = {
  Africa: 'أفريقيا',
  Antarctica: 'القارة القطبية الجنوبية',
  Asia: 'آسيا',
  Europe: 'أوروبا',
  'North America': 'أمريكا الشمالية',
  Oceania: 'أوقيانوسيا',
  'South America': 'أمريكا الجنوبية',
};

// ─── Question generators ──────────────────────────────────────────────────────

/** "What is the capital of [country]?" */
function capitalQuestion(c: Country, all: Country[], lang: 'en' | 'ar', idx: number): Question | null {
  const capital = c.capital?.[0];
  if (!capital) return null;

  const wrongs = wrongOptions(
    all,
    c,
    (x) => x.capital?.[0],
    capital,
    lang
  );
  if (wrongs.length < 3) return null;

  const name = countryName(c, lang);
  return {
    id: `geo-cap-${c.cca3}-${idx}`,
    language: lang,
    categoryId: 5,
    difficulty: 1,
    question: lang === 'ar'
      ? `ما هي عاصمة ${name}؟`
      : `What is the capital of ${name}?`,
    correct: capital,
    options: shuffle([capital, ...wrongs.slice(0, 3)]),
  };
}

/** "Which continent is [country] in?" */
function continentQuestion(c: Country, all: Country[], lang: 'en' | 'ar', idx: number): Question | null {
  const continent = c.continents?.[0];
  if (!continent) return null;

  const continentDisplay = lang === 'ar' ? (continentAr[continent] ?? continent) : continent;

  // Build wrong options from distinct continent names
  const seen = new Set<string>();
  const allContinents: string[] = [];
  for (const x of all) {
    const cont = x.continents?.[0];
    if (cont && !seen.has(cont)) { seen.add(cont); allContinents.push(cont); }
  }
  const wrongContinents = shuffle(allContinents.filter((cont) => cont !== continent))
    .slice(0, 3)
    .map((cont) => lang === 'ar' ? (continentAr[cont] ?? cont) : cont);

  if (wrongContinents.length < 3) return null;

  const name = countryName(c, lang);
  return {
    id: `geo-cont-${c.cca3}-${idx}`,
    language: lang,
    categoryId: 5,
    difficulty: 1,
    question: lang === 'ar'
      ? `في أي قارة تقع ${name}؟`
      : `Which continent is ${name} in?`,
    correct: continentDisplay,
    options: shuffle([continentDisplay, ...wrongContinents]),
  };
}

/** "What currency does [country] use?" */
function currencyQuestion(c: Country, all: Country[], lang: 'en' | 'ar', idx: number): Question | null {
  const currencyKey = c.currencies && Object.keys(c.currencies)[0];
  if (!currencyKey) return null;
  const currencyName = c.currencies![currencyKey].name;
  if (!currencyName) return null;

  const wrongs = wrongOptions(
    all,
    c,
    (x) => x.currencies ? Object.values(x.currencies)[0]?.name : undefined,
    currencyName,
    lang
  );
  if (wrongs.length < 3) return null;

  const name = countryName(c, lang);
  return {
    id: `geo-cur-${c.cca3}-${idx}`,
    language: lang,
    categoryId: 5,
    difficulty: 2,
    question: lang === 'ar'
      ? `ما هي عملة ${name}؟`
      : `What currency does ${name} use?`,
    correct: currencyName,
    options: shuffle([currencyName, ...wrongs.slice(0, 3)]),
  };
}

/** "What is a language spoken in [country]?" */
function languageQuestion(c: Country, all: Country[], lang: 'en' | 'ar', idx: number): Question | null {
  const langVal = c.languages && Object.values(c.languages)[0];
  if (!langVal) return null;

  const wrongs = wrongOptions(
    all,
    c,
    (x) => x.languages ? Object.values(x.languages)[0] : undefined,
    langVal,
    lang
  );
  if (wrongs.length < 3) return null;

  const name = countryName(c, lang);
  return {
    id: `geo-lang-${c.cca3}-${idx}`,
    language: lang,
    categoryId: 5,
    difficulty: 2,
    question: lang === 'ar'
      ? `ما اللغة الرسمية في ${name}؟`
      : `What is an official language of ${name}?`,
    correct: langVal,
    options: shuffle([langVal, ...wrongs.slice(0, 3)]),
  };
}

/** "Which of these countries borders [country]?" */
function borderQuestion(c: Country, all: Country[], lang: 'en' | 'ar', idx: number): Question | null {
  if (!c.borders || c.borders.length === 0) return null;

  const borderCca3 = c.borders[0];
  const borderCountry = all.find((x) => x.cca3 === borderCca3);
  if (!borderCountry) return null;

  const correct = countryName(borderCountry, lang);

  // Non-bordering countries as wrong options
  const nonBorders = shuffle(
    all.filter(
      (x) =>
        x.cca3 !== c.cca3 &&
        !c.borders!.includes(x.cca3)
    )
  )
    .slice(0, 3)
    .map((x) => countryName(x, lang));

  if (nonBorders.length < 3) return null;

  const name = countryName(c, lang);
  return {
    id: `geo-brd-${c.cca3}-${idx}`,
    language: lang,
    categoryId: 5,
    difficulty: 3,
    question: lang === 'ar'
      ? `أي من هذه الدول تحد ${name}؟`
      : `Which of these countries borders ${name}?`,
    correct,
    options: shuffle([correct, ...nonBorders]),
  };
}

/** "Which country's flag is this? [emoji]" */
function flagQuestion(c: Country, all: Country[], lang: 'en' | 'ar', idx: number): Question | null {
  if (!c.flag) return null;

  const correct = countryName(c, lang);
  const wrongs = shuffle(
    all.filter((x) => x.cca3 !== c.cca3 && x.flag !== c.flag)
  )
    .slice(0, 3)
    .map((x) => countryName(x, lang));

  if (wrongs.length < 3) return null;

  return {
    id: `geo-flag-${c.cca3}-${idx}`,
    language: lang,
    categoryId: 5,
    difficulty: 2,
    question: lang === 'ar'
      ? `${c.flag} لأي دولة تنتمي هذه العلم؟`
      : `${c.flag} Which country does this flag belong to?`,
    correct,
    options: shuffle([correct, ...wrongs]),
  };
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Fetches countries from the REST API and returns `count` randomised
 * geography questions in the requested language.
 */
export async function getGeographyQuestions(
  lang: 'en' | 'ar',
  count = 10
): Promise<Question[]> {
  const all = await getCountries();

  // Pick a diverse pool of countries
  const pool = pick(all, Math.min(80, all.length));

  const generators = [
    capitalQuestion,
    continentQuestion,
    currencyQuestion,
    languageQuestion,
    borderQuestion,
    flagQuestion,
  ];

  const questions: Question[] = [];

  for (let i = 0; i < pool.length && questions.length < count * 3; i++) {
    const gen = generators[i % generators.length];
    const q = gen(pool[i], all, lang, i);
    if (q) questions.push(q);
  }

  return shuffle(questions).slice(0, count);
}
