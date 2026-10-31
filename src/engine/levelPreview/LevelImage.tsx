import React from "react"

import { Level } from "@/types"
import { LEVEL_PREVIEW_SIZE, LEVEL_THUMBNAIL_EXT, LEVEL_THUMBNAIL_SIZE } from "@/constants";


export enum LevelImageType {
  Preview,
  Thumbnail,
}
interface Props {
  level: Level,
  type: LevelImageType,
  blink?: boolean,
  locked?: boolean,
  className?: string,
  style?: React.CSSProperties,
}
export const LevelImage = ({ level, type, blink, locked, className, style }: Props) => {
  if (!level) {
    return (
      <div
        className={"canvas-container invisible"}
      />
    );
  }
  const size = type === LevelImageType.Preview ? LEVEL_PREVIEW_SIZE : LEVEL_THUMBNAIL_SIZE;
  const path = `assets/graphics/level-preview/${level.id}_${size}.${LEVEL_THUMBNAIL_EXT}`;
  return (
    <div
      className={"canvas-container"
        + (blink ? " invisible" : "")
        + (className ? ` ${className}` : "")
        + (locked ? ` locked` : "")
      }
      style={{
        ...style,
        width: size,
        height: size,
      }}
    >
      <img src={path} width={size} height={size} />
    </div>
  )
}
