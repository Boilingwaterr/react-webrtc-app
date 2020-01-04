export const maxLength = max => value =>
  value && value.length > max ? `Must be ${max} characters or less` : undefined;


const minLength = min => value =>
  value && value.length < min ? `Must be ${min} characters or more` : undefined;

export const minLength3 = minLength(3);