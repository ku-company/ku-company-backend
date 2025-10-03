
export interface UserDTO{
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    role: string;
    verified: boolean;
    status: string;
    profile_image: string | null;
    employee_profile?: object | null;
    company_profile?: object | null;
}

export interface UserCompanyDTO {
    id: number;
    company_name: string;
    email: string;
    role: string;
    verified: boolean;
    status: string;
    profile_image: string | null;
    company_profile?: object | null;
}

export interface LoginResponse{
    id: number;
    access_token: string;
    refresh_token: string;
    user_name: string;
    role: string;
    email: string;
    verified: boolean;
}

export interface RefreshTokenRequest {
    token: string
}

export interface CompanyProfileDTO {
    user_id: number;
    company_name: string;
    description: string;
    industry: string;
    tel: string;
    location: string;
    
}