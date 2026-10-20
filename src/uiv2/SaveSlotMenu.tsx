import React, { useEffect, useRef, useState } from "react"
import { Episode, GameMode, InputAction, InputType, SaveSlot, SaveSlotData, UINavDir } from "@/types";
import { getLevelById } from "@/levels/levelUtils";
import { episodeDisplay } from "@/utils";
import { Slot, SlotContainer } from "./components/Slot";
import { saveDataStore } from "@/stores/SaveDataStore";
import { Controls } from "./components/Controls";
import { bridge } from "./uiBridge";
import { useForceRerender } from "./hooks/useForceRerender";
import { onUIEvent, unsubscribeOnUIEvent } from "@/ui/uiEvents";
import { useRefState } from "@/editor/hooks/useRefState";
import { DOM } from "@/ui/uiUtils";
import { Stack } from "@/components/Stack";

export const SaveSlotMenu = () => {
  const forceRerender = useForceRerender();
  const [showing, setShowing] = useState(false);
  const [selectedSlot, selectedSlotRef, setSelectedSlot] = useRefState<SaveSlot>(SaveSlot.Slot1);
  const [isResetSlotSelected, isResetSlotSelectedRef, setResetSlotSelected] = useRefState(false)
  const [disabled, setDisabled] = useState(false);
  const [blink, setBlink] = useState(false);
  const menu = useRef<HTMLDivElement>(null);
  const buttons = {
    slot1: useRef<HTMLButtonElement>(null),
    slot2: useRef<HTMLButtonElement>(null),
    slot3: useRef<HTMLButtonElement>(null),
    reset: useRef<HTMLButtonElement>(null),
  }

  useEffect(() => {
    const handleUIEvent = (action: InputAction = InputAction.None) => {
      switch (action) {
        case InputAction.ForceRerender:
          forceRerender();
          break;
        case InputAction.ShowSaveSlotMenu:
          setShowing(true);
          setSelectedSlot(SaveSlot.Slot1);
          setResetSlotSelected(false);
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
        case InputAction.ShowLevelSelectMenu:
          setShowing(false);
          break;
        case InputAction.ShowCampaignModeMenu:
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
        case InputAction.ResetCurrentSaveSlot:
          forceRerender();
          setDisabled(false);
          setResetSlotSelected(false);
          break;
        case InputAction.CancelResetCurrentSaveSlot:
          setDisabled(false);
          setResetSlotSelected(false);
          break;
        case InputAction.ConfirmResetCurrentSaveSlot:
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
    if (showing && !disabled && menu.current) {
      bridge.saveSlotMenu.showing = true;
      bridge.saveSlotMenu.onNavigate = (navDir: UINavDir) => {
        if (
          !document.activeElement ||
          !(document.activeElement instanceof HTMLButtonElement) ||
          !menu.current.contains(document.activeElement)
        ) {
          setSelectedSlot(SaveSlot.Slot1);
          setResetSlotSelected(false);
          return true;
        }
        const selectedSlotUsed = saveDataStore.getIsSlotUsed(selectedSlotRef.current);
        switch (navDir) {
          case UINavDir.Prev:
            return false;
          case UINavDir.Next:
            return false;
          case UINavDir.Up:
            setSelectedSlot(prev => (prev + 1) % 3 + 1);
            setResetSlotSelected(false);
            break;
          case UINavDir.Down:
            setSelectedSlot(prev => prev % 3 + 1);
            setResetSlotSelected(false);
            break;
          case UINavDir.Left:
            if (!selectedSlotUsed) return false;
            setResetSlotSelected(prev => !prev);
            break;
          case UINavDir.Right:
            if (!selectedSlotUsed) return false;
            setResetSlotSelected(prev => !prev);
            break;
        }
        return true;
      }
      bridge.saveSlotMenu.onInteract = () => {
        if (isResetSlotSelectedRef.current) {
          handleClearSave(selectedSlotRef.current);
        } else {
          handleChooseSlot(selectedSlotRef.current);
        }
        return true;
      }
      bridge.saveSlotMenu.onCancel = () => {
        bridge.callAction(InputAction.HideSaveSlotMenu);
        return true;
      }
    } else {
      bridge.saveSlotMenu.showing = false;
      bridge.saveSlotMenu.onNavigate = null;
      bridge.saveSlotMenu.onInteract = null;
      bridge.saveSlotMenu.onCancel = null;
    }
  }, [showing, disabled]);

  useEffect(() => {
    if (showing && !disabled) {
      if (isResetSlotSelected) {
        DOM.select(buttons.reset.current);
      } else if (selectedSlot === SaveSlot.Slot1) {
        DOM.select(buttons.slot1.current);
      } else if (selectedSlot === SaveSlot.Slot2) {
        DOM.select(buttons.slot2.current);
      } else if (selectedSlot === SaveSlot.Slot3) {
        DOM.select(buttons.slot3.current);
      }
    }
  }, [showing, disabled, selectedSlot, isResetSlotSelected]);

  if (!showing) return null;

  const isUsedSlot1 = saveDataStore.getIsSlotUsed(SaveSlot.Slot1);
  const isUsedSlot2 = saveDataStore.getIsSlotUsed(SaveSlot.Slot2);
  const isUsedSlot3 = saveDataStore.getIsSlotUsed(SaveSlot.Slot3);
  const slot1 = saveDataStore.getSlot(SaveSlot.Slot1);
  const slot2 = saveDataStore.getSlot(SaveSlot.Slot2);
  const slot3 = saveDataStore.getSlot(SaveSlot.Slot3);
  const inputType = bridge.gameState.inputType;

  console.log({
    isUsedSlot1,
    isUsedSlot2,
    isUsedSlot3,
    slot1,
    slot2,
    slot3,
  });

  const handleClearSave = (slot: SaveSlot) => {
    // TODO: REMOVE
    console.log('remove:', slot);

    saveDataStore.setCurrentSaveSlot(slot);
    bridge.callAction(InputAction.ConfirmResetCurrentSaveSlot);
  }

  const handleChooseSlot = (slot: SaveSlot) => {
    saveDataStore.setCurrentSaveSlot(slot);
    const empty = !saveDataStore.getIsSlotUsed(slot);
    if (empty) {
      saveDataStore.setCurrentSaveSlot(slot);
      bridge.gameState.gameMode = GameMode.Normal;
      // TODO: ShowCampaignModeMenu
      bridge.callAction(InputAction.ShowLevelSelectMenu);
    } else {
      saveDataStore.setCurrentSaveSlot(slot);
      const slotData = saveDataStore.getSlot(slot);
      bridge.callAction(InputAction.LoadGame, slotData);
    }
  }

  return (
    <div id="save-slot-menu" className="settings-menu save-slot-menu" ref={menu}>
      <div className="background blur"></div>
      <div className="content gap">
        <h2 className="title-gradient">Select Profile</h2>

        <SlotContainer>
          <SaveDataSlot
            id="save-slot-1"
            slotRef={buttons.slot1}
            slot={SaveSlot.Slot1}
            selected={selectedSlot === SaveSlot.Slot1}
            empty={!isUsedSlot1}
            slotData={slot1}
            blink={blink}
            resetRef={buttons.reset}
            isResetSlotSelected={isResetSlotSelected}
            onClick={handleChooseSlot}
          />
          <SaveDataSlot
            id="save-slot-1"
            slotRef={buttons.slot2}
            slot={SaveSlot.Slot2}
            selected={selectedSlot === SaveSlot.Slot2}
            empty={!isUsedSlot2}
            slotData={slot2}
            blink={blink}
            resetRef={buttons.reset}
            isResetSlotSelected={isResetSlotSelected}
            onClick={handleChooseSlot}
          />
          <SaveDataSlot
            id="save-slot-2"
            slotRef={buttons.slot3}
            slot={SaveSlot.Slot3}
            selected={selectedSlot === SaveSlot.Slot3}
            empty={!isUsedSlot3}
            slotData={slot3}
            blink={blink}
            resetRef={buttons.reset}
            isResetSlotSelected={isResetSlotSelected}
            onClick={handleChooseSlot}
          />
        </SlotContainer>

        <Stack className="menu-controls" row>
          {inputType === InputType.Keyboard ? (
            <>
              <Controls.ButtonBack inputType={inputType} />
              <Controls.ButtonSelect inputType={inputType} />
            </>
          ) : (
            <>
              <Controls.ButtonSelect inputType={inputType} />
              <Controls.ButtonBack inputType={inputType} />
            </>
          )}
        </Stack>
      </div>
    </div>
  )
}

function timeDisplay(durationMs: number) {
  const hours = Math.floor(durationMs / 1000 / 60 / 60);
  const minutes = Math.floor(durationMs / 1000 / 60 % 60);
  const seconds = Math.floor(durationMs / 1000 % 60);
  if (hours > 0) {
    return `${hours}H ${minutes}M`;
  }
  return `${minutes}M ${seconds}S`;
}

interface SaveDataSlotProps {
  id: string,
  slotRef: React.MutableRefObject<HTMLButtonElement>,
  resetRef: React.MutableRefObject<HTMLButtonElement>,
  selected: boolean,
  empty: boolean,
  blink: boolean,
  slot: SaveSlot,
  slotData: SaveSlotData | null,
  isResetSlotSelected: boolean,
  onClick: (slot: SaveSlot) => void,
}
function SaveDataSlot({
  id,
  slotRef,
  resetRef,
  selected,
  empty,
  blink,
  slotData,
  slot,
  isResetSlotSelected,
  onClick,
}: SaveDataSlotProps) {
  if (empty || !slotData) {
    return (
      <EmptySlot
        id={id}
        slotRef={slotRef}
        selected={selected}
        focused={selected}
        blink={selected && blink}
        onClick={() => onClick(slot)}
      />
    )
  }
  const levelId = slotData?.lastLevelId;
  const episode = slotData?.episode;
  const timePlayedMs = slotData?.stats.totalGameTimeElapsed;
  const level = getLevelById(levelId);
  return (
    <div>
      <Slot
        id={id}
        slotRef={slotRef}
        className="save-slot"
        selected={selected}
        focused={selected && !isResetSlotSelected}
        blink={selected && blink}
        onClick={() => onClick(slot)}
      >
        <span>
          <span>
            <span className="save-slot-level-name">{level.name}</span>
            <span className="save-slot-episode">{episodeDisplay(episode)}</span>
            <span className="save-slot-time-played">{timeDisplay(timePlayedMs)}</span>
          </span>
          <span className="save-slot-level-preview">
            level<br/>preview
          </span>
        </span>
      </Slot>
      {selected && (
        <div className="position-absolute" style={{ left: '100%', marginLeft: 20 }}>
          <button ref={resetRef} className={"newbutton ui-arrows select-white" + (isResetSlotSelected ? " active" : "")}>
            Reset
          </button>
        </div>
      )}
    </div>
  );
}

interface EmptySlotProps {
  id: string,
  slotRef: React.MutableRefObject<HTMLButtonElement>,
  selected: boolean,
  focused: boolean,
  blink: boolean,
  onClick: () => void,
}
function EmptySlot({
  id,
  slotRef,
  selected,
  focused,
  blink,
  onClick,
}: EmptySlotProps) {
  return (
    <Slot
      id={id}
      slotRef={slotRef}
      className="save-slot"
      selected={selected}
      focused={focused}
      blink={blink}
      onClick={onClick}
    >
      [Empty]
    </Slot>
  );
}
