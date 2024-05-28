import React, { useEffect, useRef } from "react";
import { useEditorData } from "./hooks/useEditorData";
import { EditorCanvas } from "./editorCanvas";

import { Operation, EditorState, EditorTool } from "./editorSketch";
import { clamp, getCoordIndex2 } from "../utils";
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
  const [portalChannel, portalChannelRef, setPortalChannel] = useRefState(KeyChannel.Yellow);

  const state = useRef<LocalState>({
    isMouseInsideMap: false,
  })

  const getCommand = () => {
    if (operationRef.current === Operation.None) return new NoOpCommand();
    if (toolRef.current === EditorTool.Pencil) {
      const coord = mouseAtRef.current;
      if (operationRef.current === Operation.Remove) {
        return new DeleteElementCommand(coord, dataRef.current, setData);
      }
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
    setPastCommands(prev => prev.filter(c => c !== command));
    setFutureCommands(prev => [...prev, command]);
  }

  const redo = () => {
    const futureCommands = futureCommandsRef.current;
    const command = futureCommands[futureCommands.length - 1];
    if (!command) return;
    const success = command.execute();
    if (success) {
      setPastCommands(prev => [...prev, command]);
      setFutureCommands(prev => prev.filter(c => c !== command));
    }
  }

  const getOperationFromMouseEvent = (ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (ev.nativeEvent.button === MouseButton.Left && ev.shiftKey) return Operation.Remove;
    if (ev.nativeEvent.button === MouseButton.Left) return Operation.Add;
    return Operation.None;
  }

  const handleMouseMove = (ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const x = Math.floor(clamp(ev.nativeEvent.offsetX, 0, DIMENSIONS.x - 1) / DIMENSIONS.x * GRIDCOUNT.x);
    const y = Math.floor(clamp(ev.nativeEvent.offsetY, 0, DIMENSIONS.y - 1) / DIMENSIONS.y * GRIDCOUNT.y);
    const coord = getCoordIndex2(x, y);
    setMouseAt(coord);
    if (toolRef.current === EditorTool.Pencil && mousePressedRef.current) {
      setOperation(getOperationFromMouseEvent(ev));
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

  const clearSelection = () => {
    setMousePressed(false);
    setTriggerOnRelease(false);
    setOperation(Operation.None);
    setLastCoordUpdated(-1);
  }

  const handleKeyDown = (ev: KeyboardEvent) => {
    const isControlPressed = ev.metaKey || ev.ctrlKey;
    const isEscape = ev.key === 'Escape' || ev.code === 'Escape' || ev.keyCode === 27;
    const isTab = ev.key === 'Tab' || ev.code === 'Tab' || ev.keyCode === 9;
    const isAlphaY = ev.key === 'y' || ev.code === 'KeyY' || ev.keyCode === 89;
    const isAlphaZ = ev.key === 'z' || ev.code === 'KeyZ' || ev.keyCode === 90;
    const isNumber1 = ev.key === '1' || ev.code === 'Digit1' || ev.code === 'Numpad1' || ev.keyCode === 49 || ev.keyCode === 97;
    const isNumber2 = ev.key === '2' || ev.code === 'Digit2' || ev.code === 'Numpad2' || ev.keyCode === 50 || ev.keyCode === 98;
    const isNumber3 = ev.key === '3' || ev.code === 'Digit3' || ev.code === 'Numpad3' || ev.keyCode === 51 || ev.keyCode === 99;
    const isNumber4 = ev.key === '4' || ev.code === 'Digit4' || ev.code === 'Numpad4' || ev.keyCode === 52 || ev.keyCode === 100;
    const isNumber5 = ev.key === '5' || ev.code === 'Digit5' || ev.code === 'Numpad5' || ev.keyCode === 53 || ev.keyCode === 101;
    const isNumber6 = ev.key === '6' || ev.code === 'Digit6' || ev.code === 'Numpad6' || ev.keyCode === 54 || ev.keyCode === 102;
    const isNumber7 = ev.key === '7' || ev.code === 'Digit7' || ev.code === 'Numpad7' || ev.keyCode === 55 || ev.keyCode === 103;
    const isNumber8 = ev.key === '8' || ev.code === 'Digit8' || ev.code === 'Numpad8' || ev.keyCode === 56 || ev.keyCode === 104;
    const isNumber9 = ev.key === '9' || ev.code === 'Digit9' || ev.code === 'Numpad9' || ev.keyCode === 57 || ev.keyCode === 105;
    if (isEscape && mousePressedRef.current) {
      clearSelection();
      ev.preventDefault();
      ev.stopPropagation();
    } else if (isAlphaZ && isControlPressed) {
      clearSelection();
      undo();
      ev.preventDefault();
      ev.stopPropagation();
    } else if (isAlphaY && isControlPressed) {
      clearSelection();
      redo();
      ev.preventDefault();
      ev.stopPropagation();
    } else if (isNumber1) {
      if (tileRef.current === Tile.Barrier) {
        setTile(Tile.Door);
      } else {
        setTile(Tile.Barrier);
      }
    } else if (isNumber2) {
      if (tileRef.current === Tile.Deco1) {
        setTile(Tile.Deco2);
      } else {
        setTile(Tile.Deco1);
      }
    } else if (isNumber3) {
      setTile(Tile.Apple);
    } else if (isNumber4) {
      setTile(Tile.Portal);
    } else if (isNumber5) {
      if (tileRef.current === Tile.Key) {
        setTile(Tile.Lock);
      } else {
        setTile(Tile.Key);
      }
    } else if (isNumber6) {
      setTile(Tile.Nospawn);
    } else if (isNumber7) {
      setTile(Tile.Passable);
    } else if (isNumber8) {
      setTile(Tile.Spawn);
    } else if (isTab) {
      if (tileRef.current === Tile.Key || tileRef.current === Tile.Lock) {
        switch (keyChannelRef.current) {
          case KeyChannel.Yellow:
            setKeyChannel(KeyChannel.Red);
            break;
          case KeyChannel.Red:
            setKeyChannel(KeyChannel.Blue);
            break;
          case KeyChannel.Blue:
            setKeyChannel(KeyChannel.Yellow);
            break;
        }
      } else if (tileRef.current === Tile.Portal) {
        setPortalChannel((portalChannelRef.current + 1) % 10);
      }
    }
  }

  const handleKeyUp = (ev: KeyboardEvent) => {
    if (operationRef.current === Operation.Remove) {
      if (mousePressedRef.current) {
        setOperation(Operation.Add);
      } else {
        setOperation(Operation.None);
      }
    }
  }

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
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
