import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet } from "react-native";

const Login = () => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [email, setemail] = useState("");
  const [otp, setOtp] = useState("");
  const [challengeCode,setchallengeCode]=useState("")

  const [step, setStep] = useState(1); // 1 = login, 2 = email, 3 = otp
  const [loading, setLoading] = useState(false);
  const BASE_URL = "https://webapp.ntpc.co.in/inspectionapi/";
const API_KEY = "pgH7QzFHJx4w46fI~$@#!$@#$dfasfd5Uzi4RvtTwlAzGyageSNz3oDeepa=xcode";

  // Step 1: Login
const handleLogin = async () => {
  if (!userId || !password) {
    Alert.alert("Error", "Please enter User ID and Password");
    return;
  }

  setLoading(true);
  try {
   
    const response = await fetch(`${BASE_URL}api/Auth/ValidateUser1`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "XApiKey": API_KEY, 
      },
      body: JSON.stringify({ password, userId }),
    });

    if (response.status === 200 || response.status === 201) {
        console.log(response.json().challengeCode)
        setchallengeCode(response.json().challengeCode)

      Alert.alert("Success", "Login successful, please enter your email");
      setStep(2);
    } else {
      const errorText = await response.text();
      console.log(errorText,response )
      Alert.alert("Error", `Invalid credentials\n${errorText}`);
    }
  } catch (error) {
    console.error("Login Error:", error);
    Alert.alert("Error", "Something went wrong");
  } finally {
    setLoading(false);
  }
};

  // Step 2: email submission
  const handleemailSubmit = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}api/Auth/RequestOTP`, {
        method: "POST",
        headers: { "Content-Type": "application/json" ,
            "XApiKey": API_KEY, 
        },
        body: JSON.stringify({ userId,challengeCode,email }),
      });

      if (response.status === 200 || response.status === 201) {
        Alert.alert("Success", "email submitted successfully, please enter OTP");
        setStep(3);
      } else {
        console.log()
        Alert.alert("Error", "email submission failed");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: OTP verification
  const handleOtpLogin = async () => {
    if (!otp) {
      Alert.alert("Error", "Please enter OTP");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}api/Auth/ValidateOTP`, {
        method: "POST",
        headers: { "Content-Type": "application/json",
             "XApiKey": API_KEY, 
         },
        body: JSON.stringify({ challengeCode,email,otp,userId }),
      });

      if (response.status === 200 || response.status === 201) {
        Alert.alert("✅ Login Complete", "You have successfully logged in!");
        setStep(4);
      } else {
        Alert.alert("Error", "Invalid OTP");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login:</Text>

      {/* Step 1: User ID + Password */}
      <TextInput
        placeholder="User ID"
        value={userId}
        onChangeText={setUserId}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        // secureTextEntry
        style={styles.input}
      />
      <Button
        title={loading && step === 1 ? "Logging in..." : "Login"}
        onPress={handleLogin}
      />

      {/* Step 2: email Field */}
      {step >= 2 && (
        <>
          <TextInput
            placeholder="Enter email"
            value={email}
            onChangeText={setemail}
            style={styles.input}
          />
          <Button
            title={loading && step === 2 ? "Submitting email..." : "Submit email"}
            onPress={handleemailSubmit}
          />
        </>
      )}

      {/* Step 3: OTP Field */}
      {step >= 3 && (
        <>
          <TextInput
            placeholder="Enter OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            style={styles.input}
          />
          <Button
            title={loading && step === 3 ? "Verifying OTP..." : "Final Login"}
            onPress={handleOtpLogin}
          />
        </>
      )}

      {step === 4 && (
        <Text style={styles.successText}>🎉 Login Successful!</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  successText: {
    fontSize: 18,
    color: "green",
    textAlign: "center",
    marginTop: 20,
  },
});

export default Login;
