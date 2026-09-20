import React, { useEffect, useRef, useState } from "react"
import { onUIEvent, unsubscribeOnUIEvent } from "@/ui/uiEvents";
import { useForceRerender } from "./hooks/useForceRerender";
import { InputAction, Level } from "@/types";
import { PauseMenuElement, PauseMenuNavMap } from "@/ui/uiNavMap";
import { bridge } from "./uiBridge";
import { LEVEL_01 } from "@/levels/campaign/level01";
import { CHALLENGE_LEVELS, LEVELS, SECRET_LEVELS } from "@/levels/levelConstants";
import { DropdownField, Option } from "@/components/Field";
import { Stack } from "@/components/Stack";
import { findLevelWarpIndex } from "@/levels/levelUtils";

export const DebugMenu = () => {
  const [showing, setShowing] = useState(false);
  const forceRerender = useForceRerender();
  const debugMenu = useRef<HTMLDivElement>(null);
  const pauseMenuNavMap = useRef<PauseMenuNavMap>(null);

  const [selectedLevel, setSelectedLevel] = useState<Level>(LEVEL_01);
  const [difficulty, setDifficulty] = useState<number>(3);

  const levelsToInclude = [
    ...LEVELS,
    ...SECRET_LEVELS,
    ...CHALLENGE_LEVELS,
  ];

  const levelToOption = (level: Level): Option => ({
    value: level.id,
    label: level.name,
  })
  const levelOptions: Option[] = levelsToInclude.map(levelToOption);

  const difficultyOptions: Option[] = [
    {
      value: '1',
      label: 'easy',
    },
    {
      value: '2',
      label: 'medium',
    },
    {
      value: '3',
      label: 'hard',
    },
    {
      value: '4',
      label: 'ultra',
    },
  ];

  const handleSetLevel = (option: Option) => {
    const id = option.value;
    const match = levelsToInclude.find(level => level.id === id);
    if (!match) return;
    setSelectedLevel(match);
    bridge.callAction(InputAction.WarpToLevel, findLevelWarpIndex(match));
  }

  const handleSetDifficulty = (option: Option) => {
    const difficulty = parseInt(option.value, 10);
    if (!Number.isNaN(difficulty)) {
      setDifficulty(difficulty);
      bridge.callAction(InputAction.SetDifficulty, difficulty);
    }
  }

  useEffect(() => {
    const handleUIEvent = (action: InputAction = InputAction.None) => {
      switch (action) {
        case InputAction.ForceRerender:
          forceRerender();
          break;
        case InputAction.ShowMainMenu:
          setShowing(false);
          break;
        case InputAction.Pause:
          setShowing(true);
          break;
        case InputAction.WarpToLevel:
          setShowing(false);
          break;
        case InputAction.UnPause:
          setShowing(false);
          break;
        default:
          break;
      }
    }
    onUIEvent(handleUIEvent);
    return () => {
      unsubscribeOnUIEvent(handleUIEvent);
    }
  }, []);

  useEffect(() => {
    if (showing) {
      bridge.debugMenu.onNavigate = (navDir) => {
        const focused = document.activeElement && debugMenu.current?.contains(document.activeElement);
        // if focused, intercept navigation input
        return focused;
      }
      bridge.debugMenu.onInteract = () => {
        return pauseMenuNavMap.current.callSelected();
      }
      bridge.debugMenu.onCancel = () => {
        return false;
      }
    } else {
      bridge.debugMenu.onNavigate = null;
      bridge.debugMenu.onInteract = null;
      bridge.debugMenu.onCancel = null;
      pauseMenuNavMap.current = null;
    }
  }, [showing]);

  if (!showing) return;

  return (
    <div ref={debugMenu} id="debug-menu" className="debug-menu">
      <Stack className="content">
        <Stack row>
          <DropdownField
            id={PauseMenuElement.DropdownDebugWarp}
            label="Warp To Level"
            options={levelOptions}
            value={selectedLevel.id}
            defaultValue={LEVEL_01.id}
            onChange={handleSetLevel}
          />
        </Stack>
        <Stack row>
          <DropdownField
            id="debug-menu-difficulty-dropdown"
            label="Difficulty"
            options={difficultyOptions}
            value={String(difficulty)}
            defaultValue={'3'}
            onChange={handleSetDifficulty}
          />
        </Stack>
      </Stack>
    </div>
  );
}
