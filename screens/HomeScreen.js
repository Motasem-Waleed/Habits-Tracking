// screens/HomeScreen.js
import { useEffect, useState } from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { getHabitsLocal } from "../services/habitService";

const Home = ({ route, navigation }) => {
  const email = route?.params?.email || "user@gmail.com";
  const userId = email;
  const name = email.split("@")[0];

  const [habits, setHabits] = useState([]);

  const loadHabits = async () => {
    try {
      const rows = await getHabitsLocal(userId);
      setHabits(rows);
    } catch (e) {
      console.log("Load habits error:", e);
    }
  };

  useEffect(() => {
    const unsub = navigation.addListener("focus", loadHabits);
    loadHabits();
    return unsub;
  }, [navigation]);

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
              uri: "https://images.icon-icons.com/2643/PNG/512/avatar_female_woman_person_people_white_tone_icon_159360.png",
            }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Habits</Text>

          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate("Add Habit", { userId })}
          >
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {habits.length === 0 ? (
          <Text style={styles.emptyText}>No habits yet. Add your first habit.</Text>
        ) : (
          habits.map((h) => (
            <TouchableOpacity
              key={h.habitId}
              style={styles.habitItem}
              onPress={() =>
                navigation.navigate("Add Habit", { userId, habitId: h.habitId, habit: h })
              }
            >
              <Text style={styles.habitText}>
                {h.icon || "✅"} {h.title}
              </Text>
              <Text style={styles.habitMeta}>
                {h.frequency} • target {h.target}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    padding: 20,
    alignItems: "center",
    backgroundColor: "#EEF2FF",
  },
  card: {
    width: "85%",
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    shadowColor: "#5E60CE",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
    paddingRight: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  welcome: {
    fontSize: 20,
    color: "#3F51B5",
    fontWeight: "600",
  },
  name: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#5E60CE",
    marginVertical: 6,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
  },
  section: {
    width: "85%",
    marginTop: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3F51B5",
  },
  addBtn: {
    backgroundColor: "#5E60CE",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
  emptyText: {
    color: "#777",
    marginTop: 6,
  },
  habitItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  habitText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
  },
  habitMeta: {
    marginTop: 4,
    color: "#666",
    fontSize: 13,
  },
});
