/**
 * LMIS v1 reference data.
 *
 * Anchors are public figures where available (DGET/MSDE ITI counts & seat
 * capacity, PLFS usual-status indicators, NCS registration totals — see
 * SOURCES). Where a public table could not be reproduced exactly (state-wise
 * PLFS tables), values are indicative model inputs and are labelled as such
 * in the Methodology tab. District-level values are disaggregated at runtime
 * by src/lib/model.ts — nothing district-specific is hard-coded.
 */

export type SectorId =
  | "electronics"
  | "itites"
  | "automotive"
  | "healthcare"
  | "retail"
  | "construction";

export type Region = "North" | "Central" | "East" | "West" | "South" | "Northeast";

export interface Sector {
  id: SectorId;
  name: string;
  nameHi: string;
  ssc: string;
  sscHi: string;
  /** Share of the national workforce employed in this sector. */
  employmentShare: number;
  /** Formally posted, skill-requiring vacancies per worker per year. */
  demandRate: number;
  /** Annual workforce churn + growth producing fresh demand (fraction). */
  turnover: number;
  /** Employment growth momentum, % per year. */
  growth: number;
  /** Real wage growth signal, % per year. */
  wageGrowth: number;
  /** Share of the national training-seat pool aimed at this sector. */
  seatShare: number;
  /** National NCS vacancy-intensity baseline, 0–100. */
  vacancyBase: number;
}

export interface Trade {
  id: string;
  sector: SectorId;
  name: string;
  nameHi: string;
  /** SSC qualification pack code (verified against SSC public listings). */
  qp: string | null;
  nsqf: number;
  /** Share of sector demand this job role absorbs. */
  demandShare: number;
}

export interface StateMeta {
  slug: string;
  /** Census/LGD state code (matches map district codes). */
  code: string;
  name: string;
  nameHi: string;
  region: Region;
  /** Worker population ratio, usual status 15+ (%). PLFS-style indicator. */
  wpr: number;
  /** Unemployment rate, usual status 15+ (%). PLFS-style indicator. */
  ur: number;
  /** Total workers (usual status), in lakh. */
  workers: number;
  /** Urban population share, 0–1. */
  urban: number;
  /** Count of ITIs (MSDE/PIB, July 2025 — verified for UP & AP). */
  itiCount: number;
  pilot: boolean;
}

/* ------------------------------------------------------------------ sectors */

export const SECTORS: Sector[] = [
  {
    id: "electronics",
    name: "Electronics Manufacturing",
    nameHi: "इलेक्ट्रॉनिक्स निर्माण",
    ssc: "ESSCI",
    sscHi: "ईएसएससी",
    employmentShare: 0.02,
    demandRate: 0.027,
    turnover: 0.15,
    growth: 14.2,
    wageGrowth: 6.5,
    seatShare: 0.14,
    vacancyBase: 86,
  },
  {
    id: "itites",
    name: "IT–ITeS & Digital",
    nameHi: "आईटी–आईटीईएस एवं डिजिटल",
    ssc: "SSC NASSCOM",
    sscHi: "एसएससी नासकॉम",
    employmentShare: 0.015,
    demandRate: 0.03,
    turnover: 0.11,
    growth: 9.5,
    wageGrowth: 8.0,
    seatShare: 0.1,
    vacancyBase: 88,
  },
  {
    id: "automotive",
    name: "Automotive & EV",
    nameHi: "ऑटोमोबाइल एवं ईवी",
    ssc: "ASDC",
    sscHi: "एएसडीसी",
    employmentShare: 0.04,
    demandRate: 0.0155,
    turnover: 0.11,
    growth: 7.8,
    wageGrowth: 5.2,
    seatShare: 0.16,
    vacancyBase: 74,
  },
  {
    id: "healthcare",
    name: "Healthcare & Allied",
    nameHi: "स्वास्थ्य एवं संबद्ध सेवाएँ",
    ssc: "HSSC",
    sscHi: "एचएसएससी",
    employmentShare: 0.03,
    demandRate: 0.017,
    turnover: 0.1,
    growth: 8.6,
    wageGrowth: 5.8,
    seatShare: 0.12,
    vacancyBase: 79,
  },
  {
    id: "retail",
    name: "Retail & E-commerce",
    nameHi: "खुदरा एवं ई-कॉमर्स",
    ssc: "RASCI",
    sscHi: "रास्की",
    employmentShare: 0.055,
    demandRate: 0.0072,
    turnover: 0.15,
    growth: 6.4,
    wageGrowth: 4.2,
    seatShare: 0.09,
    vacancyBase: 66,
  },
  {
    id: "construction",
    name: "Construction & Infrastructure",
    nameHi: "निर्माण एवं अवसंरचना",
    ssc: "CSDC",
    sscHi: "सीएसडीसी",
    employmentShare: 0.07,
    demandRate: 0.0072,
    turnover: 0.11,
    growth: 5.9,
    wageGrowth: 4.8,
    seatShare: 0.11,
    vacancyBase: 70,
  },
];

