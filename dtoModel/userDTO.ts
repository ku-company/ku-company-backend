
export interface UserDTO{
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    roles: string;
    verified: boolean;
    profile_image: string | null;
}