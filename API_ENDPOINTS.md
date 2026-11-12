# Docdoc Telemedicine API — Endpoints Reference

Complete reference of all implemented API endpoints, including requests, headers, query/path parameters, success responses, and error responses.

## Base URLs

- **Production:** `https://docdoc-plum.vercel.app`
- **Local Development:** `http://localhost:3000`

## Authentication

Protected endpoints require a JWT Bearer token in the `Authorization` header:

```http
Authorization: Bearer <access_token>
```

---

## Table of Contents

1. [System & Health](#1-system--health)
   - [Welcome / API Overview (`GET /`)](#11-welcome--api-overview)
   - [Health Check (`GET /health`, `GET /api/v1/health`)](#12-health-check)
2. [Authentication (`/api/v1/auth`)](#2-authentication)
   - [Register (`POST /api/v1/auth/register`)](#21-register)
   - [Login (`POST /api/v1/auth/login`)](#22-login)
   - [Forgot Password (`POST /api/v1/auth/forgot-password`)](#23-forgot-password)
   - [Get Current User (`GET /api/v1/auth/me`)](#24-get-current-user-protected)
3. [Specializations (`/api/v1/specializations`)](#3-specializations)
   - [List Specializations (`GET /api/v1/specializations`)](#31-list-specializations)
4. [Doctors (`/api/v1/doctors`)](#4-doctors)
   - [List Doctors (`GET /api/v1/doctors`)](#41-list-doctors)
   - [Get Recommended Doctors (`GET /api/v1/doctors/recommended`)](#42-get-recommended-doctors)
   - [Get Doctor By ID (`GET /api/v1/doctors/:id`)](#43-get-doctor-by-id)
5. [Global Error Responses](#5-global-error-responses)

---

## 1. System & Health

### 1.1 Welcome / API Overview

- **Method & Path:** `GET /`
- **Auth Required:** No

#### Response (`200 OK`)

```json
{
  "status": "success",
  "message": "Welcome to Docdoc Telemedicine API",
  "endpoints": {
    "health": "/api/v1/health",
    "doctors": "/api/v1/doctors",
    "recommended_doctors": "/api/v1/doctors/recommended",
    "specializations": "/api/v1/specializations",
    "auth": {
      "register": "POST /api/v1/auth/register",
      "login": "POST /api/v1/auth/login",
      "forgot_password": "POST /api/v1/auth/forgot-password",
      "profile": "GET /api/v1/auth/me"
    }
  }
}
```

---

### 1.2 Health Check

- **Method & Path:** `GET /health` or `GET /api/v1/health`
- **Auth Required:** No

#### Response (`200 OK`)

```json
{
  "status": "success",
  "message": "Docdoc API is running"
}
```

---

## 2. Authentication

### 2.1 Register

Creates a new user account and returns a JWT token.

- **Method & Path:** `POST /api/v1/auth/register`
- **Auth Required:** No
- **Headers:** `Content-Type: application/json`

#### Request Body

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | string | Yes | User's full name |
| `email` | string | Yes | Unique email address (normalized to lowercase) |
| `phone` | string | Yes | Unique phone number |
| `password` | string | Yes | User password |
| `password_confirmation` | string | Yes | Must match `password` |

```json
{
  "name": "Kareem Toson",
  "email": "kareem@example.com",
  "phone": "+201226211829",
  "password": "StrongPassword123!",
  "password_confirmation": "StrongPassword123!"
}
```

#### Responses

- **`201 Created`**

```json
{
  "status": "success",
  "message": "Account created successfully",
  "data": {
    "user": {
      "id": "e3b0c442-98fc-1c14-9afbf4c8996fb924",
      "name": "Kareem Toson",
      "email": "kareem@example.com",
      "phone_number": "+201226211829"
    },
    "token": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
      "token_type": "Bearer",
      "expires_in": 86400
    }
  }
}
```

- **`422 Unprocessable Entity`** (Missing fields)

```json
{
  "status": "error",
  "code": "VALIDATION_ERROR",
  "message": "Name, email, password, and phone are required"
}
```

- **`422 Unprocessable Entity`** (Password mismatch)

```json
{
  "status": "error",
  "code": "VALIDATION_ERROR",
  "message": "Passwords do not match",
  "errors": [
    {
      "field": "password_confirmation",
      "message": "Passwords do not match"
    }
  ]
}
```

- **`409 Conflict`** (Email or phone already exists)

```json
{
  "status": "error",
  "code": "RESOURCE_EXISTS",
  "message": "Email or phone number already in use",
  "errors": [
    {
      "field": "email",
      "message": "Email already in use"
    }
  ]
}
```

---

### 2.2 Login

Authenticates an existing active user and issues a JWT token.

- **Method & Path:** `POST /api/v1/auth/login`
- **Auth Required:** No
- **Headers:** `Content-Type: application/json`

#### Request Body

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `email` | string | Yes | Registered email address |
| `password` | string | Yes | Account password |
| `remember_me` | boolean | No | If `true`, token expires in 30 days (`2592000`s); otherwise 1 day (`86400`s) |

```json
{
  "email": "kareem@example.com",
  "password": "StrongPassword123!",
  "remember_me": false
}
```

#### Responses

- **`200 OK`**

```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "id": "e3b0c442-98fc-1c14-9afbf4c8996fb924",
      "name": "Kareem Toson",
      "email": "kareem@example.com",
      "phone_number": "+201226211829",
      "avatar_url": null
    },
    "token": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
      "token_type": "Bearer",
      "expires_in": 86400
    }
  }
}
```

- **`401 Unauthorized`** (Missing fields, user not found/inactive, or wrong password)

```json
{
  "status": "error",
  "code": "INVALID_CREDENTIALS",
  "message": "Invalid email or password"
}
```

---

### 2.3 Forgot Password

Initiates a password reset request (generates a SHA-256 hashed reset token valid for 15 minutes if the user exists and is active). Always returns `200 OK` when a valid email string is provided to prevent account enumeration.

- **Method & Path:** `POST /api/v1/auth/forgot-password`
- **Auth Required:** No
- **Headers:** `Content-Type: application/json`

#### Request Body

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `email` | string | Yes | Email address for password reset |

```json
{
  "email": "kareem@example.com"
}
```

#### Responses

- **`200 OK`**

```json
{
  "status": "success",
  "message": "If this email is registered in our system, a password reset link has been sent."
}
```

- **`422 Unprocessable Entity`** (Invalid or missing email)

```json
{
  "status": "error",
  "code": "VALIDATION_ERROR",
  "message": "A valid email address is required"
}
```

---

### 2.4 Get Current User (Protected)

Retrieves the authenticated user's profile.

- **Method & Path:** `GET /api/v1/auth/me`
- **Auth Required:** Yes (`Bearer <access_token>`)
- **Headers:**
  ```http
  Authorization: Bearer <access_token>
  ```

#### Request Body / Parameters

None.

#### Responses

- **`200 OK`**

```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "e3b0c442-98fc-1c14-9afbf4c8996fb924",
      "name": "Kareem Toson",
      "email": "kareem@example.com",
      "phone_number": "+201226211829",
      "avatar_url": null,
      "created_at": "2026-11-08T15:20:00.000Z"
    }
  }
}
```

- **`401 Unauthorized`** (Missing, invalid, or expired token)

```json
{
  "status": "error",
  "code": "UNAUTHORIZED",
  "message": "Access token missing or invalid"
}
```
*(Possible messages: `"Access token missing or invalid"`, `"Access token missing"`, `"Invalid or expired token"`, `"Authentication required"`)*

- **`404 Not Found`** (User no longer exists or is inactive)

```json
{
  "status": "error",
  "code": "NOT_FOUND",
  "message": "User profile not found"
}
```

---

## 3. Specializations

### 3.1 List Specializations

Retrieves medical specializations along with doctor counts.

- **Method & Path:** `GET /api/v1/specializations`
- **Auth Required:** No

#### Query Parameters

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `limit` | integer | `undefined` (all) | Maximum number of specializations to return |
| `sort` | string | `display_order:asc` | Format `<field>:<direction>`. Supported fields: `display_order`, `name`. Direction: `asc` or `desc` |

**Example:** `GET /api/v1/specializations?limit=8&sort=display_order:asc`

#### Responses

- **`200 OK`**

```json
{
  "status": "success",
  "data": {
    "specializations": [
      {
        "id": "9f8c7a6b-1234-4abc-8def-112233445566",
        "name": "Cardiology",
        "slug": "cardiology",
        "icon_url": "https://example.com/icons/cardiology.png",
        "description": "Heart and cardiovascular specialists",
        "display_order": 1,
        "doctor_count": 5,
        "created_at": "2026-11-08T14:00:00.000Z",
        "updated_at": "2026-11-08T14:00:00.000Z"
      }
    ]
  },
  "meta": {
    "total": 10
  }
}
```

- **`500 Internal Server Error`**

```json
{
  "status": "error",
  "code": "INTERNAL_SERVER_ERROR",
  "message": "Failed to retrieve specializations"
}
```

---

## 4. Doctors

### 4.1 List Doctors

Retrieves a paginated, searchable, filterable, and sortable list of doctors.

- **Method & Path:** `GET /api/v1/doctors`
- **Auth Required:** No

#### Query Parameters

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | integer | `1` | Page number (minimum `1`) |
| `limit` | integer | `10` | Items per page (`1` to `50`) |
| `search` | string | — | Case-insensitive partial match on doctor `name` or `hospital_name` |
| `specialization_id` | UUID string | — | Filter doctors by specialization ID |
| `sort_by` | string | `rating` | Sort field: `rating`, `review_count`, `name`, or `created_at` |
| `sort_order` | string | `desc` | Sort direction: `asc` or `desc` |

**Example:** `GET /api/v1/doctors?page=1&limit=10&search=Ahmed&sort_by=rating&sort_order=desc`

#### Responses

- **`200 OK`**

```json
{
  "status": "success",
  "data": {
    "doctors": [
      {
        "id": "a1b2c3d4-5678-4ef9-8123-456789abcdef",
        "name": "Dr. Randy Wigham",
        "hospital_name": "RSUD Gatot Subroto",
        "rating": 4.8,
        "review_count": 4279,
        "profile_image_url": "https://example.com/doctors/randy.jpg",
        "is_available": true,
        "specialization": {
          "id": "9f8c7a6b-1234-4abc-8def-112233445566",
          "name": "General",
          "slug": "general"
        }
      }
    ]
  },
  "meta": {
    "pagination": {
      "current_page": 1,
      "per_page": 10,
      "total_items": 24,
      "total_pages": 3,
      "has_next_page": true,
      "has_prev_page": false
    }
  }
}
```

- **`500 Internal Server Error`**

```json
{
  "status": "error",
  "code": "INTERNAL_SERVER_ERROR",
  "message": "Failed to retrieve doctors"
}
```

---

### 4.2 Get Recommended Doctors

Retrieves doctors flagged as `isRecommended: true`, ordered by `rating` descending, then `reviewCount` descending.

- **Method & Path:** `GET /api/v1/doctors/recommended`
- **Auth Required:** No

#### Query Parameters

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `limit` | integer | `5` | Maximum number of recommended doctors (minimum `1`) |

**Example:** `GET /api/v1/doctors/recommended?limit=5`

#### Responses

- **`200 OK`**

```json
{
  "status": "success",
  "data": {
    "recommended_doctors": [
      {
        "id": "a1b2c3d4-5678-4ef9-8123-456789abcdef",
        "name": "Dr. Randy Wigham",
        "hospital_name": "RSUD Gatot Subroto",
        "rating": 4.8,
        "review_count": 4279,
        "profile_image_url": "https://example.com/doctors/randy.jpg",
        "is_available": true,
        "specialization": {
          "id": "9f8c7a6b-1234-4abc-8def-112233445566",
          "name": "General",
          "slug": "general"
        }
      }
    ]
  }
}
```

- **`500 Internal Server Error`**

```json
{
  "status": "error",
  "code": "INTERNAL_SERVER_ERROR",
  "message": "Failed to retrieve recommended doctors"
}
```

---

### 4.3 Get Doctor By ID

Retrieves detailed information for a specific doctor, including `bio`, `consultation_fee`, and `specialization.icon_url`.

- **Method & Path:** `GET /api/v1/doctors/:id`
- **Auth Required:** No

#### Path Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID string | Yes | Unique doctor ID |

**Example:** `GET /api/v1/doctors/a1b2c3d4-5678-4ef9-8123-456789abcdef`

#### Responses

- **`200 OK`**

```json
{
  "status": "success",
  "data": {
    "doctor": {
      "id": "a1b2c3d4-5678-4ef9-8123-456789abcdef",
      "name": "Dr. Randy Wigham",
      "hospital_name": "RSUD Gatot Subroto",
      "rating": 4.8,
      "review_count": 4279,
      "profile_image_url": "https://example.com/doctors/randy.jpg",
      "bio": "Experienced general practitioner with over 10 years of clinical service.",
      "consultation_fee": 150.0,
      "is_available": true,
      "specialization": {
        "id": "9f8c7a6b-1234-4abc-8def-112233445566",
        "name": "General",
        "slug": "general",
        "icon_url": "https://example.com/icons/general.png"
      },
      "created_at": "2026-11-08T14:00:00.000Z"
    }
  }
}
```

- **`404 Not Found`**

```json
{
  "status": "error",
  "code": "NOT_FOUND",
  "message": "Doctor with ID a1b2c3d4-5678-4ef9-8123-456789abcdef not found"
}
```

- **`500 Internal Server Error`**

```json
{
  "status": "error",
  "code": "INTERNAL_SERVER_ERROR",
  "message": "Failed to retrieve doctor details"
}
```

---

## 5. Global Error Responses

### Undefined Route (`404 Not Found`)

```json
{
  "status": "error",
  "code": "NOT_FOUND",
  "message": "Route GET /unknown-path not found"
}
```

### Unhandled Server Error (`500 Internal Server Error`)

```json
{
  "status": "error",
  "code": "INTERNAL_SERVER_ERROR",
  "message": "An internal server error occurred"
}
```