/** Share of the annual seat pool that sits inside the six pilot sectors. */
export const PILOT_SEAT_SHARE = SECTORS.reduce((s, x) => s + x.seatShare, 0);

/* ------------------------------------------------------------------- trades */

export const TRADES: Trade[] = [
  // Electronics — QP codes verified on ESSCI's published listing
  { id: "ele-pcb", sector: "electronics", name: "PCB Assembly Technician", nameHi: "पीसीबी असेंबली तकनीशियन", qp: "ELE/Q7804", nsqf: 4, demandShare: 0.4 },
  { id: "ele-clean", sector: "electronics", name: "Clean-Room Operations Technician", nameHi: "क्लीन-रूम ऑपरेशंस तकनीशियन", qp: "ELE/N0166", nsqf: 4, demandShare: 0.25 },
  { id: "ele-semi", sector: "electronics", name: "Semiconductor Process Technician", nameHi: "सेमीकंडक्टर प्रोसेस तकनीशियन", qp: "ELE/Q1406", nsqf: 6, demandShare: 0.2 },
  { id: "ele-th", sector: "electronics", name: "Through-Hole Assembly Operator", nameHi: "थ्रू-होल असेंबली ऑपरेटर", qp: "ELE/Q5101", nsqf: 4, demandShare: 0.15 },
  // IT–ITeS — role packs under SSC NASSCOM Future Skills (QP catalogue not public-numbered)
  { id: "it-dev", sector: "itites", name: "Software Developer & Analyst", nameHi: "सॉफ़्टवेयर डेवलपर एवं विश्लेषक", qp: null, nsqf: 6, demandShare: 0.45 },
  { id: "it-cloud", sector: "itites", name: "Cloud & Datacentre Operations", nameHi: "क्लाउड एवं डेटासेंटर संचालन", qp: null, nsqf: 5, demandShare: 0.25 },
  { id: "it-desk", sector: "itites", name: "IT Service Desk Associate", nameHi: "आईटी सर्विस डेस्क एसोसिएट", qp: null, nsqf: 4, demandShare: 0.3 },
  // Automotive — QP codes verified on ASDC's job-role listing
  { id: "auto-sales", sector: "automotive", name: "Automotive Sales Executive", nameHi: "ऑटोमोबाइल सेल्स एग्जीक्यूटिव", qp: "ASC/Q1001", nsqf: 5, demandShare: 0.15 },
  { id: "auto-qc", sector: "automotive", name: "Quality Control Jr. Inspector", nameHi: "क्वालिटी कंट्रोल जूनियर इंस्पेक्टर", qp: "ASC/Q6303", nsqf: 5, demandShare: 0.25 },
  { id: "auto-mech", sector: "automotive", name: "Motor Vehicle Mechanic", nameHi: "मोटर वाहन मैकेनिक", qp: null, nsqf: 3, demandShare: 0.35 },
  { id: "auto-assy", sector: "automotive", name: "Vehicle Assembly Line Operator", nameHi: "वाहन असेंबली लाइन ऑपरेटर", qp: null, nsqf: 3, demandShare: 0.25 },
  // Healthcare — HSSC
  { id: "hc-gda", sector: "healthcare", name: "General Duty Assistant", nameHi: "जनरल ड्यूटी असिस्टेंट", qp: "HSS/Q5101", nsqf: 4, demandShare: 0.5 },
  { id: "hc-lab", sector: "healthcare", name: "Medical Lab Technician", nameHi: "मेडिकेल लैब टेक्नीशियन", qp: null, nsqf: 4, demandShare: 0.25 },
  { id: "hc-ward", sector: "healthcare", name: "Ward Attendant", nameHi: "वार्ड अटेंडेंट", qp: null, nsqf: 3, demandShare: 0.25 },
  // Retail — RASCI
  { id: "ret-sales", sector: "retail", name: "Retail Sales Associate", nameHi: "रिटेल सेल्स असोसिएट", qp: "RAS/Q0104", nsqf: 3, demandShare: 0.5 },
  { id: "ret-ecom", sector: "retail", name: "E-commerce Operations Associate", nameHi: "ई-कॉमर्स ऑपरेशंस असोसिएट", qp: null, nsqf: 4, demandShare: 0.3 },
  { id: "ret-inv", sector: "retail", name: "Retail Inventory Associate", nameHi: "रिटेल इन्वेंटरी असोसिएट", qp: null, nsqf: 3, demandShare: 0.2 },
  // Construction — CSDC (levels verified on CSDC listing)
  { id: "con-helper", sector: "construction", name: "Helper Mason", nameHi: "हेल्पर मेसन", qp: "CON/Q0101", nsqf: 2, demandShare: 0.35 },
  { id: "con-amason", sector: "construction", name: "Assistant Mason", nameHi: "असिस्टेंट मेसन", qp: "CON/Q0102", nsqf: 3, demandShare: 0.35 },
  { id: "con-brick", sector: "construction", name: "Brick Mason", nameHi: "ब्रिक मेसन", qp: "CON/Q0113", nsqf: 4, demandShare: 0.3 },
];

