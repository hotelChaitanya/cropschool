# API Documentation

This document provides complete API documentation for CropSchool's backend services, including authentication, user management, game data, and progress tracking.

## 🚀 API Overview

**Base URL**: `http://localhost:3003/api` (development)  
**Production URL**: `https://cropschool.vercel.app/api`  
**Authentication**: JWT tokens via HTTP-only cookies  
**Content Type**: `application/json`

## 🔐 Authentication Endpoints

### Register User (Development)

```http
POST /api/auth/register-dev
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "username": "John Doe"
}
```

**Response (201 Created):**

```json
{
  "user": {
    "id": "60d5f9b8f8a4c2b4c8e1b2a1",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "parent",
    "level": 1,
    "points": 0,
    "streakDays": 0,
    "children": []
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

```json
// 400 Bad Request - Missing fields
{
  "error": "All fields are required"
}

// 400 Bad Request - User exists
{
  "error": "User already exists"
}

// 500 Internal Server Error
{
  "error": "Registration failed",
  "details": "Error message (development only)"
}
```

### Login User (Development)

```http
POST /api/auth/login-dev
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**

```json
{
  "user": {
    "id": "60d5f9b8f8a4c2b4c8e1b2a1",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "parent",
    "level": 1,
    "points": 0,
    "streakDays": 0,
    "children": []
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

```json
// 400 Bad Request - Missing fields
{
  "error": "Email and password are required"
}

// 401 Unauthorized - Invalid credentials
{
  "error": "Invalid credentials"
}
```

### Get Current User

```http
GET /api/auth/me
```

**Headers:**

```
Cookie: auth-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**

```json
{
  "id": "60d5f9b8f8a4c2b4c8e1b2a1",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "parent",
  "level": 1,
  "points": 0,
  "streakDays": 0,
  "children": [],
  "lastActive": "2025-08-17T10:30:00.000Z",
  "createdAt": "2025-08-01T08:00:00.000Z"
}
```

### Logout User

```http
POST /api/auth/logout
```

**Response (200 OK):**

```json
{
  "message": "Logged out successfully"
}
```

## 👥 User Management Endpoints

### Get User Profile

```http
GET /api/users/:id
```

**Response (200 OK):**

```json
{
  "id": "60d5f9b8f8a4c2b4c8e1b2a1",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "parent",
  "level": 5,
  "points": 1250,
  "streakDays": 7,
  "completedLessons": ["math-1", "math-2", "science-1"],
  "children": ["60d5f9b8f8a4c2b4c8e1b2a2"],
  "createdAt": "2025-08-01T08:00:00.000Z",
  "updatedAt": "2025-08-17T10:30:00.000Z"
}
```

### Update User Profile

```http
PUT /api/users/:id
```

**Request Body:**

```json
{
  "name": "John Smith",
  "level": 6,
  "points": 1300
}
```

**Response (200 OK):**

```json
{
  "id": "60d5f9b8f8a4c2b4c8e1b2a1",
  "email": "user@example.com",
  "name": "John Smith",
  "role": "parent",
  "level": 6,
  "points": 1300,
  "updatedAt": "2025-08-17T10:35:00.000Z"
}
```

### Get Children (Parent Only)

```http
GET /api/parent/children
```

**Response (200 OK):**

```json
{
  "children": [
    {
      "id": "60d5f9b8f8a4c2b4c8e1b2a2",
      "name": "Alice Doe",
      "email": "alice@example.com",
      "level": 3,
      "points": 750,
      "streakDays": 5,
      "lastActive": "2025-08-17T09:00:00.000Z",
      "progress": {
        "totalGamesPlayed": 15,
        "averageScore": 85,
        "completedLessons": 12
      }
    }
  ]
}
```

### Create Child Account

```http
POST /api/parent/children
```

**Request Body:**

```json
{
  "name": "Alice Doe",
  "email": "alice@example.com",
  "password": "childpass123"
}
```

**Response (201 Created):**

```json
{
  "child": {
    "id": "60d5f9b8f8a4c2b4c8e1b2a2",
    "name": "Alice Doe",
    "email": "alice@example.com",
    "role": "child",
    "parent": "60d5f9b8f8a4c2b4c8e1b2a1",
    "level": 1,
    "points": 0,
    "createdAt": "2025-08-17T10:40:00.000Z"
  }
}
```

## 🎮 Game Data Endpoints

### Get All Games

```http
GET /api/games
```

**Query Parameters:**

- `category` (optional): Filter by game category
- `difficulty` (optional): Filter by difficulty level
- `limit` (optional): Number of games to return
- `offset` (optional): Number of games to skip

