import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#89190D",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 30,
  },
  formContainer: {
    width: "80%",
    alignItems: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "white",
    shadowColor: "black",
    shadowOffset: { width: 2, height: 2 }, // Độ lệch của bóng
    shadowOpacity: 0.8, // Độ mờ của bóng
    shadowRadius: 3, // Bán kính của bóng
    elevation: 5, // Chiều cao của bóng (dùng cho Android)
  },
  input: {
    width: "80%",
    height: 40,
    paddingHorizontal: 10,
    fontSize: 16,
    backgroundColor: "white",
  },
  icon: {
    marginHorizontal: 10,
  },
  button: {
    width: "100%",
    height: 50,
    top: 10,
    backgroundColor: "#A36658",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#A36659",
    shadowColor: "black",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 5,
  },
  buttonText: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
  link: {
    top: 10,
    marginTop: 10,
    fontSize: 16,
    color: "#FBEAFE",
    fontWeight: "bold",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  lottie: {
    width: 50,
    height: 50,
  },

  backButton: {
    position: "absolute",
    left: 20,
  },
});
