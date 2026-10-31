import { onUIEvent, unsubscribeOnUIEvent } from "@/ui/uiEvents";
import React, { useEffect, useRef, useState } from "react"
import { useForceRerender } from "./hooks/useForceRerender";
import { DOM } from "@/ui/uiUtils";
import { state } from "@/gameState";
import { GameMode, InputAction, UINavDir } from "@/types";
import { TitleScreenMenuButton, TitleScreenMenuNavMap } from "@/ui/uiNavMap";
import { bridge } from "./uiBridge";

export const TitleScreen = () => {
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
  const titleScreenMenuNavMap = useRef<TitleScreenMenuNavMap>(null);

  useEffect(() => {
    const handleUIEvent = (action: InputAction = InputAction.None) => {
      switch (action) {
        case InputAction.ForceRerender:
          forceRerender();
          break;
        case InputAction.ShowTitleScreen:
          forceRerender();
          setShowing(true);
          setActive(true);
          break;
        case InputAction.HideTitleScreen:
          setShowing(false);
          setActive(false);
          break;
        case InputAction.ShowCampaignModeMenu:
          setActive(false);
          break;
        case InputAction.ShowLevelSelectMenu:
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
      bridge.titleScreen.showing = true;
      const titleScreenMenuButtons: Record<TitleScreenMenuButton, HTMLButtonElement> = {
        [TitleScreenMenuButton.StartGame]: buttons.start.current,
        [TitleScreenMenuButton.QuitGame]: buttons.quit.current,
        [TitleScreenMenuButton.OSTMode]: buttons.ostMode.current,
        [TitleScreenMenuButton.QuoteMode]: buttons.quoteMode.current,
        [TitleScreenMenuButton.Community]: buttons.community.current,
        [TitleScreenMenuButton.Leaderboard]: buttons.leaderboard.current,
        [TitleScreenMenuButton.Settings]: buttons.settings.current,
      };
      titleScreenMenuNavMap.current = new TitleScreenMenuNavMap(
        titleScreenMenuButtons,
        {
          [TitleScreenMenuButton.StartGame]: InputAction.ShowGameModeMenu,
          [TitleScreenMenuButton.QuitGame]: InputAction.ConfirmQuitGame,
          [TitleScreenMenuButton.OSTMode]: InputAction.EnterOstMode,
          [TitleScreenMenuButton.QuoteMode]: InputAction.EnterQuoteMode,
          [TitleScreenMenuButton.Leaderboard]: InputAction.ShowLeaderboard,
          [TitleScreenMenuButton.Settings]: InputAction.ShowSettingsMenu,
          [TitleScreenMenuButton.Community]: InputAction.GotoCommunityPage,
        },
        bridge.callAction,
      );
      bridge.titleScreen.onNavigate = (navDir) => {
        switch (navDir) {
          case UINavDir.Prev:
            return titleScreenMenuNavMap.current.gotoPrev();
          case UINavDir.Up:
            return titleScreenMenuNavMap.current.gotoUp();
          case UINavDir.Left:
            return titleScreenMenuNavMap.current.gotoLeft();
          case UINavDir.Next:
            return titleScreenMenuNavMap.current.gotoNext();
          case UINavDir.Down:
            return titleScreenMenuNavMap.current.gotoDown();
          case UINavDir.Right:
            return titleScreenMenuNavMap.current.gotoRight();
          default:
            return false;
        }
      }
      bridge.titleScreen.onInteract = () => {
        return titleScreenMenuNavMap.current.callSelected();
      }
      bridge.titleScreen.onCancel = () => {
        return false;
      }
    } else {
      bridge.titleScreen.showing = false;
      bridge.titleScreen.onNavigate = null;
      bridge.titleScreen.onInteract = null;
      bridge.titleScreen.onCancel = null;
      titleScreenMenuNavMap.current = null;
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
          className="button-start-game newbutton ui-arrows select-white"
          onClick={handleStartGame}
        >
          play
        </button>
        <button
          tabIndex={0}
          ref={buttons.quit}
          id="ui-button-quit"
          className="button-quit-game newbutton ui-arrows select-white"
          onClick={handleQuitGame}
        >
          quit
        </button>
        <button
          tabIndex={0}
          ref={buttons.ostMode}
          id="ui-button-ost-mode"
          className="button ui-sprite newbutton headphones"
          onClick={handleEnterOstMode}
        >
          <span className="tooltip align-left">OST Mode</span>
        </button>
        <button
          tabIndex={0}
          ref={buttons.quoteMode}
          id="ui-button-quote-mode"
          className="button ui-sprite newbutton quote"
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
          className="button ui-sprite newbutton community"
        >
          <span className="tooltip align-right">Community</span>
        </a>
        <button
          tabIndex={0}
          ref={buttons.leaderboard}
          id="ui-button-leaderboard"
          className="button ui-sprite newbutton trophy"
          onClick={handleShowLeaderboard}
        >
          <span className="tooltip align-right">Leaderboard</span>
        </button>
        <button
          tabIndex={0}
          ref={buttons.settings}
          id="ui-button-settings"
          className="button ui-sprite newbutton gear"
          onClick={handleShowSettingsMenu}
        >
          <span className="tooltip align-right">Settings</span>
        </button>
      </div>
    </>
  );
}