**Response (200 OK):**

```json
{
  "games": [
    {
      "id": "math-addition-1",
      "title": "Basic Addition",
      "description": "Learn addition with numbers 1-10",
      "category": "math",
      "difficulty": "beginner",
      "estimatedTime": 600,
      "requiredLessons": [],
      "config": {
        "maxNumber": 10,
        "operationType": "addition",
        "timeLimit": 30
      },
      "thumbnail": "/images/games/math-addition.png",
      "isActive": true
    },
    {
      "id": "science-plants-1",
      "title": "Plant Parts",
      "description": "Identify different parts of plants",
      "category": "science",
      "difficulty": "beginner",
      "estimatedTime": 450,
      "requiredLessons": [],
      "config": {
        "plantTypes": ["flower", "tree", "vegetable"],
        "partTypes": ["root", "stem", "leaf", "flower"]
      },
      "thumbnail": "/images/games/plant-parts.png",
      "isActive": true
    }
  ],
  "total": 2,
  "hasMore": false
}
```

### Get Single Game

```http
GET /api/games/:gameId
```

**Response (200 OK):**

```json
{
  "id": "math-addition-1",
  "title": "Basic Addition",
  "description": "Learn addition with numbers 1-10",
  "category": "math",
  "difficulty": "beginner",
  "estimatedTime": 600,
  "instructions": [
    "Look at the numbers on the screen",
    "Add them together",
    "Click on the correct answer"
  ],
  "learningObjectives": [
    "Practice basic addition",
    "Improve number recognition",
    "Build math confidence"
  ],
  "config": {
    "maxNumber": 10,
    "operationType": "addition",
    "timeLimit": 30,
    "questionsPerSession": 10,
    "passingScore": 70
  },
  "assets": {
    "images": ["/images/numbers/1.png", "/images/numbers/2.png"],
    "sounds": ["/sounds/correct.mp3", "/sounds/incorrect.mp3"]
  },
  "requiredLessons": [],
  "nextGameId": "math-addition-2",
  "isActive": true,
  "createdAt": "2025-08-01T08:00:00.000Z",
  "updatedAt": "2025-08-15T12:00:00.000Z"
}
```

## 📊 Progress Tracking Endpoints

### Save Game Progress

```http
POST /api/progress
```

**Request Body:**

```json
{
  "gameId": "math-addition-1",
  "lessonId": "lesson-1",
  "score": 85,
  "completed": true,
  "timeSpent": 450,
  "gameData": {
    "questionsAnswered": 10,
    "correctAnswers": 8,
    "incorrectAnswers": 2,
    "hints": 1,
    "attempts": [
      {
        "question": "2 + 3",
        "userAnswer": 5,
        "correct": true,
        "timeSpent": 12
      }
    ]
  }
}
```

**Response (201 Created):**

```json
{
  "id": "60d5f9b8f8a4c2b4c8e1b2a3",
  "userId": "60d5f9b8f8a4c2b4c8e1b2a1",
  "gameId": "math-addition-1",
  "lessonId": "lesson-1",
  "score": 85,
  "completed": true,
  "timeSpent": 450,
  "pointsEarned": 100,
  "newAchievements": [
    {
      "id": "first-math-game",
      "title": "Math Beginner",
      "description": "Complete your first math game",
      "points": 50
    }
  ],
  "completedAt": "2025-08-17T10:45:00.000Z",
  "createdAt": "2025-08-17T10:45:00.000Z"
}
```

### Get User Progress

```http
GET /api/progress/user/:userId
```

**Query Parameters:**

- `gameId` (optional): Filter by specific game
- `completed` (optional): Filter by completion status
- `limit` (optional): Number of records to return
- `offset` (optional): Number of records to skip

**Response (200 OK):**

```json
{
  "progress": [
    {
      "id": "60d5f9b8f8a4c2b4c8e1b2a3",
      "gameId": "math-addition-1",
      "gameName": "Basic Addition",
      "lessonId": "lesson-1",
      "score": 85,
      "completed": true,
      "timeSpent": 450,
      "pointsEarned": 100,
      "completedAt": "2025-08-17T10:45:00.000Z"
    }
  ],
  "summary": {
    "totalGamesPlayed": 15,
    "totalGamesCompleted": 12,
    "averageScore": 78,
    "totalTimeSpent": 6750,
    "totalPointsEarned": 1250,
    "currentStreak": 7,
    "longestStreak": 10
  },
  "total": 15,
  "hasMore": false
}
```

