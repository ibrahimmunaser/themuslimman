/**
 * Username Generation Utility
 * 
 * Generates usernames from full names in format: firstInitial + lastName
 * Example: "Ibrahim Munaser" -> "imunaser"
 * 
 * Handles duplicates by appending numbers: imunaser, imunaser1, imunaser2, etc.
 */

import { prisma } from "./db";

/**
 * Generate a username from a full name
 * Format: firstInitial + lastName (all lowercase, no spaces)
 * Example: "Ibrahim Munaser" -> "imunaser"
 */
function generateBaseUsername(fullName: string): string {
  const nameParts = fullName.trim().split(/\s+/);
  
  if (nameParts.length === 0) {
    throw new Error("Invalid name provided");
  }
  
  // Handle single name (just use it as is)
  if (nameParts.length === 1) {
    return nameParts[0].toLowerCase().replace(/[^a-z0-9]/g, "");
  }
  
  // First name initial
  const firstInitial = nameParts[0].charAt(0).toLowerCase();
  
  // Last name (everything after first name)
  const lastName = nameParts.slice(1).join("").toLowerCase();
  
  // Remove any non-alphanumeric characters
  const cleanLastName = lastName.replace(/[^a-z0-9]/g, "");
  
  return `${firstInitial}${cleanLastName}`;
}

/**
 * Check if a username exists in the database
 */
async function usernameExists(username: string): Promise<boolean> {
  const existing = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });
  return existing !== null;
}

/**
 * Generate a unique username for a user
 * If base username exists, appends incrementing numbers until unique
 * 
 * Example: 
 * - "Ibrahim Munaser" -> "imunaser"
 * - If taken -> "imunaser1"
 * - If taken -> "imunaser2"
 * - etc.
 */
export async function generateUniqueUsername(fullName: string): Promise<string> {
  const baseUsername = generateBaseUsername(fullName);
  
  // Try base username first
  const baseExists = await usernameExists(baseUsername);
  if (!baseExists) {
    return baseUsername;
  }
  
  // If base exists, try with numbers
  let counter = 1;
  let candidateUsername = `${baseUsername}${counter}`;
  
  while (await usernameExists(candidateUsername)) {
    counter++;
    candidateUsername = `${baseUsername}${counter}`;
    
    // Safety check to prevent infinite loop
    if (counter > 9999) {
      throw new Error(`Could not generate unique username for ${fullName}`);
    }
  }
  
  return candidateUsername;
}

/**
 * Validate a full name for username generation
 */
export function validateFullName(fullName: string): { valid: boolean; error?: string } {
  const trimmed = fullName.trim();
  
  if (!trimmed) {
    return { valid: false, error: "Name is required" };
  }
  
  if (trimmed.length < 2) {
    return { valid: false, error: "Name must be at least 2 characters" };
  }
  
  if (trimmed.length > 100) {
    return { valid: false, error: "Name is too long (max 100 characters)" };
  }
  
  // Check for at least some letters
  if (!/[a-zA-Z]/.test(trimmed)) {
    return { valid: false, error: "Name must contain at least one letter" };
  }
  
  return { valid: true };
}

/**
 * Preview what username will be generated (without checking database)
 * Useful for showing users what their username will be before signup
 */
export function previewUsername(fullName: string): string {
  return generateBaseUsername(fullName);
}

// Examples for testing
export const examples = {
  "Ibrahim Munaser": "imunaser",
  "John Smith": "jsmith",
  "Sarah Johnson": "sjohnson",
  "Muhammad Ali": "mali",
  "A B": "ab",
  "OneNameOnly": "onenameonly",
  "José García": "jgarcia", // Accents removed
  "Mary-Jane Watson": "mjwatson", // Hyphens removed
  "Dr. Ahmed Hassan": "dahmed", // First initial from "Dr", last name from rest
};
