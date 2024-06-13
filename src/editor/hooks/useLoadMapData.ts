import { useEffect } from "react";
import { decodeMapData } from "../utils/editorUtils";
import { EditorData, EditorOptions } from "../../types";
import toast from "react-hot-toast";
import { SetStateValue } from "../editorTypes";
import { Command } from "../commands";
import { EDITOR_DEFAULTS } from "../editorConstants";

interface UseLoadMapDataParams {
  setData: (data: EditorData) => void;
  setOptions: (options: EditorOptions) => void;
  setPastCommands: (value: SetStateValue<Command[]>) => void;
  setFutureCommands: (value: SetStateValue<Command[]>) => void;
  setInitialized: (value: boolean) => void;
}

export const useLoadMapData = ({ setData, setOptions, setPastCommands, setFutureCommands, setInitialized }: UseLoadMapDataParams) => {
  useEffect(() => {
    const loadData = () => {
      try {
        const query = new URLSearchParams(window.location.search);
        const data = query.get('data');
        if (data) {
          const [decoded, options] = decodeMapData(data);
          setData(decoded);
          setOptions(options);
        } else {
          setData(EDITOR_DEFAULTS.data);
          setOptions(EDITOR_DEFAULTS.options);
        }
        setPastCommands([]);
        setFutureCommands([]);
      } catch (err) {
        console.error(err.message);
        toast.error('Unable to load map data from url');
      } finally {
        setInitialized(true);
      }
    };

    loadData();

    const handlePopState = (ev: PopStateEvent) => {
      loadData();
    }

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    }
  }, [])
}
