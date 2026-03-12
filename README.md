# SmartCV

SmartCV is a minimal, professional, and aesthetic AI-powered resume and job application assistant. It uses a modern web stack to provide a seamless "glassmorphism" UI with advanced AI features for tailoring resumes to specific job contexts.

## 🚀 Tech Stack Breakdown

### 1. Framework & Core UI
- **Next.js (App Router):** The foundation of the application, utilizing React Server Components (RSC) and standard client components.
- **React 18:** The core UI library.
- **TypeScript:** Ensuring strict type safety across all frontend and backend routes.
- **Tailwind CSS:** The utility-first styling layer, used heavily for typography, spacing, and rapid layout design.
- **Framer Motion:** Powering the micro-animations, page transitions, and smooth rendering effects (like the floating kanban boards and fade-in components).
- **Lucide React:** A beautiful, lightweight icon library used consistently throughout the dashboard and landing pages.

### 2. Authentication
- **NextAuth.js (Auth.js):** Managing secure sessions and authentication flows.
- **Google OAuth:** Allowing users to sign in instantly with their Google accounts (`GoogleProvider`).
- **Credentials Provider:** A fallback email/password authentication system.
- **Bcryptjs:** For hashing and securely storing standard passwords.

### 3. Database & Backend
- **Prisma ORM:** The absolute source of truth for database schema and type-safe querying.
- **SQLite:** The local development database (defined in `dev.db`), easily swappable to PostgreSQL or MySQL for production.
- **Next.js API Routes (Route Handlers):** Serverless backend functions handling profile saving (`/api/profile`), fetching, and AI integration.

### 4. AI & Resume Generation
- **Google Generative AI SDK (`@google/generative-ai`):** The backbone of the smart features.
- **Gemini 2.5 Flash (`gemini-2.5-flash`):** The lightning-fast LLM used to:
  1. *Scrape & Parsed LinkedIn Profiles:* Simulating the extraction of structured JSON profile data directly from a LinkedIn URL.
  2. *Resume Tailoring:* Analyzing a target job description and rewriting the user's master experience bullet points to natively inject keywords and maximize ATS compatibility.
- **React-to-Print:** A powerful library used to inject the dynamic React state into a hidden, perfectly scaled A4 CSS layout (`210mm x 297mm`) and natively trigger the browser's PDF export dialog.

## 📁 Key Features & Architecture

1. **Dark-Mode Glass Aesthetics:** The UI is globally themed with a dark mode by default (`mesh-bg` class) and heavily utilizes CSS backdrop blurs (`backdrop-blur-md`, `bg-background/50`) to create a floating "glass" effect inspired by Apple, Stripe, and Linear.
2. **Master Profile State:** Users input their core details *once*. The application saves this master profile object to the SQLite database.
3. **Dynamic PDF Rendering:** The `ResumePreview` component sits invisibly on the DOM, constantly reflecting the active state of the Master Profile. When the user requests a PDF, the AI modifies the state slightly to match a job, and the browser cleanly "prints" that invisible DOM element directly to a local, 1-page constrained PDF.
4. **Kanban Application Tracker:** An animated, draggable-style UI for organizing job applications in columns (Wishlist, Applied, Interview, Offer, Rejected).

## 🛠️ Local Development

1. Ensure you have Node.js installed.
2. Run `npm install` to install dependencies.
3. Copy `.env.example` to `.env` and fill in:
   - `GEMINI_API_KEY` (From Google AI Studio)
   - `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` (For OAuth)
   - `NEXTAUTH_SECRET` (Any long random string)
4. Initialize the database schema: `npx prisma db push`
5. Start the development server: `npm run dev`
6. Open http://localhost:3000

*Developed by SpyderByte (Allan Joe Joseph, Saurav Venu, Amrita Shajikumar)*
