
export interface UserDTO{
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    roles: string;
    verified: boolean;
    profile_image: string | null;
}

export interface LoginResponse{
    access_token: string;
    refresh_token: string;
    user_name: string;
    roles: string;
    email: string;
}

export interface RefreshTokenRequest {
    token: string
}