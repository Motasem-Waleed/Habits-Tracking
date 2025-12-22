import { StyleSheet, Text, View, Image } from "react-native";

const Home = ({ route }) => {
  const email = route?.params?.email || "user@gmail.com";
  const name = email.split("@")[0];

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
    flexDirection: "row", // صف أفقي
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
});


export default Home;
