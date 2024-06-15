import React, { useEffect, useRef, useState } from "react";

import { OST_MODE_TRACKS, SLIME_CONTROL_TRACKS } from "../../constants";
import { EditorOptions, GameSettings, Level, MusicTrack } from "../../types";
import { SetStateValue } from "../editorTypes";
import { getRelativeDir, getTrackName } from "../../utils";
import { musicTracktoIndex } from "../utils/musicTrackUtils";
import { Stack } from "../components/Stack";
import { resumeAudioContext } from "../../engine/audio";
import { MusicPlayer } from "../../engine/musicPlayer";
import {
  Field,
  SliderWithInput,
  ToggleField,
  DropdownField,
  Option,
} from "../components/Field";
import { SelectLevelDropdown } from "./SelectLevelDropdown";

import * as styles from './EditorOptions.css';

interface PanelStatsProps {
  isPreviewShowing: boolean;
  options: EditorOptions;
  setOptions: (value: SetStateValue<EditorOptions>) => void;
  loadLevel: (level: Level) => void;
}

export const PanelStats = ({ isPreviewShowing, options, setOptions, loadLevel }: PanelStatsProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const musicPlayer = useRef<MusicPlayer>(null);
  const buttonPlay = useRef<HTMLButtonElement>(null);
  const buttonStop = useRef<HTMLButtonElement>(null);

  if (!musicPlayer.current) {
    const settings: GameSettings = {
      musicVolume: 1,
      sfxVolume: 1,
      isScreenShakeDisabled: true,
    };
    musicPlayer.current = new MusicPlayer(settings);
  }

  useEffect(() => {
    return () => {
      musicPlayer.current?.stopAllTracks();
    }
  }, []);

  useEffect(() => {
    if (isPreviewShowing) {
      stopTrack();
    }
  }, [isPreviewShowing]);

  const includedTracks: MusicTrack[] = [MusicTrack.None, ...OST_MODE_TRACKS, MusicTrack.drone, ...SLIME_CONTROL_TRACKS];

  const getNumberedTrackName = (track: MusicTrack) => {
    if (track === MusicTrack.None) return 'None';
    const index = musicTracktoIndex(track);
    return `${String(index + 1).padStart(2, '0')}_${getTrackName(track)}`
  };

  const toOption = (track: MusicTrack): Option => ({
    id: track,
    value: track,
    label: getNumberedTrackName(track),
  });

  const musicTrackOptions = includedTracks.map(toOption);
  const selectedOption = musicTrackOptions.find(option => option.value === options.musicTrack) || toOption(options.musicTrack);

  const handleChangeTrack = (option: Option) => {
    const found = includedTracks.find(includedTrack => includedTrack === option.value as MusicTrack);
    if (!found) {
      setOptions(prev => ({ ...prev, musicTrack: MusicTrack.None }));
      stopTrack();
      return;
    }
    if (found === options.musicTrack) return;
    setOptions(prev => ({ ...prev, musicTrack: found }));
    if (isPlaying) playSelectedTrack(found);
  };

  const playSelectedTrack = (overrideTrack?: MusicTrack) => {
    const track = overrideTrack || options.musicTrack;
    if (track === MusicTrack.None) {
      stopTrack();
    } else {
      musicPlayer.current?.stopAllTracks();
      resumeAudioContext().then(() => {
        musicPlayer.current?.play(track);
      })
      setIsPlaying(true);
      if (document.activeElement === buttonPlay.current) {
        setTimeout(() => buttonStop.current?.focus(), 0);
      }
    }
  }

  const stopTrack = () => {
    musicPlayer.current?.stopAllTracks();
    setIsPlaying(false);
    if (document.activeElement === buttonStop.current) {
      setTimeout(() => buttonPlay.current?.focus(), 0);
    }
  }

  return (
    <div>
      <Field
        label="Map Name"
        name="name"
        value={options.name}
        onChange={(val) => setOptions({ ...options, name: val })}
        fullWidth
      />
      <ToggleField
        label="Disable apple spawn"
        name="disableAppleSpawn"
        checked={options.disableAppleSpawn}
        onChange={(val) => setOptions({ ...options, disableAppleSpawn: val })}
      />
      {!options.disableAppleSpawn && (
        <SliderWithInput
          label="Num apples at start"
          name="numApplesStart"
          value={options.numApplesStart}
          onChange={(val) => setOptions({ ...options, numApplesStart: val })}
          min={0}
          max={50}
        />
      )}
      <SliderWithInput
        label="Apples to clear"
        name="applesToClear"
        value={options.applesToClear}
        onChange={(val) => setOptions({ ...options, applesToClear: val })}
        min={0}
        max={200}
      />
      <SliderWithInput
        label="Time to clear (s)"
        name="timeToClear"
        value={options.timeToClear}
        onChange={(val) => setOptions({ ...options, timeToClear: val })}
        min={1}
        max={5 * 60 * 1000}
      />
      <SliderWithInput
        label="Start snek size"
        name="snakeStartSize"
        value={options.snakeStartSize}
        onChange={(val) => setOptions({ ...options, snakeStartSize: val })}
        min={3}
        max={100}
      />
      <SliderWithInput
        label="Hit Grace Time (ms)"
        name="extraHurtGraceTime"
        value={options.extraHurtGraceTime}
        onChange={(val) => setOptions({ ...options, extraHurtGraceTime: val })}
        min={0}
        max={200}
      />
      <SliderWithInput
        label="Global Light"
        name="globalLight"
        value={options.globalLight}
        onChange={(val) => setOptions({ ...options, globalLight: val })}
        min={0}
        max={1}
        step={0.01}
      />
      <Stack row align="center" marginBottom>
        <DropdownField
          label="Music Track"
          options={musicTrackOptions}
          value={selectedOption}
          onChange={handleChangeTrack}
        />
        {!isPlaying && (
          <button className={styles.buttonPlay} ref={buttonPlay} onClick={() => playSelectedTrack()}>
            <img src={`${getRelativeDir()}/assets/graphics/editor-play.png`} />
          </button>
        )}
        {isPlaying && (
          <button className={styles.buttonStop} ref={buttonStop} onClick={stopTrack}>
            <img src={`${getRelativeDir()}/assets/graphics/editor-stop.png`} />
          </button>
        )}
      </Stack>
      <hr />
      <SelectLevelDropdown loadLevel={loadLevel} />
    </div>
  );
}
