import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface GameDetails {
    genre: string;
    platforms: string;
    releaseDate: string;
}
export type AdminResult = {
    __kind__: "error";
    error: string;
} | {
    __kind__: "success";
    success: null;
};
export interface UserProfile {
    name: string;
}
export enum UpdateContentResult {
    notAdmin = "notAdmin",
    success = "success"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    disablePasswordProtection(): Promise<AdminResult>;
    enablePasswordProtection(password: string): Promise<AdminResult>;
    getAboutText(): Promise<string>;
    getAdminStatus(): Promise<boolean>;
    getBodyTextColor(): Promise<string>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDeveloperLink(): Promise<string>;
    getFeatures(): Promise<Array<string>>;
    getGameDetails(): Promise<GameDetails>;
    getGameTitle(): Promise<string>;
    getInstagramLink(): Promise<string>;
    getPressEmail(): Promise<string>;
    getTagline(): Promise<string>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeAdmin(adminToken: string, userProvidedToken: string): Promise<AdminResult>;
    isAdmin(principal: Principal): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateAboutText(text: string): Promise<UpdateContentResult>;
    updateBodyTextColor(color: string): Promise<UpdateContentResult>;
    updateDeveloperLink(url: string): Promise<UpdateContentResult>;
    updateFeatures(items: Array<string>): Promise<UpdateContentResult>;
    updateGameDetails(genre: string, platforms: string, releaseDate: string): Promise<UpdateContentResult>;
    updateGameTitle(title: string): Promise<UpdateContentResult>;
    updateInstagramLink(url: string): Promise<UpdateContentResult>;
    updatePressEmail(email: string): Promise<UpdateContentResult>;
    updateTagline(newTagline: string): Promise<UpdateContentResult>;
    verifyPassword(password: string): Promise<boolean>;
}
