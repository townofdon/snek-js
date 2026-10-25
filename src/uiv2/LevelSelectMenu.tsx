import React, { useEffect, useLayoutEffect, useRef, useState } from "react"
import { useForceRerender } from "./hooks/useForceRerender";
import { Episode, InputAction, InputType, Level, NewGameArgs, UINavDir } from "@/types";
import { onUIEvent, unsubscribeOnUIEvent } from "@/ui/uiEvents";
import { saveDataStore } from '@/stores/SaveDataStore';
import { SELECTABLE_LEVELS_EP_01, SELECTABLE_LEVELS_EP_02, SELECTABLE_LEVELS_EP_03 } from "@/levels/levelConstants";
import { bridge } from "./uiBridge";
import { episodeDisplay, sluggify } from "@/utils";
import { GamepadType, getGamepadType } from "@/engine/gamepad";
import { Stack } from "@/components/Stack";
import { LevelPreview } from "@/engine/levelPreview/LevelPreview";

const LEVEL_PREVIEW_SIZE = 240;
const ADJACENT_LEVEL_POSITION = -60;

export const LevelSelectMenu = () => {
  const [selectedLevelIdx, setSelectedLevelIdx] = useState(0);
  const [selectedEpisode, setSelectedEpisode] = useState(Episode.E1);
  const [showing, setShowing] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [blink, setBlink] = useState(false);
  const forceRerender = useForceRerender();

  const inputType = bridge.gameState.inputType;

  const levels = (() => {
    if (selectedEpisode === Episode.E1) return SELECTABLE_LEVELS_EP_01;
    if (selectedEpisode === Episode.E2) return SELECTABLE_LEVELS_EP_02;
    if (selectedEpisode === Episode.E3) return SELECTABLE_LEVELS_EP_03;
    return SELECTABLE_LEVELS_EP_01;
  })();

  const levelcurr = levels[(selectedLevelIdx + 0) % levels.length] || null;
  let levelprev = levels[(selectedLevelIdx - 1) % levels.length] || null;
  let levelnext = levels[(selectedLevelIdx + 1) % levels.length] || null;

  if (selectedLevelIdx % levels.length === 0) {
    levelprev = null;
  }
  if (selectedLevelIdx % levels.length === levels.length - 1) {
    levelnext = null;
  }

  useEffect(() => {
    const handleUIEvent = (action: InputAction = InputAction.None) => {
      switch (action) {
        case InputAction.ForceRerender:
          forceRerender();
          break;
        case InputAction.ShowLevelSelectMenu:
          setShowing(true);
          setDisabled(false);
          setSelectedEpisode(Episode.E1);
          setSelectedLevelIdx(0);
          setBlink(false);
          break;
        case InputAction.HideLevelSelectMenu:
          setShowing(false);
          break;
        case InputAction.ShowSettingsMenu:
          setShowing(false);
          break;
        case InputAction.ShowMainMenu:
          setShowing(false);
          break;
        case InputAction.ShowGameModeMenu:
          setShowing(false);
          break;
        case InputAction.ShowSaveSlotMenu:
          setShowing(false);
          break;
        case InputAction.NewGame:
          setDisabled(true);
          break;
        case InputAction.ButtonBlinkOn:
          setBlink(true);
          break;
        case InputAction.ButtonBlinkOff:
          setBlink(false);
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
    if (showing && !disabled) {
      bridge.levelSelectMenu.showing = true;
      bridge.levelSelectMenu.onNavigate = (navDir: UINavDir) => {
        switch (navDir) {
          case UINavDir.Prev:
            setSelectedLevelIdx(prev => Math.max(prev - 1, 0));
            break;
          case UINavDir.Next:
            setSelectedLevelIdx(prev => prev + 1);
            break;
          case UINavDir.Up:
            setSelectedEpisode(prev => {
              let newEpisode = prev - 1;
              if (newEpisode < Episode.E1) newEpisode = Episode.E3;
              return newEpisode;
            });
            setSelectedLevelIdx(0);
            break;
          case UINavDir.Down:
            setSelectedEpisode(prev => {
              let newEpisode = prev + 1;
              if (newEpisode > Episode.E3) newEpisode = Episode.E1;
              return newEpisode;
            });
            setSelectedLevelIdx(0);  
            break;
          case UINavDir.Left:
            setSelectedLevelIdx(prev => Math.max(prev - 1, 0));
            break;
          case UINavDir.Right:
            setSelectedLevelIdx(prev => prev + 1);
            break;
        }
        return true;
      }
      bridge.levelSelectMenu.onInteract = () => {
        if (!levelcurr) return;
        const newGameArgs = {
          levelId: levelcurr.id,
          episode: selectedEpisode,
          gameMode: bridge.gameState.gameMode,
        } satisfies NewGameArgs;
        bridge.callAction(InputAction.NewGame, newGameArgs);
        setDisabled(true);
        return true;
      }
      bridge.levelSelectMenu.onCancel = () => {
        bridge.callAction(InputAction.HideLevelSelectMenu);
        return true;
      }
    } else {
      bridge.levelSelectMenu.showing = false;
      bridge.levelSelectMenu.onNavigate = null;
      bridge.levelSelectMenu.onInteract = null;
      bridge.levelSelectMenu.onCancel = null;
    }
  }, [showing, disabled, levelcurr]);

  if (!showing) return null;

  if (!levelcurr) {
    console.error(`could not find level of index ${selectedLevelIdx}`);
    return null;
  }

  const displayLevel = (level: Level | null, active: boolean) => {
    if (!level) return null;
    const slug = sluggify(level.name);
    const preview = `assets/graphics/level-preview/${slug}.jpg`;
    const completedMedium = saveDataStore.getLevelCompleted(level.id, 2);
    const completedHard = saveDataStore.getLevelCompleted(level.id, 3);
    const completedUltra = saveDataStore.getLevelCompleted(level.id, 4);
    return (
      <button id={`select-level-${slug}`} className={`select-level${active ? ' active' : ''}`} onClick={() => {
        if (disabled) return;
        const newGameArgs = {
          levelId: levelcurr.id,
          episode: selectedEpisode,
          gameMode: bridge.gameState.gameMode,
        } satisfies NewGameArgs;
        bridge.callAction(InputAction.NewGame, newGameArgs);
        setDisabled(true);
      }}>
        {active && (
          <div className="completion-status">
            <div className={`medium${completedMedium ? " completed" : ""}`}></div>
            <div className={`hard${completedHard ? " completed" : ""}`}></div>
            <div className={`ultra${completedUltra ? " completed" : ""}`}></div>
          </div>
        )}
        <img alt={`Select level ${level.name}`} src={preview} width="150" height="150" onError={(ev) => {
          console.error(ev);
        }} />
      </button>
    )
  };

  return (
    <div id="level-select-menu" className="settings-menu level-select-menu">
      <div className="background blur"></div>
      <div className="content">
        <h2 className="center title-gradient">Level Select</h2>
        <h3 className="center level-name">
          <span className="transform-flip-x"><img src="assets/graphics/editor-play.png" width="16" height="16" /></span>
          <span id="level-select-map-number" className="num">{String((selectedLevelIdx % levels.length) + 1).padStart(2, '0')}</span>
          <span id="level-select-map-name" className="name">{levelcurr.name}</span>
          <span><img src="assets/graphics/editor-play.png" width="16" height="16" /></span>
        </h3>
        <div id="level-select-levels" className="levels">
          <LevelPreview
            level={levelprev}
            width={LEVEL_PREVIEW_SIZE}
            height={LEVEL_PREVIEW_SIZE}
            className="dim"
            style={{
              position: 'absolute',
              left: ADJACENT_LEVEL_POSITION,
            }}
            deferLoading
          />
          <LevelPreview
            level={levelcurr}
            width={LEVEL_PREVIEW_SIZE}
            height={LEVEL_PREVIEW_SIZE}
            blink={blink}
            className="active"
          />
          <LevelPreview
            level={levelnext}
            width={LEVEL_PREVIEW_SIZE}
            height={LEVEL_PREVIEW_SIZE}
            className="dim"
            style={{
              position: 'absolute',
              right: ADJACENT_LEVEL_POSITION,
            }}
            deferLoading
          />
        </div>
        {/* <div id="level-select-levels" className="levels">
          {displayLevel(levelprev, false)}
          {!blink && displayLevel(levelcurr, true)}
          {displayLevel(levelnext, false)}
        </div> */}
        <div className="level-select-episode position-absolute" style={{ bottom: 60 }}>
          <span className="overworld-icon vert-arrows" style={{ marginBottom: 8 }} />
          <h4 className="minimood episode">{episodeDisplay(selectedEpisode)}</h4>
        </div>
        <div className="menu-controls position-absolute" style={{ bottom: 60, right: 40 }}>
          <Controls inputType={inputType} />
        </div>
      </div>
    </div>
  )
}

interface ControlsProps {
  inputType: InputType,
}
function Controls({ inputType }: ControlsProps) {
  const gamepadType = getGamepadType();
  if (inputType === InputType.Keyboard) {
    return (
      <>
        <Stack row>
          <span className="controls-key escape position-absolute" style={{ right: '100%' }} />
          <p className="minimood">Back</p>
        </Stack>
        <Stack>
          <span className="controls-key return position-absolute" style={{ right: '100%' }} />
          <p className="minimood">Select</p>
        </Stack>
      </>
    );
  }
  return (
    <>
      <Stack row>
        {(gamepadType === GamepadType.Xbox) && (
          <span className="controls-button xbox-a position-absolute" style={{ right: '100%', marginRight: 10 }} />
        )}
        {gamepadType === GamepadType.Playstation && (
          <span className="controls-button ps-x position-absolute" style={{ right: '100%', marginRight: 10 }} />
        )}
        {gamepadType === GamepadType.Nintendo && (
          <span className="controls-button switch-b position-absolute" style={{ right: '100%', marginRight: 10 }} />
        )}
        <p className="minimood">Select</p>
      </Stack>
      <Stack row>
        {(gamepadType === GamepadType.Xbox) && (
          <span className="controls-button xbox-b position-absolute" style={{ right: '100%', marginRight: 10 }} />
        )}
        {(gamepadType === GamepadType.Playstation) && (
          <span className="controls-button ps-o position-absolute" style={{ right: '100%', marginRight: 10 }} />
        )}
        {(gamepadType === GamepadType.Nintendo) && (
          <span className="controls-button switch-a position-absolute" style={{ right: '100%', marginRight: 10 }} />
        )}
        <p className="minimood">Back</p>
      </Stack>
    </>
  )
}
