/**
 * Adaptive Enrollment Form Component
 * 
 * This component demonstrates how enrollment forms adapt based on class settings.
 * It reads the class's audienceType and requiresGuardian settings to show appropriate fields.
 * 
 * Usage in different contexts:
 * - Public class join (with join code)
 * - Admin manual enrollment
 * - Self-registration flows
 * 
 * The form adapts to show:
 * - Guardian fields for children/requiresGuardian classes
 * - Simplified fields for adult-only classes
 * - Family registration fields for family classes
 */

"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ClassSettings {
  id: string;
  title: string;
  audienceType: "children" | "teens" | "adults" | "family" | "mixed";
  requiresGuardian: boolean;
  genderRestriction?: "male" | "female" | null;
  ageMin?: number | null;
  ageMax?: number | null;
  capacity?: number | null;
}

interface AdaptiveEnrollmentFormProps {
  classSettings: ClassSettings;
  onSubmit: (data: EnrollmentData) => Promise<void>;
  mode?: "self-join" | "admin-enroll";
}

export interface EnrollmentData {
  // Student/Participant info
  fullName: string;
  email?: string;
  dateOfBirth?: string;
  
  // Guardian info (conditional)
  guardianName?: string;
  guardianEmail?: string;
  guardianPhone?: string;
  guardianRelationship?: string;
  
  // Family enrollment (conditional)
  householdContact?: string;
  householdEmail?: string;
  householdPhone?: string;
  numChildren?: number;
  numAdults?: number;
}

export function AdaptiveEnrollmentForm({ 
  classSettings, 
  onSubmit, 
  mode = "self-join" 
}: AdaptiveEnrollmentFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<EnrollmentData>({
    fullName: "",
    email: "",
  });

  const needsGuardianInfo = classSettings.requiresGuardian || classSettings.audienceType === "children";
  const isFamilyClass = classSettings.audienceType === "family";
  const isAdultClass = classSettings.audienceType === "adults";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to enroll. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function updateField(field: keyof EnrollmentData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormData({ ...formData, [field]: e.target.value });
    };
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Class info header */}
      <div className="bg-surface border border-border rounded-xl p-4">
        <h3 className="text-lg font-semibold text-text">{classSettings.title}</h3>
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="px-2 py-1 rounded-full text-xs bg-gold/10 text-gold border border-gold/20 capitalize">
            {classSettings.audienceType}
          </span>
          {classSettings.genderRestriction && (
            <span className="px-2 py-1 rounded-full text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 capitalize">
              {classSettings.genderRestriction} only
            </span>
          )}
          {(classSettings.ageMin || classSettings.ageMax) && (
            <span className="px-2 py-1 rounded-full text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Ages {classSettings.ageMin || "any"}-{classSettings.ageMax || "any"}
            </span>
          )}
        </div>
      </div>

      {/* Family enrollment flow */}
      {isFamilyClass && (
        <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-text mb-1">Household Contact Information</h4>
            <p className="text-xs text-text-muted mb-4">
              This class is for families. Please provide household contact information.
            </p>
          </div>

          <Input
            label="Primary contact name"
            value={formData.householdContact || ""}
            onChange={updateField("householdContact")}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Email"
              type="email"
              value={formData.householdEmail || ""}
              onChange={updateField("householdEmail")}
            />
            <Input
              label="Phone"
              type="tel"
              value={formData.householdPhone || ""}
              onChange={updateField("householdPhone")}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Number of children"
              type="number"
              min="0"
              value={formData.numChildren || ""}
              onChange={updateField("numChildren")}
            />
            <Input
              label="Number of adults"
              type="number"
              min="0"
              value={formData.numAdults || ""}
              onChange={updateField("numAdults")}
            />
          </div>
        </div>
      )}

      {/* Standard participant info (for non-family classes) */}
      {!isFamilyClass && (
        <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-text mb-1">
              {isAdultClass ? "Your Information" : "Participant Information"}
            </h4>
            <p className="text-xs text-text-muted mb-4">
              {isAdultClass 
                ? "Enter your details to enroll in this class." 
                : needsGuardianInfo
                ? "Enter the student's information."
                : "Enter participant details."}
            </p>
          </div>

          <Input
            label="Full name"
            value={formData.fullName}
            onChange={updateField("fullName")}
            required
          />

          {!needsGuardianInfo && (
            <Input
              label="Email address"
              type="email"
              value={formData.email || ""}
              onChange={updateField("email")}
            />
          )}

          {(needsGuardianInfo || classSettings.ageMin || classSettings.ageMax) && (
            <Input
              label="Date of birth"
              type="date"
              value={formData.dateOfBirth || ""}
              onChange={updateField("dateOfBirth")}
              required={needsGuardianInfo}
            />
          )}
        </div>
      )}

      {/* Guardian info section (for children/requiresGuardian classes) */}
      {needsGuardianInfo && !isFamilyClass && (
        <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-text mb-1">Guardian/Parent Information</h4>
            <p className="text-xs text-text-muted mb-4">
              This class requires guardian contact information for enrollment.
            </p>
          </div>

          <Input
            label="Guardian name"
            value={formData.guardianName || ""}
            onChange={updateField("guardianName")}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Guardian email"
              type="email"
              value={formData.guardianEmail || ""}
              onChange={updateField("guardianEmail")}
              required
            />
            <Input
              label="Phone"
              type="tel"
              value={formData.guardianPhone || ""}
              onChange={updateField("guardianPhone")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Relationship to student
            </label>
            <select
              value={formData.guardianRelationship || ""}
              onChange={updateField("guardianRelationship")}
              className="w-full px-4 py-3 rounded-lg bg-surface border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all"
            >
              <option value="">Select relationship</option>
              <option value="mother">Mother</option>
              <option value="father">Father</option>
              <option value="guardian">Legal Guardian</option>
              <option value="grandparent">Grandparent</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Submit button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={loading}
        className="w-full justify-center"
      >
        {mode === "self-join" ? "Join class" : "Enroll participant"}
      </Button>

      {/* Capacity warning */}
      {classSettings.capacity && (
        <p className="text-xs text-center text-text-muted">
          This class has a capacity limit of {classSettings.capacity} participants.
        </p>
      )}
    </form>
  );
}
