import React from "react";
import { View, StyleSheet } from "react-native";

export default function ProgressBar({ value = 0, target = 0 }) {
  const ratio = Math.max(0, Math.min(1, value / target));

  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${ratio * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 10,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
    marginTop: 10,
  },
  fill: {
    height: "100%",
    backgroundColor: "#4F46E5",
  },
});
