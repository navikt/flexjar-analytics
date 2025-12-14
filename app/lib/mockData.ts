import type {
  Answer,
  FeedbackDto,
  FeedbackPage,
  FeedbackStats,
  FieldStat,
  RatingAnswer,
  SingleChoiceAnswer,
  SubmissionContext,
  TextAnswer,
  TopTaskStats,
  TopTasksResponse,
} from "./api";

// ============================================
// Helper functions for creating answers
// ============================================

function createRatingAnswer(
  fieldId: string,
  label: string,
  rating: number,
  description?: string,
): RatingAnswer {
  return {
    fieldId,
    fieldType: "RATING",
    question: { label, description },
    value: { type: "rating", rating },
  };
}

function createTextAnswer(
  fieldId: string,
  label: string,
  text: string,
  description?: string,
): TextAnswer {
  return {
    fieldId,
    fieldType: "TEXT",
    question: { label, description },
    value: { type: "text", text },
  };
}

function createSingleChoiceAnswer(
  fieldId: string,
  label: string,
  selectedOptionId: string,
  description?: string,
  options?: { id: string; label: string }[],
): SingleChoiceAnswer {
  return {
    fieldId,
    fieldType: "SINGLE_CHOICE",
    question: { label, description, options },
    value: { type: "singleChoice", selectedOptionId },
  };
}

// Helper for context with viewport dimensions
function createContext(
  pathname: string,
  deviceType: "mobile" | "tablet" | "desktop" = "desktop",
  viewportWidth?: number,
  viewportHeight?: number,
): SubmissionContext {
  const defaultWidths = { mobile: 375, tablet: 768, desktop: 1440 };
  const defaultHeights = { mobile: 812, tablet: 1024, desktop: 900 };
  const width = viewportWidth || defaultWidths[deviceType];
  const height = viewportHeight || defaultHeights[deviceType];
  return {
    url: `https://www.nav.no${pathname}`,
    pathname,
    deviceType,
    viewportWidth: width,
    viewportHeight: height,
  };
}

function generateTopTasksMockData(): FeedbackDto[] {
  const items: FeedbackDto[] = [];
  const tasks = [
    {
      id: "lese-om-dialogmote",
      label: "Lese om dialogmøte",
      weight: 0.4,
      successRate: 0.9,
    },
    {
      id: "melde-motebehov",
      label: "Melde behov for møte",
      weight: 0.3,
      successRate: 0.6,
    }, // Hard path
    {
      id: "svare-pa-innkalling",
      label: "Svare på innkalling",
      weight: 0.2,
      successRate: 0.8,
    },
    { id: "annet", label: "Noe annet", weight: 0.1, successRate: 0.5 },
  ];

  const now = new Date();
  // Generate data for last 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    // 10-25 submissions per day to ensure > 100 total
    const dailyCount = Math.floor(Math.random() * 15) + 10;

    for (let j = 0; j < dailyCount; j++) {
      // Pick task based on weight
      const rand = Math.random();
      let cumulativeWeight = 0;
      const selectedTask =
        tasks.find((t) => {
          cumulativeWeight += t.weight;
          return rand <= cumulativeWeight;
        }) || tasks[0];

      // Determine success
      const successRand = Math.random();
      let successValue = "yes";
      let blocker = undefined;

      if (successRand > selectedTask.successRate) {
        // Fail or partial
        if (Math.random() > 0.5) {
          successValue = "no";
          blocker = "Skjønte ikke skjemaet";
        } else {
          successValue = "partial";
          blocker = "Fant ikke all info";
        }
      }

      // Add variation to time
      const hour = 8 + Math.floor(Math.random() * 12);
      const timestamp = `${dateStr}T${hour.toString().padStart(2, "0")}:${Math.floor(
        Math.random() * 60,
      )
        .toString()
        .padStart(2, "0")}:00Z`;

      items.push({
        id: `tt-gen-${i}-${j}`,
        submittedAt: timestamp,
        app: "dialogmote-frontend",
        surveyId: "meld-motebehov-ag",
        surveyType: "topTasks",
        context: createContext("/motebehov/arbeidsgiver", "desktop"),
        answers: [
          createSingleChoiceAnswer(
            "task",
            "Hva prøvde du å gjøre?",
            selectedTask.id,
            undefined,
            tasks.map((t) => ({ id: t.id, label: t.label })),
          ),
          createSingleChoiceAnswer(
            "taskSuccess",
            "Klarte du det?",
            successValue,
          ),
          ...(blocker
            ? [createTextAnswer("blocker", "Hva hindret deg?", blocker)]
            : []),
        ],
        sensitiveDataRedacted: false,
      });
    }
  }
  return items;
}

