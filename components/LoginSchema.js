
import * as Yup from "yup";

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email("البريد الإلكتروني غير صالح")
    .required("البريد الإلكتروني مطلوب"),
  password: Yup.string()
    .min(6, "كلمة المرور قصيرة جدًا")
    .required("كلمة المرور مطلوبة"),
});

export default loginSchema;
