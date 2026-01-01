import type { Answer, FeedbackDto } from "~/types/api";
import {
  createContext,
  createDateAnswer,
  createMultiChoiceAnswer,
  createRatingAnswer,
  createSingleChoiceAnswer,
  createTextAnswer,
} from "./helpers";
import type { FeedbackTopic } from "./topics";

export interface SurveyConfig {
  app: string;
  surveyId: string;
  basePath: string;
  topics: FeedbackTopic[];
  questions: {
    ratingLabel: string;
    textLabel?: string;
    textLabel2?: string;
  };
  /** Optional metadata generator - returns metadata for each item */
  metadataGenerator?: () => Record<string, string>;
}

export function generateSurveyData(
  count: number,
  config: SurveyConfig,
): FeedbackDto[] {
  const items: FeedbackDto[] = [];
  const now = new Date();

  // 1. Flatten all topics into a pool of potential items
  type PoolItem = {
    text: string;
    rating: number;
    tags: string[];
    isRedacted: boolean;
  };

  const pool: PoolItem[] = [];

  for (const topic of config.topics) {
    for (const comment of topic.comments) {
      pool.push({
        text: comment,
        rating: topic.rating,
        tags: topic.tags || [],
        isRedacted: !!topic.isRedacted,
      });
    }
  }

  // 2. Shuffle the pool to get random order
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // 3. Generate the requested amount
  for (let i = 0; i < count; i++) {
    const poolItem = pool[i % pool.length];

    // Random date within last 60 days to spread them out
    const daysAgo = Math.floor(Math.random() * 60);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    const dateStr = date.toISOString().split("T")[0];
    const hour = 7 + Math.floor(Math.random() * 15);
    const minute = Math.floor(Math.random() * 60);
    const timestamp = `${dateStr}T${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}:00Z`;

    // Answers
    const answers: Answer[] = [
      createRatingAnswer(
        "hovedsporsmal",
        config.questions.ratingLabel,
        poolItem.rating,
      ),
    ];

    if (poolItem.text) {
      if (config.questions.textLabel) {
        answers.push(
          createTextAnswer(
            "begrunnelse",
            config.questions.textLabel,
            poolItem.text,
            "Valgfritt",
          ),
        );
      } else if (config.questions.textLabel2) {
        // Employer case: put text in one of the fields based on sentiment (rating)
        const field = poolItem.rating > 3 ? "nytte" : "forbedringer";
        const label =
          poolItem.rating > 3
            ? "Opplever du at oppfølgingsplanen er et nyttig verktøy?"
            : "Hvis du kunne endre på noe, hva ville det vært?";

        answers.push(createTextAnswer(field, label, poolItem.text));
      }
    }

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

    const suffix = Math.floor(Math.random() * 10000);
    const path = `${config.basePath}/${suffix}`;

    items.push({
      id: `gen-${config.surveyId}-${i}`,
      submittedAt: timestamp,
      app: config.app,
      surveyId: config.surveyId,
      context: createContext(path, device, width, height),
      tags: poolItem.tags,
      metadata: config.metadataGenerator?.(),
      answers,
      sensitiveDataRedacted: poolItem.isRedacted,
    });
  }

  return items;
}

