// screens/LoginScreen.js
import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Input } from "react-native-elements";
import loginSchema from "../components/LoginSchema";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";


const LoginScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const loginErrors = () => {
    setErrors({});

    loginSchema
      .validate(form, { abortEarly: false })
      .then(async () => {
        const email = form.email.trim().toLowerCase();
        const password = form.password;

        try {
          await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), form.password);

          navigation.replace("Tabs", { email });
        } catch (e) {
          // رسائل Firebase الشائعة
          let msg = "Login failed. Try again.";
          if (e?.code === "auth/invalid-credential") msg = "Wrong email or password.";
          if (e?.code === "auth/invalid-email") msg = "Invalid email.";
          if (e?.code === "auth/user-not-found") msg = "User not found.";
          if (e?.code === "auth/wrong-password") msg = "Wrong email or password.";

          setErrors({ password: msg });
        }
      })
      .catch((error) => {
        if (error.inner) {
          const errorsObject = {};
          error.inner.forEach((err) => {
            errorsObject[err.path] = err.message;
          });
          setErrors(errorsObject);
        }
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Login</Text>

      <View style={styles.formContainer}>
        <Input
          placeholder="Email"
          value={form.email}
          onChangeText={(text) => setForm({ ...form, email: text })}
          errorMessage={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          containerStyle={styles.inputContainer}
          inputContainerStyle={styles.inputBox}
        />

        <Input
          placeholder="Password"
          value={form.password}
          onChangeText={(text) => setForm({ ...form, password: text })}
          errorMessage={errors.password}
          secureTextEntry
          containerStyle={styles.inputContainer}
          inputContainerStyle={styles.inputBox}
        />

        <TouchableOpacity style={styles.loginBtn} onPress={loginErrors}>
          <Text style={styles.loginBtnText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.forgot}>
          <Text style={styles.forgotText}>Forget Password ?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.register}
          onPress={() => navigation.replace("Register")}
        >
          <Text style={styles.registerText}>Don't have an account? Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#EEF2FF",
  },

  header: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#3F51B5",
  },

  formContainer: {
    width: "90%",
    maxWidth: 400,
  },

  inputContainer: {
    width: "100%",
  },

  inputBox: {
    borderWidth: 1,
    borderColor: "#9C89FF",
    borderRadius: 8,
    paddingHorizontal: 10,
  },

  forgot: {
    marginTop: 15,
    alignItems: "center",
  },

  forgotText: {
    color: "#3F51B5",
  },

  loginBtn: {
    width: "95%",
    backgroundColor: "#5E60CE",
    marginTop: 10,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  loginBtnText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 16,
  },

  register: {
    marginTop: 15,
    alignItems: "center",
  },

  registerText: {
    color: "#3F51B5",
    fontWeight: "600",
  },
});
