import validator from "validator";

const validatePassword = (password: string): boolean => {
  const verifyLengthRule = validator.isLength(password, { min: 8, max: 20 });
  const verifyCharRule = validator.matches(password, /[a-zA-Z0-9]/);
  return verifyLengthRule && verifyCharRule;
};

export default validatePassword;