/* ------------------------------------------------------------------- states */

export const STATES: StateMeta[] = [
  { slug: "andaman-and-nicobar-islands", code: "35", name: "Andaman and Nicobar Islands", nameHi: "अंडमान और निकोबार द्वीपसमूह", region: "South", wpr: 55.7, ur: 4.7, workers: 9, urban: 0.37, itiCount: 20, pilot: false },
  { slug: "andhra-pradesh", code: "37", name: "Andhra Pradesh", nameHi: "आंध्र प्रदेश", region: "South", wpr: 62.1, ur: 4.4, workers: 235, urban: 0.3, itiCount: 519, pilot: false },
  { slug: "arunachal-pradesh", code: "12", name: "Arunachal Pradesh", nameHi: "अरुणाचल प्रदेश", region: "Northeast", wpr: 69.2, ur: 3.7, workers: 19, urban: 0.11, itiCount: 30, pilot: false },
  { slug: "assam", code: "18", name: "Assam", nameHi: "असम", region: "Northeast", wpr: 58.4, ur: 3.9, workers: 151, urban: 0.14, itiCount: 260, pilot: false },
  { slug: "bihar", code: "10", name: "Bihar", nameHi: "बिहार", region: "East", wpr: 55.1, ur: 3.0, workers: 424, urban: 0.11, itiCount: 980, pilot: true },
  { slug: "chandigarh", code: "04", name: "Chandigarh", nameHi: "चंडीगढ़", region: "North", wpr: 51.2, ur: 5.9, workers: 12, urban: 0.97, itiCount: 20, pilot: false },
  { slug: "chhattisgarh", code: "22", name: "Chhattisgarh", nameHi: "छत्तीसगढ़", region: "Central", wpr: 60.1, ur: 2.6, workers: 151, urban: 0.2, itiCount: 320, pilot: false },
  { slug: "dadra-and-nagar-haveli-and-daman-and-diu", code: "26", name: "Dadra and Nagar Haveli and Daman and Diu", nameHi: "दादरा और नगर हवेली और दमन और दीव", region: "West", wpr: 60.5, ur: 3.5, workers: 6, urban: 0.46, itiCount: 15, pilot: false },
  { slug: "delhi", code: "07", name: "Delhi", nameHi: "दिल्ली", region: "North", wpr: 51.6, ur: 6.6, workers: 106, urban: 0.98, itiCount: 230, pilot: false },
  { slug: "goa", code: "30", name: "Goa", nameHi: "गोवा", region: "West", wpr: 66.5, ur: 4.8, workers: 17, urban: 0.62, itiCount: 40, pilot: false },
  { slug: "gujarat", code: "24", name: "Gujarat", nameHi: "गुजरात", region: "West", wpr: 64.2, ur: 3.1, workers: 265, urban: 0.43, itiCount: 760, pilot: true },
  { slug: "haryana", code: "06", name: "Haryana", nameHi: "हरियाणा", region: "North", wpr: 61.3, ur: 4.1, workers: 151, urban: 0.34, itiCount: 310, pilot: false },
  { slug: "himachal-pradesh", code: "02", name: "Himachal Pradesh", nameHi: "हिमाचल प्रदेश", region: "North", wpr: 66.2, ur: 4.2, workers: 53, urban: 0.1, itiCount: 110, pilot: false },
  { slug: "jammu-and-kashmir", code: "01", name: "Jammu and Kashmir", nameHi: "जम्मू और कश्मीर", region: "North", wpr: 50.3, ur: 6.4, workers: 68, urban: 0.28, itiCount: 140, pilot: false },
  { slug: "jharkhand", code: "20", name: "Jharkhand", nameHi: "झारखंड", region: "East", wpr: 55.2, ur: 4.2, workers: 167, urban: 0.2, itiCount: 370, pilot: false },
  { slug: "karnataka", code: "29", name: "Karnataka", nameHi: "कर्नाटक", region: "South", wpr: 60.4, ur: 5.4, workers: 257, urban: 0.38, itiCount: 690, pilot: true },
  { slug: "kerala", code: "32", name: "Kerala", nameHi: "केरल", region: "South", wpr: 49.2, ur: 7.4, workers: 174, urban: 0.47, itiCount: 410, pilot: false },
  { slug: "ladakh", code: "38", name: "Ladakh", nameHi: "लद्दाख", region: "North", wpr: 55.8, ur: 5.4, workers: 5, urban: 0.16, itiCount: 20, pilot: false },
  { slug: "lakshadweep", code: "31", name: "Lakshadweep", nameHi: "लक्षद्वीप", region: "South", wpr: 55.2, ur: 4.1, workers: 2, urban: 0.78, itiCount: 5, pilot: false },
  { slug: "madhya-pradesh", code: "23", name: "Madhya Pradesh", nameHi: "मध्य प्रदेश", region: "Central", wpr: 65.9, ur: 3.6, workers: 363, urban: 0.23, itiCount: 880, pilot: false },
  { slug: "maharashtra", code: "27", name: "Maharashtra", nameHi: "महाराष्ट्र", region: "West", wpr: 60.8, ur: 3.4, workers: 485, urban: 0.45, itiCount: 1170, pilot: true },
  { slug: "manipur", code: "14", name: "Manipur", nameHi: "मणिपुर", region: "Northeast", wpr: 61.2, ur: 4.6, workers: 27, urban: 0.26, itiCount: 45, pilot: false },
  { slug: "meghalaya", code: "17", name: "Meghalaya", nameHi: "मेघालय", region: "Northeast", wpr: 62.4, ur: 4.5, workers: 30, urban: 0.2, itiCount: 50, pilot: false },
  { slug: "mizoram", code: "15", name: "Mizoram", nameHi: "मिज़ोरम", region: "Northeast", wpr: 65.4, ur: 4.9, workers: 15, urban: 0.52, itiCount: 30, pilot: false },
  { slug: "nagaland", code: "13", name: "Nagaland", nameHi: "नागालैंड", region: "Northeast", wpr: 62.1, ur: 4.3, workers: 23, urban: 0.28, itiCount: 40, pilot: false },
  { slug: "odisha", code: "21", name: "Odisha", nameHi: "ओडिशा", region: "East", wpr: 57.3, ur: 3.8, workers: 220, urban: 0.17, itiCount: 440, pilot: false },
  { slug: "puducherry", code: "34", name: "Puducherry", nameHi: "पुडुचेरी", region: "South", wpr: 55.4, ur: 5.6, workers: 15, urban: 0.9, itiCount: 35, pilot: false },
  { slug: "punjab", code: "03", name: "Punjab", nameHi: "पंजाब", region: "North", wpr: 60.2, ur: 4.4, workers: 136, urban: 0.37, itiCount: 280, pilot: false },
  { slug: "rajasthan", code: "08", name: "Rajasthan", nameHi: "राजस्थान", region: "North", wpr: 56.2, ur: 3.3, workers: 326, urban: 0.24, itiCount: 823, pilot: false },
  { slug: "sikkim", code: "11", name: "Sikkim", nameHi: "सिक्किम", region: "Northeast", wpr: 60.3, ur: 5.1, workers: 8, urban: 0.09, itiCount: 15, pilot: false },
  { slug: "tamil-nadu", code: "33", name: "Tamil Nadu", nameHi: "तमिलनाडु", region: "South", wpr: 59.8, ur: 6.9, workers: 303, urban: 0.48, itiCount: 830, pilot: true },
  { slug: "telangana", code: "36", name: "Telangana", nameHi: "तेलंगाना", region: "South", wpr: 55.8, ur: 4.9, workers: 182, urban: 0.38, itiCount: 470, pilot: false },
  { slug: "tripura", code: "16", name: "Tripura", nameHi: "त्रिपुरा", region: "Northeast", wpr: 63.1, ur: 4.4, workers: 30, urban: 0.26, itiCount: 60, pilot: false },
  { slug: "uttar-pradesh", code: "09", name: "Uttar Pradesh", nameHi: "उत्तर प्रदेश", region: "North", wpr: 52.4, ur: 3.2, workers: 710, urban: 0.22, itiCount: 3258, pilot: true },
  { slug: "uttarakhand", code: "05", name: "Uttarakhand", nameHi: "उत्तराखंड", region: "North", wpr: 58.1, ur: 4.0, workers: 83, urban: 0.3, itiCount: 200, pilot: false },
  { slug: "west-bengal", code: "19", name: "West Bengal", nameHi: "पश्चिम बंगाल", region: "East", wpr: 56.4, ur: 4.6, workers: 310, urban: 0.31, itiCount: 740, pilot: false },
];

