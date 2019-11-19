import React, { useState, useEffect } from "react";
import GameStyles from "./GameStyles.js";
import Timer from "./Timer.js";
import AutoExplore from "./AutoExplore.js";
import axios from "axios";

import { faSquare as regSquare } from "@fortawesome/free-regular-svg-icons";
import {
  faSquare,
  faArrowUp,
  faArrowRight,
  faArrowDown,
  faArrowLeft,
  faQuestion
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Map = props => {
  const classes = GameStyles();
  const { player, setPlayer, token, cooldown, setCooldown } = props;

  const [map, setMap] = useState([]);
  const [graph, setGraph] = useState();

  useEffect(() => {
    axios
      // .get("http://localhost:5000/api/map")
      .get("https://treasure-hunt-map.herokuapp.com/api/map")
      .then(res => {
        console.log(res.data);
        setMap(res.data.rooms);
        setGraph(res.data.graph);
      })
      .catch(err => console.log(err));
  }, []);

  // Render whole map
  // Convert coords to integers
  // const coords = map.map(r =>
  //   r.coordinates
  //     .slice(1, r.coordinates.length - 1)
  //     .split(",")
  //     .map(Number)
  // );

  // const xValues = coords.map(r => r[0]);
  // const yValues = coords.map(r => r[1]);

  // const minX = Math.min(...xValues);
  // const minY = Math.min(...yValues);

  // const maxX = Math.max(...xValues);
  // const maxY = Math.max(...yValues);

  // Render 5 to the east and west, 3 to the north and south
  const currentCoords = player.coordinates
    .slice(1, player.coordinates.length - 1)
    .split(",")
    .map(Number);

  const minX = currentCoords[0] - 5;
  const minY = currentCoords[1] - 3;

  const maxX = currentCoords[0] + 5;
  const maxY = currentCoords[1] + 3;

  const createMap = () => {
    // initialize map
    let gameMap = [];
    // start loop for rows
    for (let y = minY; y <= maxY; y++) {
      // for each row, initialize storage for all rooms in the row
      let rowMap = [];
      // start loop for each room column in the row
      for (let x = minX; x <= maxX; x++) {
        // default direction value is 0
        let north = 0;
        let south = 0;
        let east = 0;
        let west = 0;
        // if room exists/has been found
        if (map.find(el => el.coordinates === `(${x},${y})`)) {
          let room = map.find(el => el.coordinates === `(${x},${y})`);
          // add 1 to direction if exists in exits array
          if (room.exits.includes("n")) north += 1;
          if (room.exits.includes("s")) south += 1;
          if (room.exits.includes("e")) east += 1;
          if (room.exits.includes("w")) west += 1;
          // add room to rowMap
          rowMap.push(
            <div className={classes.room} key={[x, y]}>
              {/* split room into grid, room resides in middle, directions hug each border of room */}
              <div className={classes.roomGrid}>
                <div className={north > 0 ? classes.show : classes.hidden}>
                  <FontAwesomeIcon icon={faArrowUp} />
                </div>
                <div className={classes.middle}>
                  <div className={west > 0 ? classes.show : classes.hidden}>
                    <FontAwesomeIcon icon={faArrowLeft} />
                  </div>
                  {/* render room icon differently based on if player is in room */}
                  {player.coordinates === `(${x},${y})` && (
                    <FontAwesomeIcon icon={faSquare} />
                  )}
                  {player.coordinates !== `(${x},${y})` && (
                    <FontAwesomeIcon icon={regSquare} />
                  )}
                  <div className={east > 0 ? classes.show : classes.hidden}>
                    <FontAwesomeIcon icon={faArrowRight} />
                  </div>
                </div>
                <div className={south > 0 ? classes.show : classes.hidden}>
                  <FontAwesomeIcon icon={faArrowDown} />
                </div>
              </div>
            </div>
          );
          // if room does not exist or has not been found, placeholder rowMap
        } else
          rowMap.push(
            <div key={[x, y]} className={classes.room}>
              <div className={classes.roomGrid}>
                <div className={classes.hidden}>
                  <FontAwesomeIcon icon={faArrowUp} />
                </div>
                <div className={classes.middle}>
                  <div className={classes.hidden}>
                    <FontAwesomeIcon icon={faArrowLeft} />
                  </div>
                  <FontAwesomeIcon icon={faQuestion} />
                  <div className={classes.hidden}>
                    <FontAwesomeIcon icon={faArrowRight} />
                  </div>
                </div>
                <div className={classes.hidden}>
                  <FontAwesomeIcon icon={faArrowDown} />
                </div>
              </div>
            </div>
          );
      }
      gameMap.push(
        <div className={classes.row} key={y}>
          {rowMap.map(row => row)}
        </div>
      );
    }
    // x and y coordinates should start from bottom left
    gameMap.reverse();
    return gameMap;
  };

  // console.log("player:", player, "rooms:", map, "graph:", graph);

  const move = async direction => {
    if (player.exits.includes(direction)) {
      const params = {
        direction
      };
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`
      };
      if (graph[player.room_id][direction] !== "?")
        params.next_room_id = graph[player.room_id][direction].toString();
      console.log(params);
      try {
        const moved = await axios.post(
          "https://lambda-treasure-hunt.herokuapp.com/api/adv/move/",
          params,
          { headers: headers }
        );
        setPlayer({ ...player, ...moved.data });
        setCooldown(moved.data.cooldown);
        console.log(moved.data);
        // only post to pg server if proper response from lambda and room does not already exist
        if (moved && !map.find(r => r.room_id === moved.data.room_id)) {
          await axios.post(
            "https://treasure-hunt-map.herokuapp.com/api/map",
            moved.data
          );
          // refresh map
          axios
            .get("https://treasure-hunt-map.herokuapp.com/api/map")
            .then(res => {
              setMap(res.data.rooms);
              setGraph(res.data.graph);
            })
            .catch(err => console.log(err));
        }
      } catch (err) {
        setCooldown(err.response.data.cooldown);
        console.log(err.response);
      }
    } else {
      alert(`You can't move ${direction.toUpperCase()}!`);
    }
  };

  return (
    <div>
      <div className={classes.gridContainer}>{createMap()}</div>
      <div className={classes.navigation}>
        <h2 className={classes.headertwo}>Movement:</h2>
        <button className={classes.navButtons} onClick={() => move("n")}>
          North
        </button>
        <div className={classes.navBotButtons}>
          <button className={classes.navButtons} onClick={() => move("w")}>
            West
          </button>
          <button className={classes.navButtons} onClick={() => move("s")}>
            South
          </button>
          <button className={classes.navButtons} onClick={() => move("e")}>
            East
          </button>
        </div>
      </div>
      <div className={classes.navigation}>
        <h2 className={classes.headertwo}>Cooldown for Next Move:</h2>
        <Timer cooldown={cooldown} setCooldown={setCooldown} />
      </div>
      <div className={classes.navigation}>
        <h2 className={classes.headertwo}>Auto Explore:</h2>
        <AutoExplore
          cooldown={cooldown}
          player={player}
          graph={graph}
          move={move}
        />
      </div>
    </div>
  );
};

export default Map;
