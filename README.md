# SmartRozgar
**AI-Enabled Labour Market Intelligence and Skill Demand Supply Forecasting Engine**

Developed for the **Smart India Hackathon 2026** under the Software category. SmartRozgar is designed to align India’s skilling efforts with active job demands by transforming scattered data into actionable intelligence.

**Prototype Link:** [smartrozgar.freebuff.app](https://smartrozgar.freebuff.app/)

---

## 🚀 The Problem
India faces a critical mismatch between the skills possessed by trained workers and the specific skills required by industries. Currently, job and training data come from scattered sources, making it difficult to identify regional skill shortages, predict future demands, and plan training effectively. 

## 💡 Our Solution
SmartRozgar acts as a proactive intelligence engine that helps government planners and institutions decide where training and skill development programs are needed most. 

The system operates on a 5-step pipeline:
1. **Collect Data:** Ingests job vacancies, skill demand, and available training seat data.
2. **Clean Data:** Standardizes formats, handles missing values, and removes duplicate postings.
3. **Find Skill Gap:** Compares active job demand against available training seats to pinpoint exact shortages.
4. **Predict Future Demand:** Estimates which specific skills will be needed in the next 2 to 4 quarters.
5. **Display Result:** Visualizes skill shortages, state-wise rankings, and forecasts on an interactive dashboard with early-warning flags.

---

## ⭐ Why We Stand Out
Unlike traditional job portals or static data dashboards, SmartRozgar is built specifically for scalable, proactive government planning:
- **Zero-Cost Infrastructure:** Runs on a 100% free, open-source stack with no database server required, hosted on Streamlit Community Cloud.
- **Plug-and-Play Integration:** Provides FastAPI endpoints (like `/gaps`, `/forecast`, `/rankings`) designed to feed directly into existing MSDE and NCVET workflows rather than forcing users to adopt a completely new ecosystem.
- **Proactive, Not Reactive:** Shifts planning from reactive to proactive using AutoETS forecasting (2-4 quarters ahead) and early-warning flags.
- **Scalable File-Based Architecture:** Starts as a small pilot but scales nationwide simply by adding new data files, with no need to rebuild the backend.
- **Localized & Accessible:** Features district-level drill-downs and an English/Hindi language switcher to ensure accessibility for regional planners.

---

## 🛠️ Technical Methodology & Stack
The project is built utilizing Python 3.11.

- **Programming:** Python
- **Data Processing & Storage:** Pandas, NumPy, DuckDB, Parquet
- **Job Matching:** RapidFuzz, NCO Mapping
- **Forecasting:** StatsForecast AutoETS
- **API & Deployment:** FastAPI, Uvicorn, Streamlit Community Cloud
- **Visualization:** Streamlit, Plotly

*(Note: The current prototype utilizes PLFS data alongside a synthetic data generator, as NCS and e-Shram feeds are not publicly available).*

---

## 📊 Impact & Viability

### Expected Outcomes
- **Bridged Skill Gaps:** Reduces the mismatch between trained workers and industry needs.
- **Efficient Resource Use:** Optimizes training seat allocation based on actual, forecasted demand, reducing financial wastage.
- **Policy Alignment:** Directly supports the *Skill India* initiative and NSQF course revisions.

---

## 👥 Project Details
- **Hackathon:** Smart India Hackathon (SIH) 2026
- **Problem Statement ID:** SIH26246
- **Team Name:** ChicGeeks
- **Team ID:** 197342
