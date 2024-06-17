import React from "react";

import { SnekMap } from "../api/map";
import { Stack } from "../editor/components/Stack";

import * as styles from './Community.css';
import { getPreviewUrl } from "../editor/utils/publishUtils";

interface MapCardProps {
  map: SnekMap,
  isImageLoaded: boolean,
}

export const MapCard = ({ map, isImageLoaded }: MapCardProps) => {
  return (
    <a className={styles.mapImageLink} href={getPreviewUrl(map.data)}>
      <Stack row className={styles.mapCard}>
        <Stack col className={styles.mapCardInfo}>
          <span className={styles.name}>{map.name}</span>
          <span className={styles.author}>{map.author}</span>
        </Stack>

        {isImageLoaded ? (
          // <img className={styles.mapImage} src={map.imageUrl} width={1200} height={630} />
          <span
            className={styles.mapImage}
            style={{ backgroundImage: `url(${map.imageUrl})` }}
          />
        ) : (
          <span className={styles.emptyMapImage}>no map image</span>
        )}
      </Stack>
    </a>
  );
}