// ============================================
// Realistic Mock Data Generators
// ============================================

const sykmeldtComments = {
  positive: [
    "Veldig enkelt og greit å fylle ut.",
    "Oversiktlig og fint.",
    "Mye bedre enn papirskjema!",
    "Liker at jeg kan gjøre dette når det passer meg.",
    "God veiledning underveis.",
    "Fikk gjort det jeg skulle uten problemer.",
    "Tydelig språk og enkel navigering.",
    "Gikk raskt å fylle ut.",
    "Dette var en drøm sammenlignet med det gamle systemet. Alt var logisk oppbygd, og jeg trengte ikke å lure på hva jeg skulle svare på noen av punktene. Takk for at dere gjør hverdagen enklere for oss som er sykmeldte!",
  ],
  neutral: [
    "Helt greit.",
    "Litt mye tekst å lese.",
    "Fungerer som forventet.",
    "Kunne vært færre klikk.",
    "Ok, men savner noen valgmuligheter.",
    "Grei nok, men litt kjedelig design.",
    "Prosessen var helt ok, men jeg stoppet opp litt underveis da jeg skulle laste opp vedlegg. Det var ikke helt åpenbart hvilke filtyper som var tillatt.",
  ],
  negative: [
    "Vanskelig å forstå hva jeg skal svare.",
    "Fikk feilmelding ved innsending.",
    "Hvorfor må jeg logge inn hele tiden?",
    "Uoversiktlig på mobil.",
    "Skjønner ikke hvorfor jeg må fylle ut dette.",
    "Knappen for å gå videre var gjemt.",
    "Tungvint løsning.",
    "Mye byråkratspråk som er vanskelig å forstå.",
    "Jeg prøvde tre ganger å sende inn skjemaet, men fikk bare en kryptisk feilmelding hver gang. Veldig frustrerende når man allerede er syk og sliten. Dere må fikse dette snarest!",
  ],
};

const arbeidsgiverComments = {
  positive: [
    "Effektiv måte å følge opp på.",
    "Sparer oss for mye tid.",
    "Veldig bra oversikt over sykmeldte.",
    "Enkelt å invitere til dialogmøte.",
    "Godt verktøy for oppfølging.",
    "Liker at vi kan kommunisere digitalt med NAV.",
    "Oversiktlig dashboard.",
    "Endelig et system som snakker sammen. Dette sparer meg for mange telefoner og e-poster. Veldig fornøyd med oversikten jeg har fått nå.",
  ],
  neutral: [
    "Gjør jobben.",
    "Litt omstendelig prosess.",
    "Helt ok verktøy.",
    "Savner mulighet til å lagre utkast enklere.",
    "Fungerer, men kunne vært raskere.",
    "Det fungerer greit, men jeg savner muligheten til å sortere listen over ansatte på etternavn. Ellers er funksjonaliteten helt ok.",
  ],
  negative: [
    "Tungvint system.",
    "Mangler funksjonalitet for oss med mange ansatte.",
    "Vanskelig å finne frem til riktig skjema.",
    "Får ikke delegert rettigheter riktig.",
    "Hvorfor er det så mange trinn?",
    "Stadig tekniske problemer ved innlogging.",
    "Ikke intuitivt hvor man skal trykke.",
    "Systemet henger seg opp hele tiden når vi er flere som bruker det samtidig. Dette er ikke holdbart for en stor bedrift som vår.",
  ],
};

