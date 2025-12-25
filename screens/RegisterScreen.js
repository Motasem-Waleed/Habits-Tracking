// screens/RegisterScreen.js
import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Input } from "react-native-elements";
import registerSchema from "../components/RegisterSchema";
import { run, getFirst } from "../utils/storage";

const RegisterScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const handleRegister = () => {
    setErrors({});

    registerSchema
      .validate(form, { abortEarly: false })
      .then(async () => {
        const email = form.email.trim().toLowerCase();
        const name = form.name.trim();

        // check existing email
        const existing = await getFirst("SELECT * FROM users WHERE email = ?;", [email]);
        if (existing) {
          Alert.alert("Error", "Email already registered.");
          return;
        }

        const userId = email; // نفس أسلوبك في habits: userId = email
        const now = Date.now();

        await run(
          "INSERT INTO users (userId, name, email, password, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?);",
          [userId, name, email, form.password, now, now]
        );

        navigation.replace("Tabs", { email });
      })
      .catch((error) => {
        if (error.inner) {
          const errorsObject = {};
          error.inner.forEach((err) => (errorsObject[err.path] = err.message));
          setErrors(errorsObject);
        }
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Register</Text>

      <View style={styles.formContainer}>
        <Input
          placeholder="Full Name"
          value={form.name}
          onChangeText={(text) => setForm({ ...form, name: text })}
          errorMessage={errors.name}
          containerStyle={styles.inputContainer}
          inputContainerStyle={styles.inputBox}
        />

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

        <Input
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChangeText={(text) => setForm({ ...form, confirmPassword: text })}
          errorMessage={errors.confirmPassword}
          secureTextEntry
          containerStyle={styles.inputContainer}
          inputContainerStyle={styles.inputBox}
        />

        <TouchableOpacity style={styles.btn} onPress={handleRegister}>
          <Text style={styles.btnText}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.replace("Login")} style={{ marginTop: 14 }}>
          <Text style={{ color: "#3F51B5", fontWeight: "600", textAlign: "center" }}>
            Already have an account? Sign In
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: "#EEF2FF" },
  header: { fontSize: 26, fontWeight: "bold", marginBottom: 30, color: "#3F51B5" },
  formContainer: { width: "90%", maxWidth: 400 },
  inputContainer: { width: "100%" },
  inputBox: { borderWidth: 1, borderColor: "#9C89FF", borderRadius: 8, paddingHorizontal: 10 },
  btn: { width: "95%", backgroundColor: "#5E60CE", marginTop: 10, borderRadius: 8, paddingVertical: 14, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
