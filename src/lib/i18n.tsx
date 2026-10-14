/**
 * i18n for LMIS — English + हिंदी (state planning units).
 *
 * Flat string table so components can't drift into undefined keys (TS-checked
 * via `keyof`). Numbers reformat per locale (hi-IN / en-IN grouping, lakh).
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "en" | "hi";

const STRINGS = {
  /* ------------------------------------------------------------- brand/nav */
  "app.tagline": { en: "Labour Market Intelligence System", hi: "श्रम बाज़ार बुद्धिमत्ता प्रणाली" },
  "app.workspace": { en: "MSDE · sector planning workspace", hi: "एमएसडीई · क्षेत्र प्लानिंग वर्कस्पेस" },
  "nav.methodology": { en: "Methodology", hi: "पद्धति" },
  "nav.dashboard": { en: "Open dashboard", hi: "डैशबोर्ड खोलें" },
  "nav.signin": { en: "Sign in", hi: "साइन इन" },
  "nav.signout": { en: "Sign out", hi: "साइन आउट" },
  "nav.language": { en: "Language", hi: "भाषा" },

  /* ------------------------------------------------------------- landing */
  "landing.badge": {
    en: "MSDE · NCVET decision support — v1 pilot",
    hi: "एमएसडीई · एनसीवीईटी निर्णय सहायता — संस्करण 1 पायलट",
  },
  "landing.title1": { en: "Skill demand is moving.", hi: "कौशल की माँग बदल रही है।" },
  "landing.title2": { en: "Your training targets should too.", hi: "आपके लक्ष्य भी बदलें।" },
  "landing.sub": {
    en: "LMIS fuses PLFS and NCS labour signals with MSDE/DGET training capacity to forecast district-level demand–supply gaps, flag saturation and shortage early, and recommend next-cycle seat targets — before placement outcomes are reported.",
    hi: "एलएमआईएस पीएलएफएस व एनसीएस श्रम संकेतों को एमएसडीई/डीजीईटी प्रशिक्षण क्षमता के साथ जोड़कर ज़िला-स्तरीय माँग–आपूर्ति अंतर का पूर्वानुमान लगाता है, संतृप्ति व कमी के संकेत पहले देता है और प्लेसमेंट परिणाम आने से पहले अगले चक्र की सीट लक्ष्य सुझाता है।",
  },
  "landing.ctaOpen": { en: "Open the planning dashboard", hi: "प्लानिंग डैशबोर्ड खोलें" },
  "landing.ctaMethod": { en: "Read the methodology", hi: "पद्धति पढ़ें" },
  "stat.districts": { en: "districts mapped", hi: "ज़िले मानचित्रित" },
  "stat.states": { en: "states & UTs", hi: "राज्य व केंद्रशासित" },
  "stat.seats": { en: "annual seats tracked", hi: "वार्षिक सीटें ट्रैक" },
  "stat.cycle": { en: "target cycle", hi: "लक्ष्य चक्र" },
  "landing.trust": {
    en: "Anchored to public PLFS 2023–24, NCS and MSDE/DGET figures",
    hi: "सार्वजनिक पीएलएफएस 2023–24, एनसीएस व एमएसडीई/डीजीईटी आँकड़ों पर आधारित",
  },
  "features.eyebrow": { en: "What version 1 does", hi: "संस्करण 1 क्या करता है" },
  "features.title": { en: "One demand index. Three decisions.", hi: "एक माँग सूचकांक। तीन निर्णय।" },
  "f1.t": { en: "Synthesises fragmented signals", hi: "बिखरे संकेतों का संश्लेषण" },
  "f1.d": {
    en: "PLFS participation, NCS vacancy momentum and DGET seat capacity are normalised into one comparable demand index per state and NSQF sector.",
    hi: "पीएलएफएस सहभागिता, एनसीएस रिक्तियों की गति व डीजीईटी सीट क्षमता को प्रत्येक राज्य व एनएसक्यूएफ क्षेत्र हेतु एक तुलनीय माँग सूचकांक में मानकीकृत किया जाता है।",
  },
  "f2.t": { en: "Drills from nation to district", hi: "राष्ट्र से ज़िले तक ड्रिल-डाउन" },
  "f2.d": {
    en: "Click through the India map to any of 726 districts — every figure rolls up consistently from district to national.",
    hi: "भारत के नक्शे से 726 ज़िलों में से किसी पर भी क्लिक करें — हर आँकड़ा ज़िले से राष्ट्रीय स्तर तक सुसंगत रूप से जुड़ता है।",
  },
  "f3.t": { en: "Flags shortage and saturation", hi: "कमी व संतृप्ति के झंडे" },
  "f3.d": {
    en: "Five severity bands flag trades and geographies approaching saturation or acute shortage — updated each cycle, not once a year.",
    hi: "पाँच गंभीरता बैंड उन व्यापारों व क्षेत्रों को चिह्नित करते हैं जो संतृप्ति या तीव्र कमी की ओर बढ़ रहे हैं — वर्ष में एक बार नहीं, हर चक्र में अद्यतन।",
  },
  "f4.t": { en: "Ships targets, not charts", hi: "चार्ट नहीं, लक्ष्य" },
  "f4.d": {
    en: "Every view exports as CSV or a documented JSON payload, ready to feed scheme target-setting workflows.",
    hi: "हर दृश्य CSV या दस्तावेज़ीकृत JSON पेलोड में निर्यात — योजना लक्ष्य-निर्धारण प्रक्रिया में सीधे उपयोग हेतु तैयार।",
  },
  "how.eyebrow": { en: "Method in three moves", hi: "तीन चरणों में पद्धति" },
  "how.title": { en: "From raw postings to a seat target", hi: "कच्ची पोस्टिंग से सीट लक्ष्य तक" },
  "h1.t": { en: "Aggregate & normalise", hi: "एकत्रित व मानकीकृत" },
  "h1.d": {
    en: "Vacancy postings, participation rates and seat capacity are coded to NSQF sectors and normalised per 1,000 workers.",
    hi: "रिक्ति पोस्टिंग, सहभागिता दर व सीट क्षमता को एनएसक्यूएफ क्षेत्रों में कोड करके प्रति 1,000 श्रमिकों पर मानकीकृत किया जाता है।",
  },
  "h2.t": { en: "Cross-reference capacity", hi: "क्षमता का पारस्परिक संदर्भ" },
  "h2.d": {
    en: "Demand meets supply: the annual seat pool is matched against projected formal vacancies at state and district grain.",
    hi: "माँग का मिलन आपूर्ति से: वार्षिक सीट पूल की मिलान राज्य व ज़िला स्तर पर अनुमानित औपचारिक रिक्तियों से की जाती है।",
  },
  "h3.t": { en: "Forecast & rank", hi: "पूर्वानुमान व क्रमबद्धता" },
  "h3.d": {
    en: "A partial-adjustment rule converts every gap into a recommended next-cycle seat target, ranked by severity and volume.",
    hi: "आंशिक-समायोजन नियम हर अंतर को अनुशंसित अगले-चक्र सीट लक्ष्य में बदलता है, जिसे गंभीरता व मात्रा के आधार पर क्रमबद्ध किया जाता है।",
  },
  "pilot.eyebrow": { en: "Version 1 scope", hi: "संस्करण 1 का दायरा" },
  "pilot.title": { en: "Six sectors. Thirty-six states. One screen.", hi: "छह क्षेत्र। छत्तीस राज्य। एक स्क्रीन।" },
  "pilot.statesLabel": { en: "Pilot states", hi: "पायलट राज्य" },
  "pilot.sectorsLabel": { en: "Pilot sectors — NSQF / SSC coded", hi: "पायलट क्षेत्र — एनएसक्यूएफ / एसएससी कोडित" },
  "pilot.note": {
    en: "District drill-down live for all {n} districts",
    hi: "सभी {n} ज़िलों के लिए ड्रिल-डाउन सक्रिय",
  },
  "pilot.growth": { en: "Employment growth momentum", hi: "रोज़गार वृद्धि गति" },
  "cta.title": { en: "Set the next cycle with evidence, not hindsight.", hi: "अगला चक्र पछतावे से नहीं, प्रमाण से तय करें।" },
  "cta.sub": {
    en: "Sign in for forecasts, flags and exports covering the {cycle} training cycle.",
    hi: "{cycle} प्रशिक्षण चक्र के पूर्वानुमान, चेतावनियाँ व निर्यात के लिए साइन इन करें।",
  },
  "footer.note": {
    en: "Concept build for MSDE/NCVET planning. Figures are anchored to the cited public sources; district values are modelled disaggregations — see Methodology.",
    hi: "एमएसडीई/एनसीवीईटी प्लानिंग हेतु अवधारणा निर्माण। आँकड़े उद्धृत सार्वजनिक स्रोतों पर आधारित; ज़िला मान मॉडल-आधारित विभाजन हैं — पद्धति देखें।",
  },

  /* --------------------------------------------------------------- tabs */
  "dash.title": {
    en: "Next-cycle skill demand, district by district",
    hi: "अगले चक्र की कौशल माँग, ज़िला-दर-ज़िला",
  },
  "tab.map": { en: "Map & drill-down", hi: "नक्शा व ड्रिल-डाउन" },
  "tab.targets": { en: "Forecast targets", hi: "पूर्वानुमान लक्ष्य" },
  "tab.warnings": { en: "Early warnings", hi: "प्रारंभिक चेतावनियाँ" },
  "tab.method": { en: "Methodology & API", hi: "पद्धति व एपीआई" },

  /* --------------------------------------------------------------- kpis */
  "kpi.target": { en: "Next-cycle seat target", hi: "अगले चक्र का सीट लक्ष्य" },
  "kpi.targetHint": { en: "across 6 pilot sectors", hi: "छह पायलट क्षेत्रों में" },
  "kpi.gap": { en: "National gap", hi: "राष्ट्रीय अंतर" },
  "kpi.gapHint": { en: "projected demand vs supply", hi: "अनुमानित माँग बनाम आपूर्ति" },
  "kpi.flags": { en: "Districts flagged", hi: "चिह्नित ज़िले" },
  "kpi.flagsHint": { en: "of {n} districts", hi: "{n} में से" },
  "kpi.di": { en: "Demand index", hi: "माँग सूचकांक" },
  "kpi.diHint": { en: "composite, 0–100", hi: "समग्र, 0–100" },
  "kpi.delta": { en: "vs current capacity", hi: "वर्तमान क्षमता बनाम" },

  /* ---------------------------------------------------------------- map */
  "map.legend": { en: "Gap severity", hi: "अंतर गंभीरता" },
  "map.hint": { en: "Click a state to drill down to its districts", hi: "ज़िलों तक जाने के लिए राज्य पर क्लिक करें" },
  "map.hintDistrict": { en: "Click a district for trade-level detail", hi: "व्यापार-स्तरीय विवरण हेतु ज़िले पर क्लिक करें" },
  "map.back": { en: "All India", hi: "संपूर्ण भारत" },
  "map.pilot": { en: "Pilot", hi: "पायलट" },
  "map.districtCount": { en: "{n} districts", hi: "{n} ज़िले" },
  "map.selectPrompt": { en: "Select a state on the map", hi: "नक्शे पर राज्य चुनें" },
  "map.sectorFilter": { en: "Sector", hi: "क्षेत्र" },
  "map.boundaries": {
    en: "Census-based district boundaries · Albers projection",
    hi: "जनगणना-आधारित ज़िला सीमाएँ · अल्बर्स प्रक्षेपण",
  },
  "level.india": { en: "India", hi: "भारत" },
  "level.state": { en: "State", hi: "राज्य" },
  "level.district": { en: "District", hi: "ज़िला" },

  /* ---------------------------------------------------------- panel/list */
  "panel.di": { en: "Demand index", hi: "माँग सूचकांक" },
  "panel.projected": { en: "Projected annual demand", hi: "अनुमानित वार्षिक माँग" },
  "panel.supply": { en: "Certified output / year", hi: "प्रमाणित उत्पादन / वर्ष" },
  "panel.gap": { en: "Gap", hi: "अंतर" },
  "panel.recommended": { en: "Recommended seats", hi: "अनुशंसित सीटें" },
  "panel.delta": { en: "vs current", hi: "वर्तमान से" },
  "panel.trend": { en: "Trend", hi: "रुझान" },
  "panel.sectorMix": { en: "Sector split of the gap", hi: "अंतर में क्षेत्र विभाजन" },
  "panel.trades": { en: "Trade-level detail", hi: "व्यापार-स्तरीय विवरण" },
  "panel.rankTitle": { en: "Ranked geographies", hi: "क्रमबद्ध भौगोलिक क्षेत्र" },
  "panel.rankSub": { en: "Sorted by severity, then by demand volume", hi: "गंभीरता, फिर माँग मात्रा के आधार पर" },

  /* -------------------------------------------------------------- table */
  "th.geo": { en: "Geography", hi: "भौगोलिक क्षेत्र" },
  "th.di": { en: "Index", hi: "सूचकांक" },
  "th.demand": { en: "Projected demand", hi: "अनुमानित माँग" },
  "th.supply": { en: "Supply", hi: "आपूर्ति" },
  "th.gap": { en: "Gap", hi: "अंतर" },
  "th.severity": { en: "Severity", hi: "गंभीरता" },
  "th.target": { en: "Next-cycle target", hi: "अगले चक्र का लक्ष्य" },
  "th.delta": { en: "Δ", hi: "Δ" },
  "th.trade": { en: "Trade / job role", hi: "व्यापार / नौकरी भूमिका" },
  "th.qp": { en: "QP code", hi: "क्यूपी कोड" },
  "th.nsqf": { en: "NSQF", hi: "एनएसक्यूएफ" },
  "th.sector": { en: "Sector", hi: "क्षेत्र" },
  "th.state": { en: "State", hi: "राज्य" },
  "th.flag": { en: "Action", hi: "कार्रवाई" },

  /* ------------------------------------------------------------ severity */
  "sev.acute": { en: "Acute shortage", hi: "तीव्र कमी" },
  "sev.acute.desc": { en: "Raise targets in the next cycle", hi: "अगले चक्र में लक्ष्य बढ़ाएँ" },
  "sev.short": { en: "Shortage", hi: "कमी" },
  "sev.short.desc": { en: "Nudge targets upward", hi: "लक्ष्य थोड़ा बढ़ाएँ" },
  "sev.balanced": { en: "Balanced", hi: "संतुलित" },
  "sev.balanced.desc": { en: "Hold targets steady", hi: "लक्ष्य स्थिर रखें" },
  "sev.over": { en: "Oversupply", hi: "अधिक आपूर्ति" },
  "sev.over.desc": { en: "Cap fresh seats", hi: "नई सीटें सीमित करें" },
  "sev.sat": { en: "Saturation", hi: "संतृप्ति" },
  "sev.sat.desc": { en: "Freeze & redeploy seats", hi: "सीटें रोककर पुनर्वितरित करें" },
  "trend.widening": { en: "Widening", hi: "बढ़ रहा" },
  "trend.narrowing": { en: "Narrowing", hi: "घट रहा" },
  "trend.stable": { en: "Stable", hi: "स्थिर" },
  "flag.shortage": { en: "Raise targets", hi: "लक्ष्य बढ़ाएँ" },
  "flag.saturation": { en: "Freeze seats", hi: "सीटें रोकें" },
  "sector.all": { en: "All pilot sectors", hi: "सभी पायलट क्षेत्र" },
  "sector.allShort": { en: "All sectors", hi: "सभी क्षेत्र" },

  /* ------------------------------------------------------------ targets */
  "targets.title": { en: "Next-cycle seat targets", hi: "अगले चक्र की सीट लक्ष्य" },
  "targets.sub": {
    en: "{cycle} · partial-adjustment rule, elasticity {e}",
    hi: "{cycle} · आंशिक-समायोजन नियम, लोच {e}",
  },
  "targets.exportCsv": { en: "CSV", hi: "सीएसवी" },
  "targets.exportJson": { en: "JSON", hi: "जेसन" },
  "targets.apiNote": { en: "Same schema as GET /api/v1/forecast", hi: "GET /api/v1/forecast जैसी ही स्कीमा" },
  "targets.chartTitle": { en: "Current vs recommended seats, by sector", hi: "वर्तमान बनाम अनुशंसित सीटें, क्षेत्र अनुसार" },
  "targets.legendA": { en: "Current certified output", hi: "वर्तमान प्रमाणित उत्पादन" },
  "targets.legendB": { en: "Recommended", hi: "अनुशंसित" },
  "targets.note": {
    en: "Targets clamp between 60% and 160% of current seats so centres are never whipsawed.",
    hi: "लक्ष्य वर्तमान सीटों के 60% व 160% के बीच सीमित रहते हैं ताकि केंद्रों पर अचानक झटका न लगे।",
  },
  "targets.stateTable": { en: "State-level recommendations", hi: "राज्य-स्तरीय अनुशंसाएँ" },

  /* ------------------------------------------------------------ warnings */
  "warn.title": { en: "Early warnings", hi: "प्रारंभिक चेतावनियाँ" },
  "warn.sub": {
    en: "Flags raised at state, district and trade grain for the {cycle} cycle.",
    hi: "{cycle} चक्र हेतु राज्य, ज़िला व व्यापार स्तर पर उठाए गए झंडे।",
  },
  "warn.geoShort": { en: "Geographies in acute shortage", hi: "तीव्र कमी वाले क्षेत्र" },
  "warn.geoSat": { en: "Geographies at saturation", hi: "संतृप्ति वाले क्षेत्र" },
  "warn.tradeShort": { en: "Trades in acute shortage", hi: "तीव्र कमी वाले व्यापार" },
  "warn.tradeSat": { en: "Trades approaching saturation", hi: "संतृप्ति की ओर बढ़ते व्यापार" },
  "warn.none": { en: "No flags for this filter.", hi: "इस फ़िल्टर के लिए कोई झंडा नहीं।" },
  "warn.showing": { en: "Top {n} by severity × volume", hi: "गंभीरता × मात्रा से शीर्ष {n}" },
  "warn.open": { en: "Open on map", hi: "नक्शे पर खोलें" },

  /* -------------------------------------------------------- methodology */
  "method.title": { en: "Methodology", hi: "पद्धति" },
  "method.indexTitle": { en: "1 · The demand index", hi: "1 · माँग सूचकांक" },
  "method.indexBody": {
    en: "DI = 0.50·vacancyIntensity + 0.30·growthMomentum + 0.20·wageSignal. Each input is normalised 0–100 per state × NSQF sector from PLFS usual-status indicators and NCS vacancy momentum.",
    hi: "DI = 0.50·रिक्ति-तीव्रता + 0.30·वृद्धि-गति + 0.20·मज़दूरी-संकेत। प्रत्येक इनपुट पीएलएफएस सामान्य-स्थिति संकेतकों व एनसीएस रिक्ति गति से राज्य × एनएसक्यूएफ क्षेत्र पर 0–100 मानकीकृत होता है।",
  },
  "method.gapTitle": { en: "2 · Gap, bands and targets", hi: "2 · अंतर, बैंड व लक्ष्य" },
  "method.gapBody": {
    en: "gap% = (projected demand − certified output) / projected demand. Recommended seats = current supply × (1 + 0.55 · gap%), clamped to 60–160% of current seats and rounded for target files.",
    hi: "अंतर% = (अनुमानित माँग − प्रमाणित उत्पादन) / अनुमानित माँग। अनुशंसित सीटें = वर्तमान आपूर्ति × (1 + 0.55 · अंतर%), वर्तमान सीटों के 60–160% के बीच सीमाबद्ध व लक्ष्य फ़ाइल हेतु गोल।",
  },
  "method.bandsTitle": { en: "Severity bands", hi: "गंभीरता बैंड" },
  "method.dataTitle": { en: "3 · Data sources", hi: "3 · डेटा स्रोत" },
  "method.dataNote": {
    en: "Public sources only in v1. Verified headline figures are used as national anchors; state × sector cells are model inputs calibrated to them.",
    hi: "संस्करण 1 में केवल सार्वजनिक स्रोत। सत्यापित सुर्ख़ी आँकड़े राष्ट्रीय आधार के रूप में; राज्य × क्षेत्र कोशिकाएँ उन पर कैलिब्रेटेड मॉडल इनपुट हैं।",
  },
  "method.apiTitle": { en: "4 · API & exports", hi: "4 · एपीआई व निर्यात" },
  "method.apiBody": {
    en: "GET /api/v1/forecast?level={state|district}&sector={id} returns the payload below. The CSV and JSON downloads on the Targets tab share this schema.",
    hi: "GET /api/v1/forecast?level={state|district}&sector={id} नीचे दिया पेलोड लौटाता है। लक्ष्य टैब के CSV व JSON डाउनलोड इसी स्कीमा का पालन करते हैं।",
  },
  "method.limitsTitle": { en: "5 · Assumptions & v1 limits", hi: "5 · मान्यताएँ व संस्करण 1 सीमाएँ" },
  "method.l1": {
    en: "State indicators follow PLFS-style usual-status measures (15+). Where exact state × sector tables could not be reproduced from public files, values are labelled model inputs.",
    hi: "राज्य संकेतक पीएलएफएस-शैली सामान्य-स्थिति (15+) माप हैं। जहाँ सार्वजनिक फ़ाइलों से सटीक राज्य × क्षेत्र तालिकाएँ पुनर्निर्मित नहीं हो सकीं, वहाँ मान मॉडल इनपुट चिह्नित हैं।",
  },
  "method.l2": {
    en: "District figures are deterministic disaggregations of state aggregates (seeded, stable across sessions) — not district survey estimates.",
    hi: "ज़िला आँकड़े राज्य कुलों के निश्चित-नियम विभाजन हैं (सीडेड, सत्रों में स्थिर) — ज़िला सर्वेक्षण अनुमान नहीं।",
  },
  "method.l3": {
    en: "QP → NCO crosswalk ships as indicative metadata pending NCVET sign-off; confirm NSQF levels against the NQR before operational use.",
    hi: "QP → NCO क्रॉसवॉक संकेतक मेटाडेटा के रूप में, एनसीवीईटी स्वीकृति शेष; ऑपरेशनल उपयोग से पहले एनक्यूआर से एनएसक्यूएफ स्तर पुष्टि करें।",
  },
  "method.copy": { en: "Copy example", hi: "उदाहरण कॉपी करें" },
  "method.copied": { en: "Copied", hi: "कॉपी हुआ" },
  "method.example": { en: "Example response", hi: "उदाहरण प्रतिक्रिया" },

  /* ---------------------------------------------------------------- auth */
  "auth.title": { en: "Get started", hi: "शुरुआत करें" },
  "auth.desc": { en: "Enter your email to log in or sign up", hi: "लॉग इन या साइन अप हेतु अपना ईमेल दर्ज करें" },
  "auth.emailPlaceholder": { en: "name@example.com", hi: "name@example.com" },
  "auth.or": { en: "Or", hi: "अथवा" },
  "auth.guest": { en: "Continue as Guest", hi: "अतिथि के रूप में जारी रखें" },
  "auth.checkEmail": { en: "Check your email", hi: "अपना ईमेल जाँचें" },
  "auth.sentTo": { en: "We've sent a code to {email}", hi: "हमने {email} पर कोड भेजा है" },
  "auth.verify": { en: "Verify code", hi: "कोड सत्यापित करें" },
  "auth.verifying": { en: "Verifying…", hi: "सत्यापन हो रहा है…" },
  "auth.noCode": { en: "Didn't receive a code?", hi: "कोड नहीं मिला?" },
  "auth.tryAgain": { en: "Try again", hi: "पुनः प्रयास करें" },
  "auth.useDifferent": { en: "Use different email", hi: "भिन्न ईमेल उपयोग करें" },
  "auth.badCode": { en: "The verification code you entered is incorrect.", hi: "आपने जो सत्यापन कोड दर्ज किया वह ग़लत है।" },
  "auth.secured": { en: "Secured by", hi: "सुरक्षित" },

  /* -------------------------------------------------------------- header */
  "hdr.cycle": { en: "Target cycle", hi: "लक्ष्य चक्र" },
  "hdr.run": { en: "Model run", hi: "मॉडल रन" },
  "hdr.dataNote": { en: "PLFS · NCS · DGET anchored", hi: "पीएलएफएस · एनसीएस · डीजीईटी आधारित" },
} as const;

