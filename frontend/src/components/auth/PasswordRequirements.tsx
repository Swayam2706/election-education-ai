/**
 * PasswordRequirements Component
 * Displays password strength requirements with visual indicators
 */

import React from 'react';
import { Check } from 'lucide-react';

interface PasswordRequirement {
  text: string;
  met: boolean;
}

interface PasswordRequirementsProps {
  password: string;
}

/**
 * PasswordRequirements - Shows password strength indicators
 * @param props - Component props
 * @returns Rendered password requirements list
 */
export const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({ password }) => {
  const requirements: PasswordRequirement[] = [
    { text: 'At least 6 characters', met: password.length >= 6 },
    { text: 'Contains letters', met: /[a-zA-Z]/.test(password) },
  ];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1">
      {requirements.map((req, index) => (
        <div key={index} className="flex items-center gap-2 text-xs">
          <Check className={`w-3 h-3 ${req.met ? 'text-green-500' : 'text-muted-foreground'}`} />
          <span className={req.met ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
            {req.text}
          </span>
        </div>
      ))}
    </div>
  );
};

export default PasswordRequirements;
