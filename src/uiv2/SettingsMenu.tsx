import React, { useEffect, useRef, useState } from "react"
import { useForceRerender } from "./hooks/useForceRerender";
import { GameMode, InputAction, UINavDir } from "@/types";
import { onUIEvent, unsubscribeOnUIEvent } from "@/ui/uiEvents";
import { SettingsMenuElement, SettingsMenuNavMap } from "@/ui/uiNavMap";
import { bridge } from "./uiBridge";
import { gamepadPressed, getGamepad } from "@/engine/gamepad";
import { Button } from "@/engine/gamepad/StandardGamepadMapping";
import { CheckboxField } from "@/uiv2/components/CheckboxField";
import { DOM } from "@/ui/uiUtils";
import { setMusicVolume, setSfxVolume } from "@/engine/audio";
import { SliderField } from "./components/SliderField";

export const SettingsMenu = () => {
  const [showing, setShowing] = useState(false);
  const [active, setActive] = useState(false);
  const forceRerender = useForceRerender();

  useEffect(() => {
    const handleUIEvent = (action: InputAction = InputAction.None) => {
      switch (action) {
        case InputAction.ForceRerender:
          forceRerender();
          break;
        case InputAction.ShowSettingsMenu:
          forceRerender();
          setShowing(true);
          setActive(true);
          break;
        case InputAction.HideSettingsMenu:
          setShowing(false);
          setActive(false);
          break;
        case InputAction.ShowMainMenu:
          setActive(false);
          break;
        case InputAction.ShowGameModeMenu:
          setActive(false);
          break;
        case InputAction.ShowLevelSelectMenu:
          setActive(false);
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

  const elements = {
    [SettingsMenuElement.CheckboxCasualMode]: useRef<HTMLInputElement>(null),
    [SettingsMenuElement.CheckboxCobraMode]: useRef<HTMLInputElement>(null),
    [SettingsMenuElement.CheckboxDisableScreenshake]: useRef<HTMLInputElement>(null),
    [SettingsMenuElement.SliderMusicVolume]: useRef<HTMLInputElement>(null),
    [SettingsMenuElement.SliderSfxVolume]: useRef<HTMLInputElement>(null),
    [SettingsMenuElement.ButtonClose]: useRef<HTMLButtonElement>(null),
  };

  const isInGameMenu = bridge.gameState?.isGameStarted || false;
  const isCobraModeUnlocked = bridge.saveDataStore?.getIsCobraModeUnlocked() || false;

  useEffect(() => {
    if (showing && active) {
      if (isInGameMenu) {
        DOM.select(elements[SettingsMenuElement.CheckboxDisableScreenshake].current);
      } else {
        DOM.select(elements[SettingsMenuElement.CheckboxCasualMode].current);
      }
    }
  }, [showing, active])

  useEffect(() => {
    if (showing && elements[SettingsMenuElement.CheckboxDisableScreenshake].current) {
      const settingsMenuElements: Record<SettingsMenuElement, HTMLInputElement | HTMLButtonElement> = {
        [SettingsMenuElement.CheckboxCasualMode]: elements[SettingsMenuElement.CheckboxCasualMode].current,
        [SettingsMenuElement.CheckboxCobraMode]: elements[SettingsMenuElement.CheckboxCobraMode].current,
        [SettingsMenuElement.CheckboxDisableScreenshake]: elements[SettingsMenuElement.CheckboxDisableScreenshake].current,
        [SettingsMenuElement.SliderMusicVolume]: elements[SettingsMenuElement.SliderMusicVolume].current,
        [SettingsMenuElement.SliderSfxVolume]: elements[SettingsMenuElement.SliderSfxVolume].current,
        [SettingsMenuElement.ButtonClose]: elements[SettingsMenuElement.ButtonClose].current,
      }
      const settingsMenuNavMap = new SettingsMenuNavMap(settingsMenuElements, bridge.callAction);
      bridge.settingsMenu.onNavigate = (navDir: UINavDir) => {
        const moveSlider = (focused: SettingsMenuElement | null, direction: number): boolean => {
          if (focused === SettingsMenuElement.SliderMusicVolume) {
            const elem = settingsMenuElements[SettingsMenuElement.SliderMusicVolume] as HTMLInputElement;
            const volume = Math.max((parseFloat(elem.value) || 0) + (direction * 0.1), 0);
            bridge.settings.musicVolume = volume;
            setMusicVolume(volume);
            forceRerender();
            return true;
          } else if (focused === SettingsMenuElement.SliderSfxVolume) {
            const elem = settingsMenuElements[SettingsMenuElement.SliderSfxVolume] as HTMLInputElement;
            const volume = Math.max((parseFloat(elem.value) || 0) + (direction * 0.1), 0);
            bridge.settings.sfxVolume = volume;
            setSfxVolume(volume);
            bridge.callAction(InputAction.TestAudio);
            forceRerender();
            return true;
          }
          return false;
        }
        switch (navDir) {
          case UINavDir.Prev:
          case UINavDir.Up:
            settingsMenuNavMap.gotoPrev();
            break;
          case UINavDir.Next:
          case UINavDir.Down:
            settingsMenuNavMap.gotoNext();
            break;
          case UINavDir.Left:
            if (gamepadPressed(getGamepad(), Button.DpadLeft)) {
              const focused = settingsMenuNavMap.getFocused();
              const handled = moveSlider(focused, -1);
              if (handled) forceRerender();
              return handled;
            }
            // do not handle event so that slider can receive left/right DOM event
            return false;
          case UINavDir.Right:
            if (gamepadPressed(getGamepad(), Button.DpadRight)) {
              const focused = settingsMenuNavMap.getFocused();
              const handled = moveSlider(focused, 1);
              if (handled) forceRerender();
              return handled;
            }
            // do not handle event so that slider can receive left/right DOM event
            return false;
        }
        return true;
      };
      bridge.settingsMenu.onInteract = () => {
        const handled = settingsMenuNavMap.callSelected()
        if (handled) forceRerender();
        return handled;
      };
      bridge.settingsMenu.onCancel = () => {
        bridge.callAction(InputAction.HideSettingsMenu);
        return true;
      };
    } else {
      bridge.settingsMenu.onNavigate = null;
      bridge.settingsMenu.onInteract = null;
      bridge.settingsMenu.onCancel = null;
    }
  }, [showing])

  if (!showing) return;
  if (!bridge.gameState) return;

  const handleChangeCasualMode = (checked) => {
    if (!active) return;
    if (checked) {
      bridge.gameState.gameMode = GameMode.Casual;
    } else {
      bridge.gameState.gameMode = GameMode.Normal;
    }
    forceRerender();
  }

  const handleChangeCobraMode = (checked) => {
    if (!active) return;
    if (checked) {
      bridge.gameState.gameMode = GameMode.Cobra;
    } else {
      bridge.gameState.gameMode = GameMode.Normal;
    }
    forceRerender();
  }

  const handleChangeDisableScreenshake = (checked) => {
    if (!active) return;
    bridge.settings.isScreenShakeDisabled = checked;
    forceRerender();
  }

  const handleChangeMusicVolume = (val: number) => {
    if (!active) return;
    bridge.settings.musicVolume = val;
    setMusicVolume(val);
    forceRerender();
  }

  const handleChangeSfxVolume = (val: number) => {
    if (!active) return;
    bridge.settings.sfxVolume = val;
    setSfxVolume(val);
    forceRerender();
  }

  const handleClose = () => {
    if (!active) return;
    bridge.callAction(InputAction.HideSettingsMenu);
  }

  return (
    <div className="settings-menu">
      <div className="background"></div>
      <div className="content">
        <h2>Settings</h2>
        <section id="settings-section-gameplay">
          <h4>Gameplay</h4>
          {!isInGameMenu && (
            <>
              <CheckboxField
                ref={elements[SettingsMenuElement.CheckboxCasualMode]}
                name="casual-mode"
                label="Enable casual mode"
                caption="Adds invincibility and move rewinding, but disables scoring"
                checked={bridge.gameState.gameMode === GameMode.Casual}
                onChange={handleChangeCasualMode}
              />
              {isCobraModeUnlocked && (
                <CheckboxField
                  ref={elements[SettingsMenuElement.CheckboxCobraMode]}
                  name="cobra-mode"
                  label="Enable COBRA mode"
                  caption="Death = game over, hearts do not replenish"
                  checked={bridge.gameState.gameMode === GameMode.Cobra}
                  onChange={handleChangeCobraMode}
                />
              )}
            </>
          )}
          <CheckboxField
            ref={elements[SettingsMenuElement.CheckboxDisableScreenshake]}
            name="disable-screenshake"
            label="Disable Screen Shake"
            checked={bridge.settings.isScreenShakeDisabled}
            onChange={handleChangeDisableScreenshake}
          />
        </section>
        <section id="settings-section-audio">
          <h4>Audio</h4>
          <SliderField
            ref={elements[SettingsMenuElement.SliderMusicVolume]}
            id="slider-volume-music"
            name="volume-music"
            value={bridge.settings.musicVolume}
            label="Music"
            onChange={handleChangeMusicVolume}
          />
          <SliderField
            ref={elements[SettingsMenuElement.SliderSfxVolume]}
            id="slider-volume-sfx"
            name="volume-sfx"
            value={bridge.settings.sfxVolume}
            label="SFX"
            onChange={handleChangeSfxVolume}
            onMouseUp={() => bridge.callAction(InputAction.TestAudio)}
          />
        </section>
        <br/>
        <button
          ref={elements[SettingsMenuElement.ButtonClose]}
          id="settings-menu-close-button"
          className="button"
          onClick={handleClose}
        >
          close
        </button>
      </div>
    </div>
  )
}
