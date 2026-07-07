import { collection, doc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "./config";
import { Complaint, CommunityVote, WeeklySummary, DevelopmentRecommendation } from "../../types";

const sampleComplaints: Complaint[] = [
  {
    title: "Large pothole on main road",
    description: "There is a massive pothole causing traffic slowdowns and potential accidents near the school.",
    category: "roads",
    severity: "high",
    priorityScore: 85,
    status: "reported",
    location: {
      lat: 17.6868,
      lng: 83.2185,
      address: "Main Road, Near School, Madhurawada",
      ward: "2"
    },
    imageURLs: [],
    voiceURL: null,
    createdBy: "dummy_user_1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    title: "Overflowing garbage bins",
    description: "Garbage hasn't been collected for 3 days. It's overflowing onto the street and smells terrible.",
    category: "sanitation",
    severity: "medium",
    priorityScore: 60,
    status: "under_review",
    location: {
      lat: 17.6880,
      lng: 83.2200,
      address: "Residential Area, Kondapeta",
      ward: "1"
    },
    imageURLs: [],
    voiceURL: null,
    createdBy: "dummy_user_2",
    createdAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
    updatedAt: new Date(Date.now() - 86400000 * 1),
  },
  {
    title: "Broken streetlights",
    description: "The streetlights on this lane have been broken for a week. It's completely dark and unsafe at night.",
    category: "electricity",
    severity: "high",
    priorityScore: 75,
    status: "reported",
    location: {
      lat: 17.6900,
      lng: 83.2150,
      address: "Lane 4, Marikavalasa",
      ward: "3"
    },
    imageURLs: [],
    voiceURL: null,
    createdBy: "dummy_user_3",
    createdAt: new Date(Date.now() - 86400000 * 5),
    updatedAt: new Date(Date.now() - 86400000 * 5),
  }
];

const sampleVotes: Omit<CommunityVote, 'id'>[] = [
  {
    complaintId: "dummy_complaint_1", // Will be replaced in seed script
    userId: "dummy_user_4",
    vote: "yes",
    timestamp: new Date()
  },
  {
    complaintId: "dummy_complaint_1",
    userId: "dummy_user_5",
    vote: "yes",
    timestamp: new Date()
  },
  {
    complaintId: "dummy_complaint_2",
    userId: "dummy_user_6",
    vote: "no",
    timestamp: new Date()
  }
];

const sampleWeeklySummary: WeeklySummary = {
  id: "week_current",
  weekOf: "2026-07-06",
  majorIssues: [
    "High volume of road complaints in Madhurawada following recent rains.",
    "Recurring sanitation delays reported in Kondapeta.",
    "Streetlight outages causing safety concerns in Marikavalasa."
  ],
  topAreas: ["Madhurawada (Ward 2)", "Kondapeta (Ward 1)"],
  recommendedActions: [
    "Deploy emergency road repair teams to Madhurawada main roads.",
    "Audit garbage collection contractor schedules for Ward 1.",
    "Schedule streetlight maintenance sweep for Ward 3."
  ],
  generatedAt: new Date()
};

export const seedDatabase = async () => {
  try {
    console.log("Starting database seeding...");

    // Seed Complaints
    const complaintRefs = [];
    for (let i = 0; i < sampleComplaints.length; i++) {
      const newComplaintRef = doc(collection(db, "complaints"));
      complaintRefs.push(newComplaintRef.id);
      await setDoc(newComplaintRef, {
        ...sampleComplaints[i],
        createdAt: Timestamp.fromDate(sampleComplaints[i].createdAt),
        updatedAt: Timestamp.fromDate(sampleComplaints[i].updatedAt),
      });
    }
    console.log("Complaints seeded.");

    // Seed Votes
    for (let i = 0; i < sampleVotes.length; i++) {
      const newVoteRef = doc(collection(db, "communityVotes"));
      const targetComplaintId = complaintRefs[i % complaintRefs.length]; // Distribute votes
      await setDoc(newVoteRef, {
        ...sampleVotes[i],
        complaintId: targetComplaintId,
        timestamp: Timestamp.fromDate(sampleVotes[i].timestamp),
      });
    }
    console.log("Community Votes seeded.");

    // Seed Weekly Summary
    await setDoc(doc(db, "weeklySummaries", sampleWeeklySummary.id), {
      ...sampleWeeklySummary,
      generatedAt: Timestamp.fromDate(sampleWeeklySummary.generatedAt)
    });
    console.log("Weekly Summary seeded.");

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};
