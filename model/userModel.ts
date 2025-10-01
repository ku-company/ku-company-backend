export interface UserDB{
    first_name: string | null;
    last_name: string | null;
    company_name: string | null;
    user_name: string | null;
    email: string;
    password_hash: string | null;
    role: string
    verified: boolean;
    status: string;
    profile_image: string | null;
    employeeProfile?: object | null;
    companyProfile?: object | null;
}

export interface sign_up_input {
    first_name: string;
    last_name: string;
    company_name?: string;
    email: string;
    role: string;
    user_name: string;
    password: string;
    confirm_password: string;
}

export interface sign_up_company_input{
    company_name: string;
    email: string;
    user_name: string;
    role: string;
    password: string;
    confirm_password: string;
}

export interface Login {
    user_name: string;
    password: string;
}

export interface UserOauth {
  id: number;
  first_name: string;
  last_name: string;
  user_name: string;
  email: string;
  password_hash: string | null;
  role: string;
  verified: boolean;
  profile_image: string;
  created_at: Date;
  updated_at: Date;
}

export interface CompanyProfileDB {
    id: number;
    user_id: number;
    company_name: string;
    description: string;
    industry: string;
    tel: string;
    location: string;

}
