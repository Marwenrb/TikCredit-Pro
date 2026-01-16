# TikCredit Pro - Complete Developer Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Getting Started](#getting-started)
3. [Project Architecture](#project-architecture)
4. [Step-by-Step Setup](#step-by-step-setup)
5. [Running the Application](#running-the-application)
6. [Key Technologies](#key-technologies)
7. [File Structure Explained](#file-structure-explained)
8. [Development Workflow](#development-workflow)
9. [API Endpoints Guide](#api-endpoints-guide)
10. [Firebase Setup](#firebase-setup)
11. [Styling & Components](#styling--components)
12. [Common Tasks](#common-tasks)
13. [Troubleshooting](#troubleshooting)
14. [Production Deployment](#production-deployment)

---

## Project Overview

**TikCredit Pro** is a premium financing platform designed for Algeria, featuring:
- 🎯 User-friendly form submission system for loan requests
- 📊 Real-time admin dashboard with analytics
- 🔐 Secure authentication and role-based access
- 💾 Dual-storage system (Firebase + Local fallback)
- 📧 Email notifications for new submissions
- 🌍 Full RTL support for Arabic language
- 📱 Mobile-responsive design

### Key Features:
- Multi-step form with validation
- Real-time submission tracking
- Export functionality (JSON, CSV, Excel, PDF)
- Rate limiting and spam prevention
- Duplicate submission detection
- Server-sent events for live updates

---

## Getting Started

### System Requirements

Before you begin, ensure you have the following installed:

1. **Node.js** (version 18.x or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

3. **Git** (for version control)
   - Download from: https://git-scm.com/
   - Verify installation: `git --version`

4. **Visual Studio Code** (recommended editor)
   - Download from: https://code.visualstudio.com/

5. **Firebase Account** (optional, for production)
   - Sign up at: https://console.firebase.google.com

### Verify Your Environment

```bash
# Check Node version (should be 18+)
node --version

# Check npm version
npm --version

# Check Git installation
git --version
```

---

## Project Architecture

### High-Level Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERACTION LAYER                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Form Page    │  │ Admin Login  │  │ Dashboard    │       │
│  │ (/form)      │  │ (/admin)     │  │ Analytics    │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
└─────────┼──────────────────┼──────────────────┼──────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                      API LAYER (Next.js)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ /api/        │  │ /api/auth/   │  │ /api/        │       │
│  │ submissions/ │  │ login/logout │  │ realtime/    │       │
│  │ submit       │  │ verify       │  │ submissions  │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
└─────────┼──────────────────┼──────────────────┼──────────────┘
          │                  │                  │
          ├──────────────────┴──────────────────┤
          ▼
┌─────────────────────────────────────────────────────────────┐
│                   DATA PERSISTENCE LAYER                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Firebase/    │  │ Local JSON   │  │ Email Service│       │
│  │ Firestore    │  │ (.tmp/)      │  │ (Resend/     │       │
│  │ (Primary)    │  │ (Fallback)   │  │  SendGrid)   │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

### Key Components

1. **Frontend** (`/src/components`, `/src/app`)
   - React components with TypeScript
   - Tailwind CSS for styling
   - Framer Motion for animations

2. **API Routes** (`/src/app/api`)
   - Form submission handler
   - Authentication endpoints
   - Real-time event streaming

3. **Libraries** (`/src/lib`)
   - Firebase initialization
   - Email service
   - Rate limiting
   - Authentication utilities

4. **Types** (`/src/types`)
   - TypeScript interfaces
   - Form data structures

---

## Step-by-Step Setup

### Step 1: Clone the Repository

```bash
# Clone the project
git clone <repository-url> tikcredit-pro
cd tikcredit-pro
```

### Step 2: Install Dependencies

```bash
# Install all npm packages
npm install

# This may take 2-5 minutes depending on your internet speed
# It will download ~500MB of dependencies
```

**What gets installed:**
- Next.js framework
- React & React DOM
- Firebase SDKs (client + admin)
- Tailwind CSS
- Framer Motion
- TypeScript
- And many other utilities

### Step 3: Setup Environment Variables

#### 3a. Create the `.env.local` file

```bash
# Copy the example file
cp env.example .env.local

# On Windows:
# copy env.example .env.local
```

#### 3b. Fill in the Environment Variables

Open `.env.local` in your editor and add values:

```env
# ===== REQUIRED =====
ADMIN_PASSWORD=YourSecurePassword123

# Generate a random 32+ character string
JWT_SECRET=abcdefghijklmnopqrstuvwxyz1234567890

# ===== OPTIONAL (Email notifications) =====
# Choose ONE: Resend or SendGrid

# Option A: Resend (Recommended)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx

# Option B: SendGrid
# SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxx

# ===== OPTIONAL (Firebase) =====
# Get these from Firebase Console
FIREBASE_PROJECT_ID=your-firebase-project
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEv....\n-----END PRIVATE KEY-----"

# ===== OPTIONAL (Features) =====
NEXT_PUBLIC_APP_URL=http://localhost:3000
INTERNAL_API_TOKEN=your-internal-token-here
```

**Important Notes:**
- Never commit `.env.local` to Git
- It's already in `.gitignore`
- Keep passwords and keys confidential
- For `FIREBASE_PRIVATE_KEY`, use literal `\n` for newlines

### Step 4: Setup Firebase (Optional but Recommended)

If you want to store submissions in Firebase:

#### 4a. Create Firebase Project

1. Go to https://console.firebase.google.com
2. Click "Create a new project"
3. Name it (e.g., "TikCredit Pro")
4. Enable Google Analytics (optional)
5. Click "Create project"

#### 4b. Generate Service Account Key

1. In Firebase Console, click **Settings ⚙️** → **Project Settings**
2. Go to **Service Accounts** tab
3. Click **Generate New Private Key**
4. A JSON file downloads
5. Copy the values to your `.env.local`:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY`

#### 4c. Create Firestore Database

1. In Firebase Console, click **Firestore Database**
2. Click **Create Database**
3. Choose **Production mode**
4. Select your region (closest to Algeria: Europe or Middle East)
5. Click **Create**

#### 4d. Setup Security Rules

1. Go to **Firestore** → **Rules** tab
2. Replace the content with rules from `firestore.rules` file
3. Click **Publish**

### Step 5: Verify Everything is Set Up

```bash
# Check if all dependencies are installed
npm list --depth=0

# Verify TypeScript configuration
npm run type-check

# Run ESLint
npm run lint
```

---

## Running the Application

### Development Mode

```bash
# Start the development server
npm run dev

# Output should show:
# ▲ Next.js 14.2.35
# - Local:        http://localhost:3000
# - Environments: .env.local
# ✓ Ready in 5.9s
```

Then open http://localhost:3000 in your browser

**What happens in development:**
- Hot reloading (changes auto-reload)
- Detailed error messages
- Console logging enabled
- Slower build time, faster startup

### Access the Application

| Page | URL | Purpose |
|------|-----|---------|
| Home | http://localhost:3000 | Landing page with info |
| Form | http://localhost:3000/form | Submit financing request |
| Admin Login | http://localhost:3000/admin | Login to dashboard |
| Admin Dashboard | http://localhost:3000/admin | View & manage submissions |

### Stop the Development Server

```bash
# Press Ctrl+C in terminal
# Or close the terminal window
```

---

## Key Technologies

### Frontend Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | 14.2.35 | React framework with SSR |
| **React** | 18.3.1 | UI library |
| **TypeScript** | 5.4.5 | Type-safe JavaScript |
| **Tailwind CSS** | 3.4.4 | Utility-first CSS |
| **Framer Motion** | 11.2.10 | Animations & transitions |
| **Lucide React** | 0.395 | Icon library |

### Backend Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Firebase Admin** | 13.6.0 | Server-side database |
| **Firebase** | 12.7.0 | Client-side auth |
| **jsonwebtoken** | 9.0.2 | JWT authentication |
| **date-fns** | 3.6.0 | Date formatting |

### Export Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| **ExcelJS** | 4.4.0 | Excel file export |
| **jsPDF** | 4.0.0 | PDF export |
| **jspdf-autotable** | 5.0.7 | PDF tables |

### Development Tools

| Tool | Purpose |
|------|---------|
| **ESLint** | Code quality checking |
| **TypeScript** | Type checking |
| **Tailwind CLI** | CSS compilation |
| **Next.js CLI** | Build & development |

---

## File Structure Explained

### Root Level Files

```
.env.example          ← Template for environment variables
.env.local            ← Your actual secrets (DO NOT COMMIT)
package.json          ← Project dependencies & scripts
tsconfig.json         ← TypeScript configuration
next.config.js        ← Next.js settings
tailwind.config.ts    ← Tailwind CSS configuration
```

### `/src` Directory Structure

```
src/
├── app/                          ← Next.js app router
│   ├── page.tsx                  ← Home page (/)
│   ├── layout.tsx                ← Root layout
│   ├── globals.css               ← Global styles
│   ├── form/
│   │   └── page.tsx              ← Form page (/form)
│   ├── admin/
│   │   └── page.tsx              ← Admin dashboard (/admin)
│   └── api/                      ← API endpoints
│       ├── auth/
│       │   ├── login/route.ts    ← POST /api/auth/login
│       │   ├── logout/route.ts   ← POST /api/auth/logout
│       │   └── verify/route.ts   ← GET /api/auth/verify
│       ├── submissions/
│       │   ├── submit/route.ts   ← POST /api/submissions/submit
│       │   └── list/route.ts     ← GET /api/submissions/list
│       └── realtime/
│           └── submissions/route.ts ← Server-Sent Events
├── components/                   ← React components
│   ├── form/
│   │   └── CleanForm.tsx         ← Multi-step form
│   ├── admin/
│   │   ├── AdminDashboard.tsx   ← Dashboard layout
│   │   ├── AdminLogin.tsx        ← Login form
│   │   └── DownloadModal.tsx     ← Export dialog
│   ├── ui/
│   │   ├── AmountSlider.tsx      ← Premium slider
│   │   ├── Button.tsx            ← Button component
│   │   ├── Modal.tsx             ← Modal component
│   │   └── ...other UI components
│   └── Providers.tsx             ← App providers
├── lib/                          ← Utilities & services
│   ├── firebase-admin.ts         ← Firebase server setup
│   ├── firebase.ts               ← Firebase client setup
│   ├── auth.ts                   ← JWT authentication
│   ├── emailService.ts           ← Email notifications
│   ├── rateLimit.ts              ← Rate limiting
│   ├── utils.ts                  ← Helper functions
│   └── design-tokens.ts          ← Design system
├── hooks/                        ← React hooks
│   └── useRealtimeSubmissions.ts ← Real-time updates hook
├── types/                        ← TypeScript types
│   ├── index.ts                  ← Form & submission types
│   └── animations.ts             ← Animation types
└── middleware.ts                 ← Request middleware

/public                           ← Static files
├── robots.txt                    ← Search engine rules
├── sitemap.xml                   ← Site structure
└── ...icon files

/scripts                          ← Build scripts
├── deploy-production.js          ← Deployment helper
└── generate-icons.js             ← Icon generator
```

### Important Files Explained

#### `src/types/index.ts`
Defines the `FormData` interface - the shape of submission data:
```typescript
interface FormData {
  fullName: string
  phone: string
  email?: string
  wilaya: string  // Province
  profession: string
  monthlyIncomeRange: string
  financingType: string
  requestedAmount: number
  salaryReceiveMethod: string
  isExistingCustomer?: string
  preferredContactTime?: string
  notes?: string
}
```

#### `src/lib/firebase-admin.ts`
Initializes Firebase Admin SDK for server-side database operations

#### `src/app/api/submissions/submit/route.ts`
Handles form submissions:
1. Validates form data
2. Checks rate limits
3. Saves to Firebase
4. Falls back to local JSON
5. Sends email notification
6. Broadcasts via SSE

#### `src/components/form/CleanForm.tsx`
The main form component with:
- 4-step form navigation
- Real-time validation
- Draft saving to localStorage
- Success animation

---

## Development Workflow

### Daily Development Workflow

#### 1. Start Development Server

```bash
# In project root
npm run dev

# Server starts on http://localhost:3000
```

#### 2. Make Code Changes

Edit files in the `/src` directory:
- Components in `/src/components`
- API routes in `/src/app/api`
- Utilities in `/src/lib`

Changes auto-reload in browser (hot reload)

#### 3. Test Your Changes

```bash
# Test in browser
# Navigate to http://localhost:3000

# Run type checking
npm run type-check

# Run linting
npm run lint

# Fix auto-fixable lint issues
npm run lint:fix
```

#### 4. Before Committing

```bash
# Ensure all tests pass
npm run type-check
npm run lint

# Run production build check
npm run build

# Fix any issues found
```

#### 5. Commit to Git

```bash
# Check what changed
git status

# Add files
git add .

# Commit with a message
git commit -m "feat: add new feature description"

# Push to repository
git push origin main
```

### Common Development Tasks

#### Adding a New Component

```typescript
// src/components/MyComponent.tsx
'use client'  // Client-side component

import React from 'react'
import { motion } from 'framer-motion'

interface MyComponentProps {
  title: string
  onSubmit: () => void
}

const MyComponent: React.FC<MyComponentProps> = ({ title, onSubmit }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 bg-white rounded-lg shadow"
    >
      <h2 className="text-2xl font-bold">{title}</h2>
      <button onClick={onSubmit}>Submit</button>
    </motion.div>
  )
}

export default MyComponent
```

#### Adding a New API Endpoint

```typescript
// src/app/api/myendpoint/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Your logic here
    
    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Error message'
    }, { status: 500 })
  }
}
```

#### Styling with Tailwind

```tsx
// Use Tailwind utility classes
<div className="flex items-center justify-between p-4 bg-gradient-to-r from-elegant-blue to-premium-gold rounded-lg shadow-lg">
  <h1 className="text-2xl font-bold text-white">Title</h1>
  <button className="px-4 py-2 bg-white text-elegant-blue rounded-md hover:shadow-lg transition-shadow">
    Click me
  </button>
</div>
```

---

## API Endpoints Guide

### Authentication Endpoints

#### 1. Login (`POST /api/auth/login`)

**Purpose:** Admin login to get JWT token

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password": "YourPassword"}'
```

**Response (Success 200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 28800
}
```

**Response (Failure 401):**
```json
{
  "success": false,
  "error": "Invalid password"
}
```

#### 2. Verify Token (`GET /api/auth/verify`)

**Purpose:** Check if JWT token is valid

**Request:**
```bash
curl -X GET http://localhost:3000/api/auth/verify \
  -H "Cookie: token=YOUR_JWT_TOKEN"
```

**Response (Valid 200):**
```json
{
  "success": true,
  "valid": true
}
```

**Response (Invalid 401):**
```json
{
  "success": false,
  "valid": false
}
```

#### 3. Logout (`POST /api/auth/logout`)

**Purpose:** Clear JWT token

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/logout
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Submission Endpoints

#### 1. Submit Form (`POST /api/submissions/submit`)

**Purpose:** Submit a new financing request

**Request:**
```bash
curl -X POST http://localhost:3000/api/submissions/submit \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "أحمد محمد",
    "phone": "0512345678",
    "email": "ahmad@example.com",
    "wilaya": "الجزائر",
    "profession": "موظف",
    "monthlyIncomeRange": "50,000 - 80,000 د.ج",
    "financingType": "قرض شخصي",
    "requestedAmount": 10000000,
    "salaryReceiveMethod": "حساب بنكي",
    "isExistingCustomer": "نعم",
    "notes": "طلب بسيط"
  }'
```

**Response (Success 200):**
```json
{
  "success": true,
  "message": "تم استلام طلبك بنجاح",
  "submissionId": "550e8400-e29b-41d4-a716-446655440000",
  "approvalProbability": 72,
  "persisted": "server"
}
```

**Response (Too Many Requests 429):**
```json
{
  "error": "Too many requests",
  "retryAfter": 45
}
```

#### 2. List Submissions (`GET /api/submissions/list`)

**Purpose:** Get all submissions (admin only)

**Request:**
```bash
curl -X GET http://localhost:3000/api/submissions/list \
  -H "Cookie: token=YOUR_JWT_TOKEN"
```

**Response (Success 200):**
```json
{
  "success": true,
  "submissions": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "timestamp": "2026-01-15T10:30:00.000Z",
      "data": {
        "fullName": "أحمد محمد",
        "phone": "0512345678",
        "requestedAmount": 10000000
        // ... other fields
      },
      "source": "web-form",
      "ip": "192.168.1.1"
    }
  ],
  "count": 42
}
```

### Real-time Endpoints

#### Server-Sent Events (`GET /api/realtime/submissions`)

**Purpose:** Live stream of new submissions

**Request:**
```javascript
// In browser
const eventSource = new EventSource('/api/realtime/submissions')

eventSource.addEventListener('new_submission', (event) => {
  const data = JSON.parse(event.data)
  console.log('New submission:', data)
})

eventSource.addEventListener('error', (event) => {
  console.error('Connection error:', event)
})
```

**Events:**
- `connected`: Connection established
- `new_submission`: New submission received
- `count_update`: Total submission count changed
- `heartbeat`: Keep-alive signal (every 30s)

---

## Firebase Setup

### Understanding Firestore

Firestore is Google's cloud database. It stores data as:

```
Project (Firebase Project)
  └─ Firestore Database
      └─ Collections
          └─ submissions (collection)
              └─ Documents (each submission)
                  ├─ fullName
                  ├─ phone
                  ├─ requestedAmount
                  └─ ... other fields
```

### Firestore Structure for TikCredit

```
tikcredit-database/
  └─ submissions/ (collection)
      ├─ doc_id_1 (document)
      │   ├─ id: "550e8400..."
      │   ├─ timestamp: "2026-01-15T10:30:00Z"
      │   ├─ data:
      │   │   ├─ fullName: "أحمد محمد"
      │   │   ├─ phone: "0512345678"
      │   │   ├─ requestedAmount: 10000000
      │   │   └─ ...
      │   ├─ ip: "192.168.1.1"
      │   ├─ userAgent: "Mozilla/5.0..."
      │   ├─ status: "pending"
      │   └─ source: "web-form"
      │
      ├─ doc_id_2 (document)
      │   └─ ... (another submission)
      │
      └─ ... (more submissions)
```

### Security Rules Explained

Located in `firestore.rules`:

```javascript
// Only allow Admin SDK access (server-side)
// Deny all direct client access
match /submissions/{document=**} {
  allow read, write: if request.auth.uid == 'admin';
}
```

This means:
- ✅ Server API can read/write submissions
- ❌ Browser clients cannot directly access database
- ❌ Unauthenticated users cannot access

### Testing Firebase Connection

```bash
# Start development server
npm run dev

# Submit a form at http://localhost:3000/form

# Check console for messages:
# ✅ "Saved submission to Firebase: <id>"
# OR
# ⚠️ "Firebase Admin DB not available - will use local fallback"
```

---

## Styling & Components

### Design System

The project uses a premium color scheme:

```typescript
// tailwind.config.ts - Main colors

// Primary: Elegant Blue (brand color)
elegant-blue: '#1E3A8A'
elegant-blue-light: '#3B82F6'
elegant-blue-dark: '#1E40AF'

// Accent: Premium Gold
premium-gold: '#F59E0B'
premium-gold-light: '#FCD34D'

// Neutral: Luxury Grays
luxury-white: '#FFFFFF'
luxury-offWhite: '#F9FAFB'
luxury-charcoal: '#374151'
luxury-darkGray: '#6B7280'

// Status Colors
status-success: '#10B981' (green)
status-error: '#EF4444' (red)
status-warning: '#F59E0B' (orange)
status-info: '#3B82F6' (blue)
```

### Using Tailwind CSS

```tsx
// Grid layout
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div>Column 1</div>
  <div>Column 2</div>
  <div>Column 3</div>
</div>

// Flex layout
<div className="flex items-center justify-between p-4">
  <span>Left content</span>
  <span>Right content</span>
</div>

// Gradient background
<div className="bg-gradient-to-r from-elegant-blue to-premium-gold">
  Gradient background
</div>

// Responsive text
<h1 className="text-xl md:text-2xl lg:text-3xl font-bold">
  Responsive heading
</h1>

// Shadow and rounded corners
<div className="rounded-lg shadow-lg hover:shadow-xl transition-shadow">
  Content with shadow
</div>
```

### Using Framer Motion for Animations

```tsx
import { motion } from 'framer-motion'

// Fade in
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  Fades in on mount
</motion.div>

// Slide and fade
<motion.div
  initial={{ opacity: 0, x: -50 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ type: 'spring', stiffness: 300 }}
>
  Slides in from left
</motion.div>

// Scale on hover
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Click me
</motion.button>

// List animation
<motion.ul layout>
  {items.map(item => (
    <motion.li
      key={item.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {item.name}
    </motion.li>
  ))}
</motion.ul>
```

### Key UI Components

#### 1. AmountSlider
Premium slider for selecting loan amount:

```tsx
import { AmountSlider } from '@/components/ui'

<AmountSlider
  min={5_000_000}
  max={20_000_000}
  step={500_000}
  value={amount}
  onChange={setAmount}
  label="المبلغ المطلوب"
  showTooltip={true}
/>
```

Features:
- Dual input (slider + numeric field)
- Quick preset buttons
- Monthly payment estimate
- Real-time value bubble
- Full keyboard support

#### 2. Button Component
```tsx
import { Button } from '@/components/ui'

<Button
  variant="primary"  // primary, secondary, outline
  size="md"          // sm, md, lg
  disabled={false}
  onClick={handleClick}
>
  Click me
</Button>
```

#### 3. Modal Component
```tsx
import { Modal } from '@/components/ui'

<Modal
  isOpen={isOpen}
  title="Dialog title"
  onClose={handleClose}
>
  Modal content here
</Modal>
```

---

## Common Tasks

### Task 1: Add a New Form Field

**Example:** Add a "Preferred Contact Day" field

**Step 1:** Update the types
```typescript
// src/types/index.ts
interface FormData {
  // ... existing fields
  preferredContactDay?: string  // Add this
}
```

**Step 2:** Add the field to the form
```tsx
// src/components/form/CleanForm.tsx
if (currentStep === 3) {
  return (
    <div>
      {/* ... existing fields ... */}
      <label className="block text-sm font-semibold">
        يوم التواصل المفضل
      </label>
      <select
        value={formData.preferredContactDay || ''}
        onChange={(e) => setFormData({
          ...formData,
          preferredContactDay: e.target.value
        })}
        className="w-full p-2 border rounded-lg"
      >
        <option value="">اختر يوم</option>
        <option value="saturday">السبت</option>
        <option value="sunday">الأحد</option>
        {/* ... more days ... */}
      </select>
    </div>
  )
}
```

**Step 3:** Add validation
```typescript
if (step === 3) {
  if (!formData.preferredContactDay) {
    errors.preferredContactDay = 'يوم التواصل مطلوب'
  }
}
```

### Task 2: Change Colors

**Example:** Change primary color from blue to green

**Step 1:** Update Tailwind config
```typescript
// tailwind.config.ts
colors: {
  elegant: {
    blue: '#10B981',  // Changed to green
    'blue-light': '#34D399',
    // ...
  }
}
```

**Step 2:** Rebuild Tailwind
```bash
npm run dev
```

All components using `elegant-blue` will now be green.

### Task 3: Add Email Template

**Example:** Change the email format

Edit `src/lib/emailService.ts`:

```typescript
export function formatSubmissionEmail(data: SubmissionEmailData): EmailPayload {
  const subject = `طلب تمويل جديد من ${data.data.fullName}`
  
  const html = `
    <h1>طلب تمويل جديد</h1>
    <p><strong>الاسم:</strong> ${data.data.fullName}</p>
    <p><strong>الهاتف:</strong> ${data.data.phone}</p>
    <p><strong>المبلغ:</strong> ${data.data.requestedAmount.toLocaleString()} د.ج</p>
    <!-- Add more fields here -->
  `
  
  return {
    to: 'weshcredit@gmail.com',
    subject,
    html,
    body: `Your plain text version here`
  }
}
```

### Task 4: Export Data in New Format

The app supports: JSON, CSV, Excel, PDF

To add XML export:

```typescript
// src/lib/exportUtils.ts
export function exportAsXML(submissions: Submission[]): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<submissions>\n'
  
  submissions.forEach(sub => {
    xml += `  <submission id="${sub.id}">\n`
    xml += `    <name>${sub.data.fullName}</name>\n`
    xml += `    <phone>${sub.data.phone}</phone>\n`
    xml += `  </submission>\n`
  })
  
  xml += '</submissions>'
  return xml
}
```

### Task 5: Adjust Rate Limiting

**Current:** 100 requests per minute per IP

To change it:

```typescript
// src/lib/rateLimit.ts
export const relaxedRateLimiter = new RateLimiter({
  interval: 60 * 1000,        // Time window (1 minute)
  uniqueTokenPerInterval: 200  // Change this number to 200 req/min
})
```

---

## Troubleshooting

### Issue 1: "Firebase Admin initialization error"

**Problem:**
```
❌ Failed to parse private key: Error: Unparsed DER bytes remain
```

**Solutions:**

1. **Check the key format:**
   ```
   CORRECT:   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE....\n-----END PRIVATE KEY-----"
   WRONG:     FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
              MIIEvQ..."
   ```

2. **Use service account file instead:**
   - Download from Firebase Console
   - Rename to `service-account-key.json`
   - Place in project root
   - Delete the env var

3. **Regenerate the key:**
   - Go to Firebase Console
   - Settings → Service Accounts
   - Delete old key
   - Generate new private key
   - Copy values again

### Issue 2: "Port 3000 is already in use"

**Problem:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solutions:**

```bash
# Option 1: Use a different port
npm run dev -- -p 3001

# Option 2: Kill the process using port 3000
# On Windows (PowerShell):
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# On macOS/Linux:
lsof -ti:3000 | xargs kill -9
```

### Issue 3: "Module not found" Error

**Problem:**
```
Module not found: Can't resolve '@/components/MyComponent'
```

**Solutions:**

```bash
# Option 1: Install missing dependencies
npm install

# Option 2: Check the path is correct
# @/ refers to /src/ directory
# @/components/MyComponent.tsx ✅
# @/components/form/CleanForm.tsx ✅

# Option 3: Check file extension
# Should be .tsx for React components
# Should be .ts for utilities
```

### Issue 4: "TypeScript errors"

**Problem:**
```
error TS2322: Type 'string' is not assignable to type 'number'
```

**Solutions:**

```bash
# Run type check to see all errors
npm run type-check

# Fix the type error
const amount: number = parseInt(userInput, 10)  // ✅ Correct

# Or use type casting
const amount = userInput as number  // ❌ Not recommended, hides errors
```

### Issue 5: "ESLint warnings"

**Problem:**
```
warning: Assign object to a variable before exporting
```

**Solutions:**

```typescript
// Before (warning)
export default {
  colors: { ... }
}

// After (no warning)
const designTokens = {
  colors: { ... }
}
export default designTokens
```

### Issue 6: "Submissions not saving"

**Problem:**
Submissions are submitted but don't appear in admin dashboard

**Debug Steps:**

1. **Check browser console:**
   ```bash
   # Open DevTools: F12 → Console
   # Look for error messages
   ```

2. **Check server console:**
   ```
   ✅ Saved submission to Firebase: <id>
   OR
   ⚠️ Firebase Admin DB not available - using local fallback
   ```

3. **Check local storage:**
   ```bash
   # File location: .tmp/submissions.json
   # Should contain JSON array of submissions
   ```

4. **Check if Firebase is connected:**
   ```bash
   # In .env.local, verify:
   FIREBASE_PROJECT_ID=xxxxx
   FIREBASE_CLIENT_EMAIL=xxxxx
   FIREBASE_PRIVATE_KEY=xxxxx
   ```

### Issue 7: "Email notifications not working"

**Problem:**
Submissions are saved but no email is sent

**Solutions:**

1. **Check if email service is configured:**
   ```bash
   # .env.local should have ONE of:
   RESEND_API_KEY=re_xxxxx    # OR
   SENDGRID_API_KEY=SG_xxxxx
   ```

2. **Verify API key is valid:**
   - Go to Resend.com or SendGrid.com
   - Check dashboard for API key
   - Make sure it's active (not revoked)

3. **Check server logs:**
   ```
   ✅ Email notification sent
   OR
   ❌ Email notification failed: <error message>
   ```

4. **Test email sending:**
   ```bash
   # Check if test emails work in Resend/SendGrid dashboard
   ```

---

## Production Deployment

### Step 1: Prepare for Production

```bash
# Run all checks
npm run type-check
npm run lint
npm run build

# Should see:
# ✓ Compiled successfully
# ✓ All pages generated (0/13)
```

### Step 2: Set Production Environment Variables

Create a `.env.production` file with:

```env
# Same as .env.local but with production URLs
NEXT_PUBLIC_APP_URL=https://tikcredit.com
NODE_ENV=production
# ... other vars
```

### Step 3: Deploy to Vercel (Recommended)

**Option A: Using Git (Automatic Deployment)**

1. Push to GitHub:
```bash
git add .
git commit -m "Production release"
git push origin main
```

2. Connect to Vercel:
   - Go to https://vercel.com
   - Click "New Project"
   - Select your GitHub repository
   - Click "Import"

3. Set environment variables:
   - In Vercel dashboard
   - Go to Settings → Environment Variables
   - Add all vars from `.env.local`

4. Deploy:
   - Vercel auto-deploys on git push
   - Monitor deployment in Vercel dashboard

**Option B: Manual Deployment**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Step 4: Enable Firestore Security

1. Go to Firebase Console
2. Firestore → Rules
3. Replace with production rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /submissions/{document=**} {
      // Only allow Admin SDK (server-side)
      allow read, write: if false;
    }
  }
}
```

### Step 5: Monitor Production

```bash
# View logs in Vercel
vercel logs <app-name> --prod

# Monitor Firebase usage
# Firebase Console → Usage
```

### Rollback (If Issues)

```bash
# If deployment has issues:
git revert HEAD
git push origin main

# Vercel auto-redeploys previous version
```

---

## Performance Tips

### Reduce Bundle Size

1. **Use dynamic imports:**
```tsx
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(
  () => import('@/components/HeavyComponent'),
  { loading: () => <p>Loading...</p> }
)
```

2. **Analyze bundle:**
```bash
npm run analyze
# Opens bundle report in browser
```

3. **Remove unused dependencies:**
```bash
npm list --depth=0
# Remove unused packages
npm uninstall package-name
```

### Improve Load Times

1. **Enable caching:**
```typescript
// next.config.js
headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable'
        }
      ]
    }
  ]
}
```

2. **Compress images:**
```bash
npm install sharp
# Next.js uses it automatically
```

### Database Optimization

1. **Use Firestore indexes:**
   - Firebase Console → Firestore → Indexes
   - Add composite indexes for frequently filtered queries

2. **Limit query results:**
```typescript
.collection('submissions')
.orderBy('timestamp', 'desc')
.limit(50)  // Get only 50 latest
.get()
```

---

## Summary Checklist

Before going live, ensure:

- [ ] All environment variables are set
- [ ] Firebase project is created and secured
- [ ] Email service is configured (Resend or SendGrid)
- [ ] Admin password is set (strong, 8+ characters)
- [ ] JWT secret is set (32+ characters)
- [ ] All tests pass (`npm run type-check` && `npm run lint`)
- [ ] Production build works (`npm run build`)
- [ ] Form submits successfully
- [ ] Admin login works
- [ ] Emails are sent
- [ ] Submissions appear in dashboard
- [ ] Database is backed up
- [ ] Security rules are in place
- [ ] Rate limiting is active
- [ ] Monitoring is set up

---

## Resources

| Resource | Link |
|----------|------|
| Next.js Documentation | https://nextjs.org/docs |
| React Documentation | https://react.dev |
| TypeScript Handbook | https://www.typescriptlang.org/docs/ |
| Tailwind CSS | https://tailwindcss.com/docs |
| Framer Motion | https://www.framer.com/motion/ |
| Firebase Docs | https://firebase.google.com/docs |
| Vercel Deployment | https://vercel.com/docs |

---

## Support

For issues or questions:

1. Check this guide's Troubleshooting section
2. Read the project's README.md
3. Check Firebase documentation
4. Check Next.js documentation
5. Search GitHub issues

---

**Document Version:** 1.0  
**Last Updated:** January 15, 2026  
**Author:** TikCredit Pro Development Team
