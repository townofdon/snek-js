import React, { useEffect, useRef, useState } from "react";
import { bridge } from "./uiBridge";
import { Episode, GameMode, InputAction, NewGameArgs, UINavDir } from "@/types";
import { useForceRerender } from "./hooks/useForceRerender";
import { GameModeMenuElement, GameModeMenuNavMap } from "@/ui/uiNavMap";
import { onUIEvent, unsubscribeOnUIEvent } from "@/ui/uiEvents";
import { DOM } from "@/ui/uiUtils";

export const GameModeMenu = () => {
  const [showing, setShowing] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [blink, setBlink] = useState(false);
  const [activeId, setActiveId] = useState('');
  const forceRerender = useForceRerender();
  const buttons = {
    campaign: useRef<HTMLButtonElement>(null),
    arcade: useRef<HTMLButtonElement>(null),
    tutorial: useRef<HTMLButtonElement>(null),
    back: useRef<HTMLButtonElement>(null),
  }
  const gameModeMenuNavMap = useRef<GameModeMenuNavMap>(null);

  useEffect(() => {
    const handleUIEvent = (action: InputAction = InputAction.None) => {
      switch (action) {
        case InputAction.ForceRerender:
          forceRerender();
          break;
        case InputAction.ShowGameModeMenu:
          setShowing(true);
          setBlink(false);
          setDisabled(false);
          setActiveId('');
          break;
        case InputAction.HideGameModeMenu:
          setShowing(false);
          break;
        case InputAction.ShowMainMenu:
          setShowing(false);
          break;
        case InputAction.ShowCampaignModeMenu:
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
      bridge.gameModeMenu.showing = true;
      const callGameModeMenuAction = (element: GameModeMenuElement) => {
        const ids: string[] = [
          GameModeMenuElement.Campaign,
          GameModeMenuElement.Arcade,
          GameModeMenuElement.Tutorial,
          GameModeMenuElement.Back,
        ];
        if (
          !!document.activeElement
          && document.activeElement instanceof HTMLButtonElement
          && ids.includes(document.activeElement.id)
        ) {
          document.activeElement?.click?.();
        }
      }
      gameModeMenuNavMap.current = new GameModeMenuNavMap(callGameModeMenuAction);
      bridge.gameModeMenu.onNavigate = (navDir) => {
        switch (navDir) {
          case UINavDir.Prev:
            return gameModeMenuNavMap.current.gotoPrev();
          case UINavDir.Up:
            return gameModeMenuNavMap.current.gotoPrev();
          case UINavDir.Left:
            return gameModeMenuNavMap.current.gotoPrev();
          case UINavDir.Next:
            return gameModeMenuNavMap.current.gotoNext();
          case UINavDir.Down:
            return gameModeMenuNavMap.current.gotoNext();
          case UINavDir.Right:
            return gameModeMenuNavMap.current.gotoNext();
          default:
            return false;
        }
      }
      bridge.gameModeMenu.onInteract = () => {
        return gameModeMenuNavMap.current.callSelected();
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
      gameModeMenuNavMap.current = null;
    }
  }, [showing, disabled]);

  useEffect(() => {
    if (showing && !disabled) {
      DOM.select(buttons.campaign.current);
    }
  }, [showing, disabled])

  if (!showing) return null;

  const handleSelectGameModeCampaign = () => {
    if (disabled) return;
    setActiveId(GameModeMenuElement.Campaign);
    bridge.callAction(InputAction.ShowSaveSlotMenu);
  }

  const handleSelectGameModeArcade = () => {
    if (disabled) return;
    setActiveId(GameModeMenuElement.Arcade);
    const newGameArgs = {
      levelId: "",
      episode: Episode.E1,
      gameMode: GameMode.Arcade,
    } satisfies NewGameArgs;
    bridge.callAction(InputAction.NewGame, newGameArgs);
  }

  const handleSelectGameModeTutorial = () => {
    if (disabled) return;
    setActiveId(GameModeMenuElement.Tutorial);
    const newGameArgs = {
      levelId: "",
      episode: Episode.E1,
      gameMode: GameMode.Tutorial,
    } satisfies NewGameArgs;
    bridge.callAction(InputAction.NewGame, newGameArgs);
  }

  const handleBack = () => {
    if (disabled) return;
    bridge.callAction(InputAction.HideGameModeMenu);
  }

  const classNameFor = (elem: GameModeMenuElement): string => {
    let className = 'button newbutton ui-arrows select-white game-mode ';
    switch (elem) {
      case GameModeMenuElement.Campaign:
        className += 'campaign ';
        break;
      case GameModeMenuElement.Arcade:
        className += 'arcade ';
        break;
      case GameModeMenuElement.Tutorial:
        className += 'tutorial ';
        break;
      case GameModeMenuElement.Back:
        className += 'back ';
        break;
    }
    if (blink && activeId === elem) {
      className += 'invisible ';
    }
    return className
  }

  return (
    <div id="game-mode-menu" className="settings-menu">
      <div className="background blur"></div>
      <div className="content gap">
        <h2 className="title-gradient">Main Menu</h2>

        <button
          tabIndex={0}
          ref={buttons.campaign}
          id={GameModeMenuElement.Campaign}
          className={classNameFor(GameModeMenuElement.Campaign)}
          onClick={handleSelectGameModeCampaign}
        >
          campaign
        </button>
        <button
          tabIndex={0}
          ref={buttons.arcade}
          id={GameModeMenuElement.Arcade}
          className={classNameFor(GameModeMenuElement.Arcade)}
          onClick={handleSelectGameModeArcade}
        >
          arcade
        </button>
        <button
          tabIndex={0}
          ref={buttons.tutorial}
          id={GameModeMenuElement.Tutorial}
          className={classNameFor(GameModeMenuElement.Tutorial)}
          onClick={handleSelectGameModeTutorial}
        >
          tutorial
        </button>
        <button
          tabIndex={0}
          ref={buttons.back}
          id={GameModeMenuElement.Back}
          className={classNameFor(GameModeMenuElement.Back)}
          onClick={handleBack}
        >
          &lt;- back
        </button>
      </div>
    </div>
  );
}
