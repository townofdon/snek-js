import React, { useEffect } from "react";

import { EditorOptions, Palette } from "../../types";
import { PALETTE, PaletteName } from "../../palettes";

import * as styles from './EditorOptions.css';
import { SpecialKey, isCharPressed } from "../utils/keyboardUtils";

interface SelectPaletteProps {
  options: EditorOptions;
  setOptions: (opts: EditorOptions) => void;
  onClose: () => void;
}

export const SelectPalette = ({ options, setOptions, onClose }: SelectPaletteProps) => {
  const onSelectPalette = (palette: Palette) => {
    setOptions({ ...options, palette: { ...palette } })
    onClose();
  }

  const renderColorBlock = (palette: Palette, key: keyof Palette) => {
    return (
      <span className={styles.paletteComponent} style={{ background: palette[key] }} />
    );
  }

  const renderPaletteButton = (paletteName: PaletteName) => {
    const palette = PALETTE[paletteName];
    return (
      <button className={styles.paletteButton} onClick={() => onSelectPalette(palette)}>
        <span className={styles.paletteName}>{paletteName}</span>
        {renderColorBlock(palette, 'background')}
        {renderColorBlock(palette, 'deco1')}
        {renderColorBlock(palette, 'deco1Stroke')}
        {renderColorBlock(palette, 'deco2')}
        {renderColorBlock(palette, 'deco2Stroke')}
        {renderColorBlock(palette, 'barrier')}
        {renderColorBlock(palette, 'barrierStroke')}
        {renderColorBlock(palette, 'door')}
        {renderColorBlock(palette, 'doorStroke')}
        {renderColorBlock(palette, 'playerHead')}
        {renderColorBlock(palette, 'playerTail')}
        {renderColorBlock(palette, 'playerTailStroke')}
        {renderColorBlock(palette, 'apple')}
        {renderColorBlock(palette, 'appleStroke')}
      </button>
    );
  }

  const handleKeyDown = (ev: KeyboardEvent) => {
    if (isCharPressed(ev, SpecialKey.Escape)) {
      onClose();
    }
  }

  useEffect(() => {
    const onKeyDown = (ev: KeyboardEvent) => {
      if (isCharPressed(ev, SpecialKey.Escape)) {
        onClose();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    }
  }, [])

  return (
    <div className={styles.selectPaletteContainer}>
      <button title="Close" className={styles.closeButton} onClick={() => onClose()}>x</button>
      <h2 className={styles.selectPaletteTitle}>Select Palette</h2>
      {renderPaletteButton(PaletteName.boxcar)}
      {renderPaletteButton(PaletteName.hospital)}
      {renderPaletteButton(PaletteName.forest)}
      {renderPaletteButton(PaletteName.mintJulip)}
      {renderPaletteButton(PaletteName.burningCity)}
      {renderPaletteButton(PaletteName.violetSunset)}
      {renderPaletteButton(PaletteName.atomic)}
      {renderPaletteButton(PaletteName.cornflower)}
      {renderPaletteButton(PaletteName.plumsea)}
      {renderPaletteButton(PaletteName.panopticon)}
      {renderPaletteButton(PaletteName.scienceLab)}
      {renderPaletteButton(PaletteName.darkStar)}
      {renderPaletteButton(PaletteName.crimson)}
      {renderPaletteButton(PaletteName.gravChamber)}
      {renderPaletteButton(PaletteName.cobra)}
    </div>
  );
}