# SmartRozgar
**AI-Enabled Labour Market Intelligence and Skill Demand Supply Forecasting Engine**[cite: 2]

Developed for the **Smart India Hackathon 2026** under the Software category[cite: 2]. SmartRozgar is designed to align India’s skilling efforts with active job demands by transforming scattered data into actionable intelligence[cite: 2].

**Prototype Link:** [smartrozgar.freebuff.app](https://smartrozgar.freebuff.app/)[cite: 2]

---

## 🚀 The Problem
India faces a critical mismatch between the skills possessed by trained workers and the specific skills required by industries[cite: 2]. Currently, job and training data come from scattered sources, making it difficult to identify regional skill shortages, predict future demands, and plan training effectively[cite: 2]. 

## 💡 Our Solution
SmartRozgar acts as a proactive intelligence engine that helps government planners and institutions decide where training and skill development programs are needed most[cite: 2]. 

The system operates on a 5-step pipeline[cite: 2]:
1. **Collect Data:** Ingests job vacancies, skill demand, and available training seat data[cite: 2].
2. **Clean Data:** Standardizes formats, handles missing values, and removes duplicate postings[cite: 2].
3. **Find Skill Gap:** Compares active job demand against available training seats to pinpoint exact shortages[cite: 2].
4. **Predict Future Demand:** Estimates which specific skills will be needed in the next 2 to 4 quarters[cite: 2].
5. **Display Result:** Visualizes skill shortages, state-wise rankings, and forecasts on an interactive dashboard with early-warning flags[cite: 2].

---

## ⭐ Why We Stand Out
Unlike traditional job portals or static data dashboards, SmartRozgar is built specifically for scalable, proactive government planning:
* **Zero-Cost Infrastructure:** Runs on a 100% free, open-source stack with no database server required, hosted on Streamlit Community Cloud[cite: 2].
* **Plug-and-Play Integration:** Provides FastAPI endpoints (like `/gaps`, `/forecast`, `/rankings`) designed to feed directly into existing MSDE and NCVET workflows rather than forcing users to adopt a completely new ecosystem[cite: 2].
* **Proactive, Not Reactive:** Shifts planning from reactive to proactive using AutoETS forecasting (2-4 quarters ahead) and early-warning flags[cite: 2].
* **Scalable File-Based Architecture:** Starts as a small pilot but scales nationwide simply by adding new data files, with no need to rebuild the backend[cite: 2].
* **Localized & Accessible:** Features district-level drill-downs and an English/Hindi language switcher to ensure accessibility for regional planners[cite: 2].

---

## 🛠️ Technical Methodology & Stack
The project is built utilizing Python 3.11[cite: 2].

* **Programming:** Python[cite: 2]
* **Data Processing & Storage:** Pandas, NumPy, DuckDB, Parquet[cite: 2]
* **Job Matching:** RapidFuzz, NCO Mapping[cite: 2]
* **Forecasting:** StatsForecast AutoETS[cite: 2]
* **API & Deployment:** FastAPI, Uvicorn, Streamlit Community Cloud[cite: 2]
* **Visualization:** Streamlit, Plotly[cite: 2]

*(Note: The current prototype utilizes PLFS data alongside a synthetic data generator, as NCS and e-Shram feeds are not publicly available)*[cite: 2].

---

## 📊 Impact & Viability

### Expected Outcomes
* **Bridged Skill Gaps:** Reduces the mismatch between trained workers and industry needs[cite: 2].
* **Efficient Resource Use:** Optimizes training seat allocation based on actual, forecasted demand, reducing financial wastage[cite: 2].
* **Policy Alignment:** Directly supports the *Skill India* initiative and NSQF course revisions[cite: 2].

---

## 👥 Project Details
* **Hackathon:** Smart India Hackathon (SIH) 2026[cite: 2]
* **Problem Statement ID:** SIH26246[cite: 2]
* **Team Name:** ChicGeeks[cite: 2]
* **Team ID:** 197342[cite: 2]
