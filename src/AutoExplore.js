import React from "react";
// import React, { useState } from "react";
import axios from "axios";

const AutoExplore = props => {
  // const { player, graph, setGraph, move, map, setMap } = props;
  const { player, graph, setGraph, move } = props;
  // const [exploring, setExploring] = useState(false);

  const shuffle = array => {
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
      "https://treasure-hunt-map.herokuapp.com/api/map"
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

  return (
    <div>
      <button onClick={() => explore(player.room_id)}>Auto Explore</button>
      <button onClick={() => stopExploration()}>Stop Exploration</button>
    </div>
  );
};

export default AutoExplore;
