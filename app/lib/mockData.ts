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
  TopTasksResponse,
  TopTaskStats,
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
    { id: "lese-om-dialogmote", label: "Lese om dialogmøte", weight: 0.4, successRate: 0.9 },
    { id: "melde-motebehov", label: "Melde behov for møte", weight: 0.3, successRate: 0.6 }, // Hard path
    { id: "svare-pa-innkalling", label: "Svare på innkalling", weight: 0.2, successRate: 0.8 },
    { id: "annet", label: "Noe annet", weight: 0.1, successRate: 0.5 },
  ];

  const now = new Date();
  // Generate data for last 14 days
  for (let i = 0; i < 14; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    // 5-15 submissions per day
    const dailyCount = Math.floor(Math.random() * 10) + 5;

    for (let j = 0; j < dailyCount; j++) {
      // Pick task based on weight
      const rand = Math.random();
      let cumulativeWeight = 0;
      const selectedTask = tasks.find(t => {
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
      const timestamp = `${dateStr}T${hour.toString().padStart(2, '0')}:30:00Z`;

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
            tasks.map(t => ({ id: t.id, label: t.label }))
          ),
          createSingleChoiceAnswer("taskSuccess", "Klarte du det?", successValue),
          ...(blocker ? [createTextAnswer("blocker", "Hva hindret deg?", blocker)] : [])
        ],
        sensitiveDataRedacted: false,
      });
    }
  }
  return items;
}

// ============================================
// Mock feedback data - NY STRUKTUR
// ============================================

