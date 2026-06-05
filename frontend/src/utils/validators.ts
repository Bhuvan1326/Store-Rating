export const validators = {
  name: (v: string): string => {
    if (!v) return 'Name is required';
    if (v.length < 20) return 'Name must be at least 20 characters';
    if (v.length > 60) return 'Name cannot exceed 60 characters';
    return '';
  },
  email: (v: string): string => {
    if (!v) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email address';
    return '';
  },
  password: (v: string): string => {
    if (!v) return 'Password is required';
    if (v.length < 8) return 'Password must be at least 8 characters';
    if (v.length > 16) return 'Password cannot exceed 16 characters';
    if (!/[A-Z]/.test(v)) return 'Password must contain at least one uppercase letter';
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(v))
      return 'Password must contain at least one special character';
    return '';
  },
  address: (v: string): string => {
    if (v && v.length > 400) return 'Address cannot exceed 400 characters';
    return '';
  },
  rating: (v: number): string => {
    if (!v) return 'Please select a rating';
    if (v < 1 || v > 5) return 'Rating must be between 1 and 5';
    return '';
  },
};

// Runs a map of field→value through validators and returns any errors found
export function validateForm(
  fields: Record<string, string | number>
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const [field, value] of Object.entries(fields)) {
    const validator = validators[field as keyof typeof validators];
    if (validator) {
      const error = (validator as (v: any) => string)(value);
      if (error) errors[field] = error;
    }
  }
  return errors;
}

// Extracts field-level errors from an API error response
export function parseApiErrors(error: any): string {
  const data = error?.response?.data;
  if (!data) return 'Something went wrong. Please try again.';
  if (Array.isArray(data.errors)) return data.errors.join(' ');
  return data.message || 'Something went wrong. Please try again.';
}
