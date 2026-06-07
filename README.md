# CPU Scheduling Academy 🎓💻

Interactive Operational Simulation Engine and Learning Management System for CPU scheduling models. Re-architected from a legacy console-based Java POI spreadsheet application into a high-fidelity, reactive, fully offline desktop/mobile web experience.

---

## 🚀 Key Features

* **Multi-Algorithm Dynamic Simulator**: Full execution support for **First-Come, First-Served (FCFS)**, **Shortest Job First (SJF)**, **Shortest Remaining Time First (SRTF)**, **Round Robin (RR)**, and both preemptive/non-preemptive **Priority Scheduling**.
* **Animated Gantt Chart & Clock-by-Clock Playback Ticker**: Features a fluid SVG-based scheduler timeline with real-time process highlighting, play, pause, frame stepping, and customizable simulator clock cycle rates.
* **Granular trace & Queue Logs**: Visualizes exactly who is entering or exiting the activeReady Queue and provides step-by-step operating system trace instructions for students.
* **MathJax LaTeX Formulation Integration**: Native offline compatibility for mathematical turnaround time, waiting time, and smoothing formulas using inline LaTeX.
* **Pristine Microsoft Excel POI Spreadsheet Export**: Custom client-side XML spreadsheet generator that creates dual-sheet files matching the original Java output — Sheet 1 hosts statistics tables with red/green threshold cells; Sheet 2 builds physical cell timelines.
* **Direct Comparative Legacy Java Source Code Deck**: Dedicated tab lets learners copy, read, and download the exact original Java `CPUScheduler` source file to study Java Stream grouping versus web hooks.

---

## 🗂️ Project Structure

```txt
/
├── index.html                  # Main entry page, imports mathJax and fonts
├── package.json                # Project dependencies and script anchors
├── metadata.json               # Platform frame permissions and capabilities
├── tsconfig.json               # TypeScript path targets and resolution bounds
├── vite.config.ts              # Vite asset configuration
└── src/
    ├── App.tsx                 # Core layout manager, UTC clocks and tab decks
    ├── main.tsx                # Client renderer mount
    ├── index.css               # Global Tailwind CSS tokens and glassmorphism definitions
    ├── types.ts                # Strict models for processes and trace vectors
    ├── algorithms.ts           # Implementation of FCFS, SJF, SRTF, RR, Priority 
    ├── excelExporter.ts        # Client-side native Multi-Tab Excel Spreadsheet Generator
    ├── practiceData.ts         # Data models for mock OS quizzes and calculations
    ├── originalJavaSource.ts   # String buffer storage of CPUScheduler.java
    └── components/
        ├── SchedulerSimulator.tsx # Dashboard with tables, presets, trace and controls
        ├── GanttChart.tsx         # SVG Gantt chart and scanner head graphics
        ├── ConceptAcademy.tsx     # Deep-dive guides, Worked Examples, and expandable questions
        ├── PracticeModule.tsx     # interactive MCQ evaluation screen showing results
        └── JavaSourceViewer.tsx   # Legacy code comparison and direct file downloader
```

---

## 🧮 Theoretical Algorithms Core Reference

### 1. First-Come-First-Serve (FCFS)
Processes are allocated the Central Processing Unit chronologically:
* **Turnaround Formula**: $TAT = Completion\\;Time - Arrival\\;Time$
* **Waiting Formula**: $WT = Start\\;Time - Arrival\\;Time$

### 2. Shortest Job First (SJF)
Provably optimal strategy selecting the ready job with the shortest CPU burst:
* **Theorem**: $Avg\\;WT_{SJF} \le Avg\\;WT_{any\\;other}$

### 3. Shortest Remaining Time First (Preemptive SJF)
Preempts running tasks instantly if an incoming process holds a shorter remaining execute profile.

### 4. Round Robin (RR)
Cycles through a circular ready queue granting small slices called a time quantum:
* **Bound limit**: $Quantum \to \infty \implies RR \to FCFS$

---

## 💻 Manual Installation & Self-hosting

### Requirements
* **NodeJS** 18.x or higher
* **npm** 9.x or higher

### 1. Install dependencies
```bash
npm install
```

### 2. Compile and run dev server locally
```bash
npm run dev
```
The server boot registers live preview streams at `http://localhost:3000`.

### 3. Build for production deployment
```bash
npm run build
```
The built bundles are outputted to `/dist`, ready to be dropped into CDN buckets or hosted offline with simple HTTP local servers.

---

## ☕ Legacy Java Compliance

At any point, users can download the original Apache POI implementation `CPUScheduler.java` by choosing the **Java Source** view deck in the navigation dashboard. 

---

## 📝 Changelog

* `v1.2.0`: Migrated console Java code to full-fidelity web platform; Added modern dark glassmorphism layout with customizable presets, step traces, SVG playbacks, interactive LaTeX theory, self checks, and a multi-tab XML binary-free exporter.
