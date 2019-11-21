import React, { useState } from "react";
import axios from "axios";

const AutoExplore = props => {
  const token = process.env.REACT_APP_TOKEN || localStorage.getItem("token");

  // const { player, graph, setGraph, move, map, setMap } = props;
  const { player, graph, move, dash, pickupTreasure, pickupSnitch } = props;
  // const [exploring, setExploring] = useState(false);
  const [roomForm, setRoomForm] = useState(0);
  const [getDirections, setGetDirections] = useState(0);

  const shuffle = array => {
    // console.log("shuffle", array);
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
    // console.log(directions);
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

  // const stopExploration = () => {
  //   // setExploring(false);
  // };

  const findTreasure = async () => {
    // Walk around randomly
    // console.log("player", player);
    if (player.items.length) {
      // If items in current room pickup and find more
      const result = await pickupTreasure();
      await sleep(result.cooldown + 1);
      findTreasure();
    }
    if (player.encumbrance >= player.strength) {
      // if fully encumbered stop searching
      console.log("inventory full, sell items");
      return;
    }
    const exits = [...player.exits];
    const directions = shuffle(exits);
    const dir = directions.pop();
    const result = await move(dir, graph);
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
      await sleep(result.cooldown + 1);
      findTreasure();
    } else {
      findTreasure();
    }
  };

  const findSnitches = async () => {
    // Walk around randomly
    // console.log("player", player);
    if (player.items.includes("golden snitch")) {
      // If items in current room pickup and find more
      const result = await pickupSnitch();
      await sleep(result.cooldown + 1);
      findSnitches();
    }
    if (player.encumbrance >= player.strength) {
      // if fully encumbered stop searching
      console.log("inventory full, sell items");
      return;
    }
    const exits = [...player.exits];
    const directions = shuffle(exits);
    const dir = directions.pop();
    const result = await move(dir, graph);
    // // Get updated graph - may not be necessary
    // const updatedMap = await axios.get(
    //   "https://Snitches-hunt-map.herokuapp.com/api/rooms"
    // );
    // const updatedGraph = updatedMap.data.graph;
    // setGraph(updatedGraph);
    await sleep(result.cooldown + 1);
    // if Snitches in room
    if (result.items.includes("golden snitch")) {
      // pick it up
      await pickupSnitch();
      await sleep(result.cooldown + 1);
      findSnitches();
    } else {
      findSnitches();
    }
  };

  const targetTravel = async (e, current, target) => {
    e.preventDefault();
    e.persist();
    // Get directions
    const directions = findPath(current, target);
    // directions by cardinal direction
    const travelDirections = directions[1];
    // rooms in directions path
    const roomDirections = directions[0].slice(1);
    console.log(directions);

    //! DASH
    // Check first direction
    const nextDirection = travelDirections[0];
    let dashArray = [];
    // loop over directions
    for (let i = 0; i < travelDirections.length; i++) {
      // if next direction === current direction
      if (travelDirections[i] === nextDirection) {
        // add room number to dash array
        dashArray.push(roomDirections[i]);
      } else {
        // else break loop
        break;
      }
    }

    // if dashArray.length >= 3
    let result;
    if (dashArray.length >= 3) {
      // conver dashArray and into string
      // dashString = dashArray.toString()
      // dash
      result = await dash(nextDirection, dashArray);
    } else {
      // Get first direction and move, wait for promise to resolve
      result = await move(nextDirection);
    }

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
      {/* <button onClick={() => stopExploration()}>Stop Exploration</button> */}
      <button onClick={() => pickupTreasure()}>Pickup Treasure</button>
      <button onClick={() => findTreasure()}>Find Treasure</button>
      <button onClick={() => findSnitches()}>Find Snitches</button>
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
