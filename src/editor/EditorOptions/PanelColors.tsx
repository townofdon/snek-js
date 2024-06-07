import React from "react";

import { EditorOptions } from "../../types";

interface PanelColorsProps {
  options: EditorOptions;
  setOptions: (options: EditorOptions) => void;
}

export const PanelColors = ({ options, setOptions }: PanelColorsProps) => {

  return (
    <div>
      Colours
    </div>
  );
}
