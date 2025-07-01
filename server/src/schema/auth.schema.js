import { z } from "zod"
import { EUserRole } from "../constant/application.js"

const authSchemas = {
    register: z.object({
        emailAddress: z.string()
            .email("Please provide a valid email address")
            .toLowerCase()
            .trim(),
        phoneNumber: z.string()
            .min(1, "Phone number is required")
            .trim(),
        password: z.string()
            .min(6, "Password must be at least 6 characters long")
            .optional(),
        googleAuth: z.object({
            googleId: z.string().optional(),
            profile: z.object({
                name: z.string().optional(),
                picture: z.string().url().optional(),
                email: z.string().email().optional()
            }).optional()
        }).optional(),
        userLocation: z.object({
            lat: z.number("Latitude must be a number"),
            long: z.number("Longitude must be a number")
        }),
        role: z.enum(Object.values(EUserRole)).default(EUserRole.USER),
        consent: z.boolean()
            .refine(val => val === true, "Consent is required to proceed"),
        avatar: z.string().url().optional()
    }),

    confirmationParams: z.object({
        token: z.string().min(1, "Confirmation token is required")
    }),

    confirmationQuery: z.object({
        code: z.string().min(1, "Confirmation code is required")
    }),

    login: z.object({
        emailAddress: z.string()
            .email("Please provide a valid email address")
            .toLowerCase()
            .trim(),
        password: z.string()
            .min(1, "Password is required")
    }),

    googleLogin: z.object({
        googleId: z.string().min(1, "Google ID is required"),
        profile: z.object({
            name: z.string().min(1, "Name is required"),
            picture: z.string().url().optional(),
            email: z.string().email("Valid email is required")
        })
    }),

    refreshToken: z.object({
        refreshToken: z.string().min(1, "Refresh token is required")
    }),

    forgotPassword: z.object({
        emailAddress: z.string()
            .email("Please provide a valid email address")
            .toLowerCase()
            .trim()
    }),

    resetPassword: z.object({
        token: z.string().min(1, "Reset token is required"),
        newPassword: z.string()
            .min(6, "Password must be at least 6 characters long"),
        confirmPassword: z.string()
            .min(6, "Confirm password must be at least 6 characters long")
    }).refine(data => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"]
    }),

    changePassword: z.object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z.string()
            .min(6, "New password must be at least 6 characters long"),
        confirmPassword: z.string()
            .min(6, "Confirm password must be at least 6 characters long")
    }).refine(data => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"]
    }).refine(data => data.currentPassword !== data.newPassword, {
        message: "New password must be different from current password",
        path: ["newPassword"]
    }),

    updateProfile: z.object({
        name: z.string()
            .min(2, "Name must be at least 2 characters long")
            .max(100, "Name cannot exceed 100 characters")
            .trim()
            .optional(),
        phoneNumber: z.string()
            .min(1, "Phone number is required")
            .trim()
            .optional(),
        avatar: z.string().url("Avatar must be a valid URL").optional(),
        userLocation: z.object({
            lat: z.number("Latitude must be a number"),
            long: z.number("Longitude must be a number")
        }).optional()
    }),

    resendConfirmation: z.object({
        emailAddress: z.string()
            .email("Please provide a valid email address")
            .toLowerCase()
            .trim()
    }),

    checkEmail: z.object({
        emailAddress: z.string()
            .email("Please provide a valid email address")
            .toLowerCase()
            .trim()
    }),

    validateToken: z.object({
        token: z.string().min(1, "Token is required")
    })
}

export default authSchemas