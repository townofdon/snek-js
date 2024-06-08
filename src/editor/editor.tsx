import React, { useEffect, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";

import { Operation, EditorTool } from "./editorSketch";
import { clamp, getCoordIndex2, isValidPortalChannel } from "../utils";
import { DIMENSIONS, GRIDCOUNT } from "../constants";
import { DIR, EditorData, EditorOptions, KeyChannel, PortalChannel } from "../types";

import { useRefState } from "./hooks/useRefState";
import {
  Command,
  DeleteElementCommand,
  DeleteLineCommand,
  DeleteRectangleCommand,
  NoOpCommand,
  SetAppleCommand,
  SetBarrierCommand,
  SetDecorative1Command,
  SetDecorative2Command,
  SetDoorCommand,
  SetKeyCommand,
  SetLineAppleCommand,
  SetLineBarrierCommand,
  SetLineDeco1Command,
  SetLineDeco2Command,
  SetLineDoorCommand,
  SetLineKeyCommand,
  SetLineLockCommand,
  SetLineNospawnCommand,
  SetLinePassableCommand,
  SetLinePortalCommand,
  SetLockCommand,
  SetNospawnCommand,
  SetPassableCommand,
  SetPlayerSpawnCommand,
  SetPortalCommand,
  SetRectangleAppleCommand,
  SetRectangleBarrierCommand,
  SetRectangleDeco1Command,
  SetRectangleDeco2Command,
  SetRectangleDoorCommand,
  SetRectangleKeyCommand,
  SetRectangleLockCommand,
  SetRectangleNospawnCommand,
  SetRectanglePassableCommand,
  SetRectanglePortalCommand,
} from "./commands";
import { SpecialKey, findNumberPressed, getIsOutside, isCharPressed, isNumberPressed } from "./utils/keyboardUtils";
import { Tile } from "./editorTypes";
import { EDITOR_DEFAULTS } from "./editorConstants";
import { EditorCanvas } from "./EditorCanvas";
import { EditorOptionsPanel } from "./EditorOptions";
import { EditorTiles } from "./EditorTiles";
import { EditorTools } from "./EditorTools";

import * as styles from "./Editor.css";
import { SidebarKeyChannels } from "./SidebarKeyChannels";
import { EditorSidebar } from "./EditorSidebar";
import { SidebarPortalChannels } from "./SidebarPortalChannels";
import { useLoadMapData } from "./hooks/useLoadMapData";

interface LocalState {
  isMouseInsideMap: boolean,
}

enum MouseButton {
  Left = 0,
  Middle = 1,
  Right = 2,
}

export const Editor = () => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const optionsContainerRef = useRef<HTMLDivElement>(null);
  const [options, optionsRef, setOptions] = useRefState<EditorOptions>(EDITOR_DEFAULTS.options)
  const [data, dataRef, setData] = useRefState<EditorData>(EDITOR_DEFAULTS.data);
  const [_pastCommands, pastCommandsRef, setPastCommands] = useRefState<Command[]>([]);
  const [_futureCommands, futureCommandsRef, setFutureCommands] = useRefState<Command[]>([]);
  const [lastCoordUpdated, lastCoordUpdatedRef, setLastCoordUpdated] = useRefState(-1);
  const [mouseAt, mouseAtRef, setMouseAt] = useRefState(-1);
  const [mouseFrom, mouseFromRef, setMouseFrom] = useRefState(-1);
  const [mousePressed, mousePressedRef, setMousePressed] = useRefState(false);
  const [triggerOnRelease, triggerOnReleaseRef, setTriggerOnRelease] = useRefState(false);
  const [shiftPressed, shiftPressedRef, setShiftPressed] = useRefState(false);
  const [altPressed, altPressedRef, setAltPressed] = useRefState(false);
  const [tool, toolRef, setTool] = useRefState(EditorTool.Pencil);
  const [tile, tileRef, _setTile] = useRefState(Tile.Barrier);
  const [keyChannel, keyChannelRef, setKeyChannel] = useRefState(KeyChannel.Yellow);
  const [portalChannel, portalChannelRef, setPortalChannel] = useRefState<PortalChannel>(0);

  useLoadMapData({ setData, setOptions });

  const setTile = (tile: Tile) => {
    if (toolRef.current === EditorTool.Eraser) setTool(EditorTool.Pencil);
    _setTile(tile);
  }

  const setChannelTo = (num: number) => {
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
    setMousePressed(false);
    setTriggerOnRelease(false);
    if (direction < 0) {
      setTile({
        [Tile.None]: Tile.Barrier,
        [Tile.Barrier]: Tile.Spawn,
        [Tile.Passable]: Tile.Barrier,
        [Tile.Door]: Tile.Passable,
        [Tile.Deco1]: Tile.Door,
        [Tile.Deco2]: Tile.Deco1,
        [Tile.Apple]: Tile.Deco2,
        [Tile.Nospawn]: Tile.Apple,
        [Tile.Lock]: Tile.Nospawn,
        [Tile.Key]: Tile.Lock,
        [Tile.Portal]: Tile.Key,
        [Tile.Spawn]: Tile.Portal,
      }[tileRef.current]);
    } else {
      setTile({
        [Tile.None]: Tile.Barrier,
        [Tile.Barrier]: Tile.Passable,
        [Tile.Passable]: Tile.Door,
        [Tile.Door]: Tile.Deco1,
        [Tile.Deco1]: Tile.Deco2,
        [Tile.Deco2]: Tile.Apple,
        [Tile.Apple]: Tile.Nospawn,
        [Tile.Nospawn]: Tile.Lock,
        [Tile.Lock]: Tile.Key,
        [Tile.Key]: Tile.Portal,
        [Tile.Portal]: Tile.Spawn,
        [Tile.Spawn]: Tile.Barrier,
      }[tileRef.current]);
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
      case Tile.Barrier:
        return new SetBarrierCommand(coord, dataRef.current, setData, rollbackLastCoordUpdated);
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
      case Tile.Barrier:
        return new SetLineBarrierCommand(from, to, dataRef, setData, rollbackLastCoordUpdated);
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
      case Tile.Barrier:
        return new SetRectangleBarrierCommand(from, to, dataRef, setData, rollbackLastCoordUpdated);
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
    }
    throw Error('not implemented');
  }

  const executeCommand = (command: Command) => {
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
    const isImmediateTool = [EditorTool.Pencil, EditorTool.Eraser].includes(toolRef.current)
    if (altPressedRef.current && (isImmediateTool || mousePressedRef.current)) return Operation.Remove;
    if (shiftPressedRef.current && isImmediateTool) return Operation.Add;
    if (mousePressedRef.current) return Operation.Write;
    return Operation.None;
  }

  const handleMouseMove = (ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const x = Math.floor(clamp(ev.nativeEvent.offsetX, 0, DIMENSIONS.x - 1) / DIMENSIONS.x * GRIDCOUNT.x);
    const y = Math.floor(clamp(ev.nativeEvent.offsetY, 0, DIMENSIONS.y - 1) / DIMENSIONS.y * GRIDCOUNT.y);
    const coord = getCoordIndex2(x, y);
    setMouseAt(coord);
    if (mousePressedRef.current && [EditorTool.Pencil, EditorTool.Eraser].includes(toolRef.current)) {
      if (lastCoordUpdatedRef.current !== mouseAtRef.current) {
        updateMap();
      }
    }
    state.current.isMouseInsideMap = true;
  };

  const handleMouseLeave = (ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setMouseAt(-1);
    state.current.isMouseInsideMap = false;
  };

  const handleMouseDown = (ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
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
  };

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
    const cancelOperation = isCharPressed(ev, SpecialKey.Escape) || isCharPressed(ev, SpecialKey.Backspace) || isCharPressed(ev, SpecialKey.Delete)
    if (mousePressedRef.current && cancelOperation) {
      setMousePressed(false);
    setTriggerOnRelease(false);
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
    // } else if (isCharPressed(ev, 'g')) {
    //   setTool(EditorTool.Bucket);
    } else if (isCharPressed(ev, 'u') || isCharPressed(ev, 'r')) {
      setTool(EditorTool.Rectangle);
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
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mouseup", handleWindowMouseUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mouseup", handleWindowMouseUp);
    }
  }, [])

  return (
    <div className={styles.layout}>
      <div className={styles.container}>
        <h1
          className={styles.mainTitle}
          style={{ color: options.palette.playerHead }}
        >
          {options.name || '_'}
        </h1>
      </div>
      <div className={styles.editorContainer}>
        <EditorCanvas
          data={data}
          options={options}
          canvas={canvas}
          mouseAt={mouseAt}
          mouseFrom={mouseFrom}
          tool={tool}
          operation={getOperation()}
          handleMouseMove={handleMouseMove}
          handleMouseLeave={handleMouseLeave}
          handleMouseDown={handleMouseDown}
          handleMouseUp={handleMouseUp}
          editorTiles={<EditorTiles activeTile={tile} setTile={setTile} />}
          editorTools={<EditorTools activeTool={tool} setTool={setTool} />}
          tileSidebar={
            <EditorSidebar
              tile={tile}
              sidebarKeyChannels={<SidebarKeyChannels activeChannel={keyChannel} setChannel={setKeyChannel} />}
              sidebarPortalChannels={<SidebarPortalChannels activeChannel={portalChannel} setChannel={setPortalChannel} />}
            />
          }
        />
        <EditorOptionsPanel
          data={data}
          options={options}
          optionsRef={optionsRef}
          optionsContainerRef={optionsContainerRef}
          setData={setData}
          setOptions={setOptions}
          executeCommand={executeCommand}
          undo={undo}
          redo={redo}
        />
      </div>
      <Toaster
        containerClassName={styles.toastContainer}
        toastOptions={{
          className: styles.toast,
          success: {
            className: styles.toastSuccess,
          },
          error: {
            className: styles.toastError,
            duration: 10000,
          },
        }}
      />
    </div>
  );
};
