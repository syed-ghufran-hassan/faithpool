import { useState, useCallback } from 'react';

interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  min?: number;
  max?: number;
  custom?: (value: string) => string | null;
}

interface FieldConfig {
  [key: string]: ValidationRules;
}

interface FormErrors {
  [key: string]: string | null;
}

interface UseFormResult<T> {
  values: T;
  errors: FormErrors;
  touched: { [key: string]: boolean };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  setFieldValue: (field: string, value: string | number) => void;
  validateField: (field: string) => string | null;
  validateForm: () => boolean;
  resetForm: () => void;
  isValid: boolean;
}

function useForm<T extends Record<string, string | number>>(
  initialValues: T,
  validationRules: FieldConfig = {}
): UseFormResult<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const validateField = useCallback((field: string): string | null => {
    const rules = validationRules[field];
    const value = String(values[field] || '');

    if (!rules) return null;

    if (rules.required && !value.trim()) {
      return 'This field is required';
    }

    if (rules.minLength && value.length < rules.minLength) {
      return `Must be at least ${rules.minLength} characters`;
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return `Must be no more than ${rules.maxLength} characters`;
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      return 'Invalid format';
    }

    if (rules.min !== undefined && Number(value) < rules.min) {
      return `Must be at least ${rules.min}`;
    }

    if (rules.max !== undefined && Number(value) > rules.max) {
      return `Must be no more than ${rules.max}`;
    }

    if (rules.custom) {
      return rules.custom(value);
    }

    return null;
  }, [values, validationRules]);

  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const error = validateField(name);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  }, [touched, validateField]);

  const handleBlur = useCallback((
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name);
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, [validateField]);

  const setFieldValue = useCallback((field: string, value: string | number) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    const newTouched: { [key: string]: boolean } = {};
    let isValid = true;

    Object.keys(validationRules).forEach((field) => {
      newTouched[field] = true;
      const error = validateField(field);
      newErrors[field] = error;
      if (error) isValid = false;
    });

    setErrors(newErrors);
    setTouched(newTouched);
    return isValid;
  }, [validationRules, validateField]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const isValid = Object.values(errors).every((error) => !error);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setFieldValue,
    validateField,
    validateForm,
    resetForm,
    isValid,
  };
}

export default useForm;
