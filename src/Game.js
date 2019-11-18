import React, { useState, useEffect } from "react";
import axios from "axios";
import GameStyles from "./GameStyles.js";
import Map from "./Map.js";

const Game = () => {
  const classes = GameStyles();
  const token = process.env.REACT_APP_TOKEN || localStorage.getItem("token");

  const [player, setPlayer] = useState({
    name: "Unknown",
    room_id: 0,
    title: "A brightly lit room",
    description:
      "You are standing in the center of a brightly lit room. You notice a shop to the west and exits to the north, south and east.",
    coordinates: "(60,60)",
    elevation: 0,
    terrain: "NORMAL",
    players: [],
    items: [],
    exits: ["n", "s", "e", "w"],
    cooldown: 100.0,
    errors: [],
    messages: []
  });

  useEffect(() => {
    const init = async () => {
      const res = await axios.get(
        "https://lambda-treasure-hunt.herokuapp.com/api/adv/init/",
        {
          headers: {
            Authorization: `Token ${token}`
          }
        }
      );
      setPlayer({ ...player, ...res.data });
      console.log(res.data);
    };
    init();
  }, [player, token]);

  useEffect(() => {
    const status = async () => {
      const res = await axios.post(
        "https://lambda-treasure-hunt.herokuapp.com/api/adv/status/",
        {
          headers: {
            Authorization: `Token ${token}`
          }
        }
      );
      setPlayer({ ...player, ...res.data });
      console.log(res.data);
    };
    status();
  });

  return (
    <div className={classes.container}>
      <div className={classes.sideBar}>
        <h1 className={classes.header}>Treasure Island</h1>
        <h2 className={classes.instructions}>
          Use Navigation Keys Below To Move.
        </h2>
        <div className={classes.headerAndText}>
          <h2 className={classes.headertwo}>Name: </h2>
          <p className={classes.text}> {player.name}</p>
        </div>
        <div className={classes.headerAndText}>
          <h2 className={classes.headertwo}>Current Location:</h2>
          <p className={classes.text}> Room: {player.room_id}</p>
          <p className={classes.text}> Coords: {player.coordinates}</p>
        </div>
        <div className={classes.headerAndText}>
          <h2 className={classes.headertwo}>Items at Current Location:</h2>
          {player.items.map(item => {
            return (
              <p className={classes.text} key={item}>
                {item}
              </p>
            );
          })}
        </div>
        <div className={classes.errorContainer}>
          <div className={classes.headerAndTextError}>
            <h2 className={classes.headertwoError}>Error Messages:</h2>
            {player.errors.map(msg => {
              return (
                <p className={classes.textError} key={msg}>
                  {msg}
                </p>
              );
            })}
          </div>
        </div>
      </div>
      <div className={classes.mapSection}>
        <Map player={player} token={token} setPlayer={setPlayer} />
      </div>
    </div>
  );
};

export default Game;
