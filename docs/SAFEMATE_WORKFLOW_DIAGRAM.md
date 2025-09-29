# SafeMate Workflow Diagram

## Complete User Journey: Landing Page to Wallet Creation

This document contains the visual workflow diagrams for the SafeMate application, showing the complete user journey from landing page to wallet creation with all supporting AWS services.

---

## 🎯 Main Workflow Diagram

```mermaid
flowchart TD
    %% Landing Page and Entry
    A[Landing Page<br/>safemate.com] --> B{User Action}
    B -->|"Get Started"| C[ModernLogin Component<br/>/app route]
    B -->|Learn More| D[FAQ Page]
    B -->|Navigation| E[Other Public Pages<br/>Personal/Family/Business/etc]
    
    %% Authentication Flow
    C --> F{Auth Mode}
    F -->|New User| G[Sign Up Form<br/>- Username/Email<br/>- Password<br/>- Account Type Selection]
    F -->|Existing User| H[Sign In Form<br/>- Username<br/>- Password]
    
    %% Sign Up Process
    G -->|Submit| I[AWS Cognito User Pool<br/>ap-southeast-2_uLgMRpWlw]
    I -->|User Created| J[Email Verification<br/>Confirmation Code]
    J -->|Code Verified| K[Account Confirmed]
    K -->|Auto Sign In| L[Post-Confirmation Trigger]
    
    %% Post-Confirmation Lambda
    L --> M[Post-Confirmation Lambda<br/>default-safemate-post-confirmation-wallet-creator]
    M -->|Async Invoke| N[User Onboarding Lambda<br/>default-safemate-user-onboarding]
    
    %% Sign In Process
    H -->|Valid Credentials| O[Authentication Success]
    O --> P{Wallet Check}
    P -->|Has Wallet| Q[Dashboard Access]
    P -->|No Wallet| R[OnboardingModal]
    
    %% Onboarding Modal Process
    R --> S[Wallet Creation Steps<br/>1. User Account Created<br/>2. Initializing Wallet<br/>3. Generating Keys<br/>4. Creating Hedera Account<br/>5. Completion]
    
    %% Wallet Creation Backend
    S --> N
    N --> T[Generate ED25519 Keypair<br/>Using @hashgraph/sdk]
    T --> U[Encrypt Private Key<br/>AWS KMS Key]
    U --> V[Create Account Alias<br/>Hedera Auto-Creation]
    V --> W[Store Wallet Data]
    
    %% DynamoDB Storage
    W --> X[DynamoDB Tables<br/>- default-safemate-wallet-keys<br/>- default-safemate-wallet-metadata]
    X --> Y[Wallet Created Successfully]
    Y --> Z[Initialize Hedera Context]
    Z --> AA[Redirect to Dashboard]
    
    %% Dashboard Access
    AA --> BB[SafeMate Dashboard<br/>- My Files<br/>- Upload<br/>- Shared Groups<br/>- Wallet Management<br/>- Profile]
    Q --> BB
    
    %% AWS Services Styling
    classDef cognito fill:#FF9900,stroke:#232F3E,stroke-width:2px,color:#FFFFFF
    classDef lambda fill:#FF9900,stroke:#232F3E,stroke-width:2px,color:#FFFFFF
    classDef dynamo fill:#3F48CC,stroke:#232F3E,stroke-width:2px,color:#FFFFFF
    classDef kms fill:#DD344C,stroke:#232F3E,stroke-width:2px,color:#FFFFFF
    classDef apigateway fill:#FF4B4B,stroke:#232F3E,stroke-width:2px,color:#FFFFFF
    classDef frontend fill:#61DAFB,stroke:#232F3E,stroke-width:2px,color:#000000
    classDef hedera fill:#00D4AA,stroke:#232F3E,stroke-width:2px,color:#FFFFFF
    
    %% Apply styles
    class I cognito
    class M,N lambda
    class X dynamo
    class U kms
    class A,C,R,S,BB frontend
    class T,V hedera
```

---

