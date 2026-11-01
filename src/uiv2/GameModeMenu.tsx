import { GameMode, InputAction, InputType, UINavDir } from "@/types";
import React, { useEffect, useRef, useState } from "react"

import { useForceRerender } from "./hooks/useForceRerender";
import { onUIEvent, unsubscribeOnUIEvent } from "@/ui/uiEvents";
import { bridge } from "./uiBridge";
import { GameModeMenuElement, } from "@/ui/uiNavMap";
import { Slot, SlotContainer } from "./components/Slot";
import { Stack } from "@/components/Stack";
import { saveDataStore } from "@/stores/SaveDataStore";
import { Controls } from "./components/Controls";
import { useRefState } from "@/editor/hooks/useRefState";

interface GameModeMenuProps {}
export const GameModeMenu = ({}: GameModeMenuProps) => {
  const forceRerender = useForceRerender();
  const [showing, setShowing] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [selectedMode, selectedModeRef, setSelectedMode] = useRefState<GameMode>(GameMode.Normal);

  const buttons: Record<GameModeMenuElement, React.MutableRefObject<any>> = {
    [GameModeMenuElement.Casual]: useRef(null),
    [GameModeMenuElement.Normal]: useRef(null),
    [GameModeMenuElement.Cobra]: useRef(null),
  }

  useEffect(() => {
    const handleUIEvent = (action: InputAction = InputAction.None) => {
      switch (action) {
        case InputAction.ForceRerender:
          forceRerender();
          break;
        case InputAction.ShowGameModeMenu:
          setShowing(true);
          setSelectedMode(GameMode.Normal);
          bridge.gameState.gameMode = GameMode.Normal;
          setDisabled(false);
          break;
        case InputAction.HideGameModeMenu:
          setShowing(false);
          break;
        case InputAction.ShowMainMenu:
          setShowing(false);
          break;
        case InputAction.ShowTitleScreen:
          setShowing(false);
          break;
        case InputAction.ShowLevelSelectMenu:
          setShowing(false);
          break;
        case InputAction.ShowSettingsMenu:
          setShowing(false);
          break;
        case InputAction.NewGame:
          setDisabled(true);
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
      bridge.gameModeMenu.showing = true;
      bridge.gameModeMenu.onNavigate = (navDir: UINavDir) => {
        const isCobraModeUnlocked = saveDataStore.getIsCobraModeUnlocked();
        switch (navDir) {
          case UINavDir.Prev:
            return false;
          case UINavDir.Next:
            return false;
          case UINavDir.Up:
            setSelectedMode(prev => {
              switch (prev) {
                case GameMode.Normal:
                  return GameMode.Casual;
                case GameMode.Casual:
                  if (!isCobraModeUnlocked) return GameMode.Normal;
                  return GameMode.Cobra;
                case GameMode.Cobra:
                  return GameMode.Normal;
                case GameMode.Arcade:
                case GameMode.Tutorial:
                default:
                  return GameMode.Normal;
              }
            });
            return true;
          case UINavDir.Down:
            setSelectedMode(prev => {
              switch (prev) {
                case GameMode.Normal:
                  if (!isCobraModeUnlocked) return GameMode.Casual;
                  return GameMode.Cobra;
                case GameMode.Casual:
                  return GameMode.Normal;
                case GameMode.Cobra:
                  return GameMode.Casual;
                case GameMode.Arcade:
                case GameMode.Tutorial:
                default:
                  return GameMode.Normal;
              }
            });
            return true;
          case UINavDir.Left:
            return false;
          case UINavDir.Right:
            return false;
          default:
            return false;
        }
      }
      bridge.gameModeMenu.onInteract = () => {
        handleSelectGameMode(selectedModeRef.current);
        return true;
      }
      bridge.gameModeMenu.onCancel = () => {
        bridge.callAction(InputAction.HideGameModeMenu);
        return true;
      }
    } else {
      bridge.gameModeMenu.showing = false;
      bridge.gameModeMenu.onNavigate = null;
      bridge.gameModeMenu.onInteract = null;
      bridge.gameModeMenu.onCancel = null;
    }
  }, [showing, disabled]);

  const handleSelectGameMode = (gameMode: GameMode) => {
    setSelectedMode(gameMode);
    bridge.gameState.gameMode = gameMode;
    bridge.callAction(InputAction.ShowLevelSelectMenu);
  }

  const isCobraModeUnlocked = saveDataStore.getIsCobraModeUnlocked();
  const inputType = bridge.gameState.inputType;

  if (!showing) return null;

  return (
    <div id="game-mode-menu" className="settings-menu game-mode-menu">
      <div className="background blur"></div>
      <div className="content gap">
        <h2 className="title-gradient">Game Mode</h2>

        <SlotContainer>
          <Slot
            className="game-mode-slot position-relative"
            id={GameModeMenuElement.Casual}
            slotRef={buttons[GameModeMenuElement.Casual]}
            selected={selectedMode === GameMode.Casual}
            onClick={() => handleSelectGameMode(GameMode.Casual)}
            onBlur={() => forceRerender()}
          >
            <GameModeSlotContent mode={GameMode.Casual} selected={selectedMode === GameMode.Casual} />
          </Slot>
          <Slot
            className="game-mode-slot position-relative"
            id={GameModeMenuElement.Normal}
            slotRef={buttons[GameModeMenuElement.Normal]}
            selected={selectedMode === GameMode.Normal}
            onClick={() => handleSelectGameMode(GameMode.Normal)}
            onBlur={() => forceRerender()}
          >
            <GameModeSlotContent mode={GameMode.Normal} selected={selectedMode === GameMode.Normal} />
          </Slot>
          {isCobraModeUnlocked && (
            <Slot
              className="game-mode-slot position-relative"
              id={GameModeMenuElement.Cobra}
              slotRef={buttons[GameModeMenuElement.Cobra]}
              selected={selectedMode === GameMode.Cobra}
              onClick={() => handleSelectGameMode(GameMode.Cobra)}
              onBlur={() => forceRerender()}
            >
              <GameModeSlotContent mode={GameMode.Cobra} selected={selectedMode === GameMode.Cobra} />
            </Slot>
          )}
        </SlotContainer>
        <div className="menu-controls position-relative">
          {inputType === InputType.Keyboard ? (
            <>
              <div style={{ position: 'absolute', left: 80 }}>
                <Controls.ButtonBack inputType={inputType} />
              </div>
              <div style={{ position: 'absolute', right: 40 }}>
                <Controls.ButtonSelect inputType={inputType} />
              </div>
            </>
          ) : (
            <>
              <div style={{ position: 'absolute', left: 70 }}>
                <Controls.ButtonBack inputType={inputType} />
              </div>
              <div style={{ position: 'absolute', right: 40 }}>
                <Controls.ButtonSelect inputType={inputType} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

interface GameModeSlotContentProps {
  mode: GameMode,
  selected: boolean,
}
const GameModeSlotContent = ({ mode, selected }: GameModeSlotContentProps) => {
  return (
    <Stack col align="center" className="fullwidth" noChildMargin gap={15} elem="span">
      {mode === GameMode.Casual && (
        <>
          <span className="game-mode-name color-w">Casual</span>
          <span className="game-mode-desc color-x">A stress-free experience.</span>
        </>
      )}
      {mode === GameMode.Normal && (
        <>
          <span className="game-mode-name color-n">Standard</span>
          <span className="game-mode-desc">Normal play mode.</span>
        </>
      )}
      {mode === GameMode.Cobra && (
        <>
          <span className={"snek-tile-16 skull" + (selected ? '' : ' dim')} style={{ position: 'absolute', left: 0, marginTop: 21, marginLeft: 30 }} />
          <span className={"snek-tile-16 skull" + (selected ? '' : ' dim')} style={{ position: 'absolute', right: 0, marginTop: 21, marginRight: 30 }} />
          <Stack row noChildMargin gap={15} elem="span">
            <span className="game-mode-name color-k">Cobra</span>
          </Stack>
          <span className="game-mode-desc color-l">No reviving. Death is permanent.</span>
        </>
      )}
    </Stack>
  )
}