### Get Progress by Game

```http
GET /api/progress/game/:gameId
```

**Response (200 OK):**

```json
{
  "gameId": "math-addition-1",
  "gameName": "Basic Addition",
  "userProgress": [
    {
      "userId": "60d5f9b8f8a4c2b4c8e1b2a1",
      "userName": "John Doe",
      "score": 85,
      "completed": true,
      "timeSpent": 450,
      "completedAt": "2025-08-17T10:45:00.000Z"
    }
  ],
  "statistics": {
    "totalPlays": 25,
    "averageScore": 76,
    "completionRate": 80,
    "averageTimeSpent": 420
  }
}
```

## 🏆 Achievement Endpoints

### Get User Achievements

```http
GET /api/achievements/user/:userId
```

**Response (200 OK):**

```json
{
  "achievements": [
    {
      "id": "60d5f9b8f8a4c2b4c8e1b2a4",
      "achievementId": "first-math-game",
      "title": "Math Beginner",
      "description": "Complete your first math game",
      "icon": "/icons/achievements/math-beginner.png",
      "points": 50,
      "category": "math",
      "rarity": "common",
      "earnedAt": "2025-08-17T10:45:00.000Z"
    },
    {
      "id": "60d5f9b8f8a4c2b4c8e1b2a5",
      "achievementId": "streak-7",
      "title": "Week Warrior",
      "description": "Play games for 7 days in a row",
      "icon": "/icons/achievements/streak-7.png",
      "points": 100,
      "category": "engagement",
      "rarity": "uncommon",
      "earnedAt": "2025-08-17T11:00:00.000Z"
    }
  ],
  "summary": {
    "totalAchievements": 2,
    "totalPoints": 150,
    "categoryCounts": {
      "math": 1,
      "engagement": 1
    },
    "rarityCounts": {
      "common": 1,
      "uncommon": 1
    }
  }
}
```

### Get All Available Achievements

```http
GET /api/achievements
```

**Response (200 OK):**

```json
{
  "achievements": [
    {
      "id": "first-math-game",
      "title": "Math Beginner",
      "description": "Complete your first math game",
      "icon": "/icons/achievements/math-beginner.png",
      "points": 50,
      "category": "math",
      "rarity": "common",
      "criteria": {
        "type": "game_completion",
        "gameCategory": "math",
        "count": 1
      },
      "isSecret": false
    }
  ]
}
```

## 📈 Analytics Endpoints

### Get Dashboard Stats

```http
GET /api/analytics/dashboard
```

**Query Parameters:**

- `userId` (required): User ID for personalized stats
- `period` (optional): Time period (7d, 30d, 90d, all)

**Response (200 OK):**

```json
{
  "user": {
    "level": 5,
    "points": 1250,
    "streakDays": 7,
    "totalGamesPlayed": 15,
    "totalTimeSpent": 6750
  },
  "recentActivity": [
    {
      "type": "game_completed",
      "gameId": "math-addition-1",
      "gameName": "Basic Addition",
      "score": 85,
      "timestamp": "2025-08-17T10:45:00.000Z"
    },
    {
      "type": "achievement_earned",
      "achievementId": "streak-7",
      "achievementName": "Week Warrior",
      "timestamp": "2025-08-17T11:00:00.000Z"
    }
  ],
  "weeklyProgress": [
    {
      "date": "2025-08-11",
      "gamesPlayed": 2,
      "timeSpent": 900,
      "pointsEarned": 150
    },
    {
      "date": "2025-08-12",
      "gamesPlayed": 3,
      "timeSpent": 1200,
      "pointsEarned": 200
    }
  ],
  "topCategories": [
    {
      "category": "math",
      "gamesPlayed": 8,
      "averageScore": 82,
      "timeSpent": 3600
    },
    {
      "category": "science",
      "gamesPlayed": 4,
      "averageScore": 75,
      "timeSpent": 1800
    }
  ]
}
```

## 🔧 Utility Endpoints

### Health Check

```http
GET /api/health
```

**Response (200 OK):**

```json
{
  "status": "healthy",
  "timestamp": "2025-08-17T12:00:00.000Z",
  "version": "1.0.0",
  "services": {
    "database": "connected",
    "authentication": "operational",
    "gameEngine": "loaded"
  },
  "uptime": 86400
}
```

### Get Application Info

```http
GET /api/info
```

**Response (200 OK):**

