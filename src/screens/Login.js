import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { navigate as rootNavigate } from './navigation/navigation';



const LoginScreen = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [challengeCode, setChallengeCode] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailList, setEmailList] = useState([]);


  const API_BASE_URL = 'https://webapp.ntpc.co.in/inspectionapi/api/';
  const API_HEADERS = {
    'Content-Type': 'application/json',
    'XApiKey': 'pgH7QzFHJx4w46fI~$@#!$@#$dfasfd5Uzi4RvtTwlAzGyageSNz3oDeepa=xcode',
  };

  // Step 1: Validate User
  const handleStep1Login = async () => {
    if (!userId || !password) {
      Alert.alert('Error', 'Please enter both User ID and Password');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}Auth/ValidateUser1`, {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify({
          userId: userId,
          password: password
        })
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (data.statusCode === 200 && data.statusDescShort === 'success') {
        setChallengeCode(data.challengeCode);

      if (Array.isArray(data.data)) {
        setEmailList(data.data);
      }

      setStep(2);
      Alert.alert('Success', 'Step 1 completed. Please select your email.');
      } else {
        Alert.alert('Login Failed', data.error || 'Invalid credentials');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Request OTP
  const handleStep2RequestOTP = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}Auth/RequestOTP`, {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify({
          challengecode: challengeCode,
          email: email,
          userId: userId
        })
      });

      const data = await response.json();
      console.log('OTP Request response:', data);

      if (data.statusCode === 200) {
        setChallengeCode(data.challengeCode);   
        setUserId(data.userid);                 
        setStep(3);
        Alert.alert('Success', data.statusDescShort);
      }
      else {
        Alert.alert('OTP Request Failed', data.error || 'Failed to send OTP');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
      console.error('OTP request error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Validate OTP
  const handleStep3ValidateOTP = async () => {
    if (!otp) {
      Alert.alert('Error', 'Please enter OTP');
      return;
    }

    if (otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}Auth/ValidateOTP`, {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify({
          ChallengeCode: challengeCode,
          Email: email,
          UserId: userId,
          OTP: otp
        })

      });

      const data = await response.json();
      console.log('OTP Validation response:', data);

      if (data.statusCode === 200) {
        const token = data.data?.[0]?.token;
        await AsyncStorage.setItem("authToken", token);

        Alert.alert('Success', 'Login completed successfully!');
        setTimeout(() => {
          if (navigation && typeof navigation.replace === 'function') {
            navigation.replace('HomeDrawer');
          } else {
            rootNavigate('HomeDrawer');
          }
        }, 1000);
      } else {
        Alert.alert('OTP Verification Failed', data.statusDescript || data.error || 'Invalid OTP');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
      console.error('OTP validation error:', error);
    } finally {
      setLoading(false);
    }
  };

 
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

 
  const renderCurrentStep = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.formContainer}>
            <Text style={styles.label}>User ID</Text>
            <TextInput
              style={styles.input}
              value={userId}
              onChangeText={setUserId}
              placeholder="Enter your User ID"
              autoCapitalize="none"
              keyboardType="numeric"
              editable={!loading}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
              editable={!loading}
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleStep1Login}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Validate User</Text>
              )}
            </TouchableOpacity>
          </View>
        );

      case 2:
        return (
          <View style={styles.formContainer}>
            <Text style={styles.label}>User ID</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={userId}
              editable={false}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value="••••••••"
              secureTextEntry
              editable={false}
            />

            <Text style={styles.label}>Email</Text>

            <View style={styles.dropdown}>
              <Picker
                selectedValue={email}
                onValueChange={(value) => setEmail(value)}
                enabled={!loading}
              >
                <Picker.Item label="Select Email" value="" />

                {emailList.map((item, index) => (
                  <Picker.Item key={index} label={item.trim()} value={item.trim()} />
                ))}
              </Picker>
            </View>


            {/* <Text style={styles.infoText}>
              An OTP will be sent to this email address for verification.
            </Text> */}

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.backButton]}
                onPress={handleBack}
                disabled={loading}
              >
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleStep2RequestOTP}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Request OTP</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.formContainer}>
            <Text style={styles.label}>User ID</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={userId}
              editable={false}
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={email}
              editable={false}
            />

            <Text style={styles.label}>OTP</Text>
            <TextInput
              style={styles.input}
              value={otp}
              onChangeText={setOtp}
              placeholder="Enter 6-digit OTP"
              keyboardType="number-pad"
              maxLength={6}
              editable={!loading}
            />

            <Text style={styles.infoText}>
              Please enter the 6-digit OTP sent to your email.
            </Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.backButton]}
                onPress={handleBack}
                disabled={loading}
              >
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleStep3ValidateOTP}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Verify OTP</Text>
                )}
              </TouchableOpacity>
            </View>
{/* 
            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleStep2RequestOTP}
              disabled={loading}
            >
              <Text style={styles.resendText}>Resend OTP</Text>
            </TouchableOpacity> */}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>NTPC Login</Text>
          <Text style={styles.stepIndicator}>Step {step} of 3</Text>
        </View>

        {renderCurrentStep()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  stepIndicator: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  disabledInput: {
    backgroundColor: '#f8f9fa',
    color: '#6c757d',
  },
  button: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    flex: 1,
    marginHorizontal: 5,
  },
  buttonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#95a5a6',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  resendButton: {
    alignItems: 'center',
    marginTop: 15,
    padding: 10,
  },
  resendText: {
    color: '#3498db',
    fontSize: 14,
    fontWeight: '600',
  },
  dropdown: {
  borderWidth: 1,
  borderColor: '#ddd',
  borderRadius: 8,
  backgroundColor: '#fff',
  marginTop: 10,
  // alignItems: 'center',
  alignContent: 'center',
}

});

export default LoginScreen;