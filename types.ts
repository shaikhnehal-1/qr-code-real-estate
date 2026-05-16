export enum ProjectStatus {
  COMPLETED = 'Completed',
  ONGOING = 'Ongoing',
  UPCOMING = 'Upcoming'
}

export enum Profession {
  CORPORATE = 'CORPORATE JOB',
  GOVT = 'GOVT SERVICE',
  BUSINESS = 'BUSINESS',
  FREELANCE = 'FREELANCE'
}

export enum Purpose {
  INVESTMENT = 'Investment',
  SELF_USE = 'Self Use',
  ROI = 'ROI',
  BUSINESS = 'Business purpose'
}

export enum Specification {
  BHK1 = '1 BHK',
  BHK2 = '2 BHK',
  BHK3 = '3 BHK',
  OTHER = 'Other'
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  location: string;
  images: string[];
  type: string;
  createdAt: number;
}

export interface Lead {
  id?: string;
  name: string;
  contact: string;
  email?: string;
  projectName: string;
  specifications: Specification;
  budget: number;
  purpose: Purpose;
  profession: Profession;
  location: string;
  ageBracket?: string;
  preferredTimeline?: string;
  createdAt: any; // Firestore Timestamp or number
}