```json
{
  "name": "CropSchool API",
  "version": "1.0.0",
  "description": "Educational gaming platform API",
  "environment": "development",
  "features": {
    "authentication": true,
    "gameEngine": true,
    "progressTracking": true,
    "achievements": true,
    "analytics": true
  },
  "limits": {
    "maxRequestsPerMinute": 100,
    "maxFileUploadSize": "10MB",
    "maxGameSessionTime": 3600
  }
}
```

## 🚨 Error Handling

### Error Response Format

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional error details (development only)",
  "timestamp": "2025-08-17T12:00:00.000Z",
  "path": "/api/endpoint"
}
```

### Common Error Codes

| Status Code | Error Code            | Description                       |
| ----------- | --------------------- | --------------------------------- |
| 400         | `VALIDATION_ERROR`    | Invalid request data              |
| 401         | `UNAUTHORIZED`        | Missing or invalid authentication |
| 403         | `FORBIDDEN`           | Insufficient permissions          |
| 404         | `NOT_FOUND`           | Resource not found                |
| 409         | `CONFLICT`            | Resource already exists           |
| 429         | `RATE_LIMIT_EXCEEDED` | Too many requests                 |
| 500         | `INTERNAL_ERROR`      | Server error                      |
| 503         | `SERVICE_UNAVAILABLE` | Service temporarily unavailable   |

## 📝 Request/Response Examples

### Creating a Game Session

```http
POST /api/games/math-addition-1/session
```

**Request:**

```json
{
  "difficulty": "beginner",
  "timeLimit": 600,
  "questionCount": 10
}
```

**Response:**

```json
{
  "sessionId": "session_123456",
  "gameId": "math-addition-1",
  "config": {
    "difficulty": "beginner",
    "timeLimit": 600,
    "questionCount": 10,
    "maxNumber": 10
  },
  "questions": [
    {
      "id": "q1",
      "question": "2 + 3 = ?",
      "options": [4, 5, 6, 7],
      "type": "multiple_choice"
    }
  ],
  "startTime": "2025-08-17T12:00:00.000Z",
  "expiresAt": "2025-08-17T12:10:00.000Z"
}
```

### Submitting Game Answers

```http
POST /api/games/sessions/session_123456/submit
```

**Request:**

```json
{
  "answers": [
    {
      "questionId": "q1",
      "answer": 5,
      "timeSpent": 12
    }
  ],
  "completed": true
}
```

**Response:**

```json
{
  "sessionId": "session_123456",
  "score": 85,
  "correctAnswers": 8,
  "totalQuestions": 10,
  "timeSpent": 450,
  "pointsEarned": 100,
  "feedback": [
    {
      "questionId": "q1",
      "correct": true,
      "explanation": "2 + 3 = 5. Great job!"
    }
  ],
  "achievements": [],
  "nextRecommendation": "math-addition-2"
}
```

## 🔐 Authentication Requirements

### JWT Token Structure

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "userId": "60d5f9b8f8a4c2b4c8e1b2a1",
    "email": "user@example.com",
    "role": "parent",
    "iat": 1629543000,
    "exp": 1629629400,
    "iss": "cropschool",
    "aud": "cropschool-users"
  }
}
```

### Cookie Configuration

```
auth-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...;
HttpOnly;
Secure;
SameSite=Lax;
Max-Age=604800;
Path=/
```

## 📊 Rate Limiting

| Endpoint Category | Requests per Minute | Burst Limit |
| ----------------- | ------------------- | ----------- |
| Authentication    | 5                   | 10          |
| Game Sessions     | 30                  | 50          |
| Progress Tracking | 60                  | 100         |
| User Data         | 100                 | 150         |
| Analytics         | 20                  | 30          |

## 🔍 API Testing

### Using cURL

```bash
# Register new user
curl -X POST http://localhost:3003/api/auth/register-dev \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","username":"Test User"}'

# Login user
curl -X POST http://localhost:3003/api/auth/login-dev \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}' \
  -c cookies.txt

# Get user profile (with cookies)
curl -X GET http://localhost:3003/api/auth/me \
  -b cookies.txt
```

### Using JavaScript/Fetch

```javascript
// Register user
const registerResponse = await fetch('/api/auth/register-dev', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'test123',
    username: 'Test User',
  }),
});

const userData = await registerResponse.json();
console.log('User registered:', userData);

// Save game progress
const progressResponse = await fetch('/api/progress', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    gameId: 'math-addition-1',
    score: 85,
    completed: true,
    timeSpent: 450,
  }),
});

const progressData = await progressResponse.json();
console.log('Progress saved:', progressData);
```

---

**Last Updated**: August 17, 2025  
**API Version**: 1.0.0
