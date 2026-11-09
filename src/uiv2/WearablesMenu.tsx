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
import { Stack } from "@/components/Stack";
import { OutfitPreview } from "@/engine/outfitPreview/OutfitPreview";

const order = [
  WearableType.Exclusive,
  WearableType.Hat,
  WearableType.Eyes,
  WearableType.Threads,
  WearableType.Hair,
];

interface WearablesMenuProps {}
export const WearablesMenu = ({}: WearablesMenuProps) => {
  const forceRerender = useForceRerender();
  const [showing, setShowing] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [selectedFrame, selectedFrameRef, setSelectedFrame] = useRefState(WearableFrame.None);
  const [selectedType, selectedTypeRef, setSelectedType] = useRefState(WearableType.Exclusive);

  useEffect(() => {
    const handleUIEvent = (action: InputAction = InputAction.None) => {
      const { anyUnlockedFor, unlocked } = getWearableData();
      switch (action) {
        case InputAction.ForceRerender:
          forceRerender();
          break;
        case InputAction.ShowWearablesMenu:
          forceRerender();
          setShowing(true);
          setDisabled(false);
          if (unlocked.length) {
            let idx = 0;
            let initialType = WearableType.None;
            do {
              initialType = order[idx];
              idx++;
            } while (!anyUnlockedFor[initialType]);
            if (!anyUnlockedFor[initialType]) {
              break;
            }
            const initialItem = getCurrentOutfitItemBy(initialType) || WearableFrame.None;
            handleSelectWearableItem(initialType, initialItem);
          }
          break;
        case InputAction.HideWearablesMenu:
          setShowing(false);
          break;
        case InputAction.UnPause:
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
    if (showing && !disabled) {
      bridge.wearablesMenu.showing = true;
      bridge.wearablesMenu.onNavigate = (navDir: UINavDir) => {
        switch (navDir) {
          case UINavDir.Prev:
            return false;
          case UINavDir.Next:
            return false;
          case UINavDir.Up:
            handleNavigateVertical(-1);
            return true;
          case UINavDir.Down:
            handleNavigateVertical(1);
            return true;
          case UINavDir.Left:
            handleNavigateHorizontal(-1);
            return true;
          case UINavDir.Right:
            handleNavigateHorizontal(1);
            return true;
          default:
            return false;
        }
      }
      bridge.wearablesMenu.onInteract = () => {
        return false;
      }
      bridge.wearablesMenu.onCancel = () => {
        bridge.callAction(InputAction.HideWearablesMenu);
        return true;
      }
    } else {
      bridge.wearablesMenu.showing = false;
      bridge.wearablesMenu.onNavigate = null;
      bridge.wearablesMenu.onInteract = null;
      bridge.wearablesMenu.onCancel = null;
    }
  }, [showing, disabled]);

  const handleNavigateVertical = (dir: number) => {
    const { anyUnlockedFor } = getWearableData();
    const filtered = order.filter(type => anyUnlockedFor[type]);
    if (!filtered.length) return;
    const next = (Math.max(filtered.indexOf(selectedTypeRef.current), 0) + filtered.length + dir) % filtered.length;
    const nextType = filtered[next];
    const nextItem = getCurrentOutfitItemBy(nextType) || WearableFrame.None;
    handleSelectWearableItem(nextType, nextItem);
  }

  const handleNavigateHorizontal = (dir: number) => {
    const unlocked = saveDataStore.getUnlockedWearablesList();
    const items: WearableFrame[] = [WearableFrame.None];
    for (let i = 0; i < unlocked.length; i++) {
      if (!unlocked[i]) continue;
      const wtype = WEARABLE_TYPE_MAP[unlocked[i]];
      if (wtype !== selectedTypeRef.current) continue;
      items.push(unlocked[i]);
    }
    const next = (Math.max(items.indexOf(selectedFrameRef.current), 0) + items.length + dir) % items.length;
    const nextItem = items[next];
    const nextType = selectedTypeRef.current;
    handleSelectWearableItem(nextType, nextItem);
  }

  const handleSelectWearableItem = (nextType: WearableType, nextItem: WearableFrame) => {
    if (!nextType) return;
    setSelectedType(nextType);
    setSelectedFrame(nextItem);
    switch (nextType) {
      case WearableType.Exclusive:
        bridge.outfit.exclusive = nextItem;
        break;
      case WearableType.Hat:
        bridge.outfit.hat = nextItem;
        break;
      case WearableType.Eyes:
        bridge.outfit.eyes = nextItem;
        break;
      case WearableType.Threads:
        bridge.outfit.threads = nextItem;
        break;
      case WearableType.Hair:
        bridge.outfit.hair = nextItem;
        break;
      default:
        break;
    }
    if (nextItem) {
      if (nextType === WearableType.Exclusive) {
        bridge.outfit.threads = WearableFrame.None;
        bridge.outfit.eyes = WearableFrame.None;
        bridge.outfit.hair = WearableFrame.None;
        bridge.outfit.hat = WearableFrame.None;
      } else {
        bridge.outfit.exclusive = WearableFrame.None;
      }
    }
    saveDataStore.setOutfit(bridge.outfit);
    forceRerender();
  }

  if (!showing) return null;

  const { anyUnlockedFor, unlockedByType } = getWearableData();
  const inputType = bridge.gameState.inputType;

  return (
    <div id="wearables-menu" className="settings-menu wearables-menu">
      <div className="background blur"></div>
      <div className="content gap">
        <h2 className="title-gradient green wearables-menu-title">Snek Fashion!</h2>
        <Stack row noChildMargin gap={32} justify="stretch" align="stretch" style={{ width: 960 }}>
          <Stack className="outfit-preview-container" col align="center" justify="center" style={{ flex: 1, minHeight: 500 }}>
            <OutfitPreview outfit={bridge.outfit} />
          </Stack>
          <Stack col align="start" justify="start" noChildMargin gap={16} style={{ flex: 1 }}>
            {anyUnlockedFor[WearableType.Exclusive] && (
              <WearableItemsRow
                label="costume"
                type={WearableType.Exclusive}
                selectedItem={selectedFrame}
                selectedType={selectedType}
                unlockedByType={unlockedByType}
                onSelectWearableItem={handleSelectWearableItem}
              />
            )}
            {anyUnlockedFor[WearableType.Hat] && (
              <WearableItemsRow
                label="headware"
                type={WearableType.Hat}
                selectedItem={selectedFrame}
                selectedType={selectedType}
                unlockedByType={unlockedByType}
                onSelectWearableItem={handleSelectWearableItem}
              />
            )}
            {anyUnlockedFor[WearableType.Eyes] && (
              <WearableItemsRow
                label="optics"
                type={WearableType.Eyes}
                selectedItem={selectedFrame}
                selectedType={selectedType}
                unlockedByType={unlockedByType}
                onSelectWearableItem={handleSelectWearableItem}
              />
            )}
            {anyUnlockedFor[WearableType.Threads] && (
              <WearableItemsRow
                label="threads"
                type={WearableType.Threads}
                selectedItem={selectedFrame}
                selectedType={selectedType}
                unlockedByType={unlockedByType}
                onSelectWearableItem={handleSelectWearableItem}
              />
            )}
            {anyUnlockedFor[WearableType.Hair] && (
              <WearableItemsRow
                label="whiskers"
                type={WearableType.Hair}
                selectedItem={selectedFrame}
                selectedType={selectedType}
                unlockedByType={unlockedByType}
                onSelectWearableItem={handleSelectWearableItem}
              />
            )}
          </Stack>
        </Stack>
        <div className="menu-controls position-relative" style={{ width: 570, marginTop: 64 }}>
          {inputType === InputType.Keyboard ? (
            <>
              <div style={{ position: 'absolute', left: 80 }}>
                <Controls.ButtonBack inputType={inputType} />
              </div>
              <div style={{ position: 'absolute', right: 40 }}>
                <Controls.ButtonMove inputType={inputType} label="Select" />
              </div>
            </>
          ) : (
            <>
              <div style={{ position: 'absolute', left: 70 }}>
                <Controls.ButtonBack inputType={inputType} />
              </div>
              <div style={{ position: 'absolute', right: 40 }}>
                <Controls.ButtonMove inputType={inputType} label="Select" />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

interface WearableItemsRowProps {
  label: string,
  type: WearableType,
  selectedType: WearableType,
  selectedItem: WearableFrame,
  unlockedByType: Record<WearableType, WearableFrame[]>,
  onSelectWearableItem: (nextType: WearableType, nextItem: WearableFrame) => void,
}
const WearableItemsRow = ({
  label,
  type,
  selectedType,
  selectedItem,
  unlockedByType,
  onSelectWearableItem,
}: WearableItemsRowProps) => {
  const activeType = type === selectedType;
  return (
    <Stack col noChildMargin gap={8} justify="start" align="start">
      <Stack row noChildMargin gap={8}>
        <p className={"font-retro nomargin"
          + (activeType ? ' color-a' : ' color-c')
        }>
          {label}
        </p>
        <p className="minimood nomargin" style={{ marginTop: 12, fontSize: '0.7em' }}>
          {getCurrentOutfitItemBy(type) === WearableFrame.None
            ? <span className="color-d">None</span>
            : <span className={getTypeColorClassname(type)}>{wearableDisplay(getCurrentOutfitItemBy(type))}</span>
          }
        </p>
      </Stack>
      <Stack row noChildMargin gap={24}>
        <WearableItem
          item={WearableFrame.None}
          type={type}
          selectedItem={selectedItem}
          selectedType={selectedType}
          onSelectWearableItem={onSelectWearableItem}
        />
        {unlockedByType[type].map(item => (
          <WearableItem
            key={item}
            item={item}
            type={type}
            selectedItem={selectedItem}
            selectedType={selectedType}
            onSelectWearableItem={onSelectWearableItem}
          />
        ))}
      </Stack>
    </Stack>
  )
}

function getCurrentOutfitItemBy(type: WearableType): WearableFrame {
  switch (type) {
    case WearableType.Exclusive:
      return bridge.outfit.exclusive || WearableFrame.None;
    case WearableType.Hat:
      return bridge.outfit.hat || WearableFrame.None;
    case WearableType.Eyes:
      return bridge.outfit.eyes || WearableFrame.None;
    case WearableType.Threads:
      return bridge.outfit.threads || WearableFrame.None;
    case WearableType.Hair:
      return bridge.outfit.hair || WearableFrame.None;
    case WearableType.None:
      return WearableFrame.None;
  }
}

interface WearableItemProps {
  item: WearableFrame,
  type: WearableType,
  selectedType: WearableType,
  selectedItem: WearableFrame,
  onSelectWearableItem: (nextType: WearableType, nextItem: WearableFrame) => void,
}
const WearableItem = ({ item, type, selectedType, selectedItem, onSelectWearableItem }: WearableItemProps) => {
  const active = getCurrentOutfitItemBy(type) === item;
  const selected = item === selectedItem && type === selectedType;
  const handleClick = () => {
    onSelectWearableItem(type, selectedItem)
  }
  return (
    <button
      title={wearableDisplay(item)}
      className={'wearable-icon'
        + (active ? ' active' : '')
        + (selected ? ' selected' : '')
        + (' ' + getIconClassname(item))
      }
      onClick={handleClick}
    ></button>
  )
}

function getTypeColorClassname(type: WearableType) {
  switch (type) {
    case WearableType.Exclusive:
      return 'color-l';
    case WearableType.Hat:
      return 'color-w';
    case WearableType.Eyes:
      return 'color-q';
    case WearableType.Threads:
      return 'color-v';
    case WearableType.Hair:
      return 'color-r';
    case WearableType.None:
      return 'color-d';
    default:
      return 'color-a';
  }
}

function getIconClassname(item: WearableFrame) {
  switch (item) {
    case WearableFrame.None:
      return 'none';
    case WearableFrame.CowboyHat:
      return 'hat';
    case WearableFrame.ChefHat:
      return 'chef';
    case WearableFrame.IndianaJonesHat:
      return 'indianajones';
    case WearableFrame.Sunglasses:
      return 'sunglasses';
    case WearableFrame.Monocle:
      return 'monocle';
    case WearableFrame.TechVisor:
      return 'techvisor';
    case WearableFrame.Glasses:
      return 'glasses';
    case WearableFrame.Aviators:
      return 'aviators';
    case WearableFrame._ThinGlasses:
      return '';
    case WearableFrame.Mustache:
      return 'mustache';
    case WearableFrame.BanditMask:
      return 'bandit';
    case WearableFrame.PirateOutfit:
      return 'pirate';
    case WearableFrame.CatEars:
      return 'catears';
    case WearableFrame.Horns:
      return 'horns';
    case WearableFrame.NinjaBlue:
      return 'ninja1';
    case WearableFrame.NinjaPurple:
      return 'ninja2';
    case WearableFrame.BaseballCap:
      return 'baseballcap';
    case WearableFrame.VikingHelmet:
      return 'viking';
    case WearableFrame.LuchadoreMaskRed:
      return 'luchador1';
    case WearableFrame.LuchadoreMaskBlue:
      return 'luchador2';
    case WearableFrame.MexicanBlanket:
      return 'blanket';
    case WearableFrame.RoyalCape:
      return 'robe';
    case WearableFrame.Crown:
      return 'crown';
    case WearableFrame.Cone:
      return 'trafficcone';
    case WearableFrame.Crusher:
      return '';
    case WearableFrame.CrusherSeg1:
      return '';
    case WearableFrame.CrusherSeg2:
      return '';
  }
}

function getWearableData() {
  const anyUnlockedFor: Partial<Record<WearableType, boolean>> = {};
  const unlocked = saveDataStore.getUnlockedWearablesList();
  const unlockedByType: Record<WearableType, WearableFrame[]> = {
    [WearableType.None]: [],
    [WearableType.Exclusive]: [],
    [WearableType.Hat]: [],
    [WearableType.Eyes]: [],
    [WearableType.Threads]: [],
    [WearableType.Hair]: [],
  };
  for (let i = 0; i < unlocked.length; i++) {
    if (!unlocked[i]) continue;
    const wtype = WEARABLE_TYPE_MAP[unlocked[i]];
    anyUnlockedFor[wtype] = true;
    unlockedByType[wtype].push(unlocked[i]);
  }
  return {
    anyUnlockedFor,
    unlockedByType,
    unlocked,
  };
}
