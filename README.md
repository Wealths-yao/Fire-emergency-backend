# 🚒 Fire Alert & Dispatch System - API Documentation

This modular backend engine handles multi-role authentication, real-time fire disaster telemetry tracking, and dynamic routing coordination data streams.

---

## 🏗 System Architecture & Security Layer Overview

### Security Specifications Enforced
*   **Cryptographic Salting**: Passwords are multi-salted with `12` work factor iterations using `bcryptjs` before storage.
*   **Access Token Protocol**: Stateless authorization via signed `jsonwebtoken` (JWT) payload envelopes expiring automatically in 8 hours.
*   **NoSQL Injection Shielded**: Request inputs are recursively sanitized with `express-mongo-sanitize` to strip logical operator patterns (such as `$` and `.`).
*   **Payload Flooding Gate**: JSON message limits are locked at `10kb` maximum per request context to safeguard operational bandwidth.
*   **Brute-Force Rate Limiter**: Access tracks limit incoming requests from individual IP footprints to `100 requests per 15-minute window`.

### Authorization Role Model
The platform separates system permissions across three explicit roles:
1.  `user`: Public civilian. Has access to request submissions.
2.  `fire_team`: First responder dispatch crew. Handles operational routing and status management.
3.  `admin`: Command control room operator. Can audit all incoming events and track live platform activity.

---

## 🔐 1. Authentication Layer Endpoints

### 📝 Register New Account
Creates a unique profile on the system network database.

*   **Endpoint Pathways**: `POST /api/auth/register`
*   **Access Privilege**: Public
*   **Headers**: `Content-Type: application/json`

#### Request Payload Model
```json
{
  "email": "first.responder@firestation.gov",
  "password": "SecurePassword123!",
  "role": "fire_team"
}
```
*Note: Valid role choices are strictly constrained to `user`, `fire_team`, or `admin`. Defaults to `user` if omitted.*

#### Successful Response (`201 Created`)
```json
{
  "success": true,
  "message": "User context account created successfully.",
  "data": {
    "id": "660c13b5e4b2d354a8123456",
    "email": "first.responder@firestation.gov",
    "role": "fire_team"
  }
}
```

#### Error Response (`409 Conflict`)
```json
{
  "success": false,
  "error": "Conflict identity match: An account profile already coordinates with that email address placement."
}
```

---

### 🔑 Login / Authenticate Credentials
Verifies credential inputs and returns an access authorization ticket.

*   **Endpoint Pathways**: `POST /api/auth/login`
*   **Access Privilege**: Public
*   **Headers**: `Content-Type: application/json`

#### Request Payload Model
```json
{
  "email": "first.responder@firestation.gov",
  "password": "SecurePassword123!"
}
```

#### Successful Response (`200 OK`)
```json
{
  "success": true,
  "message": "Handshake signature validation success.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2MGMxM2I1ZSIsImVtYWlsIjoiZmlyZSIsInJvbGUiOiJmaXJlX3RlYW0ifQ...",
    "role": "fire_team",
    "email": "first.responder@firestation.gov"
  }
}
```

#### Error Response (`401 Unauthorized`)
```json
{
  "success": false,
  "error": "Authentication failed: Access entry configurations do not match our database records."
}
```

---

## 🚨 2. Emergency Incident Management Endpoints

All endpoints in this segment require a valid JWT passed within the HTTP authorization stream header.
*   **Header Format Rule**: `Authorization: Bearer <YOUR_JWT_TOKEN>`

### 🗺 Submit Emergency Dispatch Form
Allows a civilian profile to pin coordinates and describe an active emergency crisis.

*   **Endpoint Pathways**: `POST /api/incidents`
*   **Access Privilege**: `user`, `admin`
*   **Headers**: `Content-Type: application/json`, `Authorization: Bearer <TOKEN>`

#### Request Payload Model
```json
{
  "latitude": 6.5244,
  "longitude": 3.3792,
  "message": "Residential structural fire detected on the 3rd floor. Thick black smoke venting."
}
```

#### Successful Response (`201 Created`)
```json
{
  "success": true,
  "data": {
    "_id": "660c14f9e4b2d354a8987654",
    "reporterEmail": "civilian@gmail.com",
    "latitude": 6.5244,
    "longitude": 3.3792,
    "message": "Residential structural fire detected on the 3rd floor. Thick black smoke venting.",
    "status": "pending",
    "createdAt": "2026-08-02T07:54:12.115Z",
    "updatedAt": "2026-08-02T07:54:12.115Z",
    "__v": 0
  }
}
```
*Triggers Socket Signal: Emits a real-time tracking packet data block over event channel `NEW_INCIDENT_DISPATCH_ALERT` instantly across connected monitors.*

---

### 📋 Fetch Incident Tracking Logs
Retrieves the entire timeline log of incident entries sorted from newest to oldest.

*   **Endpoint Pathways**: `GET /api/incidents`
*   **Access Privilege**: `fire_team`, `admin`
*   **Headers**: `Authorization: Bearer <TOKEN>`

#### Successful Response (`200 OK`)
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "660c14f9e4b2d354a8987654",
      "reporterEmail": "civilian@gmail.com",
      "latitude": 6.5244,
      "longitude": 3.3792,
      "message": "Residential structural fire detected on the 3rd floor. Thick black smoke venting.",
      "status": "pending",
      "createdAt": "2026-08-02T07:54:12.115Z",
      "updatedAt": "2026-08-02T07:54:12.115Z"
    }
  ]
}
```

---

### 🔄 Update Incident Tracking Lifecycle
Changes the operational state of an emergency incident as dispatch crews deploy or resolve the threat.

*   **Endpoint Pathways**: `PATCH /api/incidents/:id`
*   **Access Privilege**: `fire_team`, `admin`
*   **Headers**: `Content-Type: application/json`, `Authorization: Bearer <TOKEN>`

#### Request Payload Model
```json
{
  "status": "dispatched"
}
```
*Note: Valid status transformations are explicitly limited to `pending`, `dispatched`, or `resolved`.*

#### Successful Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "_id": "660c14f9e4b2d354a8987654",
    "reporterEmail": "civilian@gmail.com",
    "latitude": 6.5244,
    "longitude": 3.3792,
    "message": "Residential structural fire detected on the 3rd floor. Thick black smoke venting.",
    "status": "dispatched",
    "createdAt": "2026-08-02T07:54:12.115Z",
    "updatedAt": "2026-08-02T08:02:44.201Z"
  }
}
```
*Triggers Socket Signal: Emits an update state payload structure out over channel event token `INCIDENT_STATUS_STATE_UPDATED` instantly.*

---

## 🔌 3. Real-Time Socket.io Stream Events

The communication server pushes operational telemetry metrics directly to frontend clients over WebSocket connections on port `5000`.

### 🛰 Outbound Server Events (Listen on Frontend)

#### 1. `NEW_INCIDENT_DISPATCH_ALERT`
Fires automatically whenever a civilian user transmits a new fire incident form.
*   **Target Audience**: Fire Teams and Admins for immediate map line-routing updates.
*   **Payload Format**: Complete updated `Incident` data object.

#### 2. `INCIDENT_STATUS_STATE_UPDATED`
Fires automatically whenever a responder crew or administrator modifies the crisis lifecycle state.
*   **Target Audience**: Admin tracking tables and active Fire Team dashboards to sync current team allocations.
*   **Payload Format**: Updated `Incident` data object containing altered status configuration keys.