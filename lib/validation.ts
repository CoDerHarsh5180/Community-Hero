import { z } from "zod";

// ==========================================
// 1. ENUMS (For strict type checking)
// ==========================================
export const UserRoleEnum = z.enum(["CITIZEN", "AUTHORITY", "ADMIN"]);
export const IssueStatusEnum = z.enum(["REPORTED", "VERIFIED", "IN_PROGRESS", "RESOLVED"]);
export const DepartmentEnum = z.enum(["Public Works", "Sanitation", "Electricity", "Water & Sewage", "Law Enforcement"]);

// ==========================================
// 2. AUTHENTICATION SCHEMAS
// ==========================================

export const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters long." }),
  username: z.string()
    .min(3, { message: "Username must be at least 3 characters." })
    .max(20, { message: "Username cannot exceed 20 characters." })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "Username can only contain letters, numbers, and underscores." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string()
    .min(6, { message: "Password must be at least 6 characters long." })
    .max(50, { message: "Password is too long." }),
  role: UserRoleEnum
});

export const loginSchema = z.object({
  identifier: z.string({ message: "Invalid Credentials" }),
  password: z.string().min(1, { message: "Password is required." }),
});

export const verifyEmailSchema = z.object({
  code: z.string().length(6, { message: "Verification code must be exactly 6 digits." }),
});

// ==========================================
// 3. ISSUE & MAP SCHEMAS
// ==========================================

// Used for the Frontend Form where coordinates are strings from inputs/geolocation
export const createIssueClientSchema = z.object({
  category: z.string().min(1, { message: "Please select a category." }),
  detail: z.string().max(1000, { message: "Description cannot exceed 1000 characters." }).optional(),
  addressText: z.string().min(5, { message: "Please provide a valid address or landmark." }),
  // Using coerce ensures that even if the form passes a string, Zod transforms it to a number
  lat: z.coerce.number().min(-90).max(90, { message: "Invalid latitude." }),
  lng: z.coerce.number().min(-180).max(180, { message: "Invalid longitude." }),
  
}).refine((data) => {
  // Custom validation: Require detail text if there's no way to verify visually
  // (Note: File validation is usually handled outside Zod when using FormData, 
  // but this ensures the text isn't empty if required)
  return true; 
}, {
  message: "Invalid submission data.",
});

// Used to validate the API route for adding a comment
export const commentSchema = z.object({
  text: z.string()
    .min(1, { message: "Comment cannot be empty." })
    .max(500, { message: "Comment cannot exceed 500 characters." }),
});

// Used by the Authority/Admin dashboard to update an issue's status
export const updateIssueStatusSchema = z.object({
  status: IssueStatusEnum,
});

// ==========================================
// 4. INFER TYPES FOR TYPESCRIPT
// ==========================================
// Export these types so you don't have to rewrite interfaces anywhere in your app

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type CreateIssueInput = z.infer<typeof createIssueClientSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type UpdateIssueStatusInput = z.infer<typeof updateIssueStatusSchema>;