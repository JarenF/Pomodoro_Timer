import React, { useState } from 'react';
import useInterval from '../utils/useInterval';
import Durations from './Durations';
import Control from './Control';
import Status from './Status';
// These functions are defined outside of the component to ensure they do not have access to state
// and are, therefore more likely to be pure.

/**
 * Update the session state with new state after each tick of the interval.
 * @param prevState
 *  the previous session state
 * @returns
 *  new session state with timing information updated.
 */
function nextTick(prevState) {
  let timeRemaining = Math.max(0, prevState.timeRemaining - 1);
  return {
    ...prevState,
    timeRemaining,
  };
}

/**
 * Higher order function that returns a function to update the session state with the next session type upon timeout.
 * @param focusDuration
 *    the current focus duration
 * @param breakDuration
 *    the current break duration
 * @returns
 *  function to update the session state.
 */
function nextSession(focusDuration, breakDuration) {
  /**
   * State function to transition the current session type to the next session. e.g. On Break -> Focusing or Focusing -> On Break
   */
  return (currentSession) => {
    if (currentSession.label === 'Focusing') {
      return {
        label: 'On Break',
        timeRemaining: breakDuration * 60,
      };
    }
    return {
      label: 'Focusing',
      timeRemaining: focusDuration * 60,
    };
  };
}

function Pomodoro() {
  // Timer starts out paused
  let [isTimerRunning, setIsTimerRunning] = useState(false);
  // The current session - null where there is no session running
  let [session, setSession] = useState(null);

  // ToDo: Allow the user to adjust the focus and break duration.
  let [focusDuration, setFocusDuration] = useState(25);
  let [breakDuration, setBreakDuration] = useState(5);

  let handleFocusDecrease = () =>
    setFocusDuration(Math.max(5, focusDuration - 5));

  let handleFocusIncrease = () =>
    setFocusDuration(Math.min(60, focusDuration + 5));

  let handleBreakDecrease = () =>
    setBreakDuration(Math.max(1, breakDuration - 1));

  let handleBreakIncrease = () =>
    setBreakDuration(Math.min(15, breakDuration + 1));

  let handleStop = () => {
    setFocusDuration(25);
    setBreakDuration(5);
    setSession(null);
    setIsTimerRunning(false);
  };

  /**
   * Custom hook that invokes the callback function every second
   *
   * NOTE: You will not need to make changes to the callback function
   */
  useInterval(
    () => {
      if (session.timeRemaining === 0) {
        new Audio('https://bigsoundbank.com/UPLOAD/mp3/1482.mp3').play();
        return setSession(nextSession(focusDuration, breakDuration));
      }
      return setSession(nextTick);
    },
    isTimerRunning ? 1000 : null
  );

  /**
   * Called whenever the play/pause button is clicked.
   */
  function playPause() {
    setIsTimerRunning((prevState) => {
      let nextState = !prevState;
      if (nextState) {
        setSession((prevStateSession) => {
          // If the timer is starting and the previous session is null,
          // start a focusing session.
          if (prevStateSession === null) {
            return {
              label: 'Focusing',
              timeRemaining: focusDuration * 60,
            };
          }
          return prevStateSession;
        });
      }
      return nextState;
    });
  }

  return (
    <div className="pomodoro">
      <Durations
        session={session}
        focusDuration={focusDuration}
        breakDuration={breakDuration}
        handleFocusDecrease={handleFocusDecrease}
        handleFocusIncrease={handleFocusIncrease}
        handleBreakDecrease={handleBreakDecrease}
        handleBreakIncrease={handleBreakIncrease}
      />

      <Control
        session={session}
        isTimerRunning={isTimerRunning}
        handleStop={handleStop}
        playPause={playPause}
      />

      <Status
        session={session}
        focusDuration={focusDuration}
        breakDuration={breakDuration}
        isTimerRunning={isTimerRunning}
      />
    </div>
  );
}

export default Pomodoro;