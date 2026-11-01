# 🛡️ AI-Powered Campus Grievance Management System

A web platform that classifies student complaints, scores their urgency, records where on campus they happened, and tracks how long each one takes to resolve. Students and administrators each get their own portal.


## 📌 Project overview

The system takes in student grievances, sorts them by type and urgency, and gives administrators a single dashboard for working through them. Students can follow the status of their own complaints.

It is meant to fix problems common in manual grievance handling: complaints registered by hand, slow communication, no real prioritization, and little visibility into progress.

Main features:

- Hindi and English keyword classification.
- Rule-based urgency detection inspired by NLP techniques.
- Severity scoring from 1 to 10.
- A separate SOS queue for critical emergencies.
- Campus location and department routing.
- Estimated SLA (service level agreement) for each grievance.
- A live resolution stopwatch.
- A Student Portal and an Admin Command Center.
- Cross-tab synchronization of status updates.

---

## 🎯 Problem statement

Students often have trouble reporting and tracking campus issues such as:

- Fire and electrical safety emergencies.
- Security incidents, fights, and ragging.
- Hostel infrastructure and maintenance problems.
- Water supply and sanitation issues.
- Mess and food quality complaints.
- Examination and academic concerns.
- Library, laboratory, and IT problems.

Conventional complaint systems treat these alike even though their urgency differs enormously. A fire report should never wait in the same queue as a routine maintenance request.

This project is a central triage platform. It evaluates each reported incident, assigns a severity, flags emergencies, and gives administrators a structured workflow for resolving them.

---

## ✨ Features

### 🎓 Two portals

The Student Portal handles:

- Student identity verification.
- Grievance submission.
- Automatic linking of the enrollment ID to each complaint.
- Campus location and hostel details.
- Live status tracking.
- Estimated resolution SLA.
- A personal grievance history.

The Admin and Authority Command Center handles:

- A central incident dashboard.
- Monitoring of active and resolved grievances.
- Prioritization by severity.
- A dedicated SOS dashboard for emergencies.
- Filtering by category and search.
- Resolving complaints.
- Live synchronization with the Student Portal.

### 🧠 Bilingual incident classification

A rule-based classification engine reads the grievance category and description. It recognizes selected Hindi and English keywords to spot potential emergencies and set the urgency.

| Reported keyword | Classification |
|---|---|
| Fire / आग | Critical SOS |
| Smoke / धुआं | Critical SOS |
| Current shock / करंट | Critical SOS |
| Assault / मारपीट | High priority |
| Ragging / रैगिंग | High priority |
| Spoiled food / खराब खाना | Medium priority |
| Attendance shortage | Medium priority |

The engine works from predefined keyword dictionaries, category rules, and severity conditions.

### 🚨 Severity scoring (1 to 10)

Every submitted grievance gets a numerical priority score from predefined classification rules.

| Priority score | Severity level | Expected SLA |
|---|---|---|
| 10/10 | Critical SOS | 0 to 15 minutes |
| 8 to 9/10 | High | 1 to 2 hours |
| 5 to 6/10 | Medium | 3 to 6 hours |
| 3 to 4/10 | Standard | 12 to 24 hours |

Fire and safety complaints automatically get critical priority, and emergency keywords trigger a 10/10 score. Critical incidents appear in their own SOS section so administrators can find them immediately.

> These are system-generated priority estimates. They are not guaranteed response or resolution times.

### 📍 Campus location routing

The submission form captures where an incident happened so administrators can tell which part of the institution is responsible. It collects:

- Campus buildings and academic blocks.
- Hostel wings and room numbers.
- Floors and specific incident locations.
- Academic courses and class sections.
- Mess and canteen locations.

The form shows extra fields depending on the grievance category selected.

### ⏱️ SLA and resolution tracking

Each active grievance has a live resolution stopwatch. The platform:

