import React, { useRef } from "react";
import toast from "react-hot-toast";

import { Stack } from "../components/Stack";
import { getPreviewUrl } from "../utils/publishUtils";
import { getGraphicsDir } from "../../utils";

import * as fieldStyles from "../components/Field/field.css";

export const CopyLink = () => {
  const input = useRef<HTMLInputElement>();
  const query = new URLSearchParams(window.location.search);
  const data = query.get("data");
  const url = getPreviewUrl(data);

  const copyText = () => {
    if (!input.current) return;
    input.current.select();
    input.current.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(input.current.value);
    toast.success("Link copied to clipboard");
  };

  return (
    <Stack row align="center" justify="spaceBetween">
      <input
        ref={input}
        type="text"
        value={url}
        className={fieldStyles.input}
        style={{
          width: "100%",
          padding: 8,
          transform: "translateY(2px)",
          marginRight: 0,
          background: "#000",
          color: "#eee",
        }}
        readOnly
      />
      <button onClick={copyText}>Copy</button>
      <a
        href={url}
        target="_blank"
        rel="nofollow"
        title="Goto map preview link"
        className="button"
        style={{
          display: "inline-flex",
          padding: 4,
          marginLeft: 0,
        }}
      >
        <img
          alt="Goto map preview link"
          src={getGraphicsDir("editor-publish-external-link.png")}
          width={32}
          height={32}
          style={{
            height: 19,
            width: "auto",
          }}
        />
      </a>
    </Stack>
  );
};
