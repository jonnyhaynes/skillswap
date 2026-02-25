export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  avatarUrl: string | null;
  bio: string;
  neighbourhood: string;
  postcode?: string;
  joinedAt: string;
  lastSeenAt: string | null;
  isVerifiedNeighbour: boolean;
  skillsOffered: string[];
  skillsWanted: string[];
}

export interface UserProfile extends User {
  averageRating: number;
  totalReviews: number;
  totalSwapsCompleted: number;
}
