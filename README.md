FasiliCare 🚇✨

FasiliCare is a crowdsourced public transport facility maintenance ticketing platform. Built as a Minimum Viable Product (MVP) for the ITECHNO CUP 2026 competition.

FasiliCare bridges the gap between daily commuters, facility administrators, and technicians. It empowers citizens to report facility issues (like broken escalators, dirty train cars, or urgent incidents) while preventing duplicate reports and incentivizing community participation through gamification.

🌟 Key Features

Role-Based Dashboards: Distinct interfaces for USER (Commuters), ADMIN (Triage & Assignment), and TECH (Technicians).

Smart Reporting System: Prevents duplicate reports by dynamically showing recent issues at the selected location. Includes Urgency levels (Low, Medium, High).

Community Feed & Forum: Users can upvote issues to increase visibility and comment on tickets to provide real-time updates.

Echoes (Archive Hub): A dedicated, filterable space to view resolved tickets and track maintenance history.

Gamification: Users earn "Reputation Points" for reporting (+10) and when their reported issue gets resolved (+50).

Direct Cloudinary Uploads: Fast, client-side unsigned image uploads for evidence and live proof photos.

"God Mode" Role Switcher: An exclusive, built-in testing feature allowing Project Leads to swap between roles on the fly without needing multiple accounts.

💻 Tech Stack

Framework: Next.js 14 (App Router)

Language: TypeScript

Styling: Tailwind CSS & shadcn/ui

Database: PostgreSQL (Hosted on Supabase)

ORM: Prisma

Authentication: NextAuth.js (Google Provider)

Image Storage: Cloudinary

🚀 Getting Started

Follow these steps to set up the project locally.

1. Clone the repository

git clone https://github.com/yourusername/fasilicare.git
cd fasilicare

2. Install Dependencies
Bash
npm install
3. Environment Variables
Create a .env file in the root directory and add the following variables. Do not use your real passwords in public repositories.

Code snippet
# Database (PostgreSQL via Supabase)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_super_secret_string"

# Google OAuth
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
CLOUDINARY_URL="cloudinary://API_KEY:API_SECRET@CLOUD_NAME"
4. Database Setup
Push the Prisma schema to your Supabase PostgreSQL database and generate the Prisma client:

Bash
npx prisma db push
npx prisma generate
5. Seed the Database
Populate the database with dummy locations (e.g., LRT Rasuna Said, Stasiun Manggarai) for the smart search dropdown:

Bash
npx prisma db seed
(Note: Ensure you have ts-node configured in your package.json for the seed script to run).

6. Run the Development Server
Bash
npm run dev

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 🧪 Testing (God Mode)

For presentation and testing purposes, logging in with specific Project Lead emails (e.g., `dhanny.aljael@gmail.com` or `gheageltra@gmail.com`) grants access to the **God Mode Role Switcher** in the navigation bar. This allows instant role switching between `USER`, `ADMIN`, and `TECH` to seamlessly demonstrate the entire app flow.

## 🤝 Credits
*   **Project Leads:** Dhanny & Ghea
*   **Event:** ITECHNO CUP 2026