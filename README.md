# 🩺 mediCare — Smart Healthcare Management Platform

**mediCare** is a full-stack healthcare management application designed to bring common patient and doctor workflows into a single platform. The project provides separate patient and doctor experiences, authentication, medical-document management, medicine reminders, doctor discovery, appointment booking, emergency contacts, and basic first-aid guidance.

> **Project type:** Full-stack web application  
> **Backend:** Node.js  
> **Frontend:** HTML, CSS, JavaScript  
> **Database:** SQLite / better-sqlite3  
> **Authentication:** Token-based authentication with JWT support  
> **File uploads:** Multer  
> **Development server:** Nodemon

---

## 📌 Overview

mediCare is intended to make healthcare information and basic healthcare workflows easier to manage digitally.

A patient can:

- Create an account and log in.
- Maintain a personal health profile.
- Store medical documents such as prescriptions and lab reports.
- Add medicine schedules and reminders.
- Search for doctors.
- Get specialist suggestions based on a described health issue.
- Book appointments with doctors.
- View appointment history and statuses.
- Save emergency contacts.
- Access an emergency page containing general first-aid guidance.
- Switch between light and dark themes.

A doctor can:

- Register and log in as a doctor.
- Maintain a professional profile.
- Specify specialization, experience, biography, phone number, and consultation fee.
- Upload a certificate for verification.
- View appointment information.
- Access patient information and documents when an appointment relationship exists.
- Update appointment status.

---

## ✨ Main Features

### 🔐 Authentication & Role Management

The application supports two user roles:

- **Patient**
- **Doctor**

The registration interface allows the user to select a role. Login redirects the user to the appropriate dashboard.

The project includes authentication middleware based on JWT and role-based authorization helpers:

- `authRequired`
- `roleRequired('patient')`
- `roleRequired('doctor')`

The frontend stores the session token and user information in browser `localStorage`.

### 👤 Patient Profile

Patients can manage:

- Phone number
- Date of birth
- Blood group
- Address
- Known diseases / medical conditions

The database stores this information in a dedicated `patient_profiles` table.

### 👨‍⚕️ Doctor Profiles

Doctor profiles support:

- Specialization
- Years of experience
- Professional biography
- Consultation fee
- Phone number
- Certificate upload
- Verification status

Doctors can upload a certificate through a multipart form using Multer. Uploading a new certificate resets the verification status to pending/unverified.

### 🔎 Doctor Search & Smart Suggestions

Patients can search doctors by:

- Name
- Specialization

The application also contains a rule-based specialist suggestion system.

For example:

| Patient Issue | Suggested Specialist |
|---|---|
| Fever | General Physician |
| Cold | General Physician |
| Cough | Pulmonologist |
| Heart / Chest | Cardiologist |
| Skin | Dermatologist |
| Bone / Fracture | Orthopedic |
| Child-related issue | Pediatrician |
| Kidney | Nephrologist |
| Tooth | Dentist |
| Eye | Ophthalmologist |
| Mental health | Psychiatrist |
| Stomach | Gastroenterologist |
| Pregnancy | Gynecologist |

The suggestion system searches the patient's issue text for predefined keywords and then looks for doctors matching the resulting specialization.

### 📅 Appointment Management

Patients can request appointments with:

- Doctor
- Date
- Time
- Issue/description

Appointment statuses supported by the backend logic are:

- `pending`
- `confirmed`
- `completed`
- `cancelled`

Doctors can update the status of appointments assigned to them.

### 📁 Medical Documents

Patients can upload and manage medical documents.

Supported document categories in the frontend include:

- Prescription
- Taken Medicine Record
- Diagnosed Disease
- Lab Report
- Other

Each document can contain:

- Title
- Type
- Related disease
- Uploaded file
- Upload timestamp

Doctors can access a patient's documents when there is an appointment history between that doctor and patient.

### 💊 Medicine Management

Patients can create medicine schedules containing:

- Medicine name
- Dosage
- Schedule times
- Start date
- End date
- Optional source document

Schedule times are stored as JSON in the database and converted back into an array when returned by the API.

### 🚨 Emergency Support

The emergency section provides:

- A prominent emergency call action.
- Saved emergency contacts.
- One-click phone calling using `tel:` links.
- General first-aid guidance.

The frontend currently includes guidance for:

- Severe bleeding
- Burns
- Suspected fractures
- Choking
- Suspected heart attack
- Road accidents
- Unconsciousness / fainting

