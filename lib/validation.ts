/**
 * Modul Validasi 4 Jenis:
 * 1. Existence Check: Memastikan kolom wajib tidak boleh kosong
 * 2. Data Type Check: Memastikan tipe data sesuai (contoh: angka, string, integer)
 * 3. Domain Check: Memastikan nilai dalam batas yang valid (contoh: jumlah > 0, pilihan enum)
 * 4. Format Check: Memastikan format sesuai pola (contoh: email valid, nomor telepon Indonesia 08...)
 */

export interface ValidationRule {
  field: string;
  label: string;
  value: any;
  required?: boolean;
  dataType?: 'string' | 'number' | 'integer' | 'phone' | 'email';
  domain?: {
    min?: number;
    max?: number;
    allowedValues?: (string | number)[];
  };
  format?: 'email' | 'phone_id' | 'alphanumeric';
  customValidator?: (val: any) => string | null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  firstError: string | null;
}

export function validateInput(rule: ValidationRule): string | null {
  const { label, value, required, dataType, domain, format, customValidator } = rule;

  // 1. EXISTENCE CHECK
  const isEmpty = value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
  if (required && isEmpty) {
    return `${label} wajib diisi dan tidak boleh kosong.`;
  }

  // Jika tidak required dan nilainya kosong, lewati validasi lainnya
  if (isEmpty) {
    return null;
  }

  // 2. DATA TYPE CHECK
  if (dataType === 'number' || dataType === 'integer') {
    const num = Number(value);
    if (isNaN(num)) {
      return `${label} harus berupa angka yang valid.`;
    }
    if (dataType === 'integer' && !Number.isInteger(num)) {
      return `${label} harus berupa bilangan bulat tanpa desimal.`;
    }
  }

  if (dataType === 'phone') {
    const digitsOnly = String(value).replace(/[\s-]/g, '');
    if (!/^\+?[0-9]+$/.test(digitsOnly)) {
      return `${label} harus berupa angka nomor telepon.`;
    }
  }

  // 3. DOMAIN CHECK
  if (domain) {
    const numVal = Number(value);
    if (domain.min !== undefined && numVal < domain.min) {
      return `${label} minimal harus bernilai ${domain.min}.`;
    }
    if (domain.max !== undefined && numVal > domain.max) {
      return `${label} maksimal boleh bernilai ${domain.max}.`;
    }
    if (domain.allowedValues && !domain.allowedValues.includes(value)) {
      return `${label} harus salah satu dari: ${domain.allowedValues.join(', ')}.`;
    }
  }

  // 4. FORMAT CHECK
  if (format === 'email' || dataType === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(value).trim())) {
      return `${label} tidak valid. Format harus sesuai (contoh: user@domain.com).`;
    }
  }

  if (format === 'phone_id') {
    const cleanPhone = String(value).replace(/[\s-]/g, '');
    const phoneRegex = /^(\+62|62|08)[0-9]{8,13}$/;
    if (!phoneRegex.test(cleanPhone)) {
      return `${label} harus format nomor Indonesia yang valid (contoh: 08123456789 atau +628123456789).`;
    }
  }

  // Custom validator
  if (customValidator) {
    const customErr = customValidator(value);
    if (customErr) return customErr;
  }

  return null;
}

export function validateForm(rules: ValidationRule[]): ValidationResult {
  const errors: Record<string, string> = {};

  for (const rule of rules) {
    const err = validateInput(rule);
    if (err) {
      errors[rule.field] = err;
    }
  }

  const errorKeys = Object.keys(errors);
  return {
    isValid: errorKeys.length === 0,
    errors,
    firstError: errorKeys.length > 0 ? errors[errorKeys[0]] : null,
  };
}
