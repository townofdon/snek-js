import { DifficultyIndex, Initiator, InputAction, Level } from '@/types';
import EventEmitter from 'eventemitter3';

const EE = new EventEmitter();

export const UIEvent = 'UIEvent'
export const InputActionEvent = 'InputActionEvent'

export const emitUIEvent = (action: InputAction, initiator: Initiator) => {
  EE.emit(UIEvent, action, initiator);
}

export const onUIEvent = (handler: (action: InputAction, initiator: Initiator) => void) => {
  EE.on(UIEvent, handler);
}

export const unsubscribeOnUIEvent = (handler: (action: InputAction, initiator: Initiator) => void) => {
  EE.off(UIEvent, handler);
}

const LevelChangedEvent = 'LevelChangedEvent';
export const emitLevelChangedEvent = (level: Level) => {
  EE.emit(LevelChangedEvent, level);
}
export const onLevelChangedEvent = (handler: (level: Level) => void) => {
  EE.on(LevelChangedEvent, handler);
}
export const offLevelChangedEvent = (handler: (level: Level) => void) => {
  EE.off(LevelChangedEvent, handler);
}

const LivesEvent = 'LivesEvent';
export const emitLivesEvent = (lives: number, isInvertedColors: boolean) => {
  EE.emit(LivesEvent, lives, isInvertedColors);
}
export const onLivesEvent = (handler: (lives: number, isInvertedColors: boolean) => void) => {
  EE.on(LivesEvent, handler);
}
export const offLivesEvent = (handler: (lives: number, isInvertedColors: boolean) => void) => {
  EE.off(LivesEvent, handler);
}

const ScoreEvent = 'ScoreEvent';
export const emitScoreEvent = (score: number) => {
  EE.emit(ScoreEvent, score);
}
export const onScoreEvent = (handler: (score: number) => void) => {
  EE.on(ScoreEvent, handler);
}
export const offScoreEvent = (handler: (score: number) => void) => {
  EE.off(ScoreEvent, handler);
}

const LevelProgressEvent = 'LevelProgressEvent';
export const emitLevelProgressEvent = (progress: number) => {
  EE.emit(LevelProgressEvent, progress);
}
export const onLevelProgressEvent = (handler: (progress: number) => void) => {
  EE.on(LevelProgressEvent, handler);
}
export const offLevelProgressEvent = (handler: (progress: number) => void) => {
  EE.off(LevelProgressEvent, handler);
}

const LevelNameEvent = 'LevelNameEvent';
export const emitLevelNameEvent = (name: string) => {
  EE.emit(LevelNameEvent, name);
}
export const onLevelNameEvent = (handler: (name: string) => void) => {
  EE.on(LevelNameEvent, handler);
}
export const offLevelNameEvent = (handler: (name: string) => void) => {
  EE.off(LevelNameEvent, handler);
}

const DifficultyEvent = 'DifficultyEvent';
export const emitDifficultyEvent = (difficulty: DifficultyIndex) => {
  EE.emit(DifficultyEvent, difficulty);
}
export const onDifficultyEvent = (handler: (difficulty: DifficultyIndex) => void) => {
  EE.on(DifficultyEvent, handler);
}
export const offDifficultyEvent = (handler: (difficulty: DifficultyIndex) => void) => {
  EE.off(DifficultyEvent, handler);
}