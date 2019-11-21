const axios = require("axios");

const token = "d10dcabec7c8d4e933b1dda5b87308cfb92943d6";
let player = {};
let cooldown = 0;

const getStatus = async () => {
  try {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`
    };
    const body = {};
    const res = await axios.post(
      "https://lambda-treasure-hunt.herokuapp.com/api/adv/status/",
      body,
      { headers: headers }
    );
    setPlayer({ ...player, ...res.data });
    setCooldown(res.data.cooldown);
    console.log(res.data);
  } catch (err) {
    setCooldown(err.cooldown);
  }
};

const init = async () => {
  try {
    const res = await axios.get(
      "https://lambda-treasure-hunt.herokuapp.com/api/adv/init/",
      {
        headers: {
          Authorization: `Token ${token}`
        }
      }
    );
    player = res.data;
    cooldown = res.data.cooldown;
    console.log(res.data);
  } catch {
    err => console.log(err);
  }
};

const newRoomDirections = currentRoom => {
  const path = [];
  path.push([[currentRoom], []]);
  const searched = {};
  while (path.length > 0) {
    let cur = path.shift();
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

const explore = () => {
  init();
  const directions = newRoomDirections(player.currentRoom);
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

explore();
