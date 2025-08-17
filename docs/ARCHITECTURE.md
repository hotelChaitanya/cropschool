# System Architecture

This document provides a comprehensive overview of CropSchool's system architecture, including component relationships, data flow, and technical decisions.

## 🏗️ High-Level Architecture

```mermaid
graph TB
    subgraph "Client Tier"
        A[Web App<br/>Next.js]
        B[Mobile App<br/>React Native]
        C[Game Engine<br/>TypeScript Canvas]
    end

    subgraph "Application Tier"
        D[Next.js API Routes]
        E[Authentication Service]
        F[Game Logic Engine]
        G[Progress Tracking]
    end

    subgraph "Data Tier"
        H[MongoDB Atlas]
        I[File Storage]
        J[Cache Layer]
    end

    subgraph "External Services"
        K[Vercel Deployment]
        L[Expo Services]
        M[Monitoring Tools]
    end

    A --> D
    B --> D
    C --> F
    D --> E
    D --> G
    E --> H
    F --> H
    G --> H
    D --> I
    D --> J

    K --> A
    L --> B
    M --> D
```

## 📦 Monorepo Structure

```mermaid
graph TD
    A[cropschool/] --> B[packages/]
    A --> C[docs/]
    A --> D[.github/]
    A --> E[docker-compose.yml]

    B --> F[web/]
    B --> G[mobile/]
    B --> H[game-engine/]
    B --> I[ui/]
    B --> J[shared/]

    F --> F1[src/app/]
    F --> F2[src/components/]
    F --> F3[src/lib/]

    G --> G1[src/screens/]
    G --> G2[src/components/]
    G --> G3[assets/]

    H --> H1[src/core/]
    H --> H2[src/systems/]
    H --> H3[examples/]

    I --> I1[src/components/]
    I --> I2[src/tokens.ts]
    I --> I3[stories/]

    J --> J1[src/types/]
    J --> J2[src/utils/]
    J --> J3[src/constants/]
```

## 🔄 Data Flow Architecture

```mermaid
sequenceDiagram
    participant U as User
    participant W as Web App
    participant A as API Routes
    participant D as Database
    participant G as Game Engine

    U->>W: Login Request
    W->>A: POST /api/auth/login
    A->>D: Validate Credentials
    D->>A: User Data
    A->>W: JWT Token
    W->>U: Dashboard

    U->>W: Start Game
    W->>G: Initialize Game
    G->>A: GET /api/games/:id
    A->>D: Fetch Game Data
    D->>A: Game Configuration
    A->>G: Game Config
    G->>U: Render Game

    U->>G: Game Actions
    G->>A: POST /api/progress
    A->>D: Save Progress
    D->>A: Confirmation
    A->>G: Update Response
    G->>U: Feedback
```

## 🎯 Component Architecture

### Web Application (Next.js)

```mermaid
graph TB
    subgraph "Next.js App Router"
        A[app/]
        A --> B[layout.tsx]
        A --> C[page.tsx]
        A --> D[loading.tsx]
        A --> E[error.tsx]
        A --> F[not-found.tsx]
    end

    subgraph "API Routes"
        G[api/]
        G --> H[auth/]
        G --> I[games/]
        G --> J[progress/]
        G --> K[users/]
    end

    subgraph "Components"
        L[components/]
        L --> M[UI Components]
        L --> N[Layout Components]
        L --> O[Feature Components]
    end

    subgraph "Libraries"
        P[lib/]
        P --> Q[Auth Context]
        P --> R[Database]
        P --> S[Utils]
    end

    B --> L
    C --> L
    H --> R
    I --> R
    J --> R
    K --> R
```

### Game Engine Architecture

```mermaid
graph TB
    subgraph "Core Engine"
        A[GameEngine]
        A --> B[EntityManager]
        A --> C[SystemManager]
        A --> D[SceneManager]
        A --> E[InputManager]
    end

    subgraph "Rendering"
        F[CanvasRenderer]
        F --> G[AnimationManager]
        F --> H[AssetManager]
    end

    subgraph "Game Systems"
        I[PhysicsWorld]
        I --> J[CoreSystems]
        I --> K[FarmSystem]
        I --> L[InventorySystem]
    end

    subgraph "Managers"
        M[AchievementManager]
        M --> N[CropManager]
        M --> O[QuestManager]
    end

    A --> F
    A --> I
    A --> M
    C --> J
    C --> K
    C --> L
```

### Mobile App Architecture

```mermaid
graph TB
    subgraph "React Native App"
        A[App.tsx]
        A --> B[Navigation]
        A --> C[Screens]
        A --> D[Components]
    end

    subgraph "Navigation"
        B --> E[Stack Navigator]
        B --> F[Tab Navigator]
        B --> G[Drawer Navigator]
    end

    subgraph "Screens"
        C --> H[HomeScreen]
        C --> I[GameScreen]
        C --> J[ProfileScreen]
    end

    subgraph "Shared Services"
        K[API Client]
        K --> L[Auth Service]
        K --> M[Game Service]
        K --> N[Progress Service]
    end

    H --> K
    I --> K
    J --> K
```

## 🗄️ Database Architecture

```mermaid
erDiagram
    User ||--o{ Progress : tracks
    User ||--o{ Achievement : earns
    User ||--o{ Child : has
    Game ||--o{ Progress : generates
    Game ||--o{ Quest : contains
    Lesson ||--o{ Progress : measures

    User {
        ObjectId _id
        string email
        string password
        string name
        string role
        ObjectId[] children
        ObjectId parent
        number level
        number points
        number streakDays
        string[] completedLessons
        Date lastActive
        Date createdAt
        Date updatedAt
    }

    Progress {
        ObjectId _id
        ObjectId userId
        string gameId
        string lessonId
        number score
        boolean completed
        number timeSpent
        Object gameData
        Date completedAt
        Date createdAt
        Date updatedAt
    }

    Achievement {
        ObjectId _id
        ObjectId userId
        string achievementId
        string title
        string description
        string icon
        number points
        Date earnedAt
        Date createdAt
    }

    Game {
        string id
        string title
        string description
        string category
        string difficulty
        Object config
        string[] requiredLessons
        Date createdAt
        Date updatedAt
    }
```

## 🔐 Authentication Architecture

```mermaid
graph TB
    subgraph "Client"
        A[Login Form]
        A --> B[AuthContext]
        B --> C[JWT Token Storage]
    end

    subgraph "Server"
        D[API Route]
        D --> E[Input Validation]
        E --> F[Password Verification]
        F --> G[JWT Generation]
        G --> H[Cookie Setting]
    end

    subgraph "Database"
        I[User Collection]
        I --> J[Password Hash]
        I --> K[User Data]
    end

    subgraph "Security Layers"
        L[bcrypt Hashing]
        M[JWT Signing]
        N[HTTP-Only Cookies]
        O[CSRF Protection]
    end

    A --> D
    F --> I
    G --> M
    H --> N

    L --> J
    M --> C
```

## 🎮 Game Integration Architecture

```mermaid
graph TB
    subgraph "Game Lifecycle"
        A[Game Selection]
        A --> B[Game Loading]
        B --> C[Game Initialization]
        C --> D[Game Loop]
        D --> E[Progress Tracking]
        E --> F[Game Completion]
    end

    subgraph "Game Engine Integration"
        G[Web Component]
        G --> H[Canvas Element]
        H --> I[Game Engine Instance]
        I --> J[Render Loop]
        I --> K[Input Handling]
        I --> L[State Management]
    end

    subgraph "Progress System"
        M[Real-time Tracking]
        M --> N[Score Calculation]
        M --> O[Achievement Check]
        M --> P[Database Update]
    end

    A --> G
    D --> M
    E --> P
    F --> A
```

## 🔧 Development Architecture

### Build System

```mermaid
graph LR
    A[Source Code] --> B[TypeScript Compiler]
    B --> C[Next.js Bundler]
    C --> D[Optimization]
    D --> E[Static Assets]
    E --> F[Deployment]

    G[Tests] --> H[Jest Runner]
    H --> I[Coverage Report]

    J[Linting] --> K[ESLint]
    K --> L[Type Checking]
    L --> M[Quality Gate]
```

### CI/CD Pipeline

```mermaid
graph TB
    A[Code Push] --> B[GitHub Actions]
    B --> C[Install Dependencies]
    C --> D[Run Tests]
    D --> E[Type Check]
    E --> F[Lint Code]
    F --> G[Build Application]
    G --> H[Security Scan]
    H --> I[Deploy to Staging]
    I --> J[E2E Tests]
    J --> K[Deploy to Production]
    K --> L[Health Check]
```

## 📊 Performance Architecture

### Caching Strategy

```mermaid
graph TB
    subgraph "Client Caching"
        A[Browser Cache]
        B[Service Worker]
        C[Local Storage]
    end

    subgraph "Application Caching"
        D[Next.js Cache]
        E[API Response Cache]
        F[Static Asset Cache]
    end

    subgraph "Database Caching"
        G[MongoDB Cache]
        H[Connection Pool]
        I[Query Optimization]
    end

    A --> D
    B --> E
    C --> F
    D --> G
    E --> H
    F --> I
```

### Load Balancing

```mermaid
graph TB
    A[User Requests] --> B[Vercel Edge Network]
    B --> C[Load Balancer]
    C --> D[Server Instance 1]
    C --> E[Server Instance 2]
    C --> F[Server Instance 3]

    D --> G[MongoDB Atlas]
    E --> G
    F --> G

    G --> H[Primary Node]
    G --> I[Secondary Node]
    G --> J[Arbiter Node]
```

## 🔒 Security Architecture

```mermaid
graph TB
    subgraph "Input Validation"
        A[Client Validation]
        B[Server Validation]
        C[Database Validation]
    end

    subgraph "Authentication"
        D[JWT Tokens]
        E[Password Hashing]
        F[Session Management]
    end

    subgraph "Authorization"
        G[Role-based Access]
        H[Route Protection]
        I[API Guards]
    end

    subgraph "Data Protection"
        J[HTTPS Encryption]
        K[Database Encryption]
        L[Secrets Management]
    end

    A --> B
    B --> C
    D --> F
    E --> F
    F --> G
    G --> H
    H --> I
    J --> K
    K --> L
```

## 📱 Multi-Platform Architecture

```mermaid
graph TB
    subgraph "Shared Layer"
        A[Business Logic]
        B[API Client]
        C[Types & Interfaces]
        D[Utilities]
    end

    subgraph "Web Platform"
        E[Next.js App]
        E --> F[React Components]
        E --> G[Web-specific Features]
    end

    subgraph "Mobile Platform"
        H[React Native App]
        H --> I[Native Components]
        H --> J[Mobile-specific Features]
    end

    subgraph "Game Engine"
        K[Canvas Renderer]
        K --> L[Cross-platform Games]
    end

    A --> E
    A --> H
    B --> E
    B --> H
    C --> E
    C --> H
    D --> E
    D --> H

    E --> K
    H --> K
```

## 📈 Monitoring Architecture

```mermaid
graph TB
    subgraph "Application Monitoring"
        A[Error Tracking]
        B[Performance Metrics]
        C[User Analytics]
    end

    subgraph "Infrastructure Monitoring"
        D[Server Health]
        E[Database Metrics]
        F[Network Performance]
    end

    subgraph "Business Metrics"
        G[User Engagement]
        H[Learning Progress]
        I[Game Statistics]
    end

    subgraph "Alerting System"
        J[Real-time Alerts]
        K[Dashboard]
        L[Reporting]
    end

    A --> J
    B --> J
    C --> G
    D --> J
    E --> J
    F --> J
    G --> K
    H --> K
    I --> K
    J --> L
    K --> L
```

## 🚀 Deployment Architecture

```mermaid
graph TB
    subgraph "Development"
        A[Local Environment]
        B[Feature Branches]
        C[Pull Requests]
    end

    subgraph "Staging"
        D[Staging Environment]
        E[Integration Testing]
        F[QA Validation]
    end

    subgraph "Production"
        G[Production Environment]
        H[Blue-Green Deployment]
        I[Health Monitoring]
    end

    subgraph "CDN & Edge"
        J[Vercel Edge Network]
        K[Static Asset CDN]
        L[Global Distribution]
    end

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    G --> J
    J --> K
    K --> L
```

---

**Last Updated**: August 17, 2025
