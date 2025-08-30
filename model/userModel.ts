export interface UserDB{
    first_name: string | null;
    last_name: string | null;
    company_name: string | null;
    user_name: string | null;
    email: string;
    password_hash: string | null;
    roles: string
    verified: boolean;
    profile_image: string | null;
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
    password: string
}