const mockFeedbackItems: FeedbackDto[] = [
  // =========================================
  // NY APP: syfo-oppfolgingsplan-frontend
  // Survey: Ny oppfølgingsplan - sykmeldt
  // =========================================
  {
    id: "uuid-001",
    submittedAt: "2025-12-08T10:30:00Z",
    app: "syfo-oppfolgingsplan-frontend",
    surveyId: "ny-oppfolgingsplan-sykmeldt",
    context: createContext("/syk/oppfolgingsplaner/1234/sykmeldt", "desktop"),
    answers: [
      createRatingAnswer(
        "hovedsporsmal",
        "Er oppfølgingsplanen til hjelp for deg?",
        5,
      ),
      createTextAnswer(
        "begrunnelse",
        "Legg gjerne til en begrunnelse",
        "Veldig nyttig å ha alt samlet på ett sted. Enkelt å fylle ut sammen med leder.",
        "Valgfritt",
      ),
    ],
    sensitiveDataRedacted: false,
  },
  {
    id: "uuid-002",
    submittedAt: "2025-12-08T09:15:00Z",
    app: "syfo-oppfolgingsplan-frontend",
    surveyId: "ny-oppfolgingsplan-sykmeldt",
    context: createContext("/syk/oppfolgingsplaner/5678/sykmeldt", "mobile"),
    tags: ["🎨 UX", "✨ Feature"],
    answers: [
      createRatingAnswer(
        "hovedsporsmal",
        "Er oppfølgingsplanen til hjelp for deg?",
        4,
      ),
      createTextAnswer(
        "begrunnelse",
        "Legg gjerne til en begrunnelse",
        "Greit verktøy, men skulle ønske det var enklere å legge til egne tiltak.",
        "Valgfritt",
      ),
    ],
    sensitiveDataRedacted: false,
  },
  {
    id: "uuid-003",
    submittedAt: "2025-12-07T14:45:00Z",
    app: "syfo-oppfolgingsplan-frontend",
    surveyId: "ny-oppfolgingsplan-sykmeldt",
    context: createContext(
      "/syk/oppfolgingsplaner/9012/sykmeldt",
      "desktop",
      1920,
      1080,
    ),
    answers: [
      createRatingAnswer(
        "hovedsporsmal",
        "Er oppfølgingsplanen til hjelp for deg?",
        5,
      ),
    ],
    sensitiveDataRedacted: false,
  },
  {
    id: "uuid-004",
    submittedAt: "2025-12-07T11:20:00Z",
    app: "syfo-oppfolgingsplan-frontend",
    surveyId: "ny-oppfolgingsplan-sykmeldt",
    context: createContext(
      "/syk/oppfolgingsplaner/3456/sykmeldt",
      "mobile",
      390,
      844,
    ),
    tags: ["🎨 UX", "👀 Til vurdering"],
    answers: [
      createRatingAnswer(
        "hovedsporsmal",
        "Er oppfølgingsplanen til hjelp for deg?",
        3,
      ),
      createTextAnswer(
        "begrunnelse",
        "Legg gjerne til en begrunnelse",
        "Litt forvirrende i starten, men ble bedre etter hvert. Kunne hatt bedre forklaringer.",
        "Valgfritt",
      ),
    ],
    sensitiveDataRedacted: false,
  },
  {
    id: "uuid-005",
    submittedAt: "2025-12-06T16:00:00Z",
    app: "syfo-oppfolgingsplan-frontend",
    surveyId: "ny-oppfolgingsplan-sykmeldt",
    context: createContext(
      "/syk/oppfolgingsplaner/7890/sykmeldt",
      "tablet",
      820,
      1180,
    ),
    tags: ["🐛 Bug", "✅ Behandlet"],
    answers: [
      createRatingAnswer(
        "hovedsporsmal",
        "Er oppfølgingsplanen til hjelp for deg?",
        2,
      ),
      createTextAnswer(
        "begrunnelse",
        "Legg gjerne til en begrunnelse",
        "Knappen for å sende planen fungerte ikke på iPad. Måtte bytte til PC.",
        "Valgfritt",
      ),
    ],
    sensitiveDataRedacted: false,
  },
  {
    id: "uuid-006",
    submittedAt: "2025-12-06T10:30:00Z",
    app: "syfo-oppfolgingsplan-frontend",
    surveyId: "ny-oppfolgingsplan-sykmeldt",
    context: createContext(
      "/syk/oppfolgingsplaner/2345/sykmeldt",
      "desktop",
      2560,
      1440,
    ),
    answers: [
      createRatingAnswer(
        "hovedsporsmal",
        "Er oppfølgingsplanen til hjelp for deg?",
        5,
      ),
      createTextAnswer(
        "begrunnelse",
        "Legg gjerne til en begrunnelse",
        "Perfekt! Mye bedre enn den gamle løsningen.",
        "Valgfritt",
      ),
    ],
    sensitiveDataRedacted: false,
  },
  {
    id: "uuid-015",
    submittedAt: "2025-12-03T16:45:00Z",
    app: "syfo-oppfolgingsplan-frontend",
    surveyId: "ny-oppfolgingsplan-sykmeldt",
    context: createContext(
      "/syk/oppfolgingsplaner/6789/sykmeldt",
      "mobile",
      375,
      667,
    ),
    answers: [
      createRatingAnswer(
        "hovedsporsmal",
        "Er oppfølgingsplanen til hjelp for deg?",
        5,
      ),
    ],
    sensitiveDataRedacted: false,
  },
  {
    id: "uuid-016",
    submittedAt: "2025-12-03T12:00:00Z",
    app: "syfo-oppfolgingsplan-frontend",
    surveyId: "ny-oppfolgingsplan-sykmeldt",
    context: createContext(
      "/syk/oppfolgingsplaner/1122/sykmeldt",
      "mobile",
      414,
      896,
    ),
    answers: [
      createRatingAnswer(
        "hovedsporsmal",
        "Er oppfølgingsplanen til hjelp for deg?",
        4,
      ),
      createTextAnswer(
        "begrunnelse",
        "Legg gjerne til en begrunnelse",
        "Oversiktlig og greit å bruke på mobil også.",
        "Valgfritt",
      ),
    ],
    sensitiveDataRedacted: false,
  },
  {
    id: "uuid-017",
    submittedAt: "2025-12-02T09:30:00Z",
    app: "syfo-oppfolgingsplan-frontend",
    surveyId: "ny-oppfolgingsplan-sykmeldt",
    context: createContext(
      "/syk/oppfolgingsplaner/3344/sykmeldt",
      "desktop",
      1366,
      768,
    ),
    answers: [
      createRatingAnswer(
        "hovedsporsmal",
        "Er oppfølgingsplanen til hjelp for deg?",
        3,
      ),
    ],
    sensitiveDataRedacted: false,
  },
  {
    id: "uuid-018",
    submittedAt: "2025-12-01T14:15:00Z",
    app: "syfo-oppfolgingsplan-frontend",
    surveyId: "ny-oppfolgingsplan-sykmeldt",
    context: createContext(
      "/syk/oppfolgingsplaner/5566/sykmeldt",
      "desktop",
      1440,
      900,
    ),
    answers: [
      createRatingAnswer(
        "hovedsporsmal",
        "Er oppfølgingsplanen til hjelp for deg?",
        5,
      ),
      createTextAnswer(
        "begrunnelse",
        "Legg gjerne til en begrunnelse",
        "Veldig bra! Føler meg mer involvert i min egen oppfølging nå.",
        "Valgfritt",
      ),
    ],
    sensitiveDataRedacted: false,
  },
  {
    id: "uuid-020",
    submittedAt: "2025-11-29T15:30:00Z",
    app: "syfo-oppfolgingsplan-frontend",
    surveyId: "ny-oppfolgingsplan-sykmeldt",
    context: createContext(
      "/syk/oppfolgingsplaner/7788/sykmeldt",
      "mobile",
      360,
      800,
    ),
    answers: [
      createRatingAnswer(
        "hovedsporsmal",
        "Er oppfølgingsplanen til hjelp for deg?",
        4,
      ),
    ],
    sensitiveDataRedacted: false,
  },
  {
    id: "uuid-013",
    submittedAt: "2025-12-04T14:00:00Z",
    app: "syfo-oppfolgingsplan-frontend",
    surveyId: "ny-oppfolgingsplan-sykmeldt",
    context: createContext(
      "/syk/oppfolgingsplaner/9900/sykmeldt",
      "desktop",
      1920,
      1200,
    ),
    answers: [
      createRatingAnswer(
        "hovedsporsmal",
        "Er oppfølgingsplanen til hjelp for deg?",
        4,
      ),
      createTextAnswer(
        "begrunnelse",
        "Legg gjerne til en begrunnelse",
        "Bra verktøy. [PERSONNUMMER FJERNET] har hjulpet meg med å fylle ut.",
        "Valgfritt",
      ),
    ],
    sensitiveDataRedacted: true,
  },

  // =========================================
  // NY APP: syfo-oppfolgingsplan-frontend
  // Survey: Ny oppfølgingsplan - arbeidsgiver
  // =========================================
  {
    id: "uuid-007",
    submittedAt: "2025-12-08T08:45:00Z",
    app: "syfo-oppfolgingsplan-frontend",
    surveyId: "ny-oppfolgingsplan-arbeidsgiver",
    context: createContext("/syk/oppfolgingsplaner/arbeidsgiver/1234", "desktop", 1920, 1080),
    tags: ["✨ Feature"],
    answers: [
      createRatingAnswer(
        "hovedsporsmal",
        "Hvordan var det å bruke oppfølgingsplanen?",
        4,
      ),
      createTextAnswer(
        "nytte",
        "Opplever du at oppfølgingsplanen er et nyttig verktøy?",
        "Ja, det gir god struktur på samtalene med den ansatte. Lettere å dokumentere hva vi har blitt enige om.",
      ),
      createTextAnswer(
        "forbedringer",
        "Hvis du kunne endre på noe, hva ville det vært?",
        "Mulighet til å legge til flere deltakere i planen, f.eks. verneombud eller HR.",
      ),
    ],
    sensitiveDataRedacted: false,
  },
  {
    id: "uuid-008",
    submittedAt: "2025-12-07T15:30:00Z",
    app: "syfo-oppfolgingsplan-frontend",
    surveyId: "ny-oppfolgingsplan-arbeidsgiver",
    context: createContext("/syk/oppfolgingsplaner/arbeidsgiver/5678", "desktop", 1440, 900),
    answers: [
      createRatingAnswer(
        "hovedsporsmal",
        "Hvordan var det å bruke oppfølgingsplanen?",
        5,
      ),
      createTextAnswer(
        "nytte",
        "Opplever du at oppfølgingsplanen er et nyttig verktøy?",
        "Veldig bra! Oversiktlig og enkelt å bruke. Sparer tid sammenlignet med gamle rutiner.",
      ),
    ],
    sensitiveDataRedacted: false,
  },
  {
    id: "uuid-009",
    submittedAt: "2025-12-07T09:00:00Z",
    app: "syfo-oppfolgingsplan-frontend",
    surveyId: "ny-oppfolgingsplan-arbeidsgiver",
    context: createContext("/syk/oppfolgingsplaner/arbeidsgiver/9012", "tablet", 768, 1024),
    tags: ["🎨 UX", "👀 Til vurdering"],
    answers: [
      createRatingAnswer(
        "hovedsporsmal",
        "Hvordan var det å bruke oppfølgingsplanen?",
        3,
      ),
      createTextAnswer(
        "nytte",
        "Opplever du at oppfølgingsplanen er et nyttig verktøy?",
        "Ok, men ikke alltid relevant for alle typer sykefravær.",
      ),
      createTextAnswer(
        "forbedringer",
        "Hvis du kunne endre på noe, hva ville det vært?",
        "Enklere å hoppe over deler som ikke er relevante. Noen ganger føles det påtvunget.",
      ),
    ],
    sensitiveDataRedacted: false,
  },
  {
    id: "uuid-010",
    submittedAt: "2025-12-06T13:15:00Z",
    app: "syfo-oppfolgingsplan-frontend",
    surveyId: "ny-oppfolgingsplan-arbeidsgiver",
    context: createContext("/syk/oppfolgingsplaner/arbeidsgiver/3456", "desktop", 1366, 768),
    tags: ["✨ Feature"],
    answers: [
      createRatingAnswer(
        "hovedsporsmal",
        "Hvordan var det å bruke oppfølgingsplanen?",
        4,
      ),
      createTextAnswer(
        "nytte",
        "Opplever du at oppfølgingsplanen er et nyttig verktøy?",
        "Fungerer fint for det meste. Godt at den ansatte også kan se og bidra.",
      ),
      createTextAnswer(
        "forbedringer",
        "Hvis du kunne endre på noe, hva ville det vært?",
        "Bedre varsling når den ansatte har gjort endringer.",
      ),
    ],
    sensitiveDataRedacted: false,
  },
  {
    id: "uuid-011",
    submittedAt: "2025-12-05T11:00:00Z",
    app: "syfo-oppfolgingsplan-frontend",
    surveyId: "ny-oppfolgingsplan-arbeidsgiver",
    context: createContext("/syk/oppfolgingsplaner/arbeidsgiver/7890", "desktop", 2560, 1440),
    answers: [
      createRatingAnswer(
        "hovedsporsmal",
        "Hvordan var det å bruke oppfølgingsplanen?",
        5,
      ),
      createTextAnswer(
        "nytte",
        "Opplever du at oppfølgingsplanen er et nyttig verktøy?",
        "Topp! Har brukt den med flere ansatte nå og det fungerer kjempebra.",
      ),
    ],
    sensitiveDataRedacted: false,
  },
  {
    id: "uuid-012",
    submittedAt: "2025-12-05T08:30:00Z",
    app: "syfo-oppfolgingsplan-frontend",
    surveyId: "ny-oppfolgingsplan-arbeidsgiver",
    context: createContext("/syk/oppfolgingsplaner/arbeidsgiver/2345", "mobile", 390, 844),
    tags: ["🐛 Bug", "🔥 Kritisk"],
    answers: [
      createRatingAnswer(
        "hovedsporsmal",
        "Hvordan var det å bruke oppfølgingsplanen?",
        1,
      ),
      createTextAnswer(
        "nytte",
        "Opplever du at oppfølgingsplanen er et nyttig verktøy?",
        "Vanskelig å forstå. Fikk ikke til å sende den til den ansatte.",
      ),
      createTextAnswer(
        "forbedringer",
        "Hvis du kunne endre på noe, hva ville det vært?",
        "Enklere brukergrensesnitt og bedre hjelpetekster.",
      ),
    ],
    sensitiveDataRedacted: false,
  },
  {
    id: "uuid-019",
    submittedAt: "2025-11-30T10:00:00Z",
    app: "syfo-oppfolgingsplan-frontend",
    surveyId: "ny-oppfolgingsplan-arbeidsgiver",
    context: createContext("/syk/oppfolgingsplaner/arbeidsgiver/6789", "desktop", 1440, 900),
    answers: [
      createRatingAnswer(
        "hovedsporsmal",
        "Hvordan var det å bruke oppfølgingsplanen?",
        4,
      ),
      createTextAnswer(
        "nytte",
        "Opplever du at oppfølgingsplanen er et nyttig verktøy?",
        "Bra verktøy for strukturert oppfølging.",
      ),
    ],
    sensitiveDataRedacted: false,
  },
  {
    id: "uuid-014",
    submittedAt: "2025-12-04T10:20:00Z",
    app: "syfo-oppfolgingsplan-frontend",
    surveyId: "ny-oppfolgingsplan-arbeidsgiver",
    context: createContext("/syk/oppfolgingsplaner/arbeidsgiver/1122", "desktop", 1920, 1080),
    answers: [
      createRatingAnswer(
        "hovedsporsmal",
        "Hvordan var det å bruke oppfølgingsplanen?",
        4,
      ),
      createTextAnswer(
        "nytte",
        "Opplever du at oppfølgingsplanen er et nyttig verktøy?",
        "Fungerer bra. Kontaktet [E-POST FJERNET] for support og fikk god hjelp.",
      ),
    ],
    sensitiveDataRedacted: true,
  },

  // =========================================
  // GAMMEL APP: oppfolgingsplan-frontend
  // Survey: Sykmeldt
  // =========================================
  {
    id: "uuid-021",
    submittedAt: "2025-12-07T09:00:00Z",
    app: "oppfolgingsplan-frontend",
    surveyId: "oppfolgingsplan-gammel-sykmeldt",
    context: createContext("/oppfolgingsplan/sykmeldt", "desktop", 1440, 900),
    tags: ["🚫 Fikses ikke"],
    answers: [
      createRatingAnswer(
        "hovedsporsmal",
        "Er oppfølgingsplanen til hjelp for deg?",
        3,
      ),
      createTextAnswer(
        "begrunnelse",
        "Legg gjerne til en begrunnelse",
        "Litt tungvint å navigere, men får gjort det jeg må.",
        "Valgfritt",
      ),
    ],
    sensitiveDataRedacted: false,
  },
  {
    id: "uuid-022",
    submittedAt: "2025-12-06T14:30:00Z",
    app: "oppfolgingsplan-frontend",
    surveyId: "oppfolgingsplan-gammel-sykmeldt",
    context: createContext("/oppfolgingsplan/sykmeldt", "mobile", 375, 812),
    tags: ["🚫 Fikses ikke", "✅ Behandlet"],
    answers: [
      createRatingAnswer(
        "hovedsporsmal",
        "Er oppfølgingsplanen til hjelp for deg?",
        2,
      ),
      createTextAnswer(
        "begrunnelse",
        "Legg gjerne til en begrunnelse",
        "Gammel løsning som er vanskelig å bruke. Håper det kommer noe nytt snart!",
        "Valgfritt",
      ),
    ],
    sensitiveDataRedacted: false,
  },
  {
    id: "uuid-023",
    submittedAt: "2025-12-05T11:15:00Z",
    app: "oppfolgingsplan-frontend",
    surveyId: "oppfolgingsplan-gammel-sykmeldt",
    context: createContext("/oppfolgingsplan/sykmeldt", "desktop", 1920, 1080),
    answers: [
      createRatingAnswer(
        "hovedsporsmal",
        "Er oppfølgingsplanen til hjelp for deg?",
        3,
      ),
    ],
    sensitiveDataRedacted: false,
  },
  {
    id: "uuid-024",
    submittedAt: "2025-12-04T16:45:00Z",
    app: "oppfolgingsplan-frontend",
    surveyId: "oppfolgingsplan-gammel-sykmeldt",
    context: createContext("/oppfolgingsplan/sykmeldt", "tablet", 768, 1024),
    answers: [
      createRatingAnswer(
        "hovedsporsmal",
        "Er oppfølgingsplanen til hjelp for deg?",
        4,
      ),
      createTextAnswer(
        "begrunnelse",
        "Legg gjerne til en begrunnelse",
        "Funker greit nok, men ser litt utdatert ut.",
        "Valgfritt",
      ),
    ],
    sensitiveDataRedacted: false,
  },
  {
    id: "uuid-025",
    submittedAt: "2025-12-03T08:30:00Z",
    app: "oppfolgingsplan-frontend",
    surveyId: "oppfolgingsplan-gammel-sykmeldt",
    context: createContext("/oppfolgingsplan/sykmeldt", "desktop", 1366, 768),
    tags: ["🐛 Bug"],
    answers: [
      createRatingAnswer(
        "hovedsporsmal",
        "Er oppfølgingsplanen til hjelp for deg?",
        2,
      ),
      createTextAnswer(
        "begrunnelse",
        "Legg gjerne til en begrunnelse",
        "Treg og uoversiktlig. Måtte prøve flere ganger før jeg fikk sendt inn.",
        "Valgfritt",
      ),
    ],
    sensitiveDataRedacted: false,
  },

  // =========================================
  // GAMMEL APP: oppfolgingsplan-frontend
  // Survey: Arbeidsgiver
  // =========================================
  {
    id: "uuid-026",
    submittedAt: "2025-12-07T13:00:00Z",
    app: "oppfolgingsplan-frontend",
    surveyId: "oppfolgingsplan-gammel-arbeidsgiver",
    context: createContext("/oppfolgingsplan/arbeidsgiver", "desktop", 1440, 900),
    tags: ["🚫 Fikses ikke"],
    answers: [
      createRatingAnswer(
        "hovedsporsmal",
        "Hvordan var det å bruke oppfølgingsplanen?",
        3,
      ),
      createTextAnswer(
        "nytte",
        "Opplever du at oppfølgingsplanen er et nyttig verktøy?",
        "OK, men burde vært enklere å finne frem.",
      ),
      createTextAnswer(
        "forbedringer",
        "Hvis du kunne endre på noe, hva ville det vært?",
        "Bedre design og mer moderne utseende.",
      ),
    ],
    sensitiveDataRedacted: false,
  },
  {
    id: "uuid-027",
    submittedAt: "2025-12-06T10:00:00Z",
    app: "oppfolgingsplan-frontend",
    surveyId: "oppfolgingsplan-gammel-arbeidsgiver",
    context: createContext("/oppfolgingsplan/arbeidsgiver", "desktop", 1920, 1080),
    tags: ["🚫 Fikses ikke"],
    answers: [
      createRatingAnswer(
        "hovedsporsmal",
        "Hvordan var det å bruke oppfølgingsplanen?",
        2,
      ),
      createTextAnswer(
        "nytte",
        "Opplever du at oppfølgingsplanen er et nyttig verktøy?",
        "Nei, den gamle løsningen er for komplisert. Vanskelig å vite hva som forventes.",
      ),
      createTextAnswer(
        "forbedringer",
        "Hvis du kunne endre på noe, hva ville det vært?",
        "Alt! Trenger fullstendig redesign.",
      ),
    ],
    sensitiveDataRedacted: false,
  },
  {
    id: "uuid-028",
    submittedAt: "2025-12-05T15:20:00Z",
    app: "oppfolgingsplan-frontend",
    surveyId: "oppfolgingsplan-gammel-arbeidsgiver",
    context: createContext("/oppfolgingsplan/arbeidsgiver", "tablet", 1024, 768),
    answers: [
      createRatingAnswer(
        "hovedsporsmal",
        "Hvordan var det å bruke oppfølgingsplanen?",
        3,
      ),
      createTextAnswer(
        "nytte",
        "Opplever du at oppfølgingsplanen er et nyttig verktøy?",
        "Middels. Gjør jobben, men ikke noe mer.",
      ),
    ],
    sensitiveDataRedacted: false,
  },
  {
    id: "uuid-029",
    submittedAt: "2025-12-04T09:45:00Z",
    app: "oppfolgingsplan-frontend",
    surveyId: "oppfolgingsplan-gammel-arbeidsgiver",
    context: createContext("/oppfolgingsplan/arbeidsgiver", "desktop", 1366, 768),
    answers: [
      createRatingAnswer(
        "hovedsporsmal",
        "Hvordan var det å bruke oppfølgingsplanen?",
        4,
      ),
      createTextAnswer(
        "nytte",
        "Opplever du at oppfølgingsplanen er et nyttig verktøy?",
        "Greit nok når man først har lært seg systemet.",
      ),
      createTextAnswer(
        "forbedringer",
        "Hvis du kunne endre på noe, hva ville det vært?",
        "Enklere onboarding for nye brukere.",
      ),
    ],
    sensitiveDataRedacted: false,
  },
  {
    id: "uuid-030",
    submittedAt: "2025-12-02T12:00:00Z",
    app: "oppfolgingsplan-frontend",
    surveyId: "oppfolgingsplan-gammel-arbeidsgiver",
    context: createContext("/oppfolgingsplan/arbeidsgiver", "mobile", 375, 812),
    tags: ["🐛 Bug"],
    answers: [
      createRatingAnswer(
        "hovedsporsmal",
        "Hvordan var det å bruke oppfølgingsplanen?",
        1,
      ),
      createTextAnswer(
        "nytte",
        "Opplever du at oppfølgingsplanen er et nyttig verktøy?",
        "Forferdelig! Brukte en time på å finne ut hvordan jeg skulle logge inn.",
      ),
      createTextAnswer(
        "forbedringer",
        "Hvis du kunne endre på noe, hva ville det vært?",
        "Enklere innlogging og bedre feilmeldinger.",
      ),
    ],
    sensitiveDataRedacted: false,
  },


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
      fieldMap.get(key)!.values.push(answer.value);
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
    filtered = filtered.filter((item) => item.submittedAt <= to + "T23:59:59Z");
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
    surveyType: filtered.length > 0 ? filtered[0].surveyType || "rating" : undefined,
  };
}

