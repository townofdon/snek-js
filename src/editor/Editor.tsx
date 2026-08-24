import React, { useCallback, useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import cx from "classnames";

import { Operation, EditorTool } from "./editorSketch";
import { clamp, getCoordIndex2, getRelativeDir, isValidPortalChannel } from "../utils";
import { DIMENSIONS, GRIDCOUNT_X, GRIDCOUNT_Y } from "../constants";
import { EDITOR_DEFAULTS } from "./editorConstants";
import { BARRIER_TYPE_MAX, BarrierType, DifficultyIndex, DIR, EditorData, EditorOptions, KeyChannel, PortalChannel, SwitchType, ThreatType } from "../types";
import { Tile } from "./editorTypes";
import { useRefState } from "./hooks/useRefState";
import { useLoadMapData } from "./hooks/useLoadMapData";
import {
  Command,
  DeleteElementCommand,
  DeleteLineCommand,
  DeleteRectangleCommand,
  FloodFillCommand,
  FloodFillEmptyCommand,
  NoOpCommand,
  SetAppleCommand,
  SetArmorCommand,
  SetBarrierCommand,
  SetDecorative1Command,
  SetDecorative2Command,
  SetDoorCommand,
  SetInvincibilityCommand,
  SetKeyCommand,
  SetLineAppleCommand,
  SetLineArmorCommand,
  SetLineBarrierCommand,
  SetLineDeco1Command,
  SetLineDeco2Command,
  SetLineDoorCommand,
  SetLineInvincibilityCommand,
  SetLineKeyCommand,
  SetLineLockCommand,
  SetLineNospawnCommand,
  SetLinePassableCommand,
  SetLinePipeCommand,
  SetLinePortalCommand,
  SetLineReversibilityCommand,
  SetLineSwitchCommand,
  SetLineThreatCommand,
  SetLockCommand,
  SetNospawnCommand,
  SetPassableCommand,
  SetPipeCommand,
  SetPlayerSpawnCommand,
  SetPortalCommand,
  SetRectangleAppleCommand,
  SetRectangleArmorCommand,
  SetRectangleBarrierCommand,
  SetRectangleDeco1Command,
  SetRectangleDeco2Command,
  SetRectangleDoorCommand,
  SetRectangleInvincibilityCommand,
  SetRectangleKeyCommand,
  SetRectangleLockCommand,
  SetRectangleNospawnCommand,
  SetRectanglePassableCommand,
  SetRectanglePipeCommand,
  SetRectanglePortalCommand,
  SetRectangleReversibilityCommand,
  SetRectangleSwitchCommand,
  SetRectangleThreatCommand,
  SetReversibilityCommand,
  SetSwitchCommand,
  SetThreatCommand,
} from "./commands";
import { MouseButton, SpecialKey, findNumberPressed, getIsOutside, isCharPressed, isNumberPressed } from "./utils/keyboardUtils";
import { EditorCanvas } from "./EditorCanvas";
import { EditorOptionsPanel } from "./EditorOptions";
import { EditorTiles } from "./EditorTiles";
import { EditorTools } from "./EditorTools";
import { MapPreview } from "./MapPreview";
import { SidebarKeyChannels } from "./SidebarKeyChannels";
import { EditorSidebar } from "./EditorSidebar";
import { SidebarPortalChannels } from "./SidebarPortalChannels";
import { useUpdateUrl } from "./hooks/useUpdateUrl";
import { SidebarBarrierTypes } from "./SidebarBarrierTypes";
import { Stack } from "@/components/Stack";
import { DropdownField, Option } from "@/components/Field";

import * as styles from "./Editor.css";
import { SidebarThreatTypes } from "./SidebarThreatTypes";

interface LocalState {
  isMouseInsideMap: boolean,
}

export const Editor = () => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const optionsContainerRef = useRef<HTMLDivElement>(null);
  const [mapId, setMapId] = useState('');
  const [initialized, setInitialized] = useState(false);
  const [isPreviewShowing, setPreviewShowing] = useState(false);
  const [difficulty, setDifficulty] = useState<DifficultyIndex>(3);
  const [options, optionsRef, setOptions] = useRefState<EditorOptions>(EDITOR_DEFAULTS.options)
  const [data, dataRef, setData] = useRefState<EditorData>(EDITOR_DEFAULTS.data);
  const [pastCommands, pastCommandsRef, setPastCommands] = useRefState<Command[]>([]);
  const [futureCommands, futureCommandsRef, setFutureCommands] = useRefState<Command[]>([]);
  const [, lastCoordUpdatedRef, setLastCoordUpdated] = useRefState(-1);
  const [mouseAt, mouseAtRef, setMouseAt] = useRefState(-1);
  const [mouseFrom, mouseFromRef, setMouseFrom] = useRefState(-1);
  const [, mousePressedRef, setMousePressed] = useRefState(false);
  const [, triggerOnReleaseRef, setTriggerOnRelease] = useRefState(false);
  const [, shiftPressedRef, setShiftPressed] = useRefState(false);
  const [, altPressedRef, setAltPressed] = useRefState(false);
  const [tool, toolRef, setTool] = useRefState(EditorTool.Pencil);
  const [tile, tileRef, _setTile] = useRefState(Tile.Barrier);
  const [barrierType, barrierTypeRef, setBarrierType] = useRefState(BarrierType.Default);
  const [threatType, threatTypeRef, setThreatType] = useRefState(ThreatType.Mine);
  const [switchType, switchTypeRef, setSwitchType] = useRefState(SwitchType.Button);
  const [keyChannel, keyChannelRef, setKeyChannel] = useRefState(KeyChannel.Yellow);
  const [portalChannel, portalChannelRef, setPortalChannel] = useRefState<PortalChannel>(0);

  const hasUndo = !!pastCommands.length;
  const hasRedo = !!futureCommands.length;

  useLoadMapData({ setData, setOptions, setPastCommands, setFutureCommands, setInitialized });
  const isSynced = useUpdateUrl({ initialized, data, options });

  const setTile = (_tile: Tile) => {
    if (toolRef.current === EditorTool.Eraser) setTool(EditorTool.Pencil);
    _setTile(_tile);
  }

  const setChannelTo = (num: number) => {
    if (tileRef.current === Tile.Key || tileRef.current === Tile.Lock) {
      if (num >= 1 && num <= 3) {
        setKeyChannel({
          [0]: KeyChannel.Yellow,
          [1]: KeyChannel.Red,
          [2]: KeyChannel.Blue,
        }[num - 1] || KeyChannel.Yellow);
      }
    } else if (tileRef.current === Tile.Portal) {
      const index = num === 0 ? 9 : num - 1;
      const channel = isValidPortalChannel(index) ? (index) : 0;
      setPortalChannel(channel);
    }
  }

  const cycleChannel = (direction: number) => {
    if (tileRef.current === Tile.Key || tileRef.current === Tile.Lock) {
      if (direction < 0) {
        setKeyChannel({
          [KeyChannel.Yellow]: KeyChannel.Blue,
          [KeyChannel.Red]: KeyChannel.Yellow,
          [KeyChannel.Blue]: KeyChannel.Red,
        }[keyChannelRef.current]);
      } else {
        setKeyChannel({
          [KeyChannel.Yellow]: KeyChannel.Red,
          [KeyChannel.Red]: KeyChannel.Blue,
          [KeyChannel.Blue]: KeyChannel.Yellow,
        }[keyChannelRef.current]);
      }
    } else if (tileRef.current === Tile.Portal) {
      const channel: PortalChannel = ((portalChannelRef.current + 10 + direction) % 10) as PortalChannel;
      setPortalChannel(channel);
    } else if (tileRef.current === Tile.Barrier) {
      let btype: BarrierType = ((barrierTypeRef.current + BARRIER_TYPE_MAX + direction) % BARRIER_TYPE_MAX) as BarrierType;
      if (btype === BarrierType.Unset) {
        btype = direction > 0 ? BarrierType.Default : (BARRIER_TYPE_MAX - 1)
      }
      setBarrierType(btype);
    } else if (tileRef.current === Tile.Threat) {
      const order: ThreatType[] = [
        ThreatType.Mine,
        ThreatType.Bomb,
        ThreatType.LaserDiode,
        ThreatType.ExplodableBarrel,
        ThreatType.Barricade,
        ThreatType.Spikes,
        ThreatType.WallSpikes,
        ThreatType.Saw,
        ThreatType.Flamethrower,
      ]
      const idx = order.indexOf(threatTypeRef.current);
      setThreatType(idx >= 0 ? order[(idx + order.length + direction) % order.length] : ThreatType.Mine);
    }
  }

  const cycleTile = (direction: number) => {
    setMousePressed(false);
    setTriggerOnRelease(false);
    const order = [
      Tile.Barrier,
      Tile.Passable,
      Tile.Door,
      Tile.Deco1,
      Tile.Deco2,
      Tile.Apple,
      Tile.Nospawn,
      Tile.Lock,
      Tile.Key,
      Tile.Portal,
      Tile.Spawn,
      Tile.Threat,
      Tile.Invincibility,
      Tile.Armor,
      Tile.Reversibility,
      Tile.Switch,
      Tile.Pipe,
    ];
    const idx = order.indexOf(tileRef.current ?? Tile.None);
    if (idx < 0 || tileRef.current === Tile.None) {
      setTile(Tile.Barrier);
    } else if (direction < 0) {
      setTile(order[(idx + order.length - 1) % order.length]);
    } else {
      setTile(order[(idx + order.length + 1) % order.length]);
    }
  }

  const state = useRef<LocalState>({
    isMouseInsideMap: false,
  })

  const getCommandDrawTile = (coord: number, prevCoord: number) => {
    const rollbackLastCoordUpdated = () => {
      setLastCoordUpdated(prevCoord);
      setMouseFrom(prevCoord);
    }
    switch (tileRef.current) {
      case Tile.Apple:
        return new SetAppleCommand(coord, dataRef.current, setData, rollbackLastCoordUpdated);
      case Tile.Threat:
        return new SetThreatCommand(coord,dataRef.current, setData, rollbackLastCoordUpdated, threatTypeRef.current);
      case Tile.Invincibility:
        return new SetInvincibilityCommand(coord, dataRef.current, setData, rollbackLastCoordUpdated);
      case Tile.Reversibility:
        return new SetReversibilityCommand(coord, dataRef.current, setData, rollbackLastCoordUpdated);
      case Tile.Armor:
        return new SetArmorCommand(coord, dataRef.current, setData, rollbackLastCoordUpdated);
      case Tile.Barrier:
        return new SetBarrierCommand(coord, dataRef.current, setData, rollbackLastCoordUpdated, barrierTypeRef.current);
      case Tile.Door:
        return new SetDoorCommand(coord, dataRef.current, setData, rollbackLastCoordUpdated);
      case Tile.Deco1:
        return new SetDecorative1Command(coord, dataRef.current, setData, rollbackLastCoordUpdated);
      case Tile.Deco2:
        return new SetDecorative2Command(coord, dataRef.current, setData, rollbackLastCoordUpdated);
      case Tile.Portal:
        return new SetPortalCommand(coord, portalChannelRef.current, dataRef.current, setData, rollbackLastCoordUpdated);
      case Tile.Key:
        return new SetKeyCommand(coord, keyChannelRef.current, dataRef.current, setData, rollbackLastCoordUpdated);
      case Tile.Lock:
        return new SetLockCommand(coord, keyChannelRef.current, dataRef.current, setData, rollbackLastCoordUpdated);
      case Tile.Spawn:
        return new SetPlayerSpawnCommand(coord, dataRef.current, setData, rollbackLastCoordUpdated);
      case Tile.Nospawn:
        return new SetNospawnCommand(coord, dataRef.current, setData, rollbackLastCoordUpdated);
      case Tile.Passable:
        return new SetPassableCommand(coord, dataRef.current, setData, rollbackLastCoordUpdated);
      case Tile.Switch:
        return new SetSwitchCommand(coord, dataRef.current, setData, rollbackLastCoordUpdated, switchTypeRef.current);
      case Tile.Pipe:
        return new SetPipeCommand(coord, dataRef.current, setData, rollbackLastCoordUpdated);
      case Tile.None:
      default:
        throw new Error(`unhandled tile: ${tileRef.current}`);
    }
  }

  const getCommandDrawLine = (from: number, to: number) => {
    const rollbackLastCoordUpdated = () => {
      setLastCoordUpdated(from);
      setMouseFrom(from);
    }
    switch (tileRef.current) {
      case Tile.Apple:
        return new SetLineAppleCommand(from, to, dataRef, setData, rollbackLastCoordUpdated);
      case Tile.Threat:
        return new SetLineThreatCommand(from, to, dataRef, setData, rollbackLastCoordUpdated, threatTypeRef.current);
      case Tile.Invincibility:
        return new SetLineInvincibilityCommand(from, to, dataRef, setData, rollbackLastCoordUpdated);
      case Tile.Reversibility:
        return new SetLineReversibilityCommand(from, to, dataRef, setData, rollbackLastCoordUpdated);
      case Tile.Armor:
        return new SetLineArmorCommand(from, to, dataRef, setData, rollbackLastCoordUpdated);
      case Tile.Barrier:
        return new SetLineBarrierCommand(from, to, dataRef, setData, rollbackLastCoordUpdated, barrierTypeRef.current);
      case Tile.Door:
        return new SetLineDoorCommand(from, to, dataRef, setData, rollbackLastCoordUpdated);
      case Tile.Deco1:
        return new SetLineDeco1Command(from, to, dataRef, setData, rollbackLastCoordUpdated);
      case Tile.Deco2:
        return new SetLineDeco2Command(from, to, dataRef, setData, rollbackLastCoordUpdated);
      case Tile.Portal:
        return new SetLinePortalCommand(from, to, portalChannelRef.current, dataRef, setData, rollbackLastCoordUpdated);
      case Tile.Key:
        return new SetLineKeyCommand(from, to, keyChannelRef.current, dataRef, setData, rollbackLastCoordUpdated);
      case Tile.Lock:
        return new SetLineLockCommand(from, to, keyChannelRef.current, dataRef, setData, rollbackLastCoordUpdated);
      case Tile.Spawn:
        return new SetPlayerSpawnCommand(to, dataRef.current, setData, rollbackLastCoordUpdated);
      case Tile.Nospawn:
        return new SetLineNospawnCommand(from, to, dataRef, setData, rollbackLastCoordUpdated);
      case Tile.Passable:
        return new SetLinePassableCommand(from, to, dataRef, setData, rollbackLastCoordUpdated);
      case Tile.Switch:
        return new SetLineSwitchCommand(from, to, dataRef, setData, rollbackLastCoordUpdated, switchTypeRef.current);
      case Tile.Pipe:
        return new SetLinePipeCommand(from, to, dataRef, setData, rollbackLastCoordUpdated);
      case Tile.None:
      default:
        throw new Error(`unhandled tile: ${tileRef.current}`);
    }
  }

  const getCommandDrawRectangle = (from: number, to: number) => {
    const rollbackLastCoordUpdated = () => {
      setLastCoordUpdated(from);
      setMouseFrom(from);
    }
    switch (tileRef.current) {
      case Tile.Apple:
        return new SetRectangleAppleCommand(from, to, dataRef, setData, rollbackLastCoordUpdated);
      case Tile.Threat:
        return new SetRectangleThreatCommand(from, to, dataRef, setData, rollbackLastCoordUpdated, threatTypeRef.current);
      case Tile.Invincibility:
        return new SetRectangleInvincibilityCommand(from, to, dataRef, setData, rollbackLastCoordUpdated);
      case Tile.Reversibility:
        return new SetRectangleReversibilityCommand(from, to, dataRef, setData, rollbackLastCoordUpdated);
      case Tile.Armor:
        return new SetRectangleArmorCommand(from, to, dataRef, setData, rollbackLastCoordUpdated);
      case Tile.Barrier:
        return new SetRectangleBarrierCommand(from, to, dataRef, setData, rollbackLastCoordUpdated, barrierTypeRef.current);
      case Tile.Door:
        return new SetRectangleDoorCommand(from, to, dataRef, setData, rollbackLastCoordUpdated);
      case Tile.Deco1:
        return new SetRectangleDeco1Command(from, to, dataRef, setData, rollbackLastCoordUpdated);
      case Tile.Deco2:
        return new SetRectangleDeco2Command(from, to, dataRef, setData, rollbackLastCoordUpdated);
      case Tile.Portal:
        return new SetRectanglePortalCommand(from, to, portalChannelRef.current, dataRef, setData, rollbackLastCoordUpdated);
      case Tile.Key:
        return new SetRectangleKeyCommand(from, to, keyChannelRef.current, dataRef, setData, rollbackLastCoordUpdated);
      case Tile.Lock:
        return new SetRectangleLockCommand(from, to, keyChannelRef.current, dataRef, setData, rollbackLastCoordUpdated);
      case Tile.Spawn:
        return new SetPlayerSpawnCommand(to, dataRef.current, setData, rollbackLastCoordUpdated);
      case Tile.Nospawn:
        return new SetRectangleNospawnCommand(from, to, dataRef, setData, rollbackLastCoordUpdated);
      case Tile.Passable:
        return new SetRectanglePassableCommand(from, to, dataRef, setData, rollbackLastCoordUpdated);
      case Tile.Switch:
        return new SetRectangleSwitchCommand(from, to, dataRef, setData, rollbackLastCoordUpdated, switchTypeRef.current);
      case Tile.Pipe:
        return new SetRectanglePipeCommand(from, to, dataRef, setData, rollbackLastCoordUpdated);
      case Tile.None:
      default:
        throw new Error(`unhandled tile: ${tileRef.current}`);
    }
  }

  const getCommand = () => {
    const operation = getOperation();
    if (operation === Operation.None) return new NoOpCommand();
    const prevCoord = lastCoordUpdatedRef.current === -1 ? mouseAtRef.current : lastCoordUpdatedRef.current;
    if (toolRef.current === EditorTool.Pencil && operation === Operation.Write) {
      const coord = mouseAtRef.current;
      return getCommandDrawTile(coord, prevCoord);
    } else if (toolRef.current === EditorTool.Pencil && operation === Operation.Add) {
      const from = prevCoord;
      const to = mouseAtRef.current;
      return getCommandDrawLine(from, to);
    } else if (toolRef.current === EditorTool.Line && [Operation.Add, Operation.Write].includes(operation)) {
      const from = mouseFromRef.current;
      const to = mouseAtRef.current;
      return getCommandDrawLine(from, to);
    } else if (toolRef.current === EditorTool.Rectangle && [Operation.Add, Operation.Write].includes(operation)) {
      const from = mouseFromRef.current;
      const to = mouseAtRef.current;
      return getCommandDrawRectangle(from, to);
    } else if (toolRef.current === EditorTool.Line && operation === Operation.Remove) {
      const from = mouseFromRef.current;
      const to = mouseAtRef.current;
      return new DeleteLineCommand(from, to, dataRef, setData, () => setLastCoordUpdated(from));
    } else if (toolRef.current === EditorTool.Rectangle && operation === Operation.Remove) {
      const from = mouseFromRef.current;
      const to = mouseAtRef.current;
      return new DeleteRectangleCommand(from, to, dataRef, setData, () => setLastCoordUpdated(from));
    } else if (
      toolRef.current === EditorTool.Eraser && operation === Operation.Write ||
      toolRef.current === EditorTool.Pencil && operation === Operation.Remove
    ) {
      const coord = mouseAtRef.current;
      return new DeleteElementCommand(coord, dataRef.current, setData, () => setLastCoordUpdated(prevCoord));
    } else if (toolRef.current === EditorTool.Eraser && operation === Operation.Add) {
      const from = prevCoord;
      const to = mouseAtRef.current;
      return new DeleteLineCommand(from, to, dataRef, setData, () => setLastCoordUpdated(from));
    } else if (toolRef.current === EditorTool.Bucket) {
      if (mouseAtRef.current === -1) return new NoOpCommand();
      if (tileRef.current === Tile.Spawn) return new NoOpCommand();
      const x = Math.floor(mouseAtRef.current % GRIDCOUNT_X);
      const y = Math.floor(mouseAtRef.current / GRIDCOUNT_X);
      if (operation === Operation.Remove) {
        return new FloodFillEmptyCommand(x, y, dataRef, setData);
      } else {
        return new FloodFillCommand(
          tileRef.current,
          x,
          y,
          portalChannelRef.current,
          keyChannelRef.current,
          barrierTypeRef.current,
          threatTypeRef.current,
          switchTypeRef.current,
          dataRef,
          setData,
        );
      }
    }
    throw Error('not implemented');
  }

  const executeCommand = (command: Command) => {
    if (!command) return;
    const success = command.execute();
    if (success) {
      setPastCommands(prev => [...prev, command]);
      setFutureCommands([]);
    }
  }

  const updateMap = () => {
    if (mouseAtRef.current === -1) return;
    if (getOperation() === Operation.None) return;
    const command = getCommand();
    executeCommand(command);
    setLastCoordUpdated(mouseAtRef.current);
    setMouseFrom(mouseAtRef.current);
  }

  const undo = () => {
    const pastCommands = pastCommandsRef.current;
    const command = pastCommands[pastCommands.length - 1];
    if (!command) return;
    toast(`Undo ${command.name.toLowerCase()}`, { icon: '⏪', duration: 1500, position: 'bottom-right', className: styles.toastUndo });
    command.rollback();
    setMousePressed(false);
    setTriggerOnRelease(false);
    setPastCommands(prev => prev.filter(c => c !== command));
    setFutureCommands(prev => [...prev, command]);
  }

  const redo = () => {
    const futureCommands = futureCommandsRef.current;
    const command = futureCommands[futureCommands.length - 1];
    if (!command) return;
    const success = command.execute();
    toast(`Redo ${command.name.toLowerCase()}`, { icon: '⏩', duration: 1500, position: 'bottom-right', className: styles.toastRedo });
    if (success) {
      setMousePressed(false);
      setTriggerOnRelease(false);
      setPastCommands(prev => [...prev, command]);
      setFutureCommands(prev => prev.filter(c => c !== command));
    }
  }

  const getOperation = (): Operation => {
    if (tileRef.current === Tile.Spawn) {
      if (mousePressedRef.current) return Operation.Write;
      return Operation.None;
    }
    const isImmediateRemovableTool = [EditorTool.Pencil, EditorTool.Eraser, EditorTool.Bucket].includes(toolRef.current);
    const isImmediateAdditiveTool = [EditorTool.Pencil, EditorTool.Eraser].includes(toolRef.current)
    if (altPressedRef.current && (isImmediateRemovableTool || mousePressedRef.current)) return Operation.Remove;
    if (shiftPressedRef.current && isImmediateAdditiveTool) return Operation.Add;
    if (mousePressedRef.current) return Operation.Write;
    return Operation.None;
  }

  const handleMouseMove = useCallback((ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const x = Math.floor(clamp(ev.nativeEvent.offsetX, 0, DIMENSIONS.x - 1) / DIMENSIONS.x * GRIDCOUNT_X);
    const y = Math.floor(clamp(ev.nativeEvent.offsetY, 0, DIMENSIONS.y - 1) / DIMENSIONS.y * GRIDCOUNT_Y);
    const coord = getCoordIndex2(x, y);
    setMouseAt(coord);
    if (mousePressedRef.current && [EditorTool.Pencil, EditorTool.Eraser].includes(toolRef.current)) {
      if (lastCoordUpdatedRef.current !== mouseAtRef.current) {
        updateMap();
      }
    }
    state.current.isMouseInsideMap = true;
  }, []);

  const handleMouseLeave = useCallback((ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setMouseAt(-1);
    state.current.isMouseInsideMap = false;
  }, []);

  const handleMouseDown = useCallback((ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (isPreviewShowing) {
      setMousePressed(false);
      setTriggerOnRelease(false);
      return;
    }
    // if already pressed, and different mouse button gets clicked, cancel the current operation
    if (mousePressedRef.current && ev.nativeEvent.button !== 0) {
      setMousePressed(false);
      setTriggerOnRelease(false);
      return;
    }
    setMousePressed(ev.nativeEvent.button === MouseButton.Left);
    setMouseFrom(mouseAtRef.current);
    if ([EditorTool.Rectangle, EditorTool.Line].includes(toolRef.current)) {
      setTriggerOnRelease(true);
    }
    if ([EditorTool.Pencil, EditorTool.Bucket, EditorTool.Eraser].includes(toolRef.current)) {
      updateMap();
    }
  }, [isPreviewShowing]);

  const handleMouseUp = (ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const isValidRelease = mousePressedRef.current && state.current.isMouseInsideMap && triggerOnReleaseRef.current;
    if (isValidRelease && [EditorTool.Rectangle, EditorTool.Line].includes(toolRef.current)) {
      updateMap();
    }
    setMousePressed(false);
    setTriggerOnRelease(false);
  };

  const handleWindowMouseUp = (ev: MouseEvent) => {
    setTimeout(() => {
      setMousePressed(false);
      setTriggerOnRelease(false);
    }, 0);
  }

  const handleKeyDown = (ev: KeyboardEvent) => {
    if (!getIsOutside(ev, optionsContainerRef)) return;
    if (isPreviewShowing) return;
    const cancelOperation = isCharPressed(ev, SpecialKey.Escape) || isCharPressed(ev, SpecialKey.Backspace) || isCharPressed(ev, SpecialKey.Delete)
    if (mousePressedRef.current && cancelOperation) {
      setMousePressed(false);
    setTriggerOnRelease(false);
    } else if (isCharPressed(ev, 'z', { ctrlKey: true, shiftKey: true }) || isCharPressed(ev, 'y', { ctrlKey: true })) {
      redo();
      ev.preventDefault();
    } else if (isCharPressed(ev, 'z', { ctrlKey: true })) {
      undo();
      ev.preventDefault();
    } else if (
      isNumberPressed(ev, 0, { shiftKey: true }) || 
      isNumberPressed(ev, 1, { shiftKey: true }) || 
      isNumberPressed(ev, 2, { shiftKey: true }) || 
      isNumberPressed(ev, 3, { shiftKey: true }) || 
      isNumberPressed(ev, 4, { shiftKey: true }) || 
      isNumberPressed(ev, 5, { shiftKey: true }) || 
      isNumberPressed(ev, 6, { shiftKey: true }) || 
      isNumberPressed(ev, 7, { shiftKey: true }) || 
      isNumberPressed(ev, 8, { shiftKey: true }) || 
      isNumberPressed(ev, 9, { shiftKey: true })
    ) {
      setChannelTo(findNumberPressed(ev));
    } else if (isCharPressed(ev, '`')) {
      setTile(Tile.Spawn);
    } else if (isNumberPressed(ev, 1)) {
      setTile(Tile.Barrier);
    } else if (isNumberPressed(ev, 2)) {
      setTile(Tile.Passable);
    } else if (isNumberPressed(ev, 3)) {
      setTile(Tile.Door);
    } else if (isNumberPressed(ev, 4)) {
      setTile(Tile.Deco1);
    } else if (isNumberPressed(ev, 5)) {
      setTile(Tile.Deco2);
    } else if (isNumberPressed(ev, 6)) {
      setTile(Tile.Apple);
    } else if (isNumberPressed(ev, 7)) {
      setTile(Tile.Nospawn);
    } else if (isNumberPressed(ev, 8)) {
      setTile(Tile.Lock);
      if (keyChannelRef.current > 3) {
        setChannelTo(3);
      }
    } else if (isNumberPressed(ev, 9)) {
      setTile(Tile.Key);
      if (keyChannelRef.current > 3) {
        setChannelTo(3);
      }
    } else if (isNumberPressed(ev, 0)) {
      setTile(Tile.Portal);
    } else if (isCharPressed(ev, '-')) {
      cycleTile(-1);
    } else if (isCharPressed(ev, '=')) {
      cycleTile(1);
    } else if (isCharPressed(ev, '[')) {
      cycleChannel(-1);
    } else if (isCharPressed(ev, ']')) {
      cycleChannel(1);
    } else if (isCharPressed(ev, 'b')) {
      setTool(EditorTool.Pencil);
    } else if (isCharPressed(ev, 'e')) {
      setTool(EditorTool.Eraser);
    } else if (isCharPressed(ev, 'l')) {
      setTool(EditorTool.Line);
    } else if (isCharPressed(ev, 'g')) {
      setTool(EditorTool.Bucket);
    } else if (isCharPressed(ev, 'u') || isCharPressed(ev, 'r')) {
      setTool(EditorTool.Rectangle);
    } else if (isCharPressed(ev, 'm')) {
      setTool(EditorTool.Select);
    } else if (isCharPressed(ev, 'v')) {
      setTool(EditorTool.Move);
    } else if (isCharPressed(ev, SpecialKey.ArrowUp, { shiftKey: true })) {
      setData(prev => ({ ...prev, startDirection: DIR.UP }));
    } else if (isCharPressed(ev, SpecialKey.ArrowDown, { shiftKey: true })) {
      setData(prev => ({ ...prev, startDirection: DIR.DOWN }));
    } else if (isCharPressed(ev, SpecialKey.ArrowLeft, { shiftKey: true })) {
      setData(prev => ({ ...prev, startDirection: DIR.LEFT }));
    } else if (isCharPressed(ev, SpecialKey.ArrowRight, { shiftKey: true })) {
      setData(prev => ({ ...prev, startDirection: DIR.RIGHT }));
    }
    setShiftPressed(ev.shiftKey);
    setAltPressed(ev.altKey);
  }

  const handleKeyUp = (ev: KeyboardEvent) => {
    setShiftPressed(ev.shiftKey);
    setAltPressed(ev.altKey);
  }

  useEffect(() => {
    if (isPreviewShowing) {
      document.body.classList.add(styles.disableScroll);
    } else {
      document.body.classList.remove(styles.disableScroll);
    }
  }, [isPreviewShowing])

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mouseup", handleWindowMouseUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mouseup", handleWindowMouseUp);
    }
  }, [])

  const difficultyOptions = [
    { id: "1", value: "1", label: "Easy" },
    { id: "2", value: "2", label: "Medium" },
    { id: "3", value: "3", label: "Hard" },
    { id: "4", value: "4", label: "Ultra" },
  ] satisfies Option[]

  return (
    <div className={cx(styles.layout)}>
      <a href={`${getRelativeDir()}community`} className={cx("button minimood", styles.allMapsButton)}>
        <span>&lt;- All Maps</span>
      </a>
      {/* <button className={cx("minimood", styles.allMapsButton)}>&lt;- All Maps</button> */}
      <div className={styles.container}>
        <Stack row>
          <h1
            className={styles.mainTitle}
            style={{ color: options.palette.playerHead }}
          >
            {options.name || "_"}
          </h1>
          <button
            className={styles.previewMapButton}
            onClick={() => setPreviewShowing(true)}
          >
            ▶️ Preview
          </button>
          <DropdownField
            // label="Preview Difficulty"
            options={difficultyOptions}
            value={String(difficulty)}
            defaultValue="3" // hard
            onChange={(option: Option) => setDifficulty(parseInt(option.value, 10) as DifficultyIndex)}
          />
          <Stack>
            <span className={cx(styles.syncText, { [styles.isSynced]: isSynced })}>
              {isSynced ? 'synced ✓' : 'syncing...'}
            </span>
          </Stack>
        </Stack>
      </div>
      <div className={styles.editorContainer}>
        <EditorCanvas
          data={data}
          options={options}
          canvas={canvas}
          mouseAt={mouseAt}
          mouseFrom={mouseFrom}
          tile={tile}
          tool={tool}
          isPreviewShowing={isPreviewShowing}
          operation={getOperation()}
          handleMouseMove={handleMouseMove}
          handleMouseLeave={handleMouseLeave}
          handleMouseDown={handleMouseDown}
          handleMouseUp={handleMouseUp}
          editorTiles={<EditorTiles activeTile={tile} setTile={setTile} />}
          editorTools={
            <EditorTools
              activeTool={tool}
              setTool={setTool}
              data={data}
              setData={setData}
              executeCommand={executeCommand}
              undo={undo}
              redo={redo}
              hasUndo={hasUndo}
              hasRedo={hasRedo}
            />
          }
          tileSidebar={
            <EditorSidebar
              tile={tile}
              sidebarKeyChannels={
                <SidebarKeyChannels
                  activeChannel={keyChannel}
                  setChannel={setKeyChannel}
                />
              }
              sidebarPortalChannels={
                <SidebarPortalChannels
                  activeChannel={portalChannel}
                  setChannel={setPortalChannel}
                />
              }
              sidebarBarrierTypes={
                <SidebarBarrierTypes
                  activeBarrierType={barrierType}
                  options={options}
                  setBarrierType={setBarrierType}
                />
              }
              sidebarThreatTypes={
                <SidebarThreatTypes
                  activeThreatType={threatType}
                  options={options}
                  setThreatType={setThreatType}
                />
              }
            />
          }
        />
        <EditorOptionsPanel
          isPreviewShowing={isPreviewShowing}
          canvas={canvas}
          mapId={mapId}
          data={data}
          options={options}
          optionsRef={optionsRef}
          optionsContainerRef={optionsContainerRef}
          setMapId={setMapId}
          setData={setData}
          setOptions={setOptions}
          executeCommand={executeCommand}
          undo={undo}
          redo={redo}
        />
      </div>
      <MapPreview
        data={data}
        options={options}
        difficulty={difficulty}
        isPreviewShowing={isPreviewShowing}
        setPreviewShowing={setPreviewShowing}
      />
      <Toaster
        containerClassName={styles.toastContainer}
        toastOptions={{
          className: styles.toast,
          success: {
            duration: 5000,
            className: styles.toastSuccess,
            iconTheme: {
              primary: "#111",
              secondary: "#7ad9cd",
            },
          },
          error: {
            duration: 10000,
            className: styles.toastError,
            iconTheme: {
              primary: "#111",
              secondary: "#f2805d",
            },
          },
        }}
      />
    </div>
  );
};
