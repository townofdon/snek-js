import { InputAction, InputType, UINavDir, WearableFrame, WearableType } from "@/types";
import React, { useEffect, useState } from "react"

import { useForceRerender } from "./hooks/useForceRerender";
import { onUIEvent, unsubscribeOnUIEvent } from "@/ui/uiEvents";
import { bridge } from "./uiBridge";
import { saveDataStore } from "@/stores/SaveDataStore";
import { Controls } from "./components/Controls";
import { useRefState } from "@/editor/hooks/useRefState";
import { WEARABLE_TYPE_MAP } from "@/constants";
import { wearableDisplay } from "@/utils";

interface WearablesMenuProps {}
export const WearablesMenu = ({}: WearablesMenuProps) => {
  const forceRerender = useForceRerender();
  const [showing, setShowing] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [selectedFrame, selectedFrameRef, setSelectedFrame] = useRefState(WearableFrame.None);
  const [selectedType, selectedTypeRef, setSelectedType] = useRefState(WearableType.Exclusive);

  useEffect(() => {
    const handleUIEvent = (action: InputAction = InputAction.None) => {
      switch (action) {
        case InputAction.ForceRerender:
          forceRerender();
          break;
        case InputAction.ShowWearablesMenu:
          setShowing(true);
          setSelectedType(WearableType.Exclusive);
          setDisabled(false);
          break;
        case InputAction.HideWearablesMenu:
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
        switch (navDir) {
          case UINavDir.Prev:
            return false;
          case UINavDir.Next:
            return false;
          case UINavDir.Up:
            // TODO: navigate
            return true;
          case UINavDir.Down:
            // TODO: navigate
            return true;
          case UINavDir.Left:
            // TODO: navigate
            return true;
          case UINavDir.Right:
            // TODO: navigate
            return true;
          default:
            return false;
        }
      }
      bridge.gameModeMenu.onInteract = () => {
        // handleSelectWearables(selectedModeRef.current);
        return true;
      }
      bridge.gameModeMenu.onCancel = () => {
        bridge.callAction(InputAction.HideWearablesMenu);
        return true;
      }
    } else {
      bridge.gameModeMenu.showing = false;
      bridge.gameModeMenu.onNavigate = null;
      bridge.gameModeMenu.onInteract = null;
      bridge.gameModeMenu.onCancel = null;
    }
  }, [showing, disabled]);

  const handleSelectWearableItem = (wtype: WearableType, frame: WearableFrame) => {
    setSelectedType(wtype);
    setSelectedFrame(frame);
    bridge.outfit[wtype] = frame;
    saveDataStore.setOutfit(bridge.outfit);
  }

  if (!showing) return null;

  const anyUnlockedFor: Partial<Record<WearableType, boolean>> = {};
  const wearables = saveDataStore.getUnlockedWearablesList();
  const itemsByType: Record<WearableType, WearableFrame[]> = {
    [WearableType.None]: [],
    [WearableType.Exclusive]: [],
    [WearableType.Hat]: [],
    [WearableType.Eyes]: [],
    [WearableType.Back]: [],
    [WearableType.Hair]: []
  };
  for (let i = 0; i < wearables.length; i++) {
    const wtype = WEARABLE_TYPE_MAP[wearables[i]];
    anyUnlockedFor[wtype] = true;
    itemsByType[wtype].push(wearables[i]);
  }
  const inputType = bridge.gameState.inputType;

  return (
    <div id="wearables-menu" className="settings-menu wearables-menu">
      <div className="background blur"></div>
      <div className="content gap">
        <h2 className="title-gradient">Snek Fashion!</h2>
        <div>
          {/* Snek preview */}
        </div>
        {anyUnlockedFor[WearableType.Exclusive] && (
          <div>
            <h4>exclusive</h4>
            {itemsByType[WearableType.Exclusive].map(item => (
              <span>{wearableDisplay(item)}</span>
            ))}
            {/*
            Idea:
            - only show current wearable item, left + right arrows if applicable
            - show squares for possible items, with active one filled in
            */}
          </div>
        )}
        {anyUnlockedFor[WearableType.Hat] && (
          <div>
            <h4>head</h4>
            {itemsByType[WearableType.Hat].map(item => (
              <span>{wearableDisplay(item)}</span>
            ))}
          </div>
        )}
        {anyUnlockedFor[WearableType.Eyes] && (
          <div>
            <h4>eyes</h4>
            {itemsByType[WearableType.Eyes].map(item => (
              <span>{wearableDisplay(item)}</span>
            ))}
          </div>
        )}
        {anyUnlockedFor[WearableType.Back] && (
          <div>
            <h4>back</h4>
            {itemsByType[WearableType.Back].map(item => (
              <span>{wearableDisplay(item)}</span>
            ))}
          </div>
        )}
        {anyUnlockedFor[WearableType.Hair] && (
          <div>
            <h4>hair</h4>
            {itemsByType[WearableType.Hair].map(item => (
              <span>{wearableDisplay(item)}</span>
            ))}
          </div>
        )}
        {/* TODO: also add up/down and left/right */}
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
