import React, { useEffect } from "react";
import GameStyles from "./GameStyles.js";

const Timer = props => {
  const classes = GameStyles();

  const { setCooldown, cooldown } = props;

  useEffect(() => {
    // exit if we reach 0
    if (cooldown <= 0) {
      setCooldown(0);
      return;
    }

    const interval = setInterval(() => {
      setCooldown(cooldown => cooldown - 1);
    }, 1000);

    // clean up
    return () => clearInterval(interval);
  }, [cooldown, setCooldown]);

  return (
    <>
      <div className={cooldown > 0 ? classes.timerStart : classes.timer}>
        {Math.ceil(cooldown)}s
      </div>
    </>
  );
};

export default Timer;