/**
 * Sector demand affinity by state — multiplier applied to vacancy intensity
 * and employment growth (1.0 = national average; unlisted states default to
 * DEFAULT_AFFINITY). Encodes where each industry actually clusters.
 */
export const AFFINITY: Partial<Record<SectorId, Record<string, number>>> = {
  electronics: {
    "tamil-nadu": 1.6, maharashtra: 1.5, karnataka: 1.4, telangana: 1.35,
    "andhra-pradesh": 1.3, gujarat: 1.3, "uttar-pradesh": 1.25, kerala: 1.1,
    haryana: 1.05, odisha: 1.05, "uttarakhand": 1.05,
  },
  itites: {
    karnataka: 1.7, telangana: 1.5, "tamil-nadu": 1.4, maharashtra: 1.4,
    haryana: 1.3, delhi: 1.25, "uttar-pradesh": 1.2, "west-bengal": 1.15,
    kerala: 1.1, gujarat: 1.05,
  },
  automotive: {
    "tamil-nadu": 1.6, maharashtra: 1.5, haryana: 1.45, gujarat: 1.4,
    karnataka: 1.3, "uttar-pradesh": 1.25, "west-bengal": 1.15, telangana: 1.15,
    "madhya-pradesh": 1.05,
  },
  healthcare: {
    kerala: 1.6, "tamil-nadu": 1.35, maharashtra: 1.3, "west-bengal": 1.3,
    delhi: 1.25, karnataka: 1.2, "andhra-pradesh": 1.2, telangana: 1.15,
    goa: 1.1, punjab: 1.05,
  },
  retail: {
    delhi: 1.5, maharashtra: 1.45, karnataka: 1.3, "tamil-nadu": 1.25,
    telangana: 1.2, "west-bengal": 1.2, haryana: 1.15, "uttar-pradesh": 1.15,
    gujarat: 1.1, kerala: 1.1,
  },
  construction: {
    maharashtra: 1.35, gujarat: 1.3, "uttar-pradesh": 1.25, "tamil-nadu": 1.2,
    karnataka: 1.2, haryana: 1.15, rajasthan: 1.15, "madhya-pradesh": 1.1,
    telangana: 1.1, "chhattisgarh": 1.05,
  },
};

