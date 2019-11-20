import React, { useState } from "react";
import axios from "axios";

const AutoExplore = props => {
  // const { player, graph, setGraph, move, map, setMap } = props;
  const { player, graph, move } = props;
  // const [exploring, setExploring] = useState(false);
  const [roomForm, setRoomForm] = useState(0);
  const [getDirections, setGetDirections] = useState(0);

  const shuffle = array => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const findPath = (current, target) => {
    const path = [];
    path.push([[current], []]);
    const searched = {};
    while (path.length > 0) {
      let cur = path.shift();
      let last = cur[0][cur[0].length - 1];
      let exits = graph[last];

      if (searched[last] === undefined) {
        if (last === target) {
          return cur;
        }
        searched[last] = 1;
        let directions = Object.keys(exits);
        for (const d of directions) {
          if (exits[d] === "?")
            return `Direction ${d} in Room ${last} not yet explored! Directions to Room ${last} are ${cur[1]}`;
          path.push([cur[0].concat(exits[d]), cur[1].concat(d)]);
        }
      }
    }
  };

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
    if (directions === undefined) {
      console.log("All rooms have been explored!");
      return;
    }
    // Get first direction and move, wait for promise to resolve
    let dir = directions.shift();
    const result = await move(dir, g);
    const newRoom = result.room_id;

    // Get updated graph - may not be necessary
    const updatedMap = await axios.get(
      "https://treasure-hunt-map.herokuapp.com/api/rooms"
    );
    const updatedGraph = updatedMap.data.graph;

    // Use resolved promise from move to set cooldown
    await sleep(result.cooldown + 1);
    // recursively explore
    if (newRoomDirections(newRoom, updatedGraph).length > 0)
      explore(newRoom, updatedGraph);
  };

  const stopExploration = () => {
    // setExploring(false);
  };

  const targetTravel = async (e, current, target) => {
    e.preventDefault();
    e.persist();
    // Get directions
    const directions = findPath(current, target)[1];
    console.log(directions);

    // Get first direction and move, wait for promise to resolve
    let dir = directions.shift();
    const result = await move(dir);
    const newRoom = result.room_id;

    // Use resolved promise from move to set cooldown
    await sleep(result.cooldown + 1);
    if (newRoom !== target) targetTravel(e, newRoom, target);
  };

  const printPath = async (e, current, target) => {
    e.preventDefault();
    const result = findPath(current, target);
    console.log(result);
  };

  return (
    <div>
      <button onClick={() => explore(player.room_id)}>Auto Explore</button>
      <button onClick={() => stopExploration()}>Stop Exploration</button>
      <form onSubmit={e => targetTravel(e, player.room_id, roomForm)}>
        <input
          type="number"
          value={roomForm}
          onChange={e => setRoomForm(Number(e.target.value))}
        />
        <input type="submit" value="Travel To Room # (0-499)" />
      </form>
      <form onSubmit={e => printPath(e, player.room_id, getDirections)}>
        <input
          type="number"
          value={getDirections}
          onChange={e => setGetDirections(Number(e.target.value))}
        />
        <input type="submit" value="Get Directions To Room # (0-499)" />
      </form>
    </div>
  );
};

export default AutoExplore;