## 🔐 Authentication Flow Detail

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant C as Cognito
    participant L as Lambda
    participant D as DynamoDB
    participant K as KMS
    participant H as Hedera
    
    %% Sign Up Flow
    U->>F: Fill Sign Up Form
    F->>C: signUp() with custom attributes
    C->>U: Send verification email
    U->>F: Enter confirmation code
    F->>C: confirmSignUp()
    C->>L: Post-confirmation trigger
    L->>L: Extract user data
    L->>L: Async invoke user-onboarding
    
    %% Wallet Creation Flow
    L->>L: Generate Hedera keypair
    L->>K: Encrypt private key
    K-->>L: Encrypted key
    L->>H: Create account alias
    L->>D: Store wallet keys
    L->>D: Store wallet metadata
    D-->>L: Success
    L-->>F: Wallet created
    F->>F: Initialize Hedera context
    F->>U: Dashboard access
```

---

## 🏗️ AWS Infrastructure Architecture

```mermaid
graph TB
    %% User Layer
    subgraph "User Interface"
        USER[User Browser]
        CDN[CloudFront CDN<br/>d19a5c2wn4mtdt.cloudfront.net]
    end
    
    %% Frontend Layer
    subgraph "Frontend Layer"
        REACT[React App<br/>localhost:5173]
        S3[S3 Static Hosting]
    end
    
    %% API Layer
    subgraph "API Gateway Layer"
        API1[Onboarding API<br/>nh9d5m1g4m]
        API2[Wallet API<br/>mit7zoku5g]
        API3[Hedera API<br/>yvzwg6rvp3]
        API4[Token Vault API<br/>19k64fbdcg]
        API5[Group API<br/>8641yebpjg]
        API6[Directory API<br/>h5qustihb1]
    end
    
    %% Compute Layer
    subgraph "Lambda Functions"
        L1[user-onboarding]
        L2[wallet-manager]
        L3[hedera-service]
        L4[token-vault]
        L5[group-manager]
        L6[directory-creator]
        L7[post-confirmation]
    end
    
    %% Authentication
    subgraph "Authentication"
        COGNITO[Cognito User Pool<br/>ap-southeast-2_uLgMRpWlw]
        IAM[IAM Roles & Policies]
    end
    
    %% Storage Layer
    subgraph "Data Storage"
        DDB1[wallet-keys]
        DDB2[wallet-metadata]
        DDB3[user-profiles]
        DDB4[groups]
        DDB5[activities]
    end
    
    %% Security Layer
    subgraph "Security"
        KMS[KMS Encryption]
        VPC[VPC Security]
    end
    
    %% External
    subgraph "Blockchain"
        HEDERA[Hedera Testnet]
    end
    
    %% Connections
    USER --> CDN
    CDN --> S3
    CDN --> REACT
    REACT --> API1
    REACT --> API2
    REACT --> API3
    REACT --> API4
    REACT --> API5
    REACT --> API6
    
    API1 --> L1
    API2 --> L2
    API3 --> L3
    API4 --> L4
    API5 --> L5
    API6 --> L6
    
    COGNITO --> L7
    L7 --> L1
    
    L1 --> DDB1
    L1 --> DDB2
    L2 --> DDB1
    L2 --> DDB2
    L5 --> DDB4
    L5 --> DDB5
    
    L1 --> KMS
    L2 --> KMS
    L3 --> HEDERA
    
    REACT --> COGNITO
    API1 --> COGNITO
    API2 --> COGNITO
    
    %% Styling
    classDef aws fill:#FF9900,stroke:#232F3E,stroke-width:2px,color:#FFFFFF
    classDef frontend fill:#61DAFB,stroke:#232F3E,stroke-width:2px,color:#000000
    classDef blockchain fill:#00D4AA,stroke:#232F3E,stroke-width:2px,color:#FFFFFF
    
    class CDN,API1,API2,API3,API4,API5,API6,L1,L2,L3,L4,L5,L6,L7,COGNITO,IAM,DDB1,DDB2,DDB3,DDB4,DDB5,KMS,VPC aws
    class USER,REACT,S3 frontend
    class HEDERA blockchain