export const DEFAULT_AFFINITY = 0.85;

/**
 * In-state vacancy posting dampener for net labour-exporting states: NCS
 * postings lag the training base where workers migrate out for work, which is
 * exactly where certified candidates face thin local placement markets.
 */
export const MIGRATION_DAMPENER: Record<string, number> = {
  bihar: 0.78,
  kerala: 0.82,
  odisha: 0.82,
  jharkhand: 0.85,
  chhattisgarh: 0.87,
  "madhya-pradesh": 0.88,
  rajasthan: 0.9,
  "himachal-pradesh": 0.88,
  assam: 0.9,
  "uttar-pradesh": 0.94,
  punjab: 0.93,
  uttarakhand: 0.92,
};

/**
 * Metro districts (matched on lower-cased name substring) absorb a larger
 * share of demand than the seeded baseline — big urban centres post more
 * vacancies relative to their training base.
 */
export const METRO_BOOST: Record<string, number> = {
  "bengaluru": 2.6, "bangalore": 2.6, "mumbai": 2.6, "chennai": 2.5,
  "hyderabad": 2.5, "new delhi": 2.4, "gautam buddh": 2.4, "ghaziabad": 2.3,
  "lucknow": 2.2, "pune": 2.2, "ahmedabad": 2.3, "surat": 2.1,
  "gurgaon": 2.3, "gurugram": 2.3, "faridabad": 2.1, "kolkata": 2.4,
  "jaipur": 2.0, "indore": 2.0, "bhopal": 1.9, "patna": 1.9,
  "ludhiana": 1.9, "coimbatore": 2.0, "kanpur": 1.9, "nagpur": 1.9,
  "thane": 2.0, "ernakulam": 1.9, "thiruvananthapuram": 1.8, "visakhapatnam": 1.9,
  "vijayawada": 1.8, "madurai": 1.8, "varanasi": 1.8, "prayagraj": 1.8,
  "allahabad": 1.8, "dehradun": 1.8, "srinagar": 1.7, "khordha": 1.9,
  "ranchi": 1.8, "raipur": 1.8, "kamrup": 1.8, "amritsar": 1.7,
  "mysore": 1.6, "mysuru": 1.6, "tiruchirappalli": 1.6,
};

