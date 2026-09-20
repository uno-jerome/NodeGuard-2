# NodeGuard: Digital Forensic Incident Management System

NodeGuard provides a structured reporting interface for citizens to lodge cyber incident reports with supporting evidence files, while giving forensic investigators an authenticated console to examine evidence, verify file integrity on disk via cryptographic checksums, and inspect Fixed chain-of-custody audit logs.

## System Capabilities

* **Citizen Intake & Tracking:** Public reporting form capturing incident category, platform, suspect identifiers, narrative, and evidence file attachments. Issues an incident tracking code (`CASE-YYYY-XXXXX`) for status inquiry.
* **Cryptographic Verification:** Ingested evidence files are hashed using streaming SHA-256 and MD5 in constant $O(1)$ memory. Analysts can execute on-demand re-hashing against disk contents to detect tampering.
* **Fixed/Unchangeable Custody Ledger:** Chain-of-custody events (ingestion, viewing, hash verification, timeline notes, status transitions) commit to an append-only log safeguarded by database-level mutation-rejection hooks.
* **Staff Console:** Role-based access control (`ADMIN` and `INVESTIGATOR`), case queue filtering, timeline notes, dossier review, and court-admissible custody exports.

## Architecture & Tech Stack

* **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons, Axios, React Router
* **Backend:** Node.js, Express.js (REST API)
* **Database:** MongoDB via Mongoose ODM
* **Core Utilities:** Native Node `crypto` streaming, Multer storage, Bcrypt.js, JSON Web Tokens

## Project Structure

```text
nodeguard/
├── backend/
│   ├── samples/             # Git-tracked sample files used by seed.js
│   ├── src/
│   │   ├── config/          # MongoDB connection
│   │   ├── controllers/     # Auth, Incident, and Evidence controllers
│   │   ├── middleware/      # JWT auth, role validation, Multer upload
│   │   ├── models/          # User, Incident, EvidenceFile, ChainOfCustodyLog
│   │   ├── routes/          # Express API route declarations
│   │   └── services/        # Forensic crypto hashing stream service
│   ├── uploads/             # Runtime evidence vault (git-ignored)
│   ├── seed.js              # Developer seed script - demo cases & sample files
│   └── server.js            # Express server entry point
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios client instance with interceptors
│   │   ├── components/      # Modular UI components (common, report, track, case)
│   │   ├── context/         # AuthContext state provider
│   │   ├── pages/           # PublicReport, TrackCase, Dashboard, CaseDetails, Login
│   │   ├── App.jsx          # Route configurations
│   │   └── main.jsx         # React application bootstrap
│   └── index.html
└── README.md
```

## Installation & Getting Started

### Prerequisites

* **Node.js**: v18.x or higher
* **npm**: v9.x or higher
* **MongoDB**: Community Edition v6.0+ or MongoDB in Docker
* **Git**

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/uno-jerome/NodeGuard.git
cd NodeGuard
```

---

### Step 2: Start MongoDB

Ensure your local MongoDB daemon is active before launching the project:

**Using Linux systemd:**

```bash
# Check status
sudo systemctl status mongod

# Start MongoDB service
sudo systemctl start mongod

sudo systemctl enable mongod
```

---

### Step 3: Install & Seed

From the **project root**, install all dependencies and fill the database:

```bash
# Install all tools
npm install

# Install backend and frontend dependencies
npm run install:all

# Configure backend environment variables
cp backend/.env.example backend/.env

# Seed database with demo accounts and sample cases
npm run seed
```

> `npm run seed` wipes and re-creates the database with two pre-built sample cases
> (including evidence files copied from `backend/samples/`) every time it is run.
> It is a **developer utility only** - never run it in production.

---

### Step 4: Run the Project

#### Option A - Both services at once (recommended)

From the **project root**, start the backend and frontend simultaneously in a single terminal:

```bash
npm run dev
```

#### Option B - Separate terminals

**Terminal 1 - Backend:**

```bash
cd backend && npm run dev    # http://localhost:5000
```

**Terminal 2 - Frontend:**

```bash
cd frontend && npm run dev   # http://localhost:5173
```

---

### Root-Level Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts backend `:5000` + frontend `:5173` simultaneously |
| `npm run seed` | Wipes and re-seeds the DB with demo accounts and sample cases |
| `npm run install:all` | Installs dependencies for both `backend/` and `frontend/` |

---

## Application Access & Test Credentials

| Portal / Resource | URL | Description |
| :--- | :--- | :--- |
| **Public Portal** | [http://localhost:5173](http://localhost:5173) | Lodge incident reports & submit evidence files |
| **Track Incident** | [http://localhost:5173/track](http://localhost:5173/track) | Track status using case ID (e.g. `CASE-2026-00001`) |
| **Staff Login** | [http://localhost:5173/login](http://localhost:5173/login) | Authenticated console for analysts & admins |
| **Backend API** | [http://localhost:5000](http://localhost:5000) | Express REST API |

### Default Staff Accounts

* **Administrator:**
  * Email: `admin@nodeguard.local`
  * Password: `Admin123!`
  * Permissions: System administration, all investigator capabilities, user management
* **Investigator:**
  * Email: `analyst@nodeguard.local`
  * Password: `Analyst123!`
  * Permissions: Case management, file integrity verification, timeline log entries

### Sample Cases (seeded by `npm run seed`)

| Tracking ID | Title | Evidence File |
| :--- | :--- | :--- |
| `CASE-2026-00001` | Targeted Spear Phishing Campaign | `phishing_sample_payload.eml` |
| `CASE-2026-00002` | GCash Online Payment Scam | `gcash_payment_receipt.jpeg` - GCash receipt showing ₱100.00 transfer |

Evidence files can be **downloaded** or **integrity-verified** (SHA-256 re-hash) from the case dossier page in the staff console.