```

---

## 🔄 Wallet Creation Process Detail

```mermaid
flowchart TD
    %% Start
    START[User Confirmed Account] --> CHECK{Check Existing Wallet}
    
    %% Existing Wallet Path
    CHECK -->|Has Wallet| EXISTING[Return Existing Wallet]
    EXISTING --> DASHBOARD[Proceed to Dashboard]
    
    %% New Wallet Path
    CHECK -->|No Wallet| GENERATE[Generate ED25519 Keypair]
    
    %% Key Generation Process
    GENERATE --> PRIVATE[Private Key Generated]
    GENERATE --> PUBLIC[Public Key Generated]
    GENERATE --> RAW[Raw Public Key Generated]
    
    %% Encryption Process
    PRIVATE --> ENCRYPT[Encrypt Private Key with KMS]
    ENCRYPT --> ENCRYPTED[Encrypted Private Key]
    
    %% Account Creation
    RAW --> ALIAS[Create Hedera Account Alias]
    ALIAS --> ACCOUNT[Account Alias Created]
    
    %% Storage Process
    ENCRYPTED --> STORE1[Store in wallet-keys table]
    PUBLIC --> STORE1
    RAW --> STORE1
    ACCOUNT --> STORE1
    
    ACCOUNT --> STORE2[Store in wallet-metadata table]
    PUBLIC --> STORE2
    
    %% Completion
    STORE1 --> SUCCESS[Wallet Created Successfully]
    STORE2 --> SUCCESS
    SUCCESS --> FRONTEND[Return to Frontend]
    FRONTEND --> INIT[Initialize Hedera Context]
    INIT --> DASHBOARD
    
    %% Styling
    classDef process fill:#4CAF50,stroke:#2E7D32,stroke-width:2px,color:#FFFFFF
    classDef storage fill:#2196F3,stroke:#1976D2,stroke-width:2px,color:#FFFFFF
    classDef security fill:#FF9800,stroke:#F57C00,stroke-width:2px,color:#FFFFFF
    classDef decision fill:#9C27B0,stroke:#7B1FA2,stroke-width:2px,color:#FFFFFF
    
    class GENERATE,PRIVATE,PUBLIC,RAW,ALIAS,ACCOUNT process
    class STORE1,STORE2,EXISTING storage
    class ENCRYPT,ENCRYPTED security
    class CHECK decision
```

---

## 📱 Frontend Component Flow

```mermaid
stateDiagram-v2
    [*] --> LandingPage
    
    LandingPage --> ModernLogin : Get Started
    LandingPage --> FAQ : Learn More
    LandingPage --> PublicPages : Navigation
    
    ModernLogin --> SignInForm : Existing User
    ModernLogin --> SignUpForm : New User
    
    SignUpForm --> ConfirmationForm : Account Created
    ConfirmationForm --> ConfirmedState : Code Verified
    ConfirmedState --> OnboardingModal : Auto Login
    
    SignInForm --> WalletCheck : Authenticated
    WalletCheck --> Dashboard : Has Wallet
    WalletCheck --> OnboardingModal : No Wallet
    
    OnboardingModal --> WalletCreation : Start Process
    WalletCreation --> WalletSuccess : Creation Complete
    WalletSuccess --> Dashboard : Initialize Context
    
    Dashboard --> MyFiles : Navigation
    Dashboard --> Upload : Navigation
    Dashboard --> SharedGroups : Navigation
    Dashboard --> WalletManagement : Navigation
    Dashboard --> Profile : Navigation
    
    state OnboardingModal {
        [*] --> AccountCreated
        AccountCreated --> InitializingWallet
        InitializingWallet --> GeneratingKeys
        GeneratingKeys --> CreatingAccount
        CreatingAccount --> WalletComplete
        WalletComplete --> [*]
    }
```

---

## 🔐 Security Flow Diagram

```mermaid
graph TD
    %% User Authentication
    subgraph "Authentication Layer"
        USER[User Credentials]
        COGNITO[AWS Cognito]
        JWT[JWT Token]
    end
    
    %% API Security
    subgraph "API Security Layer"
        GATEWAY[API Gateway]
        CORS[CORS Validation]
        AUTH[Token Validation]
        LAMBDA[Lambda Authorizer]
    end
    
    %% Data Security
    subgraph "Data Security Layer"
        KMS[AWS KMS]
        ENCRYPT[Field Encryption]
        DYNAMODB[DynamoDB Encryption at Rest]
    end
    
    %% Network Security
    subgraph "Network Security"
        TLS[TLS/HTTPS]
        VPC[VPC Isolation]
        IAM[IAM Roles]
    end
    
    %% Flow
    USER --> COGNITO
    COGNITO --> JWT
    JWT --> GATEWAY
    GATEWAY --> CORS
    CORS --> AUTH
    AUTH --> LAMBDA
    LAMBDA --> KMS
    KMS --> ENCRYPT
    ENCRYPT --> DYNAMODB
    
    %% Security Styling
    classDef security fill:#F44336,stroke:#D32F2F,stroke-width:2px,color:#FFFFFF
    classDef encryption fill:#FF9800,stroke:#F57C00,stroke-width:2px,color:#FFFFFF
    classDef network fill:#4CAF50,stroke:#388E3C,stroke-width:2px,color:#FFFFFF
    
    class USER,COGNITO,JWT,GATEWAY,CORS,AUTH,LAMBDA security
    class KMS,ENCRYPT,DYNAMODB encryption
    class TLS,VPC,IAM network