/* ------------------------------------------------------------------ model */

export const MODEL = {
  /** Target training cycle the forecast feeds into. */
  cycle: "FY 2027–28",
  runDate: "2026-10-14",
  horizonMonths: 12,
  /** Demand-index weights (must sum to 1). */
  weights: { vacancy: 0.5, growth: 0.3, wage: 0.2 },
  /** Partial-adjustment rule: how fast seat targets chase the gap. */
  elasticity: 0.55,
  targetMin: 0.6,
  targetMax: 1.6,
  /** Severity bands on the demand–supply gap (% of projected demand). */
  bands: { acuteShortage: 35, shortage: 15, oversupply: -15, saturation: -35 },
  /** Average annual seats per ITI = 2,617,000 / 14,615. */
  seatsPerIti: 179,
  /** Seats realised as certified candidates (no-show / drop-out buffer). */
  fillRate: 0.87,
} as const;

/** Verified national reference figures surfaced in KPI cards and exports. */
export const NATIONAL_REFS = {
  itiCount: 14615,
  itiSeats: 2617000,
  itiCapacityLakh: 26.17,
  pmkvyCertified: 12900000,
  ncsJobseekers: 60200000,
  ncsEmployers: 5427000,
  ncsVacancies: 80000000,
  districts: 726,
  states: 36,
  sectors: SECTORS.length,
} as const;

export const SOURCES: {
  label: string;
  detail: string;
  url: string;
  role: string;
}[] = [
  {
    label: "PLFS Annual Report 2023–24 (MoSPI)",
    detail: "State-level worker population ratio & unemployment rate, usual status 15+",
    url: "https://www.mospi.gov.in/sites/default/files/publication_reports/AnnualReport_PLFS2023-24L2.pdf",
    role: "Labour-force base: participation, unemployment, workforce scale",
  },
  {
    label: "National Career Service (NCS) — PIB, Dec 2025",
    detail: "6.02 crore jobseekers · 54.27 lakh employers · 8 crore vacancies mobilised",
    url: "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2198745&reg=3&lang=1",
    role: "Vacancy momentum feeding the demand index",
  },
  {
    label: "MSDE / DGET — ITI capacity (PIB, Jul 2025 & Annual Report 2024–25)",
    detail: "14,615 ITIs (3,316 govt + 11,299 private) · 26.17 lakh annual seat capacity",
    url: "https://www.pib.gov.in/PressReleseDetailm.aspx?PRID=2150231",
    role: "Supply base: existing training capacity by state",
  },
  {
    label: "National Qualification Register (NQR) & SSC QP listings",
    detail: "ESSCI, ASDC, HSSC, RASCI, CSDC qualification packs & NSQF levels",
    url: "https://www.nqr.gov.in/",
    role: "NSQF/QP coding of trades; QP→NCO crosswalk (pending NCVET sign-off)",
  },
  {
    label: "NCVET — Mapping of Qualifications with NCO Codes",
    detail: "QP ↔ NCO-2015 crosswalk reference for the export schema",
    url: "https://ncvet.gov.in/",
    role: "Occupation-code crosswalk reference (v1 ships as indicative metadata)",
  },
  {
    label: "PMKVY / NSDC training outcomes (Jul 2025)",
    detail: "1.29 crore certified under PMKVY over the past decade",
    url: "https://ddindia.co.in/2025/07/over-3-3-crore-candidates-trained-under-nsdc-and-pmkvy-schemes-in-10-years-govt/",
    role: "Short-term training channel added to the supply base",
  },
];

/** Districts whose slug/name must be listed for drilldown labels. */
export const CYCLE_LABEL = MODEL.cycle;
