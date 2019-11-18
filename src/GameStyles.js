import { makeStyles } from "@material-ui/core";

const GameStyles = makeStyles({
  hidden: {
    visibility: "hidden"
  },
  container: {
    display: "flex",
    maxWidth: "1500px",
    width: "100%",
    height: "100vh"
  },
  header: {
    fontSize: "20px",
    color: "gray"
  },
  sideBar: {
    border: "1px solid black",
    width: "20%",
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    height: "100vh"
  },
  headerAndText: {
    marginTop: "4rem",
    alignItems: "center"
  },
  headertwo: {
    fontSize: "2rem",
    fontWeight: "bold",
    margin: "1% 0"
  },
  text: {
    fontSize: "1.6rem"
  },
  errorContainer: {
    height: "10rem"
  },
  headerAndTextError: {
    alignItems: "center",
    color: "red",
    marginTop: "4rem",
    display: "block"
  },
  headertwoError: {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "red"
  },
  textError: {
    fontSize: "1.6rem",
    color: "red"
  },

  mapSection: {
    display: "flex",
    margin: "0 auto",
    flexDirection: "column",
    width: "70%"
  },
  instructions: {
    fontSize: "2rem"
  },
  navigation: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    margin: "2%"
  },
  navBotButtons: {
    display: "flex",
    justifyContent: "center",
    width: "300px"
  },
  navButtons: {
    margin: "1%"
  },

  gridContainer: {
    height: "500px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
  },
  row: {
    color: "blue",
    display: "flex",
    justifyContent: "space-between",
    margin: "1%"
  },
  room: {
    // height: "50px",
    // width: "50px",
    color: "green",
    display: "flex",
    margin: "1%"
  },
  roomGrid: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
  },
  middle: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center"
  },

  timer: {
    fontSize: "2rem",
    textAlign: "center",
    color: "black"
  },
  timerStart: {
    fontSize: "2rem",
    textAlign: "center",
    color: "red"
  }
});

export default GameStyles;
