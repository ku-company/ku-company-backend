import type { jobPost } from "@prisma/client";

export interface JobPostingFeedDTO {
  id: number;
  position: string;
  description: string;
  jobType: string;
  available_position: number;
  company_name: string | null;
  company_profile_image: string | null;
  company_location: string | null;
  company_tel: string | null;
  created_at: Date;
  updated_at: Date;
  posted_ago: string;
}

export interface companyInfoDTO {
    user_id: number;
    company_name: string | null;
    location: string | null;
    tel: string | null;
}

export type JobPostWithCompany = jobPost & { company: companyInfoDTO };