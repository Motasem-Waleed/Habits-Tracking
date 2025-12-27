import { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";

import { getAll } from "../utils/storage";
import { todayStr, addDaysStr } from "../utils/dateUtils";

function buildDateList(days) {
  const end = todayStr();
  const list = [];
  for (let i = days - 1; i >= 0; i--) list.push(addDaysStr(end, -i));
  return list;
}

function shortDateLabel(dateStr) {
  return `${dateStr.slice(5, 7)}/${dateStr.slice(8, 10)}`;
}

function SimpleBars({ data, labels, maxHeight = 120, suffix = "" }) {
  const maxVal = Math.max(1, ...data.map((n) => Number(n) || 0));

  return (
    <View style={styles.chartWrap}>
      <View style={styles.chartRow}>
        {data.map((val, i) => {
          const h = Math.round(((Number(val) || 0) / maxVal) * maxHeight);
          return (
            <View key={i} style={styles.barCol}>
              <View style={[styles.bar, { height: h }]} />
              <Text style={styles.barValue}>
                {(Number(val) || 0) + suffix}
              </Text>
              <Text style={styles.barLabel}>{labels[i] || ""}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default function StatisticsScreen({ route }) {
  const email = route?.params?.email || "";
  const userId = route?.params?.userId || email || "guest";

  const [loading, setLoading] = useState(false);
  const [habits, setHabits] = useState([]);
  const [weeklySeries, setWeeklySeries] = useState([]);   // numbers (%)
  const [monthlySeries, setMonthlySeries] = useState([]); // numbers (count)
  

  const [weeklyRate, setWeeklyRate] = useState(0);
  const [monthlyRate, setMonthlyRate] = useState(0);
  const [top3, setTop3] = useState([]);
  const [bestStreak, setBestStreak] = useState({ days: 0, habit: null });

  const last7 = useMemo(() => buildDateList(7), []);
  const last30 = useMemo(() => buildDateList(30), []);
  const start30 = last30[0];
  const endToday = todayStr();

  const loadStats = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const habitRows = await getAll(
        `SELECT habitId, title, icon, target, frequency
         FROM habits
         WHERE userId=? AND deleted=0`,
        [userId]
      );
      setHabits(habitRows);
      const totalHabits = habitRows.length;

      const progress30 = await getAll(
        `SELECT habitId, date, completed
         FROM progress
         WHERE userId=? AND date>=? AND date<=?`,
        [userId, start30, endToday]
      );

      const completedPerDay = new Map();     // date -> count
      const completedPerHabit = new Map();   // habitId -> count

      for (const r of progress30) {
        if (!r?.date || !r?.habitId) continue;
        if (r.completed === 1) {
          completedPerDay.set(r.date, (completedPerDay.get(r.date) || 0) + 1);
          completedPerHabit.set(r.habitId, (completedPerHabit.get(r.habitId) || 0) + 1);
        }
      }

      // weekly (%)
      const weekPct = last7.map((d) => {
        const done = completedPerDay.get(d) || 0;
        return totalHabits > 0 ? Math.round((done / totalHabits) * 100) : 0;
      });
      setWeeklySeries(weekPct);

      // monthly (count)
      const monthCounts = last30.map((d) => completedPerDay.get(d) || 0);
      setMonthlySeries(monthCounts);

      const weekTotalDone = last7.reduce((acc, d) => acc + (completedPerDay.get(d) || 0), 0);
      const monthTotalDone = last30.reduce((acc, d) => acc + (completedPerDay.get(d) || 0), 0);

      const weekDen = totalHabits * 7;
      const monthDen = totalHabits * 30;

      setWeeklyRate(weekDen > 0 ? Math.round((weekTotalDone / weekDen) * 100) : 0);
      setMonthlyRate(monthDen > 0 ? Math.round((monthTotalDone / monthDen) * 100) : 0);

      // Top 3
      const habitById = new Map(habitRows.map((h) => [h.habitId, h]));
      const topArr = Array.from(completedPerHabit.entries())
        .map(([hid, count]) => {
          const h = habitById.get(hid);
          return { habitId: hid, title: h?.title || "Habit", icon: h?.icon || "", count };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);
      setTop3(topArr);

      // Best streak (last 120 days)
      const start120 = addDaysStr(todayStr(), -120);
      const completed120 = await getAll(
        `SELECT habitId, date
         FROM progress
         WHERE userId=? AND completed=1 AND date>=? AND date<=?`,
        [userId, start120, endToday]
      );

      const doneSetByHabit = new Map();
      for (const r of completed120) {
        if (!doneSetByHabit.has(r.habitId)) doneSetByHabit.set(r.habitId, new Set());
        doneSetByHabit.get(r.habitId).add(r.date);
      }

      let best = { days: 0, habit: null };
      for (const h of habitRows) {
        const set = doneSetByHabit.get(h.habitId) || new Set();
        let streak = 0;
        let d = todayStr();
        while (set.has(d)) {
          streak += 1;
          d = addDaysStr(d, -1);
        }
        if (streak > best.days) best = { days: streak, habit: h };
      }
      setBestStreak(best);
    } catch (e) {
      console.log("Stats error:", e);
      Alert.alert("Error", String(e?.message || e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [userId]);

  const weeklyLabels = last7.map(shortDateLabel);

  // لتخفيف زحمة 30 label: نعرض كل 5 أيام فقط
  const monthlyLabels = last30.map((d, idx) => (idx % 5 === 0 ? shortDateLabel(d) : ""));

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Statistics</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={loadStats} disabled={loading}>
          <Text style={styles.refreshText}>{loading ? "Loading..." : "Refresh"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Summary</Text>
        <Text style={styles.line}>Total habits: {habits.length}</Text>
        <Text style={styles.line}>Weekly completion rate: {weeklyRate}%</Text>
        <Text style={styles.line}>Monthly completion rate: {monthlyRate}%</Text>
        <Text style={styles.line}>
          Best streak:{" "}
          {bestStreak.habit
            ? `${bestStreak.habit.icon ? bestStreak.habit.icon + " " : ""}${bestStreak.habit.title} — ${bestStreak.days} day(s)`
            : "0"}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Weekly Chart (last 7 days)</Text>
        <Text style={styles.note}>Y = % of habits completed per day</Text>
        <SimpleBars data={weeklySeries} labels={weeklyLabels} suffix="%" />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Monthly Chart (last 30 days)</Text>
        <Text style={styles.note}>Y = number of completed habits per day</Text>
        <SimpleBars data={monthlySeries} labels={monthlyLabels} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Top 3 Habits (last 30 days)</Text>
        {top3.length === 0 ? (
          <Text style={styles.empty}>No completed habits yet.</Text>
        ) : (
          top3.map((h, idx) => (
            <View key={h.habitId} style={styles.topRow}>
              <Text style={styles.topText}>
                {idx + 1}) {h.icon ? `${h.icon} ` : ""}{h.title}
              </Text>
              <Text style={styles.topCount}>{h.count}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EEF2FF", padding: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  title: { fontSize: 22, fontWeight: "900", color: "#111" },
  refreshBtn: { backgroundColor: "#E0E7FF", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  refreshText: { color: "#3730A3", fontWeight: "900" },

  card: { backgroundColor: "#fff", borderRadius: 18, padding: 14, marginTop: 12 },
  cardTitle: { fontSize: 16, fontWeight: "900", color: "#111" },
  line: { marginTop: 8, color: "#333", fontWeight: "700" },
  note: { marginTop: 6, color: "#666", fontSize: 12 },

  chartWrap: { marginTop: 12 },
  chartRow: { flexDirection: "row", alignItems: "flex-end", gap: 6 },
  barCol: { alignItems: "center", flex: 1 },
  bar: { width: "100%", backgroundColor: "#4F46E5", borderTopLeftRadius: 6, borderTopRightRadius: 6 },
  barValue: { marginTop: 6, fontSize: 10, color: "#111", fontWeight: "800" },
  barLabel: { marginTop: 4, fontSize: 10, color: "#666" },

  empty: { marginTop: 10, color: "#666" },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  topText: { color: "#222", fontWeight: "800" },
  topCount: { color: "#111", fontWeight: "900" },
});
