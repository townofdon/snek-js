import React, { useEffect, useRef, useState } from "react";
import { bridge } from "./uiBridge";
import { Episode, GameMode, InputAction, NewGameArgs, UINavDir } from "@/types";
import { useForceRerender } from "./hooks/useForceRerender";
import { MainMenuElement, MainMenuNavMap } from "@/ui/uiNavMap";
import { onUIEvent, unsubscribeOnUIEvent } from "@/ui/uiEvents";
import { DOM } from "@/ui/uiUtils";

export const MainMenu = () => {
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
  const mainMenuNavMap = useRef<MainMenuNavMap>(null);

  useEffect(() => {
    const handleUIEvent = (action: InputAction = InputAction.None) => {
      switch (action) {
        case InputAction.ForceRerender:
          forceRerender();
          break;
        case InputAction.ShowMainMenu:
          setShowing(true);
          setBlink(false);
          setDisabled(false);
          setActiveId('');
          break;
        case InputAction.HideMainMenu:
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
        case InputAction.ShowGameModeMenu:
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
      bridge.mainMenu.showing = true;
      const callMainMenuAction = (element: MainMenuElement) => {
        const ids: string[] = [
          MainMenuElement.Campaign,
          MainMenuElement.Arcade,
          MainMenuElement.Tutorial,
          MainMenuElement.Back,
        ];
        if (
          !!document.activeElement
          && document.activeElement instanceof HTMLButtonElement
          && ids.includes(document.activeElement.id)
        ) {
          document.activeElement?.click?.();
        }
      }
      mainMenuNavMap.current = new MainMenuNavMap(callMainMenuAction);
      bridge.mainMenu.onNavigate = (navDir) => {
        switch (navDir) {
          case UINavDir.Prev:
            return mainMenuNavMap.current.gotoPrev();
          case UINavDir.Up:
            return mainMenuNavMap.current.gotoPrev();
          case UINavDir.Left:
            return mainMenuNavMap.current.gotoPrev();
          case UINavDir.Next:
            return mainMenuNavMap.current.gotoNext();
          case UINavDir.Down:
            return mainMenuNavMap.current.gotoNext();
          case UINavDir.Right:
            return mainMenuNavMap.current.gotoNext();
          default:
            return false;
        }
      }
      bridge.mainMenu.onInteract = () => {
        return mainMenuNavMap.current.callSelected();
      }
      bridge.mainMenu.onCancel = () => {
        bridge.callAction(InputAction.HideMainMenu);
        return true;
      }
    } else {
      bridge.mainMenu.showing = false;
      bridge.mainMenu.onNavigate = null;
      bridge.mainMenu.onInteract = null;
      bridge.mainMenu.onCancel = null;
      mainMenuNavMap.current = null;
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
    setActiveId(MainMenuElement.Campaign);
    bridge.callAction(InputAction.ShowSaveSlotMenu);
  }

  const handleSelectGameModeArcade = () => {
    if (disabled) return;
    setActiveId(MainMenuElement.Arcade);
    const newGameArgs = {
      levelId: "",
      episode: Episode.E1,
      gameMode: GameMode.Arcade,
    } satisfies NewGameArgs;
    bridge.callAction(InputAction.NewGame, newGameArgs);
  }

  const handleSelectGameModeTutorial = () => {
    if (disabled) return;
    setActiveId(MainMenuElement.Tutorial);
    const newGameArgs = {
      levelId: "",
      episode: Episode.E1,
      gameMode: GameMode.Tutorial,
    } satisfies NewGameArgs;
    bridge.callAction(InputAction.NewGame, newGameArgs);
  }

  const handleBack = () => {
    if (disabled) return;
    bridge.callAction(InputAction.HideMainMenu);
  }

  const classNameFor = (elem: MainMenuElement): string => {
    let className = 'button newbutton ui-arrows select-white main-menu ';
    switch (elem) {
      case MainMenuElement.Campaign:
        className += 'campaign ';
        break;
      case MainMenuElement.Arcade:
        className += 'arcade ';
        break;
      case MainMenuElement.Tutorial:
        className += 'tutorial ';
        break;
      case MainMenuElement.Back:
        className += 'back ';
        break;
    }
    if (blink && activeId === elem) {
      className += 'invisible ';
    }
    return className
  }

  return (
    <div id="main-menu" className="settings-menu">
      <div className="background blur"></div>
      <div className="content gap">
        <h2 className="title-gradient">Main Menu</h2>

        <button
          tabIndex={0}
          ref={buttons.campaign}
          id={MainMenuElement.Campaign}
          className={classNameFor(MainMenuElement.Campaign)}
          onClick={handleSelectGameModeCampaign}
        >
          campaign
        </button>
        <button
          tabIndex={0}
          ref={buttons.arcade}
          id={MainMenuElement.Arcade}
          className={classNameFor(MainMenuElement.Arcade)}
          onClick={handleSelectGameModeArcade}
        >
          arcade
        </button>
        <button
          tabIndex={0}
          ref={buttons.tutorial}
          id={MainMenuElement.Tutorial}
          className={classNameFor(MainMenuElement.Tutorial)}
          onClick={handleSelectGameModeTutorial}
        >
          tutorial
        </button>
        <button
          tabIndex={0}
          ref={buttons.back}
          id={MainMenuElement.Back}
          className={classNameFor(MainMenuElement.Back)}
          onClick={handleBack}
        >
          &lt;- back
        </button>
      </div>
    </div>
  );
}
