import { onUIEvent, unsubscribeOnUIEvent } from "@/ui/uiEvents";
import React, { useEffect, useRef, useState } from "react"
import { useForceRerender } from "./hooks/useForceRerender";
import { DOM } from "@/ui/uiUtils";
import { state } from "@/gameState";
import { GameMode, InputAction, UINavDir } from "@/types";
import { MainMenuButton, MainMenuNavMap } from "@/ui/uiNavMap";
import { bridge } from "./uiBridge";

export const MainMenu = () => {
  const [showing, setShowing] = useState(false);
  const [active, setActive] = useState(false);
  const forceRerender = useForceRerender();
  const buttons = {
    start: useRef<HTMLButtonElement>(null),
    quit: useRef<HTMLButtonElement>(null),
    ostMode: useRef<HTMLButtonElement>(null),
    quoteMode: useRef<HTMLButtonElement>(null),
    community: useRef<HTMLButtonElement>(null),
    leaderboard: useRef<HTMLButtonElement>(null),
    settings: useRef<HTMLButtonElement>(null),
  }
  const mainMenuNavMap = useRef<MainMenuNavMap>(null);

  useEffect(() => {
    const handleUIEvent = (action: InputAction = InputAction.None) => {
      switch (action) {
        case InputAction.ForceRerender:
          forceRerender();
          break;
        case InputAction.ShowMainMenu:
          forceRerender();
          setShowing(true);
          setActive(true);
          break;
        case InputAction.HideMainMenu:
          setShowing(false);
          setActive(false);
          break;
        case InputAction.ShowSettingsMenu:
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

  useEffect(() => {
    if (showing) {
      const mainMenuButtons: Record<MainMenuButton, HTMLButtonElement> = {
        [MainMenuButton.StartGame]: buttons.start.current,
        [MainMenuButton.QuitGame]: buttons.quit.current,
        [MainMenuButton.OSTMode]: buttons.ostMode.current,
        [MainMenuButton.QuoteMode]: buttons.quoteMode.current,
        [MainMenuButton.Community]: buttons.community.current,
        [MainMenuButton.Leaderboard]: buttons.leaderboard.current,
        [MainMenuButton.Settings]: buttons.settings.current,
      };
      mainMenuNavMap.current = new MainMenuNavMap(
        mainMenuButtons,
        {
          [MainMenuButton.StartGame]: InputAction.ShowGameModeMenu,
          [MainMenuButton.QuitGame]: InputAction.ConfirmQuitGame,
          [MainMenuButton.OSTMode]: InputAction.EnterOstMode,
          [MainMenuButton.QuoteMode]: InputAction.EnterQuoteMode,
          [MainMenuButton.Leaderboard]: InputAction.ShowLeaderboard,
          [MainMenuButton.Settings]: InputAction.ShowSettingsMenu,
          [MainMenuButton.Community]: InputAction.GotoCommunityPage,
        },
        bridge.callAction,
      );
      bridge.mainMenu.onNavigate = (navDir) => {
        switch (navDir) {
          case UINavDir.Prev:
            return mainMenuNavMap.current.gotoPrev();
          case UINavDir.Up:
            return mainMenuNavMap.current.gotoUp();
          case UINavDir.Left:
            return mainMenuNavMap.current.gotoLeft();
          case UINavDir.Next:
            return mainMenuNavMap.current.gotoNext();
          case UINavDir.Down:
            return mainMenuNavMap.current.gotoDown();
          case UINavDir.Right:
            return mainMenuNavMap.current.gotoRight();
          default:
            return false;
        }
      }
      bridge.mainMenu.onInteract = () => {
        return mainMenuNavMap.current.callSelected();
      }
      bridge.mainMenu.onCancel = () => {
        return false;
      }
    } else {
      bridge.mainMenu.onNavigate = null;
      bridge.mainMenu.onInteract = null;
      bridge.mainMenu.onCancel = null;
      mainMenuNavMap.current = null;
    }
  }, [showing]);

  useEffect(() => {
    if (showing && active) {
      DOM.select(buttons.start.current);
    }
  }, [showing, active])

  if (!showing) return;

  const showLabelCasualMode = state.gameMode === GameMode.Casual;
  const showLabelCobra = state.gameMode === GameMode.Cobra;

  const handleStartGame = () => {
    if (!active) return;
    bridge.callAction(InputAction.ShowGameModeMenu);
  }

  const handleQuitGame = () => {
    if (!active) return;
    bridge.callAction(InputAction.ConfirmQuitGame);
  }

  const handleEnterOstMode = () => {
    if (!active) return;
    bridge.callAction(InputAction.EnterOstMode);
  }

  const handleEnterQuoteMode = () => {
    if (!active) return;
    bridge.callAction(InputAction.EnterQuoteMode);
  }

  const handleShowLeaderboard = () => {
    if (!active) return;
    bridge.callAction(InputAction.ShowLeaderboard);
  }

  const handleShowSettingsMenu = () => {
    if (!active) return;
    bridge.callAction(InputAction.ShowSettingsMenu);
  }

  return (
    <>
      <div id="main-title" className="main-title title-sprite-container">
        <span id="main-title-variant-grayblue" className="variant default">
          <span className="title-sprite">
            <span className="title-sprite-img sprite-snek-letter-s"></span>
          </span>
          <span className="title-sprite">
            <span className="title-sprite-img sprite-snek-letter-n"></span>
          </span>
          <span className="title-sprite">
            <span className="title-sprite-img sprite-snek-letter-e"></span>
          </span>
          <span className="title-sprite">
            <span className="title-sprite-img sprite-snek-letter-k"></span>
          </span>
        </span>
        <span id="main-title-variant-gray" className="variant gray">
          <span className="title-sprite">
            <span className="title-sprite-img sprite-snek-letter-s"></span>
          </span>
          <span className="title-sprite">
            <span className="title-sprite-img sprite-snek-letter-n"></span>
          </span>
          <span className="title-sprite">
            <span className="title-sprite-img sprite-snek-letter-e"></span>
          </span>
          <span className="title-sprite">
            <span className="title-sprite-img sprite-snek-letter-k"></span>
          </span>
        </span>
        <span id="main-title-variant-green" className="variant green">
          <span className="title-sprite">
            <span className="title-sprite-img sprite-snek-letter-s"></span>
          </span>
          <span className="title-sprite">
            <span className="title-sprite-img sprite-snek-letter-n"></span>
          </span>
          <span className="title-sprite">
            <span className="title-sprite-img sprite-snek-letter-e"></span>
          </span>
          <span className="title-sprite">
            <span className="title-sprite-img sprite-snek-letter-k"></span>
          </span>
        </span>
        <span id="main-title-variant-red" className="variant red">
          <span className="title-sprite">
            <span className="title-sprite-img sprite-snek-letter-s"></span>
          </span>
          <span className="title-sprite">
            <span className="title-sprite-img sprite-snek-letter-n"></span>
          </span>
          <span className="title-sprite">
            <span className="title-sprite-img sprite-snek-letter-e"></span>
          </span>
          <span className="title-sprite">
            <span className="title-sprite-img sprite-snek-letter-k"></span>
          </span>
        </span>
        <span id="main-title-variant-sand" className="variant sand">
          <span className="title-sprite">
            <span className="title-sprite-img sprite-snek-letter-s"></span>
          </span>
          <span className="title-sprite">
            <span className="title-sprite-img sprite-snek-letter-n"></span>
          </span>
          <span className="title-sprite">
            <span className="title-sprite-img sprite-snek-letter-e"></span>
          </span>
          <span className="title-sprite">
            <span className="title-sprite-img sprite-snek-letter-k"></span>
          </span>
        </span>
        <span id="main-title-variant-yellow" className="variant yellow">
          <span className="title-sprite">
            <span className="title-sprite-img sprite-snek-letter-s"></span>
          </span>
          <span className="title-sprite">
            <span className="title-sprite-img sprite-snek-letter-n"></span>
          </span>
          <span className="title-sprite">
            <span className="title-sprite-img sprite-snek-letter-e"></span>
          </span>
          <span className="title-sprite">
            <span className="title-sprite-img sprite-snek-letter-k"></span>
          </span>
        </span>
      </div>
      <div id="main-ui-buttons" className="main-ui-buttons">
        <button
          tabIndex={0}
          ref={buttons.start}
          id="ui-button-start"
          className="button-start-game"
          onClick={handleStartGame}
        >
          &gt;&gt; start game
        </button>
        <button
          tabIndex={0}
          ref={buttons.quit}
          id="ui-button-quit"
          className="button-quit-game"
          onClick={handleQuitGame}
        >
          quit
        </button>
        <button
          tabIndex={0}
          ref={buttons.ostMode}
          id="ui-button-ost-mode"
          className="button ui-sprite headphones"
          onClick={handleEnterOstMode}
        >
          <span className="tooltip align-left">OST Mode</span>
        </button>
        <button
          tabIndex={0}
          ref={buttons.quoteMode}
          id="ui-button-quote-mode"
          className="button ui-sprite quote"
          onClick={handleEnterQuoteMode}
        >
          <span className="tooltip align-left">Quote Mode</span>
        </button>
        <a
          tabIndex={0}
          ref={buttons.community as unknown as React.MutableRefObject<HTMLAnchorElement>}
          href="https://townofdon.github.io/snek-js/community/"
          target="_blank"
          id="ui-button-community"
          className="button ui-sprite community"
        >
          <span className="tooltip align-right">Community</span>
        </a>
        <button
          tabIndex={0}
          ref={buttons.leaderboard}
          id="ui-button-leaderboard"
          className="button ui-sprite trophy"
          onClick={handleShowLeaderboard}
        >
          <span className="tooltip align-right">Leaderboard</span>
        </button>
        <button
          tabIndex={0}
          ref={buttons.settings}
          id="ui-button-settings"
          className="button ui-sprite gear"
          onClick={handleShowSettingsMenu}
        >
          <span className="tooltip align-right">Settings</span>
        </button>
      </div>
      {showLabelCasualMode && (
        <div
          id="main-menu-label-casual-mode"
          className="main-menu-label-casual-mode"
        >
          <span>Casual Mode</span>
        </div>
      )}
      {showLabelCobra && (
        <div
          id="main-menu-label-cobra-mode"
          className="main-menu-label-cobra-mode"
        >
          <span>Cobra Mode</span>
        </div>
      )}
    </>
  );
}