interface SurveyConfig {
  app: string;
  surveyId: string;
  basePath: string;
  userType: "sykmeldt" | "arbeidsgiver";
  questions: {
    ratingLabel: string;
    textLabel?: string;
    textLabel2?: string;
  };
  tagsProbability?: number;
}

function generateTags(
  rating: number,
  probability = 0.25,
): string[] | undefined {
  if (Math.random() > probability) return undefined;

  const tags: string[] = [];
  const addTag = (pool: string[]) =>
    tags.push(pool[Math.floor(Math.random() * pool.length)]);

  // Weighted probabilities for tag categories
  const r = Math.random();

  if (rating <= 2) {
    if (r < 0.6) addTag(["🐛 Bug", "🔥 Kritisk"]);
    else if (r < 0.8) addTag(["🎨 UX", "🚫 Fikses ikke"]);
    else addTag(["✨ Feature", "👀 Til vurdering"]); // Sometimes even angry users want features
  } else if (rating === 3) {
    if (r < 0.4) addTag(["🎨 UX"]);
    else if (r < 0.7) addTag(["✨ Feature"]);
    else addTag(["🐛 Bug", "👀 Til vurdering"]);
  } else {
    if (r < 0.5) addTag(["✨ Feature", "🎨 UX"]);
    else if (r < 0.6)
      addTag(["🐛 Bug"]); // Rare bug report with high rating
    else addTag(["✅ Behandlet"]);
  }

  // Add status tag effectively randomly for some realism
  if (Math.random() > 0.7 && !tags.includes("✅ Behandlet")) {
    tags.push(Math.random() > 0.5 ? "✅ Behandlet" : "👀 Til vurdering");
  }

  return Array.from(new Set(tags));
}

function generateSurveyData(
  count: number,
  config: SurveyConfig,
): FeedbackDto[] {
  const items: FeedbackDto[] = [];
  const now = new Date();
  const commentsPool =
    config.userType === "sykmeldt" ? sykmeldtComments : arbeidsgiverComments;

  for (let i = 0; i < count; i++) {
    // Random date within last 60 days
    const daysAgo = Math.floor(Math.random() * 60);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    const dateStr = date.toISOString().split("T")[0];
    const hour = 7 + Math.floor(Math.random() * 15); // 07:00 - 22:00
    const minute = Math.floor(Math.random() * 60);
    const timestamp = `${dateStr}T${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}:00Z`;

    // Rating distribution (weighted towards positive)
    const rand = Math.random();
    let rating: number;
    let sentiment: "positive" | "neutral" | "negative";

    if (rand > 0.3) {
      // 70% positive (4-5)
      rating = Math.random() > 0.4 ? 5 : 4;
      sentiment = "positive";
    } else if (rand > 0.1) {
      // 20% neutral (3)
      rating = 3;
      sentiment = "neutral";
    } else {
      // 10% negative (1-2)
      rating = Math.random() > 0.5 ? 2 : 1;
      sentiment = "negative";
    }

    // Occasional mismatch (User gives 5 stars but writes "Bug", or 1 star "Great app")
    // This adds human error realism
    if (Math.random() < 0.05) {
      const sentiments: ("positive" | "neutral" | "negative")[] = [
        "positive",
        "neutral",
        "negative",
      ];
      sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
    }

    // Answers
    const answers: Answer[] = [
      createRatingAnswer("hovedsporsmal", config.questions.ratingLabel, rating),
    ];

    // Add text answer probalistically (30% chance)
    if (Math.random() > 0.7) {
      const texts = commentsPool[sentiment];
      const text = texts[Math.floor(Math.random() * texts.length)];

      if (config.questions.textLabel) {
        answers.push(
          createTextAnswer(
            "begrunnelse",
            config.questions.textLabel,
            text,
            "Valgfritt",
          ),
        );
      } else if (config.questions.textLabel2) {
        // Special case for employers with 2 text fields
        // Randomly pick one or both
        if (Math.random() > 0.5) {
          answers.push(
            createTextAnswer(
              "nytte",
              "Opplever du at oppfølgingsplanen er et nyttig verktøy?",
              text,
            ),
          );
        } else {
          answers.push(
            createTextAnswer(
              "forbedringer",
              "Hvis du kunne endre på noe, hva ville det vært?",
              text,
            ),
          );
        }
      }
    }

    // Generate realistic tags based on rating
    const tags = generateTags(rating, config.tagsProbability);

    // Device
    const deviceRand = Math.random();
    let device: "mobile" | "tablet" | "desktop";
    let width: number;
    let height: number;

    if (deviceRand > 0.6) {
      device = "desktop";
      width = 1920;
      height = 1080;
    } else if (deviceRand > 0.1) {
      device = "mobile";
      width = 375;
      height = 812;
    } else {
      device = "tablet";
      width = 768;
      height = 1024;
    }

    // Pathname variation (simple)
    const suffix = Math.floor(Math.random() * 10000);
    const path = `${config.basePath}/${suffix}`;

    items.push({
      id: `gen-${config.surveyId}-${i}`,
      submittedAt: timestamp,
      app: config.app,
      surveyId: config.surveyId,
      context: createContext(path, device, width, height),
      tags,
      answers,
      sensitiveDataRedacted: Math.random() > 0.95, // Occasional redaction
    });
  }

  return items;
}

