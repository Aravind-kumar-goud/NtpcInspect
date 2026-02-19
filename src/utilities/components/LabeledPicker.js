import { View, Text, StyleSheet, Platform } from "react-native";
import { Picker } from "@react-native-picker/picker";
import Ionicons from "react-native-vector-icons/Ionicons";

const LabeledPicker = ({
  label,
  icon,
  value,
  onValueChange,
  items = [],   // 🔥 dynamic options
  placeholder = "Select",
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label} <Text style={{ color: "red" }}>*</Text></Text>

      <View style={styles.inputBox}>
        {icon && <Ionicons name={icon} size={18} color="#1E5AA7" />}

        <Picker
          selectedValue={value}
          onValueChange={onValueChange}
          style={styles.picker}
          dropdownIconColor="#1E5AA7"
        >
          <Picker.Item label={placeholder} value="" />

          {items.map((item, index) => (
            <Picker.Item
              key={index}
              label={item.label}
              value={item.value}
            />
          ))}
        </Picker>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },

  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1E5AA7",
    borderRadius: 8,
    paddingHorizontal: 10,
    minHeight: 48,
    backgroundColor: "#fff",
  },

  picker: {
    flex: 1,
    marginLeft: 6,
    color: "#000",
    ...(Platform.OS === "android" && {
      transform: [{ scaleY: 1.05 }], // ✅ avoids text cut
    }),
  },
});

export default LabeledPicker;