export function generateTopTasksMockData(): FeedbackDto[] {
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
      let successValue = "Ja";
      let blocker: string | undefined = undefined;

      // Diverse blocker reasons for pattern analysis
      const blockerReasons = [
        "Skjønte ikke skjemaet",
        "Fant ikke all info",
        "Teknisk feil på siden",
        "Ble logget ut underveis",
        "Visste ikke hva jeg skulle velge",
        "Knappen fungerte ikke",
        "Siden tok for lang tid å laste",
        "Fikk feilmelding",
      ];

      if (successRand > selectedTask.successRate) {
        // Fail or partial
        if (Math.random() > 0.4) {
          successValue = "Nei";
          blocker =
            blockerReasons[Math.floor(Math.random() * blockerReasons.length)];
        } else {
          successValue = "Delvis";
          blocker =
            blockerReasons[Math.floor(Math.random() * blockerReasons.length)];
        }
      }

      // Calculate duration based on success and complexity
      // Target time + variability
      const baseTimeMs = 45000 + Math.random() * 90000;
      let durationMs = baseTimeMs * (0.8 + Math.random() * 0.4);

      // Failures usually take longer (searching around) or very short (rage quit)
      if (successValue === "Nei") {
        durationMs = Math.random() > 0.5 ? durationMs * 2 : durationMs * 0.3;
      }

      durationMs = Math.round(durationMs);

      // Add variation to time
      const hour = 8 + Math.floor(Math.random() * 12);
      const minute = Math.floor(Math.random() * 60);
      const dateObj = new Date(dateStr);
      dateObj.setUTCHours(hour, minute, 0, 0);
      const timestamp = dateObj.toISOString();

      // Start time
      const startedAt = new Date(dateObj.getTime() - durationMs).toISOString();

      items.push({
        id: `tt-gen-${i}-${j}`,
        submittedAt: timestamp,
        visitStartedAt: startedAt,
        durationMs,
        app: "dialogmote-frontend",
        surveyId: "survey-top-tasks",
        surveyType: "topTasks",
        // Realistic device distribution: 55% desktop, 35% mobile, 10% tablet
        context: createContext(
          "/motebehov/arbeidsgiver",
          Math.random() < 0.55
            ? "desktop"
            : Math.random() < 0.8
              ? "mobile"
              : "tablet",
        ),
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

export function generateDiscoveryMockData(): FeedbackDto[] {
  const items: FeedbackDto[] = [];
  const now = new Date();

  // Rich open-text responses that will create meaningful word clouds and themes
  // Each entry: { text, successRate, theme }
  const discoveryResponses = [
    // Theme: Søknadsstatus (high volume, mixed success)
    {
      text: "Sjekke status på søknaden min om dagpenger",
      success: 0.6,
      theme: "status",
    },
    {
      text: "Finne ut hvor langt søknaden min har kommet",
      success: 0.5,
      theme: "status",
    },
    {
      text: "Se om søknaden er behandlet ferdig",
      success: 0.7,
      theme: "status",
    },
    {
      text: "Lure på om dere har mottatt dokumentene mine til søknaden",
      success: 0.4,
      theme: "status",
    },
    {
      text: "Sjekke saksbehandlingstid på søknaden",
      success: 0.5,
      theme: "status",
    },

    // Theme: Sykemelding/Sykepenger (high volume, good success)
    {
      text: "Sende inn sykemelding fra legen",
      success: 0.85,
      theme: "sykmelding",
    },
    {
      text: "Finne ut når jeg får sykepenger",
      success: 0.7,
      theme: "sykmelding",
    },
    {
      text: "Sjekke hvor mye sykepenger jeg får utbetalt",
      success: 0.8,
      theme: "sykmelding",
    },
    { text: "Forlenge sykemelding", success: 0.75, theme: "sykmelding" },
    {
      text: "Lese om regler for sykmelding",
      success: 0.9,
      theme: "sykmelding",
    },

    // Theme: Kontakte NAV (low success - friction point!)
    { text: "Snakke med noen om saken min", success: 0.3, theme: "kontakt" },
    { text: "Finne telefonnummer til NAV", success: 0.4, theme: "kontakt" },
    { text: "Bestille time hos NAV-kontoret", success: 0.35, theme: "kontakt" },
    {
      text: "Sende melding til saksbehandler",
      success: 0.25,
      theme: "kontakt",
    },
    { text: "Få svar på henvendelsen min", success: 0.2, theme: "kontakt" },

    // Theme: Skjema/Dokumenter (medium success)
    { text: "Finne riktig skjema for å søke", success: 0.6, theme: "skjema" },
    {
      text: "Laste opp dokumentasjon til saken",
      success: 0.7,
      theme: "skjema",
    },
    { text: "Fylle ut meldekort", success: 0.85, theme: "skjema" },
    { text: "Sende inn vedlegg som manglet", success: 0.65, theme: "skjema" },

    // Theme: Utbetaling (high volume)
    { text: "Se når pengene kommer", success: 0.9, theme: "utbetaling" },
    { text: "Sjekke utbetalingsdato", success: 0.85, theme: "utbetaling" },
    {
      text: "Forstå hva som er trukket i skatt",
      success: 0.5,
      theme: "utbetaling",
    },
    {
      text: "Finne kvittering på utbetaling",
      success: 0.7,
      theme: "utbetaling",
    },
  ];

  // Generate 150 items with weighted distribution
  for (let i = 0; i < 150; i++) {
    const daysAgo = Math.floor(Math.random() * 45);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    const hour = 6 + Math.floor(Math.random() * 16);
    const timestamp = `${date.toISOString().split("T")[0]}T${hour.toString().padStart(2, "0")}:${Math.floor(
      Math.random() * 60,
    )
      .toString()
      .padStart(2, "0")}:00Z`;

    // Pick a response (weighted towards status and sykmelding themes)
    const weights = {
      status: 0.25,
      sykmelding: 0.25,
      kontakt: 0.15,
      skjema: 0.15,
      utbetaling: 0.2,
    };
    const rand = Math.random();
    let cumulative = 0;
    let selectedTheme = "status";
    for (const [theme, weight] of Object.entries(weights)) {
      cumulative += weight;
      if (rand <= cumulative) {
        selectedTheme = theme;
        break;
      }
    }

    const themeResponses = discoveryResponses.filter(
      (r) => r.theme === selectedTheme,
    );
    const response =
      themeResponses[Math.floor(Math.random() * themeResponses.length)];

    // Determine success based on the response's typical success rate
    const successRand = Math.random();
    let successValue: "yes" | "partial" | "no" = "yes";
    if (successRand > response.success) {
      successValue = successRand > response.success + 0.15 ? "no" : "partial";
    }

    // Add optional blocker text for failures
    const blockerTexts = [
      "Fant ikke riktig side",
      "Ble sendt i ring på nettsiden",
      "Informasjonen var utdatert",
      "Skjønte ikke hva jeg skulle gjøre",
      "Innlogging feilet",
    ];

    const answers = [
      createTextAnswer("task", "Hva kom du for å gjøre i dag?", response.text),
      createSingleChoiceAnswer(
        "success",
        "Fikk du gjort det?",
        successValue,
        undefined,
        [
          { id: "yes", label: "Ja" },
          { id: "partial", label: "Delvis" },
          { id: "no", label: "Nei" },
        ],
      ),
    ];

    if (successValue !== "yes" && Math.random() > 0.3) {
      answers.push(
        createTextAnswer(
          "blocker",
          "Hva hindret deg?",
          blockerTexts[Math.floor(Math.random() * blockerTexts.length)],
        ),
      );
    }

    items.push({
      id: `disc-${i}`,
      submittedAt: timestamp,
      app: "nav-no-frontend",
      surveyId: "survey-discovery",
      surveyType: "discovery",
      context: createContext("/", Math.random() > 0.6 ? "mobile" : "desktop"),
      answers,
      sensitiveDataRedacted: false,
    });
  }
  return items;
}

export function generateTaskPriorityMockData(): FeedbackDto[] {
  const items: FeedbackDto[] = [];
  const now = new Date();

  // Extended task list to show realistic "Long Neck" distribution
  // The first few tasks should dominate (that's the "Long Neck")
  const tasks = [
    // TOP TASKS (will get ~60% of all votes combined - the "Long Neck")
    { id: "sjekke-utbetaling", label: "Sjekke utbetalinger", weight: 0.22 },
    { id: "sok-dagpenger", label: "Søke dagpenger", weight: 0.18 },
    { id: "melde-sykefravaer", label: "Melde sykefravær", weight: 0.12 },
    { id: "sjekke-status", label: "Sjekke søknadsstatus", weight: 0.1 },

    // MEDIUM TASKS (next ~25%)
    { id: "meldekort", label: "Sende meldekort", weight: 0.08 },
    { id: "finne-skjema", label: "Finne riktig skjema", weight: 0.06 },
    { id: "kontakte-nav", label: "Kontakte NAV", weight: 0.05 },
    { id: "lese-rettigheter", label: "Lese om mine rettigheter", weight: 0.04 },

    // TINY TASKS (the long tail - ~15% combined)
    { id: "endre-kontonummer", label: "Endre kontonummer", weight: 0.03 },
    {
      id: "bestille-legeerklaring",
      label: "Bestille legeerklæring",
      weight: 0.025,
    },
    { id: "se-vedtak", label: "Se vedtak", weight: 0.02 },
    { id: "klage-vedtak", label: "Klage på vedtak", weight: 0.015 },
    { id: "sok-foreldrepenger", label: "Søke foreldrepenger", weight: 0.015 },
    { id: "aktivitetsplan", label: "Oppdatere aktivitetsplan", weight: 0.01 },
    { id: "cv-registrering", label: "Registrere CV", weight: 0.01 },
    { id: "annet", label: "Annet", weight: 0.02 },
  ];

  // Generate 200 votes to show a clear pattern
  for (let i = 0; i < 200; i++) {
    const daysAgo = Math.floor(Math.random() * 14); // Concentrated in last 2 weeks
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    const hour = 8 + Math.floor(Math.random() * 12);
    const timestamp = `${date.toISOString().split("T")[0]}T${hour.toString().padStart(2, "0")}:${Math.floor(
      Math.random() * 60,
    )
      .toString()
      .padStart(2, "0")}:00Z`;

    // Users pick 3-5 tasks based on WEIGHTED selection (not uniform!)
    const numPicks = 3 + Math.floor(Math.random() * 3);
    const picks = new Set<string>();

    while (picks.size < numPicks) {
      // Weighted random selection
      const rand = Math.random();
      let cumulative = 0;
      for (const task of tasks) {
        cumulative += task.weight;
        if (rand <= cumulative) {
          picks.add(task.id);
          break;
        }
      }
    }
    const selectedIds = Array.from(picks);

    items.push({
      id: `prior-${i}`,
      submittedAt: timestamp,
      app: "nav-no-frontend",
      surveyId: "survey-task-priority",
      surveyType: "taskPriority",
      context: createContext(
        "/minside",
        Math.random() > 0.7 ? "mobile" : "desktop",
      ),
      answers: [
        createMultiChoiceAnswer(
          "priority",
          "Hva er de viktigste tingene du trenger å gjøre på nav.no? (Velg inntil 5)",
          selectedIds,
          undefined,
          tasks.map((t) => ({ id: t.id, label: t.label })),
        ),
      ],
      sensitiveDataRedacted: false,
    });
  }
  return items;
}

export function generateComplexSurveyData(): FeedbackDto[] {
  const items: FeedbackDto[] = [];
  const now = new Date();

  // Extensive comment pools for maximum variety
  const privatePersonComments = {
    positive: [
      "Veldig enkelt å fylle ut skjemaet, tok under 5 minutter!",
      "Endelig en løsning som fungerer på mobil. Tusen takk!",
      "God oversikt over alle stegene i prosessen.",
      "Mye bedre enn det gamle systemet.",
      "Likte at jeg kunne lagre og fortsette senere.",
      "Tydelig og forståelig språk gjennom hele prosessen.",
      "Rask og smidig prosess fra start til slutt.",
      "Intuitivt grensesnitt som var lett å navigere.",
      "Fikk all informasjonen jeg trengte underveis.",
      "Bra at det var mulig å se forhåndsvisning før innsending.",
      "Enklere enn jeg fryktet!",
      "Fornøyd med at jeg slapp å ringe inn.",
      "Perfekt at man kan gjøre dette når det passer en selv.",
      "Oversiktlig og strukturert. Godt jobba!",
      "Imponert over hvor raskt det gikk.",
    ],
    neutral: [
      "Greit nok, men tok litt tid å finne frem.",
      "Fungerte, men kunne vært mer oversiktlig.",
      "Noen av feltene var litt uklare.",
      "Savner mulighet til å se status etterpå.",
      "Litt vanskelig å forstå hva som var neste steg.",
      "OK, men hjelpetekstene kunne vært bedre.",
      "Gikk greit til slutt, men måtte lete litt.",
      "Hadde foretrukket færre obligatoriske felt.",
      "Burde vært tydeligere hva som skjer etter innsending.",
      "Fungerte på PC, men har ikke testet mobil.",
      "Kunne ønske meg bedre bekreftelse på at alt var sendt.",
      "Litt rotete layout på noen av sidene.",
      "Tok lengre tid enn forventet.",
      "Grunnleggende funksjonalitet på plass.",
      "",
      "",
    ],
    negative: [
      "Fikk feilmelding flere ganger uten forklaring.",
      "Måtte starte på nytt fordi økten utløp.",
      "Vanskelig å forstå hva dere ville ha.",
      "For mange obligatoriske felt som ikke var relevante for meg.",
      "Innloggingen fungerte dårlig.",
      "Ble kastet ut midt i utfyllingen. Frustrerende.",
      "Knappen for å gå videre virket ikke i Chrome.",
      "Tekstfeltene var for små til å skrive ordentlig.",
      "Fikk ikke lastet opp vedlegg, prøvde 3 ganger.",
      "Skjemaet hang seg opp på mobilen min.",
      "Ingenting fungerte som det skulle.",
      "Brukte over en time på noe som burde ta 10 min.",
      "Dårlig brukeropplevelse fra start til slutt.",
      "Hvorfor må jeg logge inn flere ganger?",
    ],
  };

  const employerComments = {
    positive: [
      "Effektivt verktøy som sparer oss for mye administrasjon.",
      "Bra at vi kan håndtere flere ansatte samtidig.",
      "Oversiktlig dashboard med god rapportering.",
      "Integrasjonen med Altinn fungerer bra nå.",
      "Mye raskere prosess enn tidligere.",
      "Endelig et system som gir oss kontroll.",
      "Liker at vi kan delegere oppgaver til HR.",
      "God historikk og sporbarhet.",
      "Varslingene på e-post er nyttige.",
      "Enkel import og eksport av data.",
      "Profesjonelt verktøy som dekker våre behov.",
      "Support-teamet var raske til å hjelpe.",
      "Dokumentasjonen var grundig og nyttig.",
    ],
    neutral: [
      "Fungerer til vanlig bruk, men mangler noen rapporter.",
      "Kunne vært enklere å finne historikk.",
      "Greit, men vi savner eksport til Excel.",
      "Litt tungvint ved store mengder data.",
      "Noe tregt ved mange samtidige brukere.",
      "Grensesnittet trenger oppdatering.",
      "Hadde forventet mer avansert filtrering.",
      "Fungerer, men konkurrenten har bedre UX.",
      "Vi klarer oss, men det er rom for forbedring.",
      "Basis-funksjonene er på plass.",
      "",
      "",
    ],
    negative: [
      "Rettighetsstyringen er for komplisert.",
      "Får ofte timeout ved store operasjoner.",
      "Vanskelig å delegere til underordnede.",
      "Mangler integrasjon med vårt HR-system.",
      "API-et er ustabilt og dårlig dokumentert.",
      "Rapporten vi trenger finnes ikke.",
      "Systemet krasjer ved batch-operasjoner.",
      "For dyrt i forhold til hva vi får.",
      "Support svarer ikke på henvendelser.",
      "Har rapportert samme bug tre ganger.",
    ],
  };

  // Feature combinations with weighted probability
  const featureCombinations = [
    { features: ["innsending"], weight: 0.35 },
    { features: ["arkiv"], weight: 0.2 },
    { features: ["innsending", "arkiv"], weight: 0.25 },
    { features: ["kalkulator"], weight: 0.05 },
    { features: ["innsending", "kalkulator"], weight: 0.05 },
    { features: ["arkiv", "kalkulator"], weight: 0.05 },
    { features: ["innsending", "arkiv", "kalkulator"], weight: 0.05 },
  ];

  // Track used comments to avoid exact duplicates
  const usedComments = new Set<string>();

  // Generate 80 submissions over the last 30 days
  for (let i = 0; i < 80; i++) {
    // Varied timestamps over last 30 days
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    // Realistic working hours with some evening submissions
    const isEvening = Math.random() < 0.15;
    const hour = isEvening
      ? 19 + Math.floor(Math.random() * 3)
      : 8 + Math.floor(Math.random() * 10);
    const minute = Math.floor(Math.random() * 60);
    const second = Math.floor(Math.random() * 60);
    date.setHours(hour, minute, second, 0);
    const timestamp = date.toISOString();

    // Role distribution: 70% private persons, 30% employers
    const isEmployer = Math.random() < 0.3;
    const role = isEmployer ? "Arbeidsgiver" : "Privatperson";

    // Rating with realistic distribution (skewed toward 3-4)
    const ratingRand = Math.random();
    let rating: number;
    if (ratingRand < 0.08) rating = 1;
    else if (ratingRand < 0.18) rating = 2;
    else if (ratingRand < 0.4) rating = 3;
    else if (ratingRand < 0.75) rating = 4;
    else rating = 5;

    // Select comment based on satisfaction and role, avoiding duplicates
    const comments = isEmployer ? employerComments : privatePersonComments;
    let commentPool: string[];
    if (rating >= 4) commentPool = comments.positive;
    else if (rating >= 3) commentPool = comments.neutral;
    else commentPool = comments.negative;

    // Try to find an unused comment, or pick randomly if all used
    let comment = "";
    const availableComments = commentPool.filter((c) => !usedComments.has(c));
    if (availableComments.length > 0) {
      comment =
        availableComments[Math.floor(Math.random() * availableComments.length)];
      if (comment) usedComments.add(comment);
    } else {
      comment = commentPool[Math.floor(Math.random() * commentPool.length)];
    }

    // Weighted feature selection
    const featureRand = Math.random();
    let cumulative = 0;
    let features: string[] = ["innsending"];
    for (const combo of featureCombinations) {
      cumulative += combo.weight;
      if (featureRand <= cumulative) {
        features = combo.features;
        break;
      }
    }

    // Random incident date within last 6 months
    const incidentDaysAgo = Math.floor(Math.random() * 180);
    const incidentDate = new Date(now);
    incidentDate.setDate(incidentDate.getDate() - incidentDaysAgo);
    const incidentDateStr = incidentDate.toISOString().split("T")[0];

    // Device distribution
    const deviceRand = Math.random();
    const device =
      deviceRand < 0.5 ? "desktop" : deviceRand < 0.85 ? "mobile" : "tablet";

    items.push({
      id: `comp-${i}`,
      submittedAt: timestamp,
      app: "syfo-oppfolgingsplan-frontend",
      surveyId: "survey-custom",
      surveyType: "custom",
      context: createContext("/advanced-feedback", device),
      answers: [
        createRatingAnswer("satisfaction", "Hvor fornøyd er du?", rating),
        createSingleChoiceAnswer("role", "Rolle", role, undefined, [
          { id: "Privatperson", label: "Privatperson" },
          { id: "Arbeidsgiver", label: "Arbeidsgiver" },
        ]),
        createMultiChoiceAnswer(
          "features",
          "Hva brukte du?",
          features,
          undefined,
          [
            { id: "innsending", label: "Innsending" },
            { id: "arkiv", label: "Arkiv" },
            { id: "kalkulator", label: "Kalkulator" },
          ],
        ),
        createDateAnswer("incidentDate", "Når skjedde dette?", incidentDateStr),
        ...(comment ? [createTextAnswer("comment", "Kommentar", comment)] : []),
      ],
      sensitiveDataRedacted: false,
    });
  }
  return items;
}