// ============================================
// Mock feedback data - NY STRUKTUR
// ============================================

const mockFeedbackItems: FeedbackDto[] = [
  ...generateSurveyData(150, {
    app: "syfo-oppfolgingsplan-frontend",
    surveyId: "ny-oppfolgingsplan-sykmeldt",
    basePath: "/syk/oppfolgingsplaner",
    userType: "sykmeldt",
    questions: {
      ratingLabel: "Er oppfølgingsplanen til hjelp for deg?",
      textLabel: "Legg gjerne til en begrunnelse",
    },
    tagsProbability: 0.15,
  }),

  ...generateSurveyData(120, {
    app: "syfo-oppfolgingsplan-frontend",
    surveyId: "ny-oppfolgingsplan-arbeidsgiver",
    basePath: "/syk/oppfolgingsplaner/arbeidsgiver",
    userType: "arbeidsgiver",
    questions: {
      ratingLabel: "Hvordan var det å bruke oppfølgingsplanen?",
      textLabel2: "True", // Triggers special handling for 2 text fields
    },
    tagsProbability: 0.2,
  }),

  ...generateSurveyData(110, {
    app: "oppfolgingsplan-frontend",
    surveyId: "oppfolgingsplan-gammel-sykmeldt",
    basePath: "/oppfolgingsplan/sykmeldt",
    userType: "sykmeldt",
    questions: {
      ratingLabel: "Er oppfølgingsplanen til hjelp for deg?",
      textLabel: "Legg gjerne til en begrunnelse",
    },
  }),

  ...generateSurveyData(110, {
    app: "oppfolgingsplan-frontend",
    surveyId: "oppfolgingsplan-gammel-arbeidsgiver",
    basePath: "/oppfolgingsplan/arbeidsgiver",
    userType: "arbeidsgiver",
    questions: {
      ratingLabel: "Hvordan var det å bruke oppfølgingsplanen?",
      textLabel: "Legg gjerne til en begrunnelse",
    },
  }),

  // Generated Top Tasks for dialogmote-frontend
  ...generateTopTasksMockData(),
];

// ============================================
// Helper functions
// ============================================

function getRating(item: FeedbackDto): number | null {
  const ratingAnswer = item.answers.find((a) => a.fieldType === "RATING");
  if (ratingAnswer && ratingAnswer.value.type === "rating") {
    return ratingAnswer.value.rating;
  }
  return null;
}

function getTextResponses(item: FeedbackDto): string[] {
  return item.answers
    .filter(
      (a) => a.fieldType === "TEXT" && a.value.type === "text" && a.value.text,
    )
    .map((a) => (a.value as { type: "text"; text: string }).text);
}

function hasTextResponse(item: FeedbackDto): boolean {
  return getTextResponses(item).length > 0;
}

// ============================================
// Stats calculation
// ============================================

