import * as yup from "yup";

const registerSchema = yup.object().shape({
  name: yup.string().required("Name is required."),
  email: yup.string().email("Invalid email.").required("Email is required."),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters.")
    .required("Password is required."),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords do not match.")
    .required("Confirm password is required."),
});

export default registerSchema;
