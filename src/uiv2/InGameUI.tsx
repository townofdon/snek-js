import { DifficultyIndex, GameMode, InputAction, Level } from "@/types";
import { offDifficultyEvent, offLevelChangedEvent, offLevelNameEvent, offLevelProgressEvent, offLivesEvent, offScoreEvent, onDifficultyEvent, onLevelChangedEvent, onLevelNameEvent, onLevelProgressEvent, onLivesEvent, onScoreEvent, onUIEvent, unsubscribeOnUIEvent } from "@/ui/uiEvents";
import React, { useEffect, useState } from "react";
import { bridge } from "./uiBridge";
import { useForceRerender } from "./hooks/useForceRerender";
import { difficultyDisplay, inverseLerp } from "@/utils";
import { hasLevelBoss } from "@/levels/levelConstants";
import { getIsStartLevel } from "@/levels/levelUtils";

const LABEL_COLOR = '#fff';
const LABEL_COLOR_INVERTED = '#000';
const LABEL_BG_COLOR = '#242b4a';
const LABEL_BG_COLOR_INVERTED = '#ffffffdd';

export const InGameUI = () => {
  const forceRerender = useForceRerender();
  const [showing, setShowing] = useState(false);
  const [hasBoss, setHasBoss] = useState(false);
  const [inverted, setInverted] = useState(false);
  const [levelName, setLevelName] = useState('');
  const [score, setScore] = useState(9999999);
  const [difficulty, setDifficulty] = useState<DifficultyIndex>(1);
  const [progress, setProgress] = useState(0);
  const [lives, setLives] = useState(3);
  const [t, setT] = useState(0);

  useEffect(() => {
    const handleUIEvent = (action: InputAction = InputAction.None) => {
      switch (action) {
        case InputAction.ForceRerender:
          forceRerender();
          break;
        case InputAction.ShowInGameUI:
          if (!getIsStartLevel(bridge.es.level)) {
            setShowing(true);
            forceRerender();
          }
          break;
        case InputAction.Pause:
          setShowing(false);
          break;
        case InputAction.HideInGameUI:
          setShowing(false);
          break;
        case InputAction.ShowLevelSelectMenu:
          setShowing(false);
          break;
        case InputAction.ShowWearablesMenu:
          setShowing(false);
          break;
        case InputAction.ShowSettingsMenu:
          setShowing(false);
          break;
        case InputAction.ShowTitleScreen:
          setShowing(false);
          break;
        case InputAction.ShowMainMenu:
          setShowing(false);
          break;
        case InputAction.ShowSaveSlotMenu:
          setShowing(false);
          break;
        case InputAction.ShowGameModeMenu:
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
    const onLevelChanged = (incoming: Level) => {
      setHasBoss(hasLevelBoss(incoming));
      forceRerender();
    }
    const onLevelName = (incoming: string) => {
      setLevelName(incoming);
    }
    const onScore = (incoming: number) => {
      setScore(incoming);
    }
    const onDifficulty = (incoming: DifficultyIndex) => {
      setDifficulty(incoming);
      forceRerender();
    }
    const onProgress = (incoming: number) => {
      setProgress(incoming);
    }
    const onLives = (incomingLives: number, incomingInverted: boolean) => {
      setLives(incomingLives);
      setInverted(incomingInverted);
    }
    onLevelChangedEvent(onLevelChanged);
    onLevelNameEvent(onLevelName);
    onScoreEvent(onScore);
    onDifficultyEvent(onDifficulty);
    onLevelProgressEvent(onProgress);
    onLivesEvent(onLives);
    return () => {
      offLevelChangedEvent(onLevelChanged);
      offLevelNameEvent(onLevelName);
      offScoreEvent(onScore);
      offDifficultyEvent(onDifficulty);
      offLevelProgressEvent(onProgress);
      offLivesEvent(onLives);
    }
  }, []);

  useEffect(() => {
    let animating = true;
    let lastTime = performance.now();
    const animate = () => {
      if (!animating) return;
      const deltaTime = performance.now() - lastTime;
      lastTime = performance.now();
      setT(prev => prev + deltaTime);
      requestAnimationFrame(animate);
    }
    animate();
    return () => {
      animating = false;
    }
  }, []);

  if (!showing) return null;
  if (getIsStartLevel(bridge.es.level)) return null;

  const maxChars = 12;
  const levelNameDisplay = levelName.split(" ").map(word => {
    const parts = [];
    do {
      let part = word.substring(0, maxChars);
      if (word.length > maxChars) { part += '-'; }
      parts.push(part);
      word = word.substring(maxChars);
    } while (word.length > maxChars);
    return parts.join('\n');
  }).join('\n');

  const showLevelProgress = bridge.gameState.isGameStarted
    && !hasBoss
    && !bridge.gameState.isLost
    && !bridge.gameState.isExitingLevel
    && !bridge.gameState.isExited;
  const doorsOpen = bridge.gameState.isDoorsOpen;
  const mode = bridge.gameState.gameMode;
  const prefix = mode === GameMode.Casual ? <span className="color-w">Casual&nbsp;</span> : null;
  const suffix = mode === GameMode.Cobra ? (
    <>
      &nbsp;
      <span className="color-a" style={{ background: '#242b4a', paddingTop: 8, paddingLeft: 5, paddingRight: 5 }}>Cobra</span>
    </>
  ) : null;

  return (
    <>
      <div className="in-game-ui left">
        {!hasBoss && !!levelName && (
          <div className="position-relative">
            <p className="font-bios level-name position-absolute" style={getLevelNameStyle(true, progress)}>{levelNameDisplay}</p>
            <p className="font-bios level-name" style={getLevelNameStyle(false, progress)}>{levelNameDisplay}</p>
          </div>
        )}
        {showLevelProgress && (
          <div className="level-progress">
            {!doorsOpen && progress > 0 && (
              <div className="level-progress-meter stop0" style={getMeterStyle(progress, 0, 0.33)} />
            )}
            {!doorsOpen && progress >= .33 && (
              <div className="level-progress-meter stop1" style={getMeterStyle(progress, 0.33, 0.66)} />
            )}
            {!doorsOpen && progress >= .66 && (
              <div className="level-progress-meter stop2" style={getMeterStyle(progress, 0.66, 1)} />
            )}
            {doorsOpen && (
              <div className="level-progress-meter rainbow" />
            )}
          </div>
        )}
      </div>
      <div className="in-game-ui right">
        {mode !== GameMode.Casual && (
          <div className={"ui-label hearts-container noblur"
            + (lives <= 0 ? ' no-lives-left' : '')
          }>
            <Heart lives={lives} heartIdx={0} isInvertedColors={inverted} />
            <Heart lives={lives} heartIdx={1} isInvertedColors={inverted} />
            <Heart lives={lives} heartIdx={2} isInvertedColors={inverted} />
            {lives >= 4 && <Heart lives={lives} heartIdx={3} isInvertedColors={inverted} />}
            {lives >= 5 && <Heart lives={lives} heartIdx={4} isInvertedColors={inverted} />}
          </div>
        )}
        <p className="font-retro difficulty">{prefix}{difficultyDisplay(difficulty, mode)}{suffix}</p>
        <Line t={t} />
        <span className="text-right position-relative">
          <p className="font-bios score dark">{String(score).padStart(8, '0')}</p>
          <p className="font-bios score position-absolute" style={{ right: 0, top: 0 }}>{String(score).padStart(3, '0')}</p>
        </span>
      </div>
    </>
  );
}

const SCROLL_INTERVAL = 120;
const SPAN = 5;

type LineVariant = 'dark' | 'red' | 'blue'
interface LineProps { t: number, variant?: LineVariant }
const Line = ({ t, variant }: LineProps) => {
  const norm = Math.floor(t / SCROLL_INTERVAL);
  return (
    <span
      className={"ui-lines noblur"
        + (variant ? ` ${variant}` : '')
      }
      style={{ backgroundPositionX: -norm * SPAN }}
    />
  )
}

function getMeterStyle(progress: number, from: number, to: number): React.CSSProperties {
  const t = (1 - inverseLerp(from, to, progress)) * 100;
  const polygon = `polygon(0% 100%, 0% ${t}%, 100% ${t}%, 100% 100%)`;
  return {
    clipPath: polygon,
  };
}

function getLevelNameStyle(inverted: boolean, progress: number): React.CSSProperties {
  const percentage = progress * 100;
  if (inverted) {
    const polygon = `polygon(0% 10%, ${percentage}% 10%, ${percentage}% 90%, 0 90%)`;
    return {
      backgroundColor: LABEL_BG_COLOR_INVERTED,
      color: LABEL_COLOR_INVERTED,
      clipPath: polygon,
    };
  } else {
    const polygon = `polygon(${percentage}% 0%, 100% 0%, 100% 100%, ${percentage}% 100%)`;
    return {
      backgroundColor: LABEL_BG_COLOR,
      color: LABEL_COLOR,
      clipPath: polygon,
    }
  }
}

interface HeartProps {
  lives: number,
  heartIdx: number,
  isInvertedColors: boolean,
}
const Heart = ({
  lives,
  heartIdx,
  isInvertedColors,
}: HeartProps) => {
  return (
    <span
      className={"ui-heart"
        + (lives <= heartIdx ? ' damaged' : '')
        + (isInvertedColors ? ' death-inverted' : '')
      }
    />
  )
}