- Timestamps every complaint when it is registered.
- Estimates the expected SLA.
- Calculates elapsed time live.
- Records the resolution timestamp.
- Calculates the total resolution time.
- Keeps status visible across portal views.

Students can follow their complaint's progress. Administrators can review pending incidents and update their status.

### 🔄 Cross-tab synchronization

The system combines browser `localStorage` events with the JavaScript `BroadcastChannel` API. When an administrator resolves a grievance in one tab, the Student Portal in another tab refreshes and shows the new status. This lets the two portals run as a synchronized demo without a dedicated real-time server.

### 📊 Administrative monitoring

The Authority Command Center gives an overview of grievance activity, including:

- Total registered grievances.
- Active SOS emergencies.
- High-priority incidents.
- Pending complaints.
- Resolved complaints.
- Category-specific records.
- An archive of resolved grievances.

The dashboard supports search, filtering, and sorting by severity.

---

## 🛠️ Technology stack

| Technology | Purpose |
|---|---|
| HTML5 | Application structure and interface |
| CSS3 | Responsive styling and visual design |
| JavaScript (ES6+) | Application logic and interaction |
| Vite | Development server and build tooling |
| LocalStorage API | Persistent browser-side data storage |
| SessionStorage API | Active session management |
| BroadcastChannel API | Cross-tab communication |
| DOM API | Dynamic rendering and interface updates |
| TypeScript / React | Additional scaffold and configured tooling |

The interface uses a Midnight Glow theme with glassmorphism-style panels and responsive layouts. Text is set in Plus Jakarta Sans, with JetBrains Mono for numbers. Status indicators and dashboard components update dynamically.

---

## 🏗️ System architecture

The application is a modular client-side app.

```text
                  ┌─────────────────────────┐
                  │       APPLICATION       │
                  │      LANDING PAGE       │
                  └────────────┬────────────┘
                               │
                     Role Selection
                               │
                ┌──────────────┴──────────────┐
                │                             │
        ┌───────▼────────┐           ┌────────▼─────────┐
        │ STUDENT PORTAL │           │ ADMIN PORTAL     │
        └───────┬────────┘           └────────┬─────────┘
                │                             │
        Grievance Submission          Incident Dashboard
                │                             │
                └──────────────┬──────────────┘
                               │
                   ┌───────────▼───────────┐
                   │  CLASSIFICATION ENGINE│
                   │  Bilingual Keywords   │
                   │  Severity Scoring     │
                   │  SLA Estimation       │
                   └───────────┬───────────┘
                               │
                   ┌───────────▼───────────┐
                   │   STORAGE MANAGEMENT  │
                   │                       │
                   │     LocalStorage      │
                   │     SessionStorage   │
                   └───────────┬───────────┘
                               │
                   ┌───────────▼───────────┐
                   │  CROSS-TAB SYNC       │
                   │  BroadcastChannel     │
                   │  Storage Events       │
                   └───────────┬───────────┘
                               │
                   ┌───────────▼───────────┐
                   │ STATUS & RESOLUTION   │
                   │ LIVE SLA MONITORING   │
                   └───────────────────────┘
```

---

## 📂 Project structure

```text
AI-grievance-management-system/
│
├── index.html              # Main application interface
├── style.css               # Complete application styling
├── app.js                  # Core application logic
│
├── src/
│   ├── App.tsx             # React scaffold
│   ├── main.tsx            # React entry point
│   └── index.css           # Tailwind CSS entry
│
├── package.json            # Dependencies and scripts
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
├── metadata.json           # Application metadata
├── .env.example            # Environment variable template
└── .gitignore              # Git ignore configuration
```

---

## ⚙️ Installation and setup

### Prerequisites

- Node.js (LTS version recommended).
- npm.
- Git.
- A modern web browser.
- Visual Studio Code (recommended).

### Steps

1. Clone the repository:

```bash
git clone <YOUR_REPOSITORY_URL>
```

2. Move into the project directory:

```bash
cd AI-grievance-management-system
```

3. Install dependencies:

```bash
npm install
```

4. Start the development server:

```bash
npm run dev
```

5. Open the app in your browser:

```text
http://localhost:3000
```

### Other commands

```bash
# Generate production build
npm run build

# Preview production build
npm run preview

# TypeScript validation
npm run lint
```

---

## 🧪 Demonstration and testing

The project ships with predefined demo grievances and a feature for inserting demo incidents. You can try these scenarios:

| Test scenario | Expected behaviour |
|---|---|
| Fire emergency | 10/10 Critical SOS |
| Electrical live wire | 10/10 Critical SOS |
| Fight or assault | High-priority classification |
| Mess food complaint | Medium-priority classification |
| Academic complaint | Medium-priority classification |
| Routine maintenance | Standard classification |
| Admin resolves complaint | Student status updates |
| Cross-tab testing | Grievance information synchronizes |

A suggested walkthrough:

1. Open the application.
2. Select the Student Portal.
3. Register a student account with the demo credentials or your own test details.
4. Submit a grievance with an incident description.
5. Check the generated severity score and expected SLA.
6. Open the Admin Command Center in another browser tab.
7. Find the grievance you just submitted.
8. Resolve it.
9. Go back to the Student Portal and check the updated status.

---

## 🔐 Data management and security

This version is a client-side academic prototype. Grievance records, account bindings, and session information live in browser storage, so:

- Data stays in the local browser, and clearing browser storage can erase saved records.
- Account verification is for demonstration only and is not production-grade authentication.
- Client-side data can be tampered with.
- There is no central database and no server-side authorization.

A real institutional deployment would need secure backend authentication, role-based access control, encrypted communication, database persistence, audit logs, and protected APIs.

---

## 🚀 Future enhancements

### 🤖 Advanced AI integration

- Replace the keyword rules with a production LLM or NLP classification service.
- Improve multilingual understanding.
- Analyze complaints in context.
- Explain each classification result.

### 🗄️ Backend and database

- A Node.js and Express backend.
- MongoDB or PostgreSQL for storage.
- Secure REST APIs.
- Centralized grievance management.

### 🚒 Emergency management

- Automatic notification of the responsible authorities.
- SMS, email, and push notifications.
- Escalation workflows.
- Configurable response deadlines.

### 🗺️ Campus routing

- Automatic assignment by department.
- GPS-based location support.
- Interactive campus maps.
- Recommendations for the responsible authority.

### 📈 Analytics

- Grievance trend analysis.
- Department-wise performance reports.
- SLA compliance monitoring.
- Resolution efficiency metrics.
- Historical grievance visualization.

### 🔒 Security

- Secure authentication.
- Role-based permissions.
- Encryption of sensitive information.
- Audit trails.
- Data privacy controls.

---

## 💡 What sets it apart

The project treats grievance handling as incident management, not just online complaint registration. Critical incidents are highlighted instead of sitting in a general queue. Hindi and English keywords make reporting easier for more students. Each complaint gets a priority score and a matching SLA estimate. Students and administrators can both see a grievance's status and elapsed time, and the two portals reflect the same updates across browser tabs.

---

## 🎓 Project information

| Attribute | Details |
|---|---|
| Project name | AI-Powered Campus Grievance Management System |
| Domain | Artificial Intelligence / Web Development |
| Project type | Academic software engineering project |
| Application type | Web-based management system |
| Primary users | Students, wardens, proctors, and administrators |
| Core focus | Grievance classification and resolution tracking |

---

## 👩‍💻 Contributors

Developed by: [Your Name / Team Name]

Institution: Amity University Jharkhand

Department: Computer Applications

Project domain: AI and full-stack web development

---

## 📜 License

The application source carries an Apache-2.0 SPDX license identifier. For repository-wide licensing, include the Apache License 2.0 text and make sure every third-party dependency keeps its own license.
