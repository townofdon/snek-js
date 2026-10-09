import React, { useEffect, useRef, useState } from "react"
import { onUIEvent, unsubscribeOnUIEvent } from "@/ui/uiEvents";
import { useForceRerender } from "./hooks/useForceRerender";
import { InputAction, Level } from "@/types";
import { PauseMenuElement, PauseMenuNavMap } from "@/ui/uiNavMap";
import { bridge } from "./uiBridge";
import { LEVEL_01 } from "@/levels/ep01/level01";
import { CHALLENGE_LEVELS, LEVELS_EP_01, LEVELS_EP_02, LEVELS_EP_03, SECRET_LEVELS } from "@/levels/levelConstants";
import { DropdownField, Option } from "@/components/Field";
import { Stack } from "@/components/Stack";
import { findLevelWarpIndex } from "@/levels/levelUtils";
import { CheckboxField } from "./components/CheckboxField";

export const DebugMenu = () => {
  const [showing, setShowing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const forceRerender = useForceRerender();
  const debugMenu = useRef<HTMLDivElement>(null);
  const pauseMenuNavMap = useRef<PauseMenuNavMap>(null);

  const [selectedLevel, setSelectedLevel] = useState<Level>(LEVEL_01);
  const [difficulty, setDifficulty] = useState<number>(3);

  const levelsToInclude = [
    ...LEVELS_EP_01,
    ...SECRET_LEVELS,
    ...LEVELS_EP_02,
    ...LEVELS_EP_03,
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
    const idx = findLevelWarpIndex(match)
    if (!match) {
      throw new Error(`no match for level id=${id}`)
    }
    if (!idx) {
      throw new Error(`no warp index found for level id=${id}`);
    }
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
      // note - the debug menu defers to the pauseMenuNavMap defined in uiBindings
      bridge.debugMenu.onNavigate = (navDir) => {
        const focused = document.activeElement && debugMenu.current?.contains(document.activeElement);
        const interceptNavigationInput = focused && menuOpen;
        return interceptNavigationInput;
      }
      bridge.debugMenu.onInteract = () => {
        const focused = document.activeElement && debugMenu.current?.contains(document.activeElement);
        const clickable = (document.activeElement as HTMLInputElement)?.type === 'checkbox';
        const interceptNavigationInput = focused && clickable;
        if (!interceptNavigationInput) return false;
        (document.activeElement as HTMLInputElement).click();
        return true;
      }
      bridge.debugMenu.onCancel = () => {
        const focused = document.activeElement && debugMenu.current?.contains(document.activeElement);
        const interceptNavigationInput = focused && menuOpen;
        return interceptNavigationInput;
      }
    } else {
      bridge.debugMenu.onNavigate = null;
      bridge.debugMenu.onInteract = null;
      bridge.debugMenu.onCancel = null;
      pauseMenuNavMap.current = null;
    }
  }, [showing, menuOpen]);

  if (!showing) return;

  const onMenuOpen = () => { setMenuOpen(true); }
  const onMenuClose = () => { setMenuOpen(false); }

  const handleChangeEasyExit = (checked: boolean) => {
    if (!showing) return;
    bridge.settings.setEasyExit(checked);
    forceRerender();
  }

  const handleChangeDisableTransitions = (checked: boolean) => {
    if (!showing) return;
    bridge.settings.setDisableTransitions(checked);
    forceRerender();
  }

  return (
    <div ref={debugMenu} id="debug-menu" className="debug-menu">
      <Stack col className="content">
        <Stack col align="start">
          <Stack row>
            <h2 className="minimood">debug</h2>
          </Stack>
          <Stack row>
            <DropdownField
              id={PauseMenuElement.DebugDropdownWarp}
              label="Warp To Level"
              options={levelOptions}
              value={selectedLevel.id}
              defaultValue={LEVEL_01.id}
              onChange={handleSetLevel}
              onMenuOpen={onMenuOpen}
              onMenuClose={onMenuClose}
            />
          </Stack>
          <Stack row>
            <DropdownField
              id={PauseMenuElement.DebugDropdownDifficulty}
              label="Difficulty"
              options={difficultyOptions}
              value={String(difficulty)}
              defaultValue={'3'}
              onChange={handleSetDifficulty}
              onMenuOpen={onMenuOpen}
              onMenuClose={onMenuClose}
            />
          </Stack>
          <Stack row>
            <CheckboxField
              id={PauseMenuElement.DebugCheckboxEasyExit}
              name="easy-exit"
              label="Enable Easy Exit"
              checked={bridge.settings.debug.easyExit}
              onChange={handleChangeEasyExit}
            />
          </Stack>
          <Stack row>
            <CheckboxField
              id={PauseMenuElement.DebugCheckboxDisableTransitions}
              name="disable-transitions"
              label="Disable Transitions"
              checked={bridge.settings.debug.disableTransitions}
              onChange={handleChangeDisableTransitions}
            />
          </Stack>
        </Stack>
      </Stack>
    </div>
  );
}
