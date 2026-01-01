import { useEffect, useState } from "react";
import {  StyleSheet,  Text,  View,  Image,  TouchableOpacity} from "react-native";

import { getFirst } from "../utils/storage";
import { syncNow } from "../services/syncService";
import { useHabits } from "../context/HabitContext";

const Home = ({ route, navigation }) => {
  const email = route?.params?.email || "";
  const userId = email || "guest";
  const nameU = route?.params?.name || (email ? email.split("@")[0] : "Guest");

  const [photoURL, setPhotoURL] = useState(null);
  const [name, setName] = useState("");

  const { habits, loadHabits } = useHabits();

  const loadUserInfo = async () => {
    try {
      if (!email) {
        setName("Guest");
        setPhotoURL(null);
        return;
      }

      const user = await getFirst(
        "SELECT name, photoURL FROM users WHERE email = ?;",
        [email.trim().toLowerCase()]
      );

      setName(user?.name || nameU);
      setPhotoURL(user?.photoURL || null);
    } catch {
      setName(nameU);
      setPhotoURL(null);
    }
  };


  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      await syncNow(userId);
      await loadUserInfo();
      await loadHabits(userId);
    });

    loadUserInfo();
    loadHabits(userId);

    return unsubscribe;
  }, [navigation, userId]);


  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.textContainer}>
            <Text style={styles.welcome}>Welcome 👋</Text>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.subtitle}>How are you today? 🤍</Text>
          </View>

          <Image
            style={styles.avatar}
            source={{
              uri:
                photoURL ||
                "https://images.icon-icons.com/2643/PNG/512/avatar_female_woman_person_people_white_tone_icon_159360.png",
            }}
          />
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.btn, styles.primaryBtn]}
            onPress={() =>
              navigation.navigate("AddEditHabit", { email, userId })
            }
          >
            <Text style={styles.btnText}>+ Add Habit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.secondaryBtn]}
            onPress={() =>
              navigation.navigate("Statistics Screen", { email, userId })
            }
          >
            <Text style={styles.secondaryText}>Statistics</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          
          <Text style={styles.sectionTitle}>Your Habits</Text>
        </View>

        {habits.length === 0 ? (
          <Text style={styles.empty}>No habits yet. Add one!</Text>
        ) : (
          habits.map((h) => (
            <TouchableOpacity
              key={h.habitId}
              style={styles.habitItem}
              onPress={() =>
                navigation.navigate("HabitDetails", {
                  email,
                  userId,
                  habitId: h.habitId,
                  habit: h,
                })
              }
            >
              <Text style={styles.habitText}>
                {h.icon ? `${h.icon} ` : ""}
                {h.title}
              </Text>
              <Text style={styles.habitMeta}>
                {h.frequency} • target: {h.target || 0}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    padding: 20,
    alignItems: "center",
    backgroundColor: "#EEF2FF",
  },
  card: {
    backgroundColor: "#fff",
    width: "100%",
    borderRadius: 18,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textContainer: { flex: 1 },
  welcome: { color: "#444", fontSize: 16, fontWeight: "700" },
  name: { fontSize: 22, fontWeight: "900", marginTop: 4, color: "#222" },
  subtitle: { marginTop: 6, color: "#666", fontSize: 14 },
  avatar: { width: 70, height: 70, borderRadius: 35, marginLeft: 10 },
  actions: { flexDirection: "row", gap: 10, marginTop: 16 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  primaryBtn: { backgroundColor: "#4F46E5" },
  btnText: { color: "#fff", fontWeight: "800" },
  secondaryBtn: { backgroundColor: "#E0E7FF" },
  secondaryText: { color: "#3730A3", fontWeight: "800" },
  section: {
    width: "100%",
    marginTop: 18,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
  },
  sectionHeader: { marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: "900", color: "#111" },
  empty: { marginTop: 10, color: "#666" },
  habitItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#EEE" },
  habitText: { fontSize: 16, fontWeight: "700", color: "#222" },
  habitMeta: { marginTop: 4, color: "#666", fontSize: 13 },
});

export default Home;