The emergency page explicitly states that its information is general awareness guidance and does not replace professional medical advice.

### 🌓 Dark Mode

The frontend includes a light/dark theme toggle.

The selected theme is persisted in `localStorage`, so it can be restored when the page is loaded again.

### 📱 Responsive UI

The CSS uses responsive layouts and switches the dashboard from a two-column layout to a single-column layout on smaller screens.

---

## 🏗️ Project Architecture

The project is organized around a simple frontend/backend structure:

```text
webDesktop_projects/
│
├── .env
├── package.json
├── server.js
├── db.js
├── auth.js
├── appointments.js
├── doctors.js
├── patients.js
├── documents.js
├── emergency.js
├── medicare.db
│
├── data/
│   └── users.json
│
└── front_end/
    ├── index.html
    ├── login.html
    ├── register.html
    ├── patient-dashboard.html
    ├── doctor-dashboard.html
    ├── emergency.html
    ├── api.js
    ├── auth.js
    ├── emergency.js
    └── style.css
```

### Backend Files

| File | Responsibility |
|---|---|
| `server.js` | Current HTTP server, environment loading, authentication endpoints, static file serving |
| `db.js` | SQLite database connection and schema creation |
| `auth.js` | JWT authentication and role authorization middleware |
| `appointments.js` | Appointment creation, listing, and status management |
| `doctors.js` | Doctor search, suggestions, profile management, and certificate upload |
| `patients.js` | Patient profile management and doctor access to patient profiles |
| `documents.js` | Medical-document and medicine management |
| `emergency.js` | Emergency-contact management |
| `.env` | Runtime configuration |

### Frontend Files

| File | Responsibility |
|---|---|
| `index.html` | Landing/home page |
| `login.html` | Login interface |
| `register.html` | Patient/doctor registration |
| `patient-dashboard.html` | Patient dashboard UI |
| `doctor-dashboard.html` | Doctor dashboard UI |
| `emergency.html` | Emergency support and first-aid page |
| `api.js` | Frontend API helper, authentication state, theme handling |
| `auth.js` | Login and registration client-side logic |
| `emergency.js` | Emergency-contact loading and accordion behavior |
| `style.css` | Global styling and responsive layout |

---

## 🗄️ Database Design

The intended SQLite database contains the following tables:

### `users`

Stores the core account information.

```text
id
name
email
password
role
phone
created_at
```

The `role` is restricted to:

```text
doctor
patient
```

### `doctor_profiles`

Stores doctor-specific information.

```text
user_id
specialization
experience
bio
certificate_path
verified
consultation_fee
```

### `patient_profiles`

Stores patient-specific health information.

```text
user_id
dob
blood_group
address
known_diseases
```

### `documents`

Stores patient medical records and uploaded files.

```text
id
patient_id
type
title
disease
file_path
uploaded_at
```

### `medicines`

Stores medicine schedules.

```text
id
patient_id
document_id
name
dosage
schedule_times
start_date
end_date
```

### `appointments`

Stores doctor-patient appointment requests.

```text
id
patient_id
doctor_id
appointment_date
appointment_time
issue
status
created_at
```

### `emergency_contacts`

Stores patient emergency contacts.

```text
id
patient_id
name
phone
relation
```

Foreign keys are enabled in the SQLite connection, and user deletion is configured to cascade to related profile and healthcare records where defined.

---

## 🔌 Backend API Design

The project contains route modules intended for an Express-style API.

### Authentication

```http
POST /api/register
POST /api/login
GET  /api/health
```

Registration accepts:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "01234567890",
  "password": "password",
  "role": "patient"
}
```

### Doctors

```http
GET  /doctors
GET  /doctors/suggest
GET  /doctors/profile
PUT  /doctors/profile
POST /doctors/certificate
```

### Patients

```http
GET /patients/profile
PUT /patients/profile
GET /patients/:id/profile
```

### Appointments

```http
POST /appointments
GET  /appointments/mine
PUT  /appointments/:id/status
```

### Documents & Medicines

```http
POST   /documents
GET    /documents/mine
GET    /documents/patient/:id
DELETE /documents/:id

POST   /documents/medicines
GET    /documents/medicines/mine
DELETE /documents/medicines/:id
```

### Emergency Contacts

```http
POST   /emergency-contacts
GET    /emergency-contacts/mine
DELETE /emergency-contacts/:id
```

> **Important implementation note:** The repository currently contains both a standalone Node.js HTTP server (`server.js`) and Express-based route modules. The route modules are not currently mounted by `server.js`, and the archive does not contain the `middleware/auth` path referenced by those route modules. Therefore, the API list above represents the implemented/intended route-module architecture, while the currently runnable `server.js` exposes the simpler registration/login/static-file flow.

---

## 🔄 Application Flow

### Patient Flow

```text
Register
   ↓
