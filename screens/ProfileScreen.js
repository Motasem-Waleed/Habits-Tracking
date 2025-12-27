import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";

import { getFirst, run } from "../utils/storage";
import { getUserOnline, upsertUserOnline } from "../services/onlineUserService";

export default function ProfileScreen({ route, navigation }) {
  const email = route?.params?.email || "";
  const userId = route?.params?.userId || email || "guest";

  const [name, setName] = useState(email ? email.split("@")[0] : "Guest");
  const [photoURL, setPhotoURL] = useState(null);

  const handleLogout = () => {
    navigation.replace("Login");
  };

  const loadLocal = async () => {
    if (!email) return;

    const row = await getFirst(
      `SELECT name, photoURL FROM users WHERE email=? LIMIT 1`,
      [email.trim().toLowerCase()]
    );

    if (row?.name) setName(row.name);
    setPhotoURL(row?.photoURL || null);
  };

  const loadOnline = async () => {
    if (!email) return;
    try {
      const u = await getUserOnline(email);
      if (!u) return;

      if (u.name) setName(u.name);
      setPhotoURL(u.photoURL || null);

      const now = Date.now();
      await run(
        `INSERT OR REPLACE INTO users (userId, name, email, photoURL, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, u.name || name, email.trim().toLowerCase(), u.photoURL || null, now, now]
      );
    } catch (e) {
      // ignore if offline
    }
  };

  useEffect(() => {
    loadLocal();
    loadOnline();
  }, [email]);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission", "Gallery permission is required.");
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!res.canceled && res.assets?.[0]?.uri) {
      setPhotoURL(res.assets[0].uri);
    }
  };

  const saveProfile = async () => {
    if (!email) {
      Alert.alert("Error", "No email found. Please login again.");
      return;
    }
    if (!name.trim()) {
      Alert.alert("Validation", "Please enter your name.");
      return;
    }

    try {
      const now = Date.now();
      const emailKey = email.trim().toLowerCase();

      const existing = await getFirst(
        `SELECT createdAt FROM users WHERE email=? LIMIT 1`,
        [emailKey]
      );
      const createdAt = existing?.createdAt ?? now;

      // save local
      await run(
        `INSERT OR REPLACE INTO users (userId, name, email, photoURL, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, name.trim(), emailKey, photoURL ?? null, createdAt, now]
      );

      // save online
      await upsertUserOnline(emailKey, {
        name: name.trim(),
        photoURL: photoURL ?? null,
      });

      Alert.alert("Done", "Profile saved ✅");
    } catch (e) {
      console.log("Save profile error:", e);
      Alert.alert("Error", String(e?.message || e));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Profile</Text>

        <TouchableOpacity style={styles.avatarWrap} onPress={pickImage}>
          <Image
            style={styles.avatar}
            source={{
              uri:
                photoURL ||
                "https://images.icon-icons.com/2643/PNG/512/avatar_female_woman_person_people_white_tone_icon_159360.png",
            }}
          />
          <Text style={styles.changePhoto}>Change photo</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Name</Text>
        <TextInput value={name} onChangeText={setName} style={styles.input} />

        <Text style={styles.label}>Email</Text>
        <Text style={styles.email}>{email}</Text>

        <TouchableOpacity style={styles.saveBtn} onPress={saveProfile}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EEF2FF", padding: 16 },
  card: { backgroundColor: "#fff", borderRadius: 18, padding: 16 },
  title: { fontSize: 20, fontWeight: "900", color: "#111", marginBottom: 12 },
  avatarWrap: { alignItems: "center", marginBottom: 14 },
  avatar: { width: 110, height: 110, borderRadius: 55 },
  changePhoto: { marginTop: 8, color: "#3730A3", fontWeight: "900" },
  label: { marginTop: 10, color: "#444", fontWeight: "800" },
  input: { marginTop: 6, backgroundColor: "#F3F4F6", borderRadius: 12, padding: 12 },
  email: { marginTop: 6, color: "#666" },
  saveBtn: {
    marginTop: 16,
    backgroundColor: "#4F46E5",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontWeight: "900" },
  logoutBtn: {
    marginTop: 10,
    alignSelf: "flex-start",
    backgroundColor: "#E53935",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  logoutText: { color: "#fff", fontWeight: "800" },
});
