import React from "react";
import Game from "./Game.js";
import { BrowserRouter, Route } from "react-router-dom";
import { makeStyles } from "@material-ui/core";

function App() {
  const classes = makeStyles({
    root: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      height: "100vh"
    }
  })();

  return (
    <BrowserRouter>
      <div className={classes.root}>
        <Route exact path="/" component={Game} />
      </div>
    </BrowserRouter>
  );
}

export default App;
