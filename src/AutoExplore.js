import React from "react";
// import React, { useState } from "react";
import axios from "axios";

const AutoExplore = props => {
  const token = process.env.REACT_APP_TOKEN || localStorage.getItem("token");

  // const { player, graph, setGraph, move, map, setMap } = props;
  const { player, graph, setGraph, move, getStatus } = props;
  // const [exploring, setExploring] = useState(false);

  const shuffle = array => {
    console.log("shuffle", array);
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  // const findPath = (current, target) => {
  //   const path = [];
  //   path.push([[current], []]);
  //   const searched = {};
  //   while (path.length > 0) {
  //     let cur = path.shift();
  //     let last = cur[0][cur[0].length - 1];
  //     let exits = graph[last];
  //     if (searched[last] === undefined) {
  //       if (last === target) return cur[1];
  //       searched[last] = 1;
  //       for (const e of exits) {
  //         if (exits[e] === "?")
  //           return `Direction ${e} in Room ${last} not yet explored! Directions to Room ${last} are ${cur[1]}`;
  //         path.push([cur[0].concat(exits[e]), cur[1].concat(e)]);
  //       }
  //     }
  //   }
  // };

  const newRoomDirections = (current, g = graph) => {
    const path = [];
    path.push([[current], []]);
    const searched = {};
    while (path.length > 0) {
      let cur = path.shift();
      let last = cur[0][cur[0].length - 1];
      if (last === "?" || g[last] === undefined) {
        return cur[1];
      }
      let exits = g[last];
      // console.log("cur:", cur, "last:", last, "exits:", exits, "graph:", graph);

      if (searched[last] === undefined) {
        searched[last] = 1;
        // randomized exploring
        let directions = Object.keys(exits);
        shuffle(directions);
        // add to path the room number and directions
        for (const d of directions) {
          path.push([cur[0].concat(exits[d]), cur[1].concat(d)]);
        }
      }
    }
  };

  const sleep = cooldown => {
    return new Promise(resolve => setTimeout(resolve, cooldown * 1000));
  };

  const explore = async (current, g = graph) => {
    // Get directions
    const directions = newRoomDirections(current, g);
    console.log(directions);
    // Get first direction and move, wait for promise to resolve
    let dir = directions.shift();
    const result = await move(dir, g);

    // Get updated graph - may not be necessary
    const updatedMap = await axios.get(
      "https://treasure-hunt-map.herokuapp.com/api/rooms"
    );
    const updatedGraph = updatedMap.data.graph;
    setGraph(updatedGraph);

    console.log(newRoomDirections(result.room_id, updatedGraph));
    console.log(updatedGraph[result.room_id]);
    // Use resolved promise from move to set cooldown
    await sleep(result.cooldown + 1);
    // recursively explore
    if (newRoomDirections(result.room_id, updatedGraph).length > 0)
      explore(result.room_id, updatedGraph);
  };

  const stopExploration = () => {
    // setExploring(false);
  };

  const pickupTreasure = async () => {
    // POST to pick up treasure in room
    console.log(player);
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`
    };
    try {
      const result = await axios.post(
        "https://lambda-treasure-hunt.herokuapp.com/api/adv/take/",
        { name: player.items[0] },
        { headers: headers }
      );
      console.log(result);
      await sleep(result.data.cooldown + 1);
      getStatus();
    } catch (err) {
      console.log(err);
    }
  };

  const findTreasure = async () => {
    // Walk around randomly
    // console.log("player", player);
    if (player.items.length) {
      pickupTreasure();
    }
    const exits = [...player.exits];
    const directions = shuffle(exits);
    const dir = directions.pop();
    console.log(dir);
    const result = await move(dir, graph);
    console.log("result of move", result);
    // // Get updated graph - may not be necessary
    // const updatedMap = await axios.get(
    //   "https://treasure-hunt-map.herokuapp.com/api/rooms"
    // );
    // const updatedGraph = updatedMap.data.graph;
    // setGraph(updatedGraph);
    await sleep(result.cooldown + 1);
    // if treasure in room
    if (result.items.length) {
      // pick it up
      await pickupTreasure();
    } else {
      findTreasure();
    }
    // if held treasure ===
  };

  return (
    <div>
      <button onClick={() => explore(player.room_id)}>Auto Explore</button>
      <button onClick={() => stopExploration()}>Stop Exploration</button>
      <button onClick={() => pickupTreasure()}>Pickup Treasure</button>
      <button onClick={() => findTreasure()}>Find Treasure</button>
    </div>
  );
};

export default AutoExplore;
