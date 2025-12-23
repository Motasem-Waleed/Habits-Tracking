import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

import { Input } from "react-native-elements";
import loginSchema from "../components/LoginSchema";

import { useEffect } from "react";
import { run, getAll } from "../utils/storage";


const Login = ({ navigation }) => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const loginErrors = () => {
    setErrors({});

    loginSchema
      .validate(form, { abortEarly: false })
      .then(() => {
        navigation.replace("Tabs" , {email: form.email});
        
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
      </View>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor :"#EEF2FF"
  },

  header: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 30,
    color:"#3F51B5",
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

});
