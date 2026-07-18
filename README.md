# JanVoice AI 

> *"A city's true beauty lies not just in its landscapes, but in the civic consciousness of its people."*

## 📖 Our Story: Why We Built This

Since our childhood, we've always found ourselves comparing life in India to the pristine streets of America or other foreign nations. There has always been a quiet corner in our minds where we asked ourselves: *"Why does our country often look so polluted and dirty?"* 

For a long time, it was easy to blame the system. But as we dug deeper, we realized it wasn't just a systemic problem—somewhere, a part of us was lacking civic sense. We had grown comfortable with the chaos. 

However, times are changing. As the internet has evolved and the world has become more connected, a lot of people have realized these conditions and are bringing their manners forward. People *want* better. They just need the right platform to translate their intent into action. 

JanVoice AI was born from this exact realization. We wanted to build a bridge for this evolving mindset—a tool that empowers citizens to narrate their impactful stories of change, turning scattered complaints into actionable, prioritized intelligence for the city of Visakhapatnam.

> *"Change doesn't start by pointing fingers at the system; it starts with a single voice, empowered by technology, ready to take ownership."*

## 🎯 Core Intentions & Main Vision

Our core intention is simple: **To build trust and streamline civic development.** 
We are not just building an app to lodge complaints; we are building a civic intelligence platform. We aim to eliminate the friction between a citizen spotting an issue and the government resolving it. By removing the noise and prioritizing what truly matters, we make the system work for the people, efficiently and transparently.

---

## 🚀 Features That Drive Impact

JanVoice AI leverages cutting-edge technology to bring order to civic management:

1. **🎙️ Multi-Modal Citizen Reporting**: We know people are busy. Citizens can report issues—whether it's a dangerous pothole, overflowing garbage, or a broken streetlight—using plain text, a quick voice note, or a simple photo. 
2. **🧠 AI-Powered Analysis**: Say goodbye to manual sorting. Google's Gemini AI automatically classifies incoming issues, writes concise summaries, and extracts key details instantly, saving hundreds of human hours.
3. **🔥 Smart Prioritization Engine**: Not all problems are equal. Our system calculates a dynamic Priority Score (0-100) based on the severity of the issue, its proximity to critical infrastructure (like schools or hospitals), and the real population density of the specific GVMC ward. We tell officials exactly what to fix *first*.
4. **🗺️ The MP Dashboard**: A command center for elected officials. They get a real-time heat map of Vizag and a sorted list of the most critical issues, transforming abstract data into a clear, actionable roadmap.
5. **📸 Verified Resolution Gallery**: Trust is built on proof. Once an issue is fixed, our AI verifies the "Before and After" photos, creating a transparent, public gallery of verified civic improvements.
6. **✨ Interactive Before/After Showcase**: Our landing page features a dynamic image slider that visually showcases successful clean-ups and fixes, proving to citizens that their voice actually leads to visible change.

---

## 🛠️ Tech Stack

Built for scale, speed, and reliability:
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui, Framer Motion
- **Backend & Database**: Firebase Authentication, Cloud Firestore
- **AI Integration**: Google Gemini 2.5 Flash API
- **Maps**: Google Maps JavaScript API (locked to Visakhapatnam coordinates)

---

## ⚙️ How to Run the Project Locally

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### 2. Install Dependencies
Open your terminal, navigate into the project folder, and run:
```bash
npm install
```

### 3. Environment Variables
You need to set up your API keys for Firebase, Google Maps, and Gemini. 
1. Create a file named `.env.local` in the root of the `janvoice-ai` folder.
2. Copy the following format and fill in your actual keys:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Start the Development Server
Run the following command to start the app:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000` to view the app.

### 5. Seed the Database (Demo Only)
For a hackathon demo, you'll want some dummy data to show off the dashboard. 
Once the server is running, visit **`http://localhost:3000/seed`** and click the **"Seed Database"** button to automatically populate your Firestore with sample complaints, community votes, and a weekly summary.

---

## 🗺️ Project Structure

- `src/app/citizen`: The portal where citizens can track and submit new complaints.
- `src/app/mp`: The dashboard for MPs/Officials to view the Vizag map and priority list.
- `src/app/api/complaints`: The backend route that processes submissions using the Gemini AI pipeline.
- `src/components/layout`: Shared UI components like the Top Navigation bar.
- `src/lib/firebase`: Firebase configuration and the database seeder script.
- `src/lib/data`: Contains `gvmc-wards.json` with real population data for Vizag wards.

---

## 🤝 Join the Movement
This project is built to demonstrate how technology, specifically AI, can streamline civic development and rebuild the foundational trust between citizens and their government. It's time to stop comparing and start building.