export type StringKey = keyof typeof STRINGS;

export interface I18nValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  /** Translate a table key, substituting {placeholders}. */
  t: (key: StringKey, params?: Record<string, string | number>) => string;
  /** Pick between two literal values by language. */
  loc: <T>(en: T, hi: T) => T;
  /** Localised number formatting. */
  fmt: (n: number) => string;
  lakh: (n: number) => string;
  pct: (n: number) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

const STORAGE_KEY = "lmis.lang";

function readInitialLang(): Lang {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "hi" || stored === "en") return stored;
  return "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readInitialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    window.localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);

  const value = useMemo<I18nValue>(() => {
    const locale = lang === "hi" ? "hi-IN" : "en-IN";
    const number = new Intl.NumberFormat(locale);
    return {
      lang,
      setLang,
      t(key, params) {
        const entry = STRINGS[key];
        let out: string = entry[lang] as string;
        if (params) {
          for (const [k, v] of Object.entries(params)) {
            out = out.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
          }
        }
        return out;
      },
      loc: (en, hi) => (lang === "hi" ? (hi as unknown as typeof en) : en),
      fmt: (n) => number.format(Math.round(n)),
      lakh: (n) => {
        if (Math.abs(n) >= 100_000) {
          const v = n / 100_000;
          const digits = Math.abs(v) >= 100 ? 1 : 2;
          const f =
            lang === "hi"
              ? new Intl.NumberFormat("hi-IN", { maximumFractionDigits: digits })
              : new Intl.NumberFormat("en-IN", { maximumFractionDigits: digits });
          return `${f.format(v)} ${lang === "hi" ? "लाख" : "lakh"}`;
        }
        return number.format(Math.round(n));
      },
      pct: (n) => `${n > 0 ? "+" : ""}${n.toFixed(1)}%`,
    };
  }, [lang, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}
