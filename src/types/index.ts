export type UserRole = "citizen" | "authority" | "mp" | "admin";
export type ComplaintStatus = "reported" | "under_review" | "assigned" | "resolved" | "flagged";
export type ComplaintCategory = "roads" | "water" | "health" | "sanitation" | "safety" | "electricity" | "other";
export type ComplaintSeverity = "critical" | "high" | "medium" | "low";
export type VoteType = "yes" | "no";

export interface User {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string; // If authority
  ward?: string; // GVMC ward number
  preferredLanguage?: string;
  createdAt: Date;
}

export interface Complaint {
  id?: string; // Firestore document ID
  title: string;
  description: string;
  originalLanguage?: string;
  translatedText?: string;
  category: ComplaintCategory;
  severity: ComplaintSeverity;
  priorityScore: number;
  status: ComplaintStatus;
  location: {
    lat: number;
    lng: number;
    address: string;
    ward: string; // GVMC ward number
  };
  imageURLs: string[];
  voiceURL: string | null;
  createdBy: string; // uid
  assignedTo?: string; // uid
  createdAt: Date;
  updatedAt: Date;
}

export interface AIAnalysis {
  id?: string; // Usually matches complaintId
  complaintId: string;
  summary: string;
  keywords: string[];
  duplicateOf: string | null; // complaintId or null
  confidenceScore: number;
  recommendation: string;
  priorityBreakdown: {
    frequency: number;
    severity: number;
    infrastructure: number;
    wardPopulationTier: number;
    recurrence: number;
  };
}

export interface Resolution {
  id?: string;
  complaintId: string;
  beforeImage: string;
  afterImage: string;
  verificationStatus: "Verified" | "Needs Review" | "Not Resolved";
  confidence: number;
  aiExplanation: string;
  verifiedAt: Date;
}

export interface CommunityVote {
  id?: string;
  complaintId: string;
  userId: string;
  vote: VoteType;
  comment?: string;
  timestamp: Date;
}

export interface DevelopmentRecommendation {
  id: string;
  title: string;
  reasoning: string[];
  supportingComplaintIds: string[];
  confidence: number;
  estimatedImpact: string;
  generatedAt: Date;
}

export interface WeeklySummary {
  id: string;
  weekOf: string;
  majorIssues: string[];
  topAreas: string[];
  recommendedActions: string[];
  generatedAt: Date;
}

export interface GVMCWard {
  wardNumber: string;
  wardName: string;
  localities: string[];
  population: number;
  densityTier: "Low" | "Medium" | "High";
  geoJsonRef?: string;
}
