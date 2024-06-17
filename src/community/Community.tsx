import React from "react";

import * as styles from "./Community.css";
import { getGraphicsDir, getRelativeDir } from "../utils";
import { Stack } from "../editor/components/Stack";
import { MapList } from "./MapList";

export const Community = () => {
  return (
    <div className={styles.layout}>
      <Stack col align="center" justify="center">
        <img
          className={styles.titleImg}
          src={getGraphicsDir("snek-title-grayblue-crop.png")}
          width={907}
          height={223}
        />
        <h1 className="minimood">Community</h1>
      </Stack>
      <div style={{ marginBottom: 60 }} />

      <Stack col>
        <div style={{ display: "inline-block" }}>
          <p className="center">
            Your bonifide destination for locally-sourced, home-grown,
            critically acclaimed&nbsp;<span className="snek-red">SNEK™</span>
            &nbsp;maps.
          </p>
  
          <Stack col align="center" style={{ marginTop: 60, marginBottom: 60 }}>
              <h3 className="minimood">links</h3>
              <Stack row>
                <p><a href={`${getRelativeDir()}`}>SNEK Campaign</a></p>
                <div style={{ width: 30 }} />
                <p><a href={`${getRelativeDir()}editor`}>SNEK Editor</a></p>
              </Stack>
          </Stack>

          <Stack col align="center">
            <h3 className="minimood">maps</h3>
            {/* <div style={{ marginTop: 30 }} /> */}
            <MapList />
          </Stack>
        </div>
      </Stack>
    </div>
  );
};
