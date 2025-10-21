export interface CompanyProfileDB {
  id: number;
  user_id: number;
  company_name: string | null;
  description: string | null;
  industry: string | null;
  tel: string | null;
  location: string | null;
  country: string | null;
  link?: string | null; // add if exists in schema
}
