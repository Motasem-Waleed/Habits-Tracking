
import * as Yup from "yup";

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Email is not valid")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password is too short")
    .required("Password is required"),
});

export default loginSchema;
