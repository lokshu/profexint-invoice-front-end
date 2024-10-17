"use client";

import { AuthBindings } from "@refinedev/core";
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const authProvider: AuthBindings = {

    login: async ({ email, password, remember }) => {
        try {
            const response = await fetch(`${API_URL}/api/v1/token/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            Cookies.set("auth", JSON.stringify(data), {
                expires: remember ? 30 : 1, // 30 days or 1 day based on the remember option
                path: "/",
            });

            return {
                success: true,
                redirectTo: "/",
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    name: "LoginError",
                    message: "Invalid username or password",
                },
            };
        }
    },
    logout: async () => {
        Cookies.remove("auth", { path: "/" });
        return {
            success: true,
            redirectTo: "/login",
        };
    },
    check: async () => {
        const auth = Cookies.get("auth");
        if (auth) {
            return {
                authenticated: true,
            };
        }

        return {
            authenticated: false,
            logout: true,
            redirectTo: "/login",
        };
    },
    getPermissions: async () => {
        const auth = Cookies.get("auth");
        if (auth) {
            const parsedUser = JSON.parse(auth);
            return parsedUser.roles;
        }
        return null;
    },
    getIdentity: async () => {
        const auth = Cookies.get("auth");
        if (auth) {
            const parsedUser = JSON.parse(auth);
            return parsedUser;
        }
        return null;
    },
    // onError: async (error) => {
    //     if (error.response?.status === 401) {
    //         return {
    //             logout: true,
    //         };
    //     }
    //
    //     return { error };
    // },
    onError: async (error) => {
        // Check if the error is due to an expired access token
        if (error?.response?.status === 401 || error.status === 401) {
            try {
                // Attempt to refresh the access token using the refresh token
                const auth = Cookies.get("auth");
                if (!auth) {
                    // No auth information available, proceed to logout
                    return { logout: true };
                }

                const parsedAuth = JSON.parse(auth);
                const refreshToken = parsedAuth.refresh;

                const response = await fetch(`${API_URL}/api/v1/token/refresh/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refresh: refreshToken }),
                });

                if (!response.ok) {
                    // If the refresh attempt fails, logout
                    throw new Error('Unable to refresh token');
                }

                const data = await response.json();

                // Update the auth cookie with the new access token
                Cookies.set("auth", JSON.stringify({
                    ...parsedAuth, // Preserve other data
                    access: data.access, // Update access token
                }), {
                    expires: 30, // Adjust according to your auth logic
                    path: "/",
                });

                // Indicate that the original request should be retried
                return { retry: true };

            } catch (refreshError) {
                // If token refresh fails, proceed to logout
                return { logout: true };
            }
        }

        // Return the error for all other cases
        return { error };
    },

};