```

---

## 📊 Data Flow Architecture

```mermaid
graph LR
    %% Frontend Data Flow
    subgraph "Frontend Data Layer"
        REACT[React Components]
        CONTEXT[React Contexts]
        SERVICES[Service Classes]
    end
    
    %% API Data Flow
    subgraph "API Data Layer"
        REST[REST APIs]
        GATEWAY[API Gateway]
        LAMBDA[Lambda Functions]
    end
    
    %% Storage Data Flow
    subgraph "Storage Data Layer"
        DYNAMO[DynamoDB Tables]
        KMS[KMS Encryption]
        BACKUP[Point-in-Time Recovery]
    end
    
    %% External Data Flow
    subgraph "External Data Layer"
        HEDERA[Hedera Network]
        HASHSCAN[HashScan Explorer]
        MIRROR[Mirror Nodes]
    end
    
    %% Data Flow Connections
    REACT --> CONTEXT
    CONTEXT --> SERVICES
    SERVICES --> REST
    REST --> GATEWAY
    GATEWAY --> LAMBDA
    LAMBDA --> DYNAMO
    LAMBDA --> KMS
    LAMBDA --> HEDERA
    HEDERA --> MIRROR
    HEDERA --> HASHSCAN
    DYNAMO --> BACKUP
    
    %% Data Flow Styling
    classDef frontend fill:#61DAFB,stroke:#0277BD,stroke-width:2px,color:#000000
    classDef api fill:#FF9900,stroke:#E65100,stroke-width:2px,color:#FFFFFF
    classDef storage fill:#4CAF50,stroke:#2E7D32,stroke-width:2px,color:#FFFFFF
    classDef external fill:#9C27B0,stroke:#6A1B9A,stroke-width:2px,color:#FFFFFF
    
    class REACT,CONTEXT,SERVICES frontend
    class REST,GATEWAY,LAMBDA api
    class DYNAMO,KMS,BACKUP storage
    class HEDERA,HASHSCAN,MIRROR external
```

---

## 🎯 Complete User Journey Timeline

```mermaid
timeline
    title SafeMate User Journey Timeline
    
    section Landing Page
        Visit Site           : User accesses safemate.com
        Explore Features     : User reviews features and use cases
        Decision Point       : User clicks "Get Started"
    
    section Authentication
        Sign Up Form         : User fills registration form
                            : Selects account type
        Email Verification   : AWS Cognito sends verification code
                            : User enters 6-digit code
        Account Confirmed    : Account status becomes CONFIRMED
    
    section Wallet Creation
        Auto Trigger         : Post-confirmation Lambda triggers
        Key Generation       : ED25519 keypair generated
        KMS Encryption       : Private key encrypted with AWS KMS
        Hedera Integration   : Account alias created for Hedera
        Database Storage     : Wallet data stored in DynamoDB
    
    section Onboarding UI
        Modal Display        : OnboardingModal shows progress
        Step Updates         : Real-time status updates shown
        Wallet Details       : Account ID and public key displayed
        Context Init         : Hedera context initialized
    
    section Dashboard Access
        Redirect             : User automatically redirected
        Full Access          : All features become available
        Ready to Use         : User can upload, share, collaborate
```

---

## 📋 Component Interaction Map

```mermaid
mindmap
  root((SafeMate Application))
    Frontend Components
      LandingPage
        HeroSection
        FeaturesSection
        RoadmapSection
      ModernLogin
        SignInForm
        SignUpForm
        ConfirmationForm
      OnboardingModal
        ProgressSteps
        WalletDetails
      Dashboard
        MyFiles
        Upload
        SharedGroups
        WalletManagement
        Profile
    
    Backend Services
      Lambda Functions
        user-onboarding
        wallet-manager
        hedera-service
        token-vault
        group-manager
        directory-creator
        post-confirmation
      API Gateways
        REST APIs
        CORS Configuration
        Authentication
    
    Data Storage
      DynamoDB Tables
        wallet-keys
        wallet-metadata
        user-profiles
        groups
        activities
      AWS KMS
        Master Key
        App Secrets Key
    
    External Services
      AWS Cognito
        User Pool
        App Client
        Custom Attributes
      Hedera Network
        Testnet
        Account Creation
        Key Management
      Monitoring
        CloudWatch Logs
        Performance Metrics
        Error Tracking
```

---

## 🚀 Deployment Architecture

```mermaid
C4Context
    title SafeMate System Context Diagram
    
    Person(user, "SafeMate User", "Person using SafeMate for secure document storage")
    
    System(safemate, "SafeMate Platform", "Blockchain-based document storage and sharing platform")
    
    System_Ext(aws, "AWS Cloud", "Amazon Web Services providing infrastructure")
    System_Ext(hedera, "Hedera Network", "Blockchain network for account and transaction management")
    System_Ext(hashscan, "HashScan", "Hedera blockchain explorer")
    
    Rel(user, safemate, "Uses", "HTTPS")
    Rel(safemate, aws, "Deployed on", "AWS APIs")
    Rel(safemate, hedera, "Integrates with", "Hedera SDK")
    Rel(safemate, hashscan, "Links to", "HTTPS")
    
    UpdateLayoutConfig($c4ShapeInRow="2", $c4BoundaryInRow="1")
```

---

## 📈 Performance Flow

```mermaid
journey
    title SafeMate User Performance Journey
    section Initial Load
      Visit Landing Page    : 3: User
      Load Static Assets    : 4: CloudFront
      Initialize React App  : 4: Frontend
    section Authentication
      Submit Credentials    : 3: User
      Validate with Cognito : 5: AWS
      Receive JWT Token     : 5: System
    section Wallet Creation
      Start Onboarding     : 4: User
      Generate Keys        : 5: Lambda
      Encrypt with KMS     : 5: AWS
      Store in DynamoDB    : 5: Database
      Connect to Hedera    : 4: Blockchain
    section Dashboard
      Load User Data       : 5: System
      Initialize Context   : 4: Frontend
      Ready for Use        : 5: User
```

---

## 🔧 Development Workflow

```mermaid
gitgraph
    commit id: "Initial Setup"
    branch development
    checkout development
    commit id: "Frontend Components"
    commit id: "Authentication Flow"
    commit id: "Lambda Functions"
    branch feature/wallet
    checkout feature/wallet
    commit id: "Wallet Creation"
    commit id: "Hedera Integration"
    checkout development
    merge feature/wallet
    commit id: "Integration Testing"
    checkout main
    merge development
    commit id: "Production Deploy"
    commit id: "Current State"
```

---

## 📖 How to Use These Diagrams

### 1. Main Workflow Diagram
- Use for understanding the complete user journey
- Reference for new team member onboarding
- Architecture discussions and planning

### 2. Sequence Diagrams
- Debug authentication issues
- Understand service interactions
- Optimize API call patterns

### 3. Infrastructure Diagrams
- AWS resource planning and management
- Cost optimization discussions
- Security reviews and audits

### 4. Component Flow Diagrams
- Frontend development planning
- State management optimization
- User experience improvements

### 5. Security Flow Diagrams
- Security audits and reviews
- Compliance documentation
- Penetration testing planning

---

## 🛠️ Diagram Maintenance

### Updating Diagrams
1. **Service Changes**: Update when new AWS services are added
2. **Flow Changes**: Modify when user workflow changes
3. **Component Updates**: Reflect new frontend components
4. **Security Updates**: Include new security measures

### Diagram Tools
- **Mermaid**: Used for all diagrams in this document
- **Live Editor**: https://mermaid.live/
- **VSCode Extension**: Mermaid Preview
- **Documentation**: https://mermaid.js.org/

### Version Control
- **File Location**: `SAFEMATE_WORKFLOW_DIAGRAM.md`
- **Git Tracking**: Track changes with git commits
- **Documentation**: Update with code changes
- **Review Process**: Include in code review cycles

---

*Last Updated: January 2025*
*Diagrams represent current production state*
*All AWS services operational in ap-southeast-2*
