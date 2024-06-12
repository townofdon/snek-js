import React, { useState } from "react";

import { OST_MODE_TRACKS, SLIME_CONTROL_TRACKS } from "../../constants";
import { EditorOptions, MusicTrack } from "../../types";
import { getTrackName } from "../../utils";
import { musicTracktoIndex } from "../utils/musicTrackUtils";
import { useRefState } from "../hooks/useRefState";
import { Stack } from "../components/Stack";
import {
  Field,
  SliderWithInput,
  ToggleField,
  DropdownField,
} from "../components/Field";

interface PanelStatsProps {
  options: EditorOptions;
  setOptions: (options: EditorOptions) => void;
}

export const PanelStats = ({ options, setOptions }: PanelStatsProps) => {
  const [isPlaying, isPlayingRef, setIsPlaying] = useRefState(false);

  const getNumberedTrackName = (track: MusicTrack) => {
    const index = musicTracktoIndex(track);
    return `${String(index + 1).padStart(2, '0')}_${getTrackName(track)}`
  }

  const includedTracks: MusicTrack[] = [...OST_MODE_TRACKS, MusicTrack.drone, ...SLIME_CONTROL_TRACKS];
  const musicTrackOptions = ['None', ...includedTracks.map(getNumberedTrackName)];

  const handleChangeTrack = (numberedTrackName: string) => {
    if (numberedTrackName === 'None') {
      setOptions({ ...options, musicTrack: MusicTrack.None });
      return;
    }
    const found = includedTracks.find((track) => {
      return track === numberedTrackName || getNumberedTrackName(track) === numberedTrackName;
    });
    if (!found) {
      console.warn(`[handleChangeTrack] Could not match track for ${numberedTrackName}`)
      return;
    }
    setOptions({ ...options, musicTrack: found });
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
      <Stack row>
        <DropdownField
          label="Music Track"
          options={musicTrackOptions}
          value={getNumberedTrackName(options.musicTrack)}
          onChange={handleChangeTrack}
        />
      </Stack>
    </div>
  );
}
