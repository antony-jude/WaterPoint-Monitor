<div align="center">

# 💧 Village Water Point Uptime Monitoring
### An Advanced IoT Platform for Panchayat-Led Water Infrastructure Management


[![Hardware](https://img.shields.io/badge/hardware-ESP32-00979D?logo=arduino&logoColor=white)](#)
[![Backend](https://img.shields.io/badge/backend-Node.js%20%2B%20Express-339933?logo=node.js&logoColor=white)](#)
[![Frontend](https://img.shields.io/badge/frontend-React.js-61DAFB?logo=react&logoColor=black)](#)
[![Database](https://img.shields.io/badge/database-SQLite-07405E?logo=sqlite&logoColor=white)](#)
[![Map](https://img.shields.io/badge/map-Leaflet.js-199900?logo=leaflet&logoColor=white)](#)
[![Deployment](https://img.shields.io/badge/deployment-Vercel-black?logo=vercel&logoColor=white)](#)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](#-license)

</div>

---

## 🚱 The Problem

Public water taps and hand pumps are the primary water source for millions of villagers — yet when one breaks down, there's no system to catch it. Failures go unreported for days, technicians are dispatched blind, and Panchayats have no visibility into the actual uptime of the infrastructure they're responsible for.

**There is no centralized, real-time way for a village administration to know which water points are working, which are failing, and where to send help next.**

## 💡 The Solution

**Village Water Point Uptime Monitoring** is a full-stack IoT platform that gives the Panchayat a single, real-time command center for every water point in the village. ESP32-based sensor nodes continuously watch flow and temperature at each tap or hand pump, an intelligent backend detects faults the moment they happen, and a live multilingual dashboard turns raw sensor data into actionable alerts, maintenance workflows, and uptime analytics.

> **Note on current build status:** The platform currently runs on a **backend-driven simulation engine** that artificially generates realistic sensor traffic (rather than live physical hardware), so the full fault-detection and dashboard pipeline can be demonstrated end-to-end. It is fully architected to be plugged into real ESP32 hardware in the field — the API contract, data processing pipeline, and dashboard already speak the exact JSON format a physical device would send.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🗺️ **Interactive Village Map** | Leaflet.js-driven spatial map showing the real-time status of every water point in the village |
| 📟 **Live Sensor Simulation Engine** | Backend engine generates sensor payloads every 5 seconds (configurable) to stress-test fault detection under load |
| 🧠 **Intelligent Fault Detection** | Real-time analysis of incoming payloads to catch zero flow, impossible sensor bounds, and sudden drops/spikes — each auto-assigned a priority level |
| 🔧 **Maintenance Management Hub** | Assign technicians, log repair costs, and keep a full history of every hardware intervention |
| 📈 **Detailed Point Analytics** | Drill-down view per water point: event timeline, uptime %, and historical flow charts |
| 📡 **ESP32 Live JSON Monitor** | A dedicated view for embedded engineers to watch raw sensor payloads arrive at the server in real time |
| 📤 **Dynamic Reporting** | Export system data as CSV or fully formatted PDF reports |
| 🛡️ **Admin Settings & Audit Logs** | Configurable fault thresholds plus an immutable audit trail for system integrity |
| 🌐 **Multilingual UI** | Fully internationalized — English, हिन्दी, தமிழ், తెలుగు, മലയാളം, ಕನ್ನಡ — for real village-level accessibility |

---

## 🏗️ System Architecture

<img width="1536" height="1024" alt="Design_Workflow" src="https://github.com/user-attachments/assets/4ac1e35a-48f1-4ed1-9522-5fae5f2fdb24" />



**Data flow in one line:**
`ESP32 reads flow/temp → filters & validates → classifies status → POSTs JSON over Wi-Fi → Express API stores & runs fault detection → SQLite persists readings/alerts/maintenance → React dashboard visualizes, maps, and reports in real time`

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Hardware / Firmware** | ESP32, flow sensor (potentiometer-based), optional temperature sensor |
| **Backend** | Node.js + Express (REST API) |
| **Database** | SQLite — 5 tables: `water_points`, `sensor_readings`, `alerts`, `maintenance_logs`, `users` |
| **Frontend** | React.js (Vite), Glassmorphism UI with micro-animations |
| **Mapping** | Leaflet.js for spatial visualization |
| **Reporting** | CSV / PDF export |
| **Deployment** | Vercel (serverless API + static frontend) |

---

## 📁 Project Structure

```
SIH 2026 Assessment/
│
├── DATASET/                  # Dataset files
├── DEMO VIDEO/               # Demonstration video
├── DESIGN/                   # UI/UX design files
├── HARDWARE SIMULATION/      # Hardware simulation scripts and files
├── PPT/                      # Presentation slides
├── SCRIPT/                   # Additional scripts
├── ScreenShots/               # UI screenshots
├── Source Code/
│   ├── backend/
│   │   ├── routes/
│   │   │   ├── readings.js       # CRUD + intelligent fault detection
│   │   │   ├── dashboard.js      # Dashboard aggregation API
│   │   │   ├── simulate.js       # Live simulation engine
│   │   │   ├── maintenance.js    # Maintenance logs API
│   │   │   ├── analytics.js      # Uptime & failure analytics
│   │   │   ├── settings.js       # Admin threshold config
│   │   │   ├── audit.js          # Immutable audit tracking
│   │   │   ├── waterpoints.js    # Master list of hardware nodes
│   │   │   └── alerts.js
│   │   ├── database.js           # SQLite schema (5 tables)
│   │   ├── server.js
│   │   ├── seed.js               # Seeds 20 nodes + 100 historical readings
│   │   └── package.json
│   │
│   └── frontend/
│       ├── src/
│       │   ├── components/       # Spinners, modals, maps
│       │   ├── pages/            # 11 distinct application views
│       │   ├── api.js
│       │   ├── App.jsx
│       │   ├── main.jsx
│       │   └── index.css         # Premium glassmorphism & micro-animations
│       └── package.json
│
├── api/                       # Serverless API endpoints
├── scripts/                   # Root-level scripts
├── package.json                # Root package configuration
├── vercel.json                 # Vercel deployment configuration
└── README.md
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd Source\ Code/backend
npm install

cd ../frontend
npm install
```

### 2. Initialize the Database
```bash
cd Source\ Code/backend
node seed.js
```
This seeds SQLite with 20 water point nodes and 100 historical readings so the dashboard has real data to visualize immediately.

### 3. Start the Services
```bash
# Terminal 1 — backend
cd Source\ Code/backend
npm run dev        # or: node server.js

# Terminal 2 — frontend
cd Source\ Code/frontend
npm run dev
```

The React dashboard will be available at **http://localhost:5173**.

---

## 📊 Screenshots

> Add your captured screenshots to the `ScreenShots/` directory and link them here:
- Dashboard View
- Live Activity Monitor
- Multilingual Interface

---

## 🎥 Demo Video
 
📹 **[Watch the working demo](https://drive.google.com/drive/folders/1CLqoX1UAGNYeIQC4wmn-nMWIzQqWwUFM?usp=sharing)**
 
> Shows the simulation engine generating live sensor traffic, the dashboard updating in real time, fault detection triggering alerts, and the maintenance workflow end to end.
 
---

## 🎯 Impact

- ⏱️ **Faster response** — Panchayats see failures the moment they happen, not days later
- 💧 **Higher uptime** — proactive maintenance instead of reactive complaint-chasing
- 🧑‍🔧 **Data-driven dispatch** — technicians go where the priority alerts say, not where the loudest complaint came from
- 🌐 **Genuine accessibility** — six-language support means the tool works for the people actually running it, not just English-speaking admins

---

## 🔭 Future Scope

- [ ] Connect the simulation engine to real ESP32 hardware in field deployments
- [ ] Solar-powered nodes for off-grid village locations
- [ ] SMS/offline-first alerts for low-connectivity areas
- [ ] Predictive maintenance using historical failure patterns
- [ ] Water quality sensors (TDS, turbidity, pH) alongside flow & temperature
- [ ] Citizen-facing app for direct issue reporting from the tap

---


## 📄 Project Reference

- **[Wokwi ESP32 Simulator](https://wokwi.com/)**: The free online tool used to simulate the hardware.
- **Project:** Village Water Point Uptime Monitoring (Advanced IoT Platform)
- **Repository:** [`antony-jude/WaterPoint-Monitor`](https://github.com/antony-jude/WaterPoint-Monitor)
- **Deployment:** Vercel

## 📜 License

This project is released under the [MIT License](LICENSE).

</div>

