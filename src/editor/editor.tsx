import React, { useEffect, useRef } from "react";
import { useEditorData } from "./hooks/useEditorData";
import { EditorCanvas } from "./editorCanvas";

import { Operation, EditorTool } from "./editorSketch";
import { clamp, getCoordIndex2, isValidPortalChannel } from "../utils";
import { DIMENSIONS, GRIDCOUNT } from "../constants";
import { KeyChannel, PortalChannel } from "../types";

import * as styles from "./editor.css";
import { useRefState } from "./hooks/useRefState";
import {
  Command,
  DeleteElementCommand,
  NoOpCommand,
  SetAppleCommand,
  SetBarrierCommand,
  SetDecorative1Command,
  SetDecorative2Command,
  SetDoorCommand,
  SetKeyCommand,
  SetLockCommand,
  SetNospawnCommand,
  SetPassableCommand,
  SetPlayerSpawnCommand,
  SetPortalCommand,
} from "./commands";
import { SpecialKey, findNumberPressed, isCharPressed, isNumberPressed } from "./utils/keyboardUtils";

interface LocalState {
  isMouseInsideMap: boolean,
}

enum Tile {
  None,
  Barrier,
  Door,
  Deco1,
  Deco2,
  Apple,
  Portal,
  Key,
  Lock,
  Spawn,
  Nospawn,
  Passable,
}

enum MouseButton {
  Left = 0,
  Middle = 1,
  Right = 2,
}

