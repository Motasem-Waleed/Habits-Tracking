import { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { getAll } from "../utils/storage";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatDateYYYYMMDD(d) {
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  return `${y}-${m}-${day}`;
}

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return startOfDay(d);
}

function calcStreak(completedDateSet) {
  // streak = عدد الأيام المتتالية حتى اليوم (اليوم أو أمس حسب وجود تسجيل)
  let streak = 0;
  for (let i = 0; ; i++) {
    const dateStr = formatDateYYYYMMDD(daysAgo(i));
    if (completedDateSet.has(dateStr)) streak++;
    else break;
  }
  return streak;
}

const StatisticsScreen = ({ route, navigation }) => {
  // نفس فكرة userId = email (مؤقتًا)
  const userId = route?.params?.userId || route?.params?.email || "user@gmail.com";

  const [habits, setHabits] = useState([]);
  const [progress, setProgress] = useState([]);

  const load = async () => {
    try {
      const habitsRows = await getAll(
        `SELECT habitId, title, icon, frequency, target
         FROM habits
         WHERE userId=? AND deleted=0`,
        [userId]
      );

      // آخر 30 يوم من progress
      const from = formatDateYYYYMMDD(daysAgo(29));
      const progressRows = await getAll(
        `SELECT habitId, date, completed, value
         FROM progress
         WHERE userId=? AND date >= ?`,
        [userId, from]
      );

      setHabits(habitsRows);
      setProgress(progressRows);
    } catch (e) {
      console.log("Statistics load error:", e);
    }
  };

  useEffect(() => {
    const unsub = navigation?.addListener?.("focus", load);
    load();
    return unsub;
  }, [navigation]);

  const stats = useMemo(() => {
    const last7Start = formatDateYYYYMMDD(daysAgo(6));
    const last30Start = formatDateYYYYMMDD(daysAgo(29));

    const prog7 = progress.filter((p) => p.date >= last7Start);
    const prog30 = progress.filter((p) => p.date >= last30Start);

    // Completion counts per habit
    const completedCount7 = {};
    const completedCount30 = {};
    const completedDatesByHabit = {};

    for (const h of habits) {
      completedCount7[h.habitId] = 0;
      completedCount30[h.habitId] = 0;
      completedDatesByHabit[h.habitId] = new Set();
    }

    for (const p of prog7) {
      if (p.completed === 1) completedCount7[p.habitId] = (completedCount7[p.habitId] || 0) + 1;
    }
    for (const p of prog30) {
      if (p.completed === 1) {
        completedCount30[p.habitId] = (completedCount30[p.habitId] || 0) + 1;
        if (!completedDatesByHabit[p.habitId]) completedDatesByHabit[p.habitId] = new Set();
        completedDatesByHabit[p.habitId].add(p.date);
      }
    }

    // Completion rate (أبسط تعريف): عدد السجلات المكتملة / (عدد العادات * عدد الأيام)
    const days7 = 7;
    const days30 = 30;

    const totalPossible7 = habits.length * days7;
    const totalPossible30 = habits.length * days30;

    const totalCompleted7 = Object.values(completedCount7).reduce((a, b) => a + b, 0);
    const totalCompleted30 = Object.values(completedCount30).reduce((a, b) => a + b, 0);

    const rate7 = totalPossible7 === 0 ? 0 : Math.round((totalCompleted7 / totalPossible7) * 100);
    const rate30 = totalPossible30 === 0 ? 0 : Math.round((totalCompleted30 / totalPossible30) * 100);

    // Top 3 habits (آخر 7 أيام)
    const top3 = [...habits]
      .map((h) => ({
        habitId: h.habitId,
        title: h.title,
        icon: h.icon || "✅",
        count7: completedCount7[h.habitId] || 0,
      }))
      .sort((a, b) => b.count7 - a.count7)
      .slice(0, 3);

    // Streak لكل habit (يعتمد على الأيام المكتملة)
    const streaks = habits.map((h) => {
      const set = completedDatesByHabit[h.habitId] || new Set();
      const streak = calcStreak(set);
      return { habitId: h.habitId, title: h.title, icon: h.icon || "✅", streak };
    });

    const bestStreak = streaks.length ? Math.max(...streaks.map((s) => s.streak)) : 0;

    return {
      habitsCount: habits.length,
      rate7,
      rate30,
      totalCompleted7,
      totalCompleted30,
      top3,
      bestStreak,
      streaks,
    };
  }, [habits, progress]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Statistics</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Overview</Text>
        <Text style={styles.line}>Habits: {stats.habitsCount}</Text>
        <Text style={styles.line}>Last 7 days completion: {stats.rate7}% ({stats.totalCompleted7} done)</Text>
        <Text style={styles.line}>Last 30 days completion: {stats.rate30}% ({stats.totalCompleted30} done)</Text>
        <Text style={styles.line}>Best streak: {stats.bestStreak} days</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Top 3 Habits (Last 7 days)</Text>
        {stats.top3.length === 0 ? (
          <Text style={styles.muted}>No data yet.</Text>
        ) : (
          stats.top3.map((h, idx) => (
            <Text key={h.habitId} style={styles.line}>
              {idx + 1}) {h.icon} {h.title} — {h.count7} completions
            </Text>
          ))
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Streaks</Text>
        {stats.streaks.length === 0 ? (
          <Text style={styles.muted}>No habits yet.</Text>
        ) : (
          stats.streaks.map((s) => (
            <Text key={s.habitId} style={styles.line}>
              {s.icon} {s.title} — {s.streak} days
            </Text>
          ))
        )}
      </View>

      <Text style={styles.note}>
        Note: Charts will be added next (Victory/Recharts). These numbers depend on saving progress into SQLite table "progress".
      </Text>
    </ScrollView>
  );
};

export default StatisticsScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#EEF2FF",
  },
  container: {
    padding: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#3F51B5",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#D6D6F5",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 8,
    color: "#222",
  },
  line: {
    fontSize: 14,
    color: "#333",
    marginBottom: 6,
  },
  muted: {
    color: "#777",
  },
  note: {
    marginTop: 6,
    color: "#666",
    fontSize: 12,
  },
});
