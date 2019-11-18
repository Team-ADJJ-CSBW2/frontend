import React, { useState } from "react";

const AutoExplore = props => {
  const { cooldown, player, graph, move } = props;
  const [exploring, setExploring] = useState(false);

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

  const newRoomDirections = current => {
    const path = [];
    path.push([[current], []]);
    const searched = {};
    while (path.length > 0) {
      let cur = path.pop();
      let last = cur[0][cur[0].length - 1];
      if (last === "?" || graph[last] === undefined) {
        return cur[1];
      }
      let exits = graph[last];
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

  const explore = current => {
    const directions = newRoomDirections(current);
    console.log("directions:", directions);

    // setExploring(true);
    // let dir = directions.shift();
    // console.log(dir);
    // while (exploring === true && directions.length > 0) {
    //   setTimeout(function() {
    //     console.log(cooldown);
    //     console.log("time to execute next move");
    //     move(dir);
    //   }, (cooldown + 1) * 1000);
    // }
    // clearTimeout();
  };

  const stopExploration = () => {
    setExploring(false);
  };

  return (
    <div>
      <button onClick={() => explore(player.room_id)}>Auto Explore</button>
      <button onClick={() => stopExploration()}>Stop Exploration</button>
    </div>
  );
};

export default AutoExplore;
