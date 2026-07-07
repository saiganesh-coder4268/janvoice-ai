# JanVoice AI — Visakhapatnam Civic Intelligence Platform

JanVoice AI is a civic-tech platform designed specifically for Visakhapatnam (Vizag), Andhra Pradesh. It converts scattered citizen complaints into structured, AI-prioritized development intelligence for elected representatives and city officials.

## 🚀 What It Does

1. **Citizens Report Issues**: Residents can submit issues (potholes, garbage, broken streetlights) via text, voice, or photo.
2. **AI Analysis**: Google's Gemini AI automatically classifies the issue, writes a concise summary, and extracts key details.
3. **Smart Prioritization**: The system calculates a Priority Score (0-100) based on the severity of the issue, its proximity to schools or hospitals, and the real population density of the specific GVMC ward.
4. **MP Dashboard**: Elected officials view a real-time heat map of Vizag and a sorted list of the most critical issues to address first.
5. **Resolution Gallery**: Once an issue is fixed, AI verifies the "Before and After" photos, providing a public gallery of verified improvements.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui, Framer Motion
- **Backend & Database**: Firebase Authentication, Cloud Firestore
- **AI Integration**: Google Gemini 2.5 Flash API
- **Maps**: Google Maps JavaScript API (locked to Visakhapatnam coordinates)

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

## 🗺️ Project Structure

- `src/app/citizen`: The portal where citizens can track and submit new complaints.
- `src/app/mp`: The dashboard for MPs/Officials to view the Vizag map and priority list.
- `src/app/api/complaints`: The backend route that processes submissions using the Gemini AI pipeline.
- `src/components/layout`: Shared UI components like the Top Navigation bar.
- `src/lib/firebase`: Firebase configuration and the database seeder script.
- `src/lib/data`: Contains `gvmc-wards.json` with real population data for Vizag wards.

## 🤝 Contributing
This project is built as a hackathon prototype demonstrating how AI can streamline civic development and build trust between citizens and government.
