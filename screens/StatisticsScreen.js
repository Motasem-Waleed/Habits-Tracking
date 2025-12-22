import { View, Text, StyleSheet } from "react-native";

const StatisticsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Statistics</Text>
      <Text>Your habits statistics will appear here 📊</Text>
    </View>
  );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
},
});

export default StatisticsScreen;