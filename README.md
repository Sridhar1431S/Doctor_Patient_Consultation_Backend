# Doctor–Patient Consultation Backend

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in your real DB credentials:
   ```bash
   cp .env.example .env
   ```
3. Generate the Prisma client and run the migration:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```
4. Start the server:
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:4000` by default.

## Database Schema

![alt text](<Screenshot 2026-07-14 160854.png>)

![alt text](<Screenshot 2026-07-14 160914.png>)

![alt text](<Screenshot 2026-07-14 160944.png>)

![alt text](<Screenshot 2026-07-14 161006.png>)
Tables: `User`, `DoctorProfile`, `Consultation`, `Message`. See `prisma/schema.prisma` for full field definitions and relations.

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /auth/register | No | Register as PATIENT or DOCTOR |
| POST | /auth/login | No | Returns JWT |
| GET | /profile | Yes | Current user's profile |
| GET | /doctors | Yes | List all doctors |
| GET | /doctors/:id | Yes | Single doctor |
| POST | /consultations | Yes (PATIENT) | Start a consultation |
| GET | /consultations | Yes | List your own consultations |
| GET | /consultations/:id | Yes | Single consultation (must be participant) |
| PATCH | /consultations/:id/status | Yes (assigned DOCTOR) | Change status |
| POST | /consultations/:id/messages | Yes (participant) | Send a message |
| GET | /consultations/:id/messages | Yes (participant) | List messages, chronological |

### Sample Requests & Responses

**POST /auth/register**
```json
// Request
{
  "name": "Dr. Rao",
  "email": "rao@test.com",
  "password": "pass123",
  "role": "DOCTOR",
  "specialization": "Cardiology",
  "experienceYears": 5
}

// Response (201)
{
  "user": {
    "id": 1,
    "name": "Dr. Rao",
    "email": "rao@test.com",
    "role": "DOCTOR",
    "createdAt": "2026-07-14T10:20:00.000Z",
    "doctorProfile": { "id": 1, "userId": 1, "specialization": "Cardiology", "experienceYears": 5 }
  }
}
```

**POST /auth/login**
```json
// Request
{ "email": "rao@test.com", "password": "pass123" }

// Response (200)
{ "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
```

**GET /profile**
```
Headers: Authorization: Bearer <token>

// Response (200)
{
  "user": {
    "id": 2,
    "name": "Sridhar",
    "email": "sridhar@test.com",
    "role": "PATIENT",
    "doctorProfile": null
  }
}
```

**GET /doctors**
```json
// Response (200)
{
  "doctors": [
    {
      "id": 1,
      "specialization": "Cardiology",
      "experienceYears": 5,
      "user": { "id": 1, "name": "Dr. Rao", "email": "rao@test.com" }
    }
  ]
}
```

**POST /consultations**
```json
// Request
{ "doctorId": 1 }

// Response (201)
{ "consultation": { "id": 1, "patientId": 2, "doctorId": 1, "status": "PENDING", "createdAt": "2026-07-14T10:22:00.000Z" } }
```

**PATCH /consultations/:id/status**
```json
// Request
{ "status": "ACTIVE" }

// Response (200)
{ "consultation": { "id": 1, "patientId": 2, "doctorId": 1, "status": "ACTIVE", "createdAt": "2026-07-14T10:22:00.000Z" } }
```

**POST /consultations/:id/messages**
```json
// Request
{ "content": "Hello doctor, I have a headache." }

// Response (201)
{ "message": { "id": 1, "consultationId": 1, "senderId": 2, "content": "Hello doctor, I have a headache.", "createdAt": "2026-07-14T10:25:00.000Z" } }
```

**GET /consultations/:id/messages**
```json
// Response (200)
{
  "messages": [
    { "id": 1, "senderId": 2, "content": "Hello doctor, I have a headache.", "createdAt": "2026-07-14T10:25:00.000Z", "sender": { "id": 2, "name": "Sridhar", "role": "PATIENT" } },
    { "id": 2, "senderId": 1, "content": "How long have you had it?", "createdAt": "2026-07-14T10:26:00.000Z", "sender": { "id": 1, "name": "Dr. Rao", "role": "DOCTOR" } }
  ]
}
```

### Error Response Examples

```json
// 400 - Invalid state change
{ "error": "Messages can only be sent in an active consultation" }

// 401 - No token
{ "error": "No token provided" }

// 403 - Wrong role/not a participant
{ "error": "Only the assigned doctor can change consultation status" }

// 404 - Not found
{ "error": "Consultation not found" }

// 409 - Duplicate email
{ "error": "Email is already registered" }
```

## Assumptions
- `GET /consultations` supports `?page=` and `?limit=` query params (default page=1, limit=10, max limit=50) and returns a `pagination` object alongside `consultations`.

- Doctor-specific fields (`specialization`, `experienceYears`) are supplied at registration time in the same request.
- Status transitions are enforced strictly in order: PENDING → ACTIVE → COMPLETED, no skipping.
- `GET /doctors` requires authentication but not a specific role.
- Messages can only be sent while a consultation is ACTIVE.
- Login returns a generic "Invalid credentials" for both wrong email and wrong password (security practice, not a bug).
