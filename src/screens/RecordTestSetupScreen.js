import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  Modal,
  ActivityIndicator,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import Video from 'react-native-video';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';

/* ================= API ================= */
const API_BASE_URL = 'https://webapp.ntpc.co.in/inspectionapi/api/';
const API_HEADERS = {
  'XApiKey':
    'pgH7QzFHJx4w46fI~$@#!$@#$dfasfd5Uzi4RvtTwlAzGyageSNz3oDeepa=xcode',
};

const RecordTestSetupScreen = ({ route, navigation }) => {
  const { chpId, testId, InspRowId, equipName, testDesc, materialType, noOfTaps,item } = route?.params || {};
  console.log(chpId, testId, InspRowId, testDesc, noOfTaps)

  /* ================= REFS ================= */
  const cameraRef = useRef(null);

  /* ================= CAMERA ================= */
  const [cameraPosition, setCameraPosition] = useState('back'); // front/back
  const device = useCameraDevice(cameraPosition);
  const [flash, setFlash] = useState('off'); // off / on

  /* ================= STATE ================= */
  const [hasPermission, setHasPermission] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [videoUri, setVideoUri] = useState(null);
  const [loadingPermission, setLoadingPermission] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [recordedDateTime, setRecordedDateTime] = useState(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingIntervalRef = useRef(null);

  /* ================= PERMISSIONS ================= */
  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      const requestPermissions = async () => {
        try {
          const cam = await Camera.requestCameraPermission();
          const mic = await Camera.requestMicrophonePermission();

          if (!mounted) return;

          const allowed =
            (cam === 'authorized' || cam === 'granted') &&
            (mic === 'authorized' || mic === 'granted');

          setHasPermission(allowed);

          if (!allowed) {
            Alert.alert(
              'Permission Required',
              'Camera & Microphone permissions are required'
            );
          }
        } catch (e) {
          console.log(e);
        } finally {
          setLoadingPermission(false);
        }
      };

      requestPermissions();
      return () => (mounted = false);
    }, [])
  );


  const formatDateTime = (date = new Date()) => {
    const pad = (n) => (n < 10 ? `0${n}` : n);

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());

    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };


  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const pad = (n) => (n < 10 ? `0${n}` : n);

    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };


  /* ================= RECORD ================= */
  // const startRecording = async () => {
  //   if (!cameraRef.current) return;

  //   setIsRecording(true);
  //   setVideoUri(null);

  //   cameraRef.current.startRecording({
  //     flash,
  //     onRecordingFinished: (video) => {
  //       setIsRecording(false);
  //       setShowCamera(false);
  //       setVideoUri(`file://${video.path}`);
  //       setRecordedDateTime(formatDateTime(new Date()));
  //     },
  //     onRecordingError: (err) => {
  //       setIsRecording(false);
  //       setShowCamera(false);
  //       Alert.alert('Recording Error', err.message);
  //     },
  //   });
  // };

  const startRecording = async () => {
    if (!cameraRef.current) return;

    setIsRecording(true);
    setVideoUri(null);
    setRecordingTime(0);

    // ✅ Start timer
    recordingIntervalRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);

    cameraRef.current.startRecording({
      flash,
      onRecordingFinished: (video) => {
        setIsRecording(false);
        setShowCamera(false);

        // ✅ Stop timer
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;

        setVideoUri(`file://${video.path}`);
        setRecordedDateTime(formatDateTime(new Date()));
      },
      onRecordingError: (err) => {
        setIsRecording(false);
        setShowCamera(false);

        // ✅ Stop timer
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;

        Alert.alert('Recording Error', err.message);
      },
    });
  };

  // const stopRecording = async () => {
  //   if (!cameraRef.current || !isRecording) return;
  //   await cameraRef.current.stopRecording();
  // };

  const stopRecording = async () => {
    if (!cameraRef.current || !isRecording) return;

    await cameraRef.current.stopRecording();

    clearInterval(recordingIntervalRef.current);
    recordingIntervalRef.current = null;
  };

  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  /* ================= UPLOAD ================= */
  const uploadVideo = () => {
    if (!videoUri) return;
    let Vduration = formatDuration(videoDuration)
    console.log(videoDuration, Vduration < 10)
    if (videoDuration >= 10) {
      Alert.alert(
        "Invalid Video",
        "Video duration must be at least 10 seconds."
      );
      return;
    }


    setUploading(true);


    Geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        const formData = new FormData();
        formData.append('GpsLat', latitude.toString());
        formData.append('GpsLong', longitude.toString());
        formData.append('ChpId', chpId);
        formData.append('TestId', testId);
        formData.append('InspRowId', InspRowId);
        formData.append('FileCaptureDtm', recordedDateTime || formatDateTime(new Date()));
        formData.append('VideoFile', {
          uri: videoUri,
          type: 'video/mp4',
          name: 'inspection_video.mp4',
        });
        console.log(formData)

        try {
           const token = await AsyncStorage.getItem("authToken");
          const res = await fetch(
            `${API_BASE_URL}Inspection/UploadVideo`,
            {
              method: 'POST',
              headers: {...API_HEADERS,
                Authorization: `Bearer ${token}`,
              },
              body: formData,
            }
          );


          console.log(res)
          const data = await res.json();
          console.log(data)

          if (res.status == 200 && data.statusCode == 200) {
            Alert.alert('Success', 'Video uploaded successfully');
            setVideoUri(null);
            if (testDesc=="INSULATION RESISTANCE(IR) TEST"){
              navigation.navigate("IRTestDetailsScreen", { testId: testId, chpId: chpId, InspRowId: InspRowId, GpsLat: latitude.toString(), GpsLong: longitude.toString(), testName: equipName, testDesc: testDesc, materialType: materialType, noOfTaps: noOfTaps,item })
            }
            if(testDesc==="RATIO TEST"){
               navigation.navigate("TestScreen", { testId: testId, chpId: chpId, InspRowId: InspRowId, GpsLat: latitude.toString(), GpsLong: longitude.toString(), testName: equipName, testDesc: testDesc, materialType: materialType, noOfTaps: noOfTaps,item })
              
            }
           
          } else {
            console.log(data.statusCode == 502)
            if (data.statusCode == 502) {
              Alert.alert('Upload Failed', data.statusDescLong);
            } else {
              Alert.alert('Upload Failed', 'Server error');
            }



          }
        } catch (e) {
          Alert.alert('Error', 'Upload failed');
        } finally {
          setUploading(false);
        }
      },
      (err) => {
        setUploading(false);
        Alert.alert('Location Error', err.message);
      },
      { enableHighAccuracy: true }
    );
  };

  /* ================= LOADING ================= */
  if (loadingPermission || !device) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Preparing camera...</Text>
      </View>
    );
  }

  /* ================= UI ================= */
  return (
    <SafeAreaView style={styles.container}>
      {/* {console.log("uploaded time ",recordedDateTime)} */}
      {/* RECORD BUTTON */}
      <TouchableOpacity
        style={styles.recordBtn}
        onPress={() => setShowCamera(true)}
      >
        <Icon name="video-plus" size={22} color="#fff" />
        <Text style={styles.recordText}>
          {videoUri ? ' Re-Take Video Setup' : ' Record Test Setup'}
        </Text>
      </TouchableOpacity>

      {/* PREVIEW */}
      {videoUri && (
        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>Preview</Text>
          <Video source={{ uri: videoUri }} style={styles.video} controls paused={true}
            onLoad={(data) => {
              // duration comes in SECONDS
              setVideoDuration(Math.floor(data.duration));
            }} />

          <TouchableOpacity
            style={styles.uploadBtn}
            onPress={uploadVideo}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon name="cloud-upload" size={20} color="#fff" />
                <Text style={styles.uploadText}> Upload Video</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* CAMERA MODAL */}
      {/* CAMERA MODAL */}
      <Modal visible={showCamera} animationType="slide">
        <View style={styles.cameraContainer}>

          {/* 🔴 RECORDING TIMER */}
          {isRecording && (
            <View style={styles.timerContainer}>
              <Icon name="record-rec" size={14} color="red" />
              <Text style={styles.timerText}>
                {formatRecordingTime(recordingTime)}
              </Text>
            </View>
          )}

          {/* CAMERA */}
          <Camera
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            device={device}
            isActive
            video
            audio
          />

          {/* TOP CONTROLS */}
          <View style={styles.topControls}>
            <TouchableOpacity
              onPress={() =>
                setFlash((prev) => (prev === 'off' ? 'on' : 'off'))
              }
            >
              <Icon
                name={flash === 'on' ? 'flash' : 'flash-off'}
                size={26}
                color="#fff"
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                setCameraPosition((p) => (p === 'back' ? 'front' : 'back'))
              }
            >
              <Icon name="camera-switch" size={28} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* RECORD BUTTON */}
          <TouchableOpacity
            style={[
              styles.captureBtn,
              { backgroundColor: isRecording ? '#dc3545' : '#28a745' },
            ]}
            onPress={isRecording ? stopRecording : startRecording}
          >
            <Icon
              name={isRecording ? 'stop' : 'record'}
              size={26}
              color="#fff"
            />
            <Text style={styles.captureText}>
              {isRecording ? ' Stop Recording' : ' Start Recording'}
            </Text>
          </TouchableOpacity>

        </View>
      </Modal>

    </SafeAreaView>
  );
};

export default RecordTestSetupScreen;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f4f6f9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  recordBtn: {
    backgroundColor: '#007bff',
    padding: 14,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  recordText: { color: '#fff', fontWeight: 'bold' },

  previewCard: {
    marginTop: 16,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    elevation: 4,
  },
  previewTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  video: { height: 220, backgroundColor: '#000', borderRadius: 8 },

  uploadBtn: {
    marginTop: 14,
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  uploadText: { color: '#fff', fontWeight: '600' },

  cameraContainer: { flex: 1, backgroundColor: '#000' },

  topControls: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  captureBtn: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 40,
    flexDirection: 'row',
    alignItems: 'center',
  },
  captureText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  timerContainer: {
    position: 'absolute',
    top: 40,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 9999,     // ✅ REQUIRED
    elevation: 10,
  },
  timerText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 6,
    fontSize: 14,
  },

});