function calculateFieldStats(items: FeedbackDto[]): FieldStat[] {
  // Collect all unique fields across all items
  const fieldMap = new Map<
    string,
    {
      fieldId: string;
      fieldType: string;
      label: string;
      values: Answer["value"][];
    }
  >();

  for (const item of items) {
    for (const answer of item.answers) {
      const key = answer.fieldId;
      if (!fieldMap.has(key)) {
        fieldMap.set(key, {
          fieldId: answer.fieldId,
          fieldType: answer.fieldType,
          label: answer.question.label,
          values: [],
        });
      }
      fieldMap.get(key)?.values.push(answer.value);
    }
  }

  // Calculate stats for each field
  const fieldStats: FieldStat[] = [];

  for (const [, field] of fieldMap) {
    if (field.fieldType === "RATING") {
      const ratings = field.values
        .filter((v) => v.type === "rating")
        .map((v) => (v as { type: "rating"; rating: number }).rating);

      const distribution: Record<number, number> = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      };
      let sum = 0;
      for (const r of ratings) {
        distribution[r] = (distribution[r] || 0) + 1;
        sum += r;
      }

      fieldStats.push({
        fieldId: field.fieldId,
        fieldType: "RATING",
        label: field.label,
        stats: {
          type: "rating",
          average: ratings.length > 0 ? sum / ratings.length : 0,
          distribution,
        },
      });
    } else if (field.fieldType === "TEXT") {
      const texts = field.values
        .filter((v) => v.type === "text")
        .map((v) => (v as { type: "text"; text: string }).text);

      const nonEmpty = texts.filter((t) => t && t.trim().length > 0);

      fieldStats.push({
        fieldId: field.fieldId,
        fieldType: "TEXT",
        label: field.label,
        stats: {
          type: "text",
          responseCount: nonEmpty.length,
          // responseRate beregnes i forhold til totalCount, ikke texts.length
          // Dette settes riktig i FieldStatsSection basert på totalCount
          responseRate: 0, // Placeholder - UI beregner selv fra responseCount/totalCount
        },
      });
    }
  }

  return fieldStats;
}

function calculateStats(
  items: FeedbackDto[],
  params: URLSearchParams,
): FeedbackStats {
  // Filter items based on params
  let filtered = [...items];

  const app = params.get("app");
  const from = params.get("from");
  const to = params.get("to");
  const surveyId = params.get("feedbackId"); // Keep old param name for backwards compat

  if (app) {
    filtered = filtered.filter((item) => item.app === app);
  }
  if (from) {
    filtered = filtered.filter((item) => item.submittedAt >= from);
  }
  if (to) {
    filtered = filtered.filter((item) => item.submittedAt <= `${to}T23:59:59Z`);
  }
  if (surveyId) {
    filtered = filtered.filter((item) => item.surveyId === surveyId);
  }

  // Legacy aggregations
  const byRating: Record<string, number> = {
    "1": 0,
    "2": 0,
    "3": 0,
    "4": 0,
    "5": 0,
  };
  const byApp: Record<string, number> = {};
  const byDate: Record<string, number> = {};
  const byFeedbackId: Record<string, number> = {};
  const ratingByDateAccum: Record<string, { total: number; count: number }> =
    {};
  const byDeviceAccum: Record<string, { total: number; count: number }> = {};
  const byPathnameAccum: Record<string, { total: number; count: number }> = {};

  let totalRating = 0;
  let ratingCount = 0;
  let countWithText = 0;

  for (const item of filtered) {
    // Rating
    const rating = getRating(item);
    if (rating !== null) {
      byRating[String(rating)]++;
      totalRating += rating;
      ratingCount++;

      // Rating by date
      const date = item.submittedAt.split("T")[0];
      if (!ratingByDateAccum[date]) {
        ratingByDateAccum[date] = { total: 0, count: 0 };
      }
      ratingByDateAccum[date].total += rating;
      ratingByDateAccum[date].count++;

      // Device stats
      const device = item.context?.deviceType || "unknown";
      if (!byDeviceAccum[device]) {
        byDeviceAccum[device] = { total: 0, count: 0 };
      }
      byDeviceAccum[device].total += rating;
      byDeviceAccum[device].count++;

      // Pathname stats
      const pathname = item.context?.pathname || "unknown";
      if (!byPathnameAccum[pathname]) {
        byPathnameAccum[pathname] = { total: 0, count: 0 };
      }
      byPathnameAccum[pathname].total += rating;
      byPathnameAccum[pathname].count++;
    }

    // App
    const appName = item.app || "unknown";
    byApp[appName] = (byApp[appName] || 0) + 1;

    // Date
    const date = item.submittedAt.split("T")[0];
    byDate[date] = (byDate[date] || 0) + 1;

    // Survey (feedbackId for backwards compat)
    const fbId = item.surveyId || "unknown";
    byFeedbackId[fbId] = (byFeedbackId[fbId] || 0) + 1;

    // Text
    if (hasTextResponse(item)) {
      countWithText++;
    }
  }

  // Convert ratingByDateAccum to ratingByDate with averages
  const ratingByDate: Record<string, { average: number; count: number }> = {};
  for (const [date, data] of Object.entries(ratingByDateAccum)) {
    ratingByDate[date] = {
      average: Math.round((data.total / data.count) * 10) / 10,
      count: data.count,
    };
  }

  // Convert device accum to byDevice
  const byDevice: Record<string, { count: number; averageRating: number }> = {};
  for (const [device, data] of Object.entries(byDeviceAccum)) {
    byDevice[device] = {
      count: data.count,
      averageRating: Math.round((data.total / data.count) * 10) / 10,
    };
  }

  // Convert pathname accum to byPathname (top 10)
  const byPathname: Record<string, { count: number; averageRating: number }> =
    {};
  const sortedPathnames = Object.entries(byPathnameAccum)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10);
  for (const [pathname, data] of sortedPathnames) {
    byPathname[pathname] = {
      count: data.count,
      averageRating: Math.round((data.total / data.count) * 10) / 10,
    };
  }

  // Calculate new field stats
  const fieldStats = calculateFieldStats(filtered);

  return {
    totalCount: filtered.length,
    countWithText,
    countWithoutText: filtered.length - countWithText,
    byRating,
    byApp,
    byDate,
    byFeedbackId,
    averageRating: ratingCount > 0 ? totalRating / ratingCount : null,
    ratingByDate,
    byDevice,
    byPathname,
    lowestRatingPaths: {},
    fieldStats,
    period: calculatePeriod(from, to),
    surveyType:
      filtered.length > 0 ? filtered[0].surveyType || "rating" : undefined,
  };
}

import dayjs from "dayjs";

function calculatePeriod(
  from: string | null,
  to: string | null,
): { from: string | null; to: string | null; days: number } {
  const today = dayjs();
  // Default to 30 days (start = today - 29 days)
  const defaultFrom = today.subtract(29, "day").format("YYYY-MM-DD");
  const defaultTo = today.format("YYYY-MM-DD");

  const actualFrom = from || defaultFrom;
  const actualTo = to || defaultTo;

  const fromDate = dayjs(actualFrom);
  const toDate = dayjs(actualTo);

  // Diff in days + 1 for inclusive range
  const diffDays = toDate.diff(fromDate, "day") + 1;

  return {
    from: actualFrom,
    to: actualTo,
    days: diffDays,
  };
}

// ============================================
// Feedback filtering and pagination
// ============================================

// ============================================
// Feedback filtering and pagination
// ============================================

function applyFilters(
  items: FeedbackDto[],
  params: URLSearchParams,
): FeedbackDto[] {
  let filtered = [...items];

  const app = params.get("app");
  const from = params.get("from");
  const to = params.get("to");
  const medTekst = params.get("medTekst");
  const fritekst = params.get("fritekst");
  const surveyId = params.get("feedbackId");
  const lavRating = params.get("lavRating");
  const pathname = params.get("pathname");
  const deviceType = params.get("deviceType");
  const tags = params.get("tags");

  if (app) {
    filtered = filtered.filter((item) => item.app === app);
  }
  if (from) {
    filtered = filtered.filter((item) => item.submittedAt >= from);
  }
  if (to) {
    filtered = filtered.filter((item) => item.submittedAt <= `${to}T23:59:59Z`);
  }
  if (medTekst === "true") {
    filtered = filtered.filter((item) => hasTextResponse(item));
  }
  // "Wall of Shame" - filter for low ratings (1-2)
  if (lavRating === "true") {
    filtered = filtered.filter((item) => {
      const ratingAnswer = item.answers.find((a) => a.fieldType === "RATING");
      if (ratingAnswer && ratingAnswer.value.type === "rating") {
        return ratingAnswer.value.rating <= 2;
      }
      return false;
    });
  }
  if (pathname) {
    filtered = filtered.filter((item) =>
      item.context?.pathname?.includes(pathname),
    );
  }
  if (deviceType) {
    filtered = filtered.filter(
      (item) => item.context?.deviceType === deviceType,
    );
  }
  if (fritekst) {
    const search = fritekst.toLowerCase();
    filtered = filtered.filter((item) =>
      item.answers.some((a) => {
        if (a.value.type === "text") {
          return a.value.text.toLowerCase().includes(search);
        }
        return false;
      }),
    );
  }
  if (surveyId) {
    filtered = filtered.filter((item) => item.surveyId === surveyId);
  }
  // Filter by tags (comma-separated, matches any)
  if (tags) {
    const tagList = tags.split(",").map((t) => t.trim());
    filtered = filtered.filter((item) =>
      item.tags?.some((tag) => tagList.includes(tag)),
    );
  }

  // Sort by date descending
  filtered.sort(
    (a, b) =>
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
  );

  return filtered;
}

export function filterFeedback(
  items: FeedbackDto[],
  params: URLSearchParams,
): FeedbackPage {
  const filtered = applyFilters(items, params);

  // Paginate
  const page = Number.parseInt(params.get("page") || "0");
  const size = Number.parseInt(params.get("size") || "20");
  const start = page * size;
  const content = filtered.slice(start, start + size);

  return {
    content,
    totalPages: Math.ceil(filtered.length / size),
    totalElements: filtered.length,
    size,
    number: page,
    hasNext: start + size < filtered.length,
    hasPrevious: page > 0,
  };
}

// ============================================
// Public API
// ============================================

export function getMockStats(params: URLSearchParams): FeedbackStats {
  return calculateStats(mockFeedbackItems, params);
}

export function getMockFeedback(params: URLSearchParams): FeedbackPage {
  return filterFeedback(mockFeedbackItems, params);
}

export function getMockTeams() {
  return {
    teams: {
      "team-esyfo": [
        "syfo-oppfolgingsplan-frontend",
        "oppfolgingsplan-frontend",
      ],
    },
  };
}

export function getMockTags() {
  // Return actual tags used in the feedback, not surveyIds
  const allTags = new Set<string>();
  for (const item of mockFeedbackItems) {
    if (item.tags) {
      for (const tag of item.tags) {
        allTags.add(tag);
      }
    }
  }
  return Array.from(allTags).sort();
}

// Calculate Top Tasks stats
export function getMockTopTasksStats(
  params: URLSearchParams,
): TopTasksResponse {
  const filtered = applyFilters(mockFeedbackItems, params);
  const taskMap = new Map<string, TopTaskStats>();
  const dailyStats: Record<string, { total: number; success: number }> = {};

  // Initialize from known tasks in mock data to ensure they appear even if count is 0
  // (In a real DB query we would group by, so we'd only get ones with answers)

  for (const item of filtered) {
    if (item.surveyType !== "topTasks") continue;

    // Find task answer
    const taskAnswer = item.answers.find(
      (a) => a.fieldId === "task" || a.fieldId === "category",
    ); // Support both likely IDs
    if (!taskAnswer || taskAnswer.fieldType !== "SINGLE_CHOICE") continue;

    const taskOption = taskAnswer.question.options?.find(
      (o) => o.id === taskAnswer.value.selectedOptionId,
    );
    // Use label if available, otherwise ID
    const task = taskOption
      ? taskOption.label
      : taskAnswer.value.selectedOptionId;

    // Find success answer
    const successAnswer = item.answers.find(
      (a) => a.fieldId === "taskSuccess" || a.fieldId === "success",
    );
    const successValue =
      successAnswer?.fieldType === "SINGLE_CHOICE"
        ? successAnswer.value.selectedOptionId
        : "unknown";

    // Find blocker
    const blockerAnswer = item.answers.find(
      (a) => a.fieldId === "blocker" || a.fieldId === "hindring",
    );
    const blocker =
      blockerAnswer?.fieldType === "TEXT" && blockerAnswer.value.text
        ? blockerAnswer.value.text
        : null;

    if (!taskMap.has(task)) {
      taskMap.set(task, {
        task,
        totalCount: 0,
        successCount: 0,
        partialCount: 0,
        failureCount: 0,
        successRate: 0,
        formattedSuccessRate: "0%",
        blockerCounts: {},
      });
    }

    const stats = taskMap.get(task);
    if (stats) {
      stats.totalCount++;

      if (successValue === "yes") stats.successCount++;
      else if (successValue === "partial") stats.partialCount++;
      else if (successValue === "no") stats.failureCount++;

      if (blocker) {
        stats.blockerCounts[blocker] = (stats.blockerCounts[blocker] || 0) + 1;
      }
    }

    // Daily stats
    const date = item.submittedAt.split("T")[0];
    if (!dailyStats[date]) {
      dailyStats[date] = { total: 0, success: 0 };
    }
    dailyStats[date].total++;
    if (successValue === "yes") {
      dailyStats[date].success++;
    }
  }

  const tasks: TopTaskStats[] = Array.from(taskMap.values()).map((stats) => {
    const rate =
      stats.totalCount > 0 ? stats.successCount / stats.totalCount : 0;
    return {
      ...stats,
      successRate: rate,
      formattedSuccessRate: `${Math.round(rate * 100)}%`,
    };
  });

  // Sort by total count desc
  tasks.sort((a, b) => b.totalCount - a.totalCount);

  return {
    totalSubmissions: filtered.filter((i) => i.surveyType === "topTasks")
      .length,
    tasks,
    dailyStats,
    questionText: filtered
      .find((i) => i.surveyType === "topTasks")
      ?.answers.find((a) => a.fieldId === "task")?.question.label,
  };
}

export function getMockSurveysByApp(): Record<string, string[]> {
  const surveysByApp: Record<string, string[]> = {};

  for (const item of mockFeedbackItems) {
    const app = item.app || "unknown";
    const surveyId = item.surveyId;

    if (!surveysByApp[app]) {
      surveysByApp[app] = [];
    }
    if (surveyId && !surveysByApp[app].includes(surveyId)) {
      surveysByApp[app].push(surveyId);
    }
  }

  return surveysByApp;
}

// Delete all feedback for a survey (mock implementation)
export function deleteMockSurvey(surveyId: string): {
  deletedCount: number;
  surveyId: string;
} {
  const initialLength = mockFeedbackItems.length;

  // Filter out items with matching surveyId
  const itemsToKeep = mockFeedbackItems.filter(
    (item) => item.surveyId !== surveyId,
  );
  const deletedCount = initialLength - itemsToKeep.length;

  // Replace the array contents (mutate in place since it's a module-level variable)
  mockFeedbackItems.length = 0;
  mockFeedbackItems.push(...itemsToKeep);

  console.log(`[Mock] Deleted ${deletedCount} items for survey "${surveyId}"`);

  return { deletedCount, surveyId };
}

// Delete single feedback item (mock implementation)
export function deleteMockFeedback(feedbackId: string): boolean {
  const initialLength = mockFeedbackItems.length;

  // Filter out item with matching id
  const itemsToKeep = mockFeedbackItems.filter(
    (item) => item.id !== feedbackId,
  );
  const deleted = initialLength !== itemsToKeep.length;

  // Replace the array contents
  mockFeedbackItems.length = 0;
  mockFeedbackItems.push(...itemsToKeep);

  console.log(
    `[Mock] ${deleted ? "Deleted" : "Not found"} feedback "${feedbackId}"`,
  );

  return deleted;
}