Login
   ↓
Patient Dashboard
   ├── Profile
   ├── Medical Documents
   ├── Medicine Reminders
   ├── Find Doctor
   │      ↓
   │   Specialist Suggestion
   │      ↓
   │   Doctor Search
   │      ↓
   │   Appointment Booking
   ├── My Appointments
   └── Emergency Contacts
```

### Doctor Flow

```text
Register as Doctor
        ↓
Login
        ↓
Doctor Dashboard
        ├── Doctor Profile
        ├── Certificate Upload
        ├── Appointment Management
        └── Patient Information / Records
```

### Emergency Flow

```text
Emergency Page
    ├── Call emergency number
    ├── View emergency contacts
    └── Read basic first-aid guidance
```

---

## 🛠️ Technology Stack

### Frontend

- HTML5
- CSS3
- Vanilla JavaScript
- Browser `localStorage`
- Fetch API

### Backend

- Node.js
- Express
- Native Node.js HTTP server
- JSON-based request handling
- CORS

### Database

- SQLite
- `better-sqlite3`

### Authentication & Security Libraries

- `jsonwebtoken`
- `bcryptjs`
- `crypto`

### File Uploads

- `multer`

### Development

- `nodemon`
- `dotenv`

---

## ⚙️ Installation

### 1. Clone the project

```bash
git clone <your-repository-url>
cd webDesktop_projects
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create or update `.env`:

```env
PORT=3000
NODE_ENV=development
DB_FILE=./medicare.db
JWT_SECRET=your_secure_jwt_secret
```

For a real deployment, replace the example JWT secret with a long, random secret.

### 4. Start the application

Production-style start:

```bash
npm start
```

Development mode:

```bash
npm run dev
```

The current server starts at:

```text
http://localhost:3000
```

### 5. Open the application

Open:

```text
http://localhost:3000
```

The server serves the files from the `front_end` directory when that directory exists.

---

## 🔑 Current Authentication Implementation

There are two authentication implementations present in the project.

### Current `server.js` implementation

The active standalone server:

- Reads users from the file configured by `DB_FILE`.
- Hashes passwords with SHA-256.
- Creates a simple SHA-256 token from email and timestamp.
- Stores the token on the client.
- Provides `/api/register` and `/api/login`.

Because `.env` sets:

```env
DB_FILE=./medicare.db
```

the current server attempts to use `medicare.db` as a JSON file even though the project also contains a SQLite database layer in `db.js`.

### Intended Express implementation

The route modules use:

- `better-sqlite3`
- `jsonwebtoken`
- JWT verification middleware
- Role-based authorization
- SQLite tables defined in `db.js`

For a production-ready version, these two approaches should be unified so that authentication, database access, and API routing all use the same implementation.

---

## 📂 File Uploads

The project uses Multer for:

- Doctor certificate uploads
- Patient medical documents

Uploaded files are intended to be stored in:

```text
uploads/
```

with generated filenames such as:

```text
cert_<userId>_<timestamp>.<extension>
doc_<userId>_<timestamp>.<extension>
```

The `uploads/` directory should be created/configured appropriately before enabling the Express upload routes.

---

## 🔐 Security Considerations

This project is suitable as an educational/full-stack project foundation, but it should not be considered production-ready healthcare software without additional security work.

Before production deployment, consider:

- Use strong password hashing such as bcrypt/Argon2 consistently.
- Use JWT consistently instead of the current standalone hash token.
- Store secrets outside source control.
- Add token expiration and refresh handling.
- Validate and sanitize all user input.
- Add file type, size, and content validation for uploads.
- Restrict access to uploaded medical files.
- Add HTTPS.
- Configure CORS for trusted origins instead of `*`.
- Add rate limiting to authentication endpoints.
- Add audit logging for access to medical records.
- Add stronger authorization checks around patient records and documents.
- Encrypt sensitive data where appropriate.
- Add secure cookie/session strategies where appropriate.
- Do not expose `.env`, database files, or uploaded medical documents publicly.
- Add appropriate healthcare privacy/compliance controls before handling real patient data.

---

## ⚠️ Current Project Limitations

A review of the supplied source code shows several areas that should be completed before treating the application as a fully integrated production system:

