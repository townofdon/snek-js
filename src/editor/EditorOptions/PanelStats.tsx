import React from "react";

import { EditorOptions } from "../../types";

interface PanelStatsProps {
  options: EditorOptions;
  setOptions: (options: EditorOptions) => void;
}

export const PanelStats = ({ options, setOptions }: PanelStatsProps) => {

  return (
    <div>
      Stats
    </div>
  );
}
