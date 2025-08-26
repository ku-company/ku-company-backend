export interface UserDB{
    first_name: string;
    last_name: string;
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
    email: string;
    role: string;
    user_name: string;
    password: string;
    confirm_password: string;
}

export interface Login {
    user_name: string;
    password: string
}