import dayjs from "dayjs";

function calculatePeriod(
  from: string | null,
  to: string | null,
): { from: string | null; to: string | null; days: number } {
  const today = dayjs();
  // Default to 30 days (start = today - 29 days)
  const defaultFrom = today.subtract(29, 'day').format("YYYY-MM-DD");
  const defaultTo = today.format("YYYY-MM-DD");

  const actualFrom = from || defaultFrom;
  const actualTo = to || defaultTo;

  const fromDate = dayjs(actualFrom);
  const toDate = dayjs(actualTo);

  // Diff in days + 1 for inclusive range
  const diffDays = toDate.diff(fromDate, 'day') + 1;

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
    filtered = filtered.filter((item) => item.submittedAt <= to + "T23:59:59Z");
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
      item.tags?.some((tag) => tagList.includes(tag))
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
    const taskAnswer = item.answers.find(a => a.fieldId === "task" || a.fieldId === "category"); // Support both likely IDs
    if (!taskAnswer || taskAnswer.fieldType !== "SINGLE_CHOICE") continue;

    const taskOption = taskAnswer.question.options?.find(o => o.id === taskAnswer.value.selectedOptionId);
    // Use label if available, otherwise ID
    const task = taskOption ? taskOption.label : taskAnswer.value.selectedOptionId;

    // Find success answer
    const successAnswer = item.answers.find(a => a.fieldId === "taskSuccess" || a.fieldId === "success");
    const successValue = successAnswer?.fieldType === "SINGLE_CHOICE" ? successAnswer.value.selectedOptionId : "unknown";

    // Find blocker
    const blockerAnswer = item.answers.find(a => a.fieldId === "blocker" || a.fieldId === "hindring");
    const blocker = blockerAnswer?.fieldType === "TEXT" && blockerAnswer.value.text ? blockerAnswer.value.text : null;

    if (!taskMap.has(task)) {
      taskMap.set(task, {
        task,
        totalCount: 0,
        successCount: 0,
        partialCount: 0,
        failureCount: 0,
        successRate: 0,
        formattedSuccessRate: "0%",
        blockerCounts: {}
      });
    }

    const stats = taskMap.get(task)!;
    stats.totalCount++;

    if (successValue === "yes") stats.successCount++;
    else if (successValue === "partial") stats.partialCount++;
    else if (successValue === "no") stats.failureCount++;

    if (blocker) {
      stats.blockerCounts[blocker] = (stats.blockerCounts[blocker] || 0) + 1;
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

  const tasks: TopTaskStats[] = Array.from(taskMap.values()).map(stats => {
    const rate = stats.totalCount > 0 ? stats.successCount / stats.totalCount : 0;
    return {
      ...stats,
      successRate: rate,
      formattedSuccessRate: Math.round(rate * 100) + "%"
    };
  });

  // Sort by total count desc
  tasks.sort((a, b) => b.totalCount - a.totalCount);

  return {
    totalSubmissions: filtered.filter(i => i.surveyType === "topTasks").length,
    tasks,
    dailyStats,
    questionText: filtered.find(i => i.surveyType === "topTasks")?.answers.find(a => a.fieldId === "task")?.question.label
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
export function deleteMockSurvey(surveyId: string): { deletedCount: number; surveyId: string } {
  const initialLength = mockFeedbackItems.length;

  // Filter out items with matching surveyId
  const itemsToKeep = mockFeedbackItems.filter(item => item.surveyId !== surveyId);
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
  const itemsToKeep = mockFeedbackItems.filter(item => item.id !== feedbackId);
  const deleted = initialLength !== itemsToKeep.length;

  // Replace the array contents
  mockFeedbackItems.length = 0;
  mockFeedbackItems.push(...itemsToKeep);

  console.log(`[Mock] ${deleted ? "Deleted" : "Not found"} feedback "${feedbackId}"`);

  return deleted;
}