export const Editor = () => {
  const canvas = useRef<HTMLCanvasElement>();
  const [data, dataRef, setData] = useEditorData();
  const [_pastCommands, pastCommandsRef, setPastCommands] = useRefState<Command[]>([]);
  const [_futureCommands, futureCommandsRef, setFutureCommands] = useRefState<Command[]>([]);
  const [lastCoordUpdated, lastCoordUpdatedRef, setLastCoordUpdated] = useRefState(-1);
  const [mouseAt, mouseAtRef, setMouseAt] = useRefState(-1);
  const [mouseFrom, mouseFromRef, setMouseFrom] = useRefState(-1);
  const [mousePressed, mousePressedRef, setMousePressed] = useRefState(false);
  const [triggerOnRelease, triggerOnReleaseRef, setTriggerOnRelease] = useRefState(false);
  const [tool, toolRef, setTool] = useRefState(EditorTool.Pencil);
  const [operation, operationRef, setOperation] = useRefState(Operation.None);
  const [tile, tileRef, setTile] = useRefState(Tile.Barrier);
  const [keyChannel, keyChannelRef, setKeyChannel] = useRefState(KeyChannel.Yellow);
  const [portalChannel, portalChannelRef, setPortalChannel] = useRefState<PortalChannel>(0);

  const state = useRef<LocalState>({
    isMouseInsideMap: false,
  })

  const getCommand = () => {
    if (operationRef.current === Operation.None) return new NoOpCommand();
    if (toolRef.current === EditorTool.Pencil && operationRef.current === Operation.Write) {
      const coord = mouseAtRef.current;
      switch (tileRef.current) {
        case Tile.Apple:
          return new SetAppleCommand(coord, dataRef.current, setData);
        case Tile.Barrier:
          return new SetBarrierCommand(coord, dataRef.current, setData);
        case Tile.Door:
          return new SetDoorCommand(coord, dataRef.current, setData);
        case Tile.Deco1:
          return new SetDecorative1Command(coord, dataRef.current, setData);
        case Tile.Deco2:
          return new SetDecorative2Command(coord, dataRef.current, setData);
        case Tile.Portal:
          return new SetPortalCommand(coord, portalChannelRef.current, dataRef.current, setData);
        case Tile.Key:
          return new SetKeyCommand(coord, keyChannelRef.current, dataRef.current, setData);
        case Tile.Lock:
          return new SetLockCommand(coord, keyChannelRef.current, dataRef.current, setData);
        case Tile.Spawn:
          return new SetPlayerSpawnCommand(coord, dataRef.current, setData);
        case Tile.Nospawn:
          return new SetNospawnCommand(coord, dataRef.current, setData);
        case Tile.Passable:
          return new SetPassableCommand(coord, dataRef.current, setData);
      }
    } else if (toolRef.current === EditorTool.Eraser && operationRef.current === Operation.Write) {
      const coord = mouseAtRef.current;
      return new DeleteElementCommand(coord, dataRef.current, setData);
    }
    throw Error('not implemented');
  }

  const updateMap = () => {
    if (lastCoordUpdatedRef.current === mouseAtRef.current) return;
    if (mouseAtRef.current === -1) return;
    if (operationRef.current === Operation.None) return;
    setLastCoordUpdated(mouseAtRef.current);
    const command = getCommand();
    const success = command.execute();
    if (success) {
      setPastCommands(prev => [...prev, command]);
      setFutureCommands([]);
    }
  }

  const undo = () => {
    const pastCommands = pastCommandsRef.current;
    const command = pastCommands[pastCommands.length - 1];
    if (!command) return;
    command.rollback();
    clearSelection();
    setPastCommands(prev => prev.filter(c => c !== command));
    setFutureCommands(prev => [...prev, command]);
  }

  const redo = () => {
    const futureCommands = futureCommandsRef.current;
    const command = futureCommands[futureCommands.length - 1];
    if (!command) return;
    const success = command.execute();
    if (success) {
      clearSelection();
      setPastCommands(prev => [...prev, command]);
      setFutureCommands(prev => prev.filter(c => c !== command));
    }
  }

  const getOperationFromMouseEvent = (ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (ev.nativeEvent.button === MouseButton.Left && ev.shiftKey) return Operation.Add;
    if (ev.nativeEvent.button === MouseButton.Left) return Operation.Write;
    return Operation.None;
  }

  const handleMouseMove = (ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const x = Math.floor(clamp(ev.nativeEvent.offsetX, 0, DIMENSIONS.x - 1) / DIMENSIONS.x * GRIDCOUNT.x);
    const y = Math.floor(clamp(ev.nativeEvent.offsetY, 0, DIMENSIONS.y - 1) / DIMENSIONS.y * GRIDCOUNT.y);
    const coord = getCoordIndex2(x, y);
    setMouseAt(coord);
    if (mousePressedRef.current && [EditorTool.Pencil, EditorTool.Eraser].includes(toolRef.current)) {
      updateMap();
    }
    state.current.isMouseInsideMap = true;
  };

  const handleMouseLeave = (ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setMouseAt(-1);
    state.current.isMouseInsideMap = false;
  };

  const handleMouseDown = (ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const op = getOperationFromMouseEvent(ev);
    // if already pressed, and different mouse button gets clicked, cancel the current operation
    if (mousePressedRef.current && op !== operationRef.current) {
      setMousePressed(false);
      setOperation(Operation.None);
      setTriggerOnRelease(false);
      return;
    }
    setMousePressed(ev.nativeEvent.button === MouseButton.Left);
    setOperation(op);
    setMouseFrom(mouseAtRef.current);
    setTriggerOnRelease(toolRef.current === EditorTool.Rectangle);
    updateMap();
  };

  const handleMouseUp = (ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (mousePressedRef.current && toolRef.current === EditorTool.Rectangle && triggerOnReleaseRef.current) {
      updateMap();
    }
    clearSelection();
  };

  const handleWindowMouseUp = (ev: MouseEvent) => {
    setTimeout(() => {
      clearSelection();
    }, 0);
  }

  const clearSelection = () => {
    setMousePressed(false);
    setTriggerOnRelease(false);
    setOperation(Operation.None);
    setLastCoordUpdated(-1);
  }

  const setChannel = (num: number) => {
    if (tileRef.current === Tile.Key || tileRef.current === Tile.Lock) {
      if (num >= 1 && num <= 3) {
        setKeyChannel({
          [0]: KeyChannel.Yellow,
          [1]: KeyChannel.Red,
          [2]: KeyChannel.Blue,
        }[keyChannelRef.current] || KeyChannel.Yellow);
      }
    } else if (tileRef.current === Tile.Portal) {
      const channel = isValidPortalChannel(num) ? num : 0;
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
    }
  }

  const cycleTile = (direction: number) => {
    clearSelection();
    if (direction < 0) {
      setTile({
        [Tile.None]: Tile.Barrier,
        [Tile.Barrier]: Tile.Passable,
        [Tile.Door]: Tile.Barrier,
        [Tile.Deco1]: Tile.Door,
        [Tile.Deco2]: Tile.Deco1,
        [Tile.Apple]: Tile.Deco2,
        [Tile.Portal]: Tile.Apple,
        [Tile.Key]: Tile.Portal,
        [Tile.Lock]: Tile.Key,
        [Tile.Spawn]: Tile.Lock,
        [Tile.Nospawn]: Tile.Spawn,
        [Tile.Passable]: Tile.Nospawn,
      }[tileRef.current]);
    } else {
      setTile({
        [Tile.None]: Tile.Barrier,
        [Tile.Barrier]: Tile.Door,
        [Tile.Door]: Tile.Deco1,
        [Tile.Deco1]: Tile.Deco2,
        [Tile.Deco2]: Tile.Apple,
        [Tile.Apple]: Tile.Portal,
        [Tile.Portal]: Tile.Key,
        [Tile.Key]: Tile.Lock,
        [Tile.Lock]: Tile.Spawn,
        [Tile.Spawn]: Tile.Nospawn,
        [Tile.Nospawn]: Tile.Passable,
        [Tile.Passable]: Tile.Barrier,
      }[tileRef.current]);
    }
  }

  const handleKeyDown = (ev: KeyboardEvent) => {
    const cancelOperation = isCharPressed(ev, SpecialKey.Escape) || isCharPressed(ev, SpecialKey.Backspace) || isCharPressed(ev, SpecialKey.Delete)
    if (mousePressedRef.current && cancelOperation) {
      clearSelection();
    } else if (isCharPressed(ev, 'z', { ctrlKey: true, shiftKey: true }) || isCharPressed(ev, 'y', { ctrlKey: true })) {
      redo();
    } else if (isCharPressed(ev, 'z', { ctrlKey: true })) {
      undo();
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
      setChannel(findNumberPressed(ev));
    } else if (isNumberPressed(ev, 0)) {
      setTile(Tile.Spawn);
    } else if (isNumberPressed(ev, 1)) {
      setTile(Tile.Barrier);
    } else if (isNumberPressed(ev, 2)) {
      setTile(Tile.Door);
    } else if (isNumberPressed(ev, 3)) {
      setTile(Tile.Deco2);
    } else if (isNumberPressed(ev, 4)) {
      setTile(Tile.Deco1);
    } else if (isNumberPressed(ev, 5)) {
      setTile(Tile.Apple);
    } else if (isNumberPressed(ev, 6)) {
      setTile(Tile.Lock);
      if (keyChannelRef.current > 3) {
        setChannel(3);
      }
    } else if (isNumberPressed(ev, 7)) {
      setTile(Tile.Key);
      if (keyChannelRef.current > 3) {
        setChannel(3);
      }
    } else if (isNumberPressed(ev, 8)) {
      setTile(Tile.Portal);
    } else if (isNumberPressed(ev, 9)) {
      if (tileRef.current !== Tile.Nospawn) {
        setTile(Tile.Nospawn);
      } else {
        setTile(Tile.Passable);
      }
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
    } else if (isCharPressed(ev, 'g')) {
      setTool(EditorTool.Bucket);
    } else if (isCharPressed(ev, 'u')) {
      setTool(EditorTool.Rectangle);
    }
  }

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mouseup", handleWindowMouseUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mouseup", handleWindowMouseUp);
    }
  }, [])

  return (
    <div className={styles.layout}>
      <div className={styles.container}>
        <h1 className={styles.mainTitle}>SNEK EDITOR</h1>
      </div>
      <div className={styles.editorContainer}>
        <EditorCanvas
          data={data}
          canvas={canvas}
          handleMouseMove={handleMouseMove}
          handleMouseLeave={handleMouseLeave}
          handleMouseDown={handleMouseDown}
          handleMouseUp={handleMouseUp}
        />
      </div>
    </div>
  );
};