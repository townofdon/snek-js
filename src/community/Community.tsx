import React from "react";

import { getGraphicsDir, getRelativeDir } from "../utils";
import { Stack } from "../editor/components/Stack";
import { MapList } from "./MapList";

import * as styles from "./Community.css";

export const Community = () => {
  return (
    <div className={styles.layout}>
      <Stack col align="center" justify="center">
        <a href={getRelativeDir()} style={{ display: 'inline-flex' }}>
          <img
            className={styles.titleImg}
            src={getGraphicsDir("snek-title-grayblue-crop.png")}
            width={907}
            height={223}
          />
        </a>
        <h1 className="minimood">Community</h1>
      </Stack>
      <div style={{ marginBottom: 60 }} />

      <Stack col>
        <div className="d-inline-block mw-100">
          <p className="align-center">
            Your bonafide destination for locally-sourced, home-grown,
            critically acclaimed&nbsp;<span className="snek-red">SNEK™</span>
            &nbsp;maps.
          </p>
  
          <Stack col align="center" style={{ marginTop: 60, marginBottom: 60 }}>
            <h3 className="minimood">links</h3>
            <Stack row style={{ padding: '0 40px', boxSizing: 'border-box' }}>
              <p><a href={`${getRelativeDir()}`}>SNEK Campaign</a></p>
              <div className="d-none d-block-md" style={{ width: 30 }} />
              <p><a href={`${getRelativeDir()}editor`}>SNEK Editor</a></p>
            </Stack>
          </Stack>

          <Stack className="mw-100" col align="center">
            <h3 className="minimood">maps</h3>
            <MapList />
          </Stack>
        </div>
      </Stack>
    </div>
  );
};