1. **Backend architecture is currently split.**  
   `server.js` uses Node's native `http` module, while the feature modules use Express routers.

2. **The Express routers are not mounted by the current server.**  
   The feature route files therefore do not become active simply by running the current `server.js`.

3. **The route modules reference `../middleware/auth`, but the supplied project does not contain that middleware directory.**  
   The root `auth.js` contains similar middleware functions, but the import paths do not currently match.

4. **The current server and SQLite layer use different data models.**  
   `server.js` treats the configured `DB_FILE` as JSON, while `db.js` expects a SQLite database.

5. **The supplied `medicare.db` is not currently a valid SQLite database file.**  
   A fresh SQLite database should be initialized using the schema in `db.js`.

6. **The patient dashboard UI references functionality that is not currently connected to a patient JavaScript module.**  
   The HTML contains actions such as profile saving, document uploading, medicine management, doctor suggestions, appointment booking, and emergency-contact management, but the corresponding client-side implementation is not included in the supplied archive.

7. **The doctor dashboard is currently largely static.**  
   Its displayed appointment, patient, notification, and schedule data are hard-coded UI examples rather than dynamically loaded records.

8. **Some frontend script paths are inconsistent.**  
   For example, `register.html` references `Style.css`, while the supplied stylesheet is `style.css`.

9. **Certificate verification is represented in the database but there is no visible admin verification workflow.**

These limitations do not reduce the value of the project as a learning/demo application, but they are important when documenting its current state.

---

## 🚀 Recommended Next Steps

For the next development phase, the following changes would make the project much more robust:

### Backend

- Convert `server.js` to an Express application or mount all existing Express routers from a single Express server.
- Create a proper `middleware/auth.js`.
- Initialize SQLite automatically using `db.js`.
- Replace the JSON-based authentication flow with SQLite-backed authentication.
- Use bcrypt for password hashing.
- Use JWTs with expiration.
- Add centralized error handling.
- Add request validation.
- Add upload validation and secure file serving.

### Frontend

- Create a dedicated `patient.js` module for the patient dashboard.
- Create a dedicated `doctor.js` module for the doctor dashboard.
- Connect dashboard UI to the backend API.
- Add loading, success, and error states.
- Fix inconsistent script and stylesheet paths.
- Implement real appointment actions.
- Implement dynamic doctor and patient lists.
- Implement certificate verification status display.
- Add proper file/document viewing controls.

### Database

- Recreate `medicare.db` using the schema in `db.js`.
- Add indexes for frequently queried fields.
- Add stronger constraints for appointment dates/statuses.
- Consider normalized medicine schedules if the application grows.

### Production

- Add HTTPS.
- Add secure deployment configuration.
- Add monitoring and logging.
- Add backups.
- Add privacy/compliance policies appropriate for healthcare data.
- Perform security testing before using real patient information.

---

## 🧪 Example Development Commands

```bash
# Install dependencies
npm install

# Start server
npm start

# Start with automatic restart during development
npm run dev
```

Health check for the current server:

```http
GET http://localhost:3000/api/health
```

Expected response:

```json
{
  "status": "ok"
}
```

---

## 🎨 UI Design

The interface uses a clean healthcare-oriented visual style:

- Teal primary color palette
- White cards
- Rounded components
- Responsive dashboard layout
- Status tags for appointments
- Emergency accent styling
- Light/dark theme support
- Simple navigation and dashboard sidebar

The design is implemented without a frontend framework, keeping the project lightweight and easy to understand.

---

## 🎯 Project Goals

The main goals of mediCare are to:

1. Centralize basic healthcare information.
2. Make doctor discovery easier.
3. Simplify appointment management.
4. Help patients organize medical documents.
5. Provide medicine schedule management.
6. Provide quick access to emergency contacts.
7. Demonstrate role-based healthcare workflows.
8. Provide a practical full-stack web-development project using Node.js and SQLite.

---

## 📜 License

No explicit license file is included in the supplied project.

If this project will be published publicly, add an appropriate `LICENSE` file and update this section.

---

## 👨‍💻 Project Summary

**mediCare** is a healthcare management web application with a patient-focused dashboard, doctor-focused workflow, medical-record organization, appointment management, medicine scheduling, doctor recommendation logic, and emergency support.

The project currently combines a functional frontend design with backend/database modules that form the foundation for a larger integrated healthcare platform. The most important next step is to unify the current standalone server with the SQLite/Express route architecture so that all dashboard features operate through one consistent backend.
