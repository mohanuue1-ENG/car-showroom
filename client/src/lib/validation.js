export const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// At least 8 characters, with a letter and a number (matches the API rule)
export const isStrongPassword = (pw) => pw.length >= 8 && /[A-Za-z]/.test(pw) && /\d/.test(pw);
export const PASSWORD_HINT = 'At least 8 characters, including a letter and a number.';
