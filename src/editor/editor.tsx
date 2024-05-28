import React from "react";
import { useEditorData } from "./hooks/useEditorData";
import { EditorCanvas } from "./editorCanvas";
// import { LEVEL_02, LEVEL_03, LEVEL_04, LEVEL_05, LEVEL_06, LEVEL_07, LEVEL_08 } from "../levels";
// import { buildLevel } from "../levels/levelBuilder";

import * as styles from "./editor.css";

// const levels = [
//   LEVEL_02,
//   LEVEL_03,
//   LEVEL_04,
//   LEVEL_05,
//   LEVEL_06,
//   LEVEL_07,
//   LEVEL_08,
// ]

export const Editor = () => {
  const [data, dataRef, setData] = useEditorData();

  // React.useEffect(() => {
  //   const interval = setInterval(() => {
  //     const nextLevel = levels[Math.floor(Math.random() * levels.length)];
  //     const levelData = buildLevel(nextLevel);
  //     setData(prev => ({
  //       ...prev,
  //       barriersMap: { ...levelData.barriersMap },
  //       doorsMap: { ...levelData.doorsMap },
  //       decoratives1Map: { ...levelData.decoratives1Map },
  //       decoratives2Map: { ...levelData.decoratives2Map },
  //       playerSpawnPosition: levelData.playerSpawnPosition.copy(),
  //     }))
  //   }, 1000);
  //   return () => clearInterval(interval);
  // }, [])

  return (
    <div className={styles.layout}>
      <div className={styles.container}>
        <EditorCanvas data={data} />
      </div>
    </div>
  );
};
