import { useEffect } from "react";
import { v4 as uuid } from 'uuid';
import toast from "react-hot-toast";

import { decodeMapData } from "../utils/editorUtils";
import { EditorData, EditorOptions } from "../../types";
import { SetStateValue } from "../editorTypes";
import { Command } from "../commands";
import { EDITOR_DEFAULTS } from "../editorConstants";
import { editorMapMetadataStore } from "@/stores/EditorMapStore";

interface UseLoadMapDataParams {
  setMapId: (id: string) => void;
  setData: (data: EditorData) => void;
  setOptions: (options: EditorOptions) => void;
  setPastCommands: (value: SetStateValue<Command[]>) => void;
  setFutureCommands: (value: SetStateValue<Command[]>) => void;
  setInitialized: (value: boolean) => void;
}

export const useLoadMapData = ({ setMapId, setData, setOptions, setPastCommands, setFutureCommands, setInitialized }: UseLoadMapDataParams) => {
  useEffect(() => {
    const loadData = () => {
      try {
        const query = new URLSearchParams(window.location.search);
        let mapId = query.get('id');
        const data = query.get('data');
        if (!mapId || !data) {
          mapId = uuid();
        }
        if (data) {
          const [decoded, options] = decodeMapData(data);
          const extendedData = editorMapMetadataStore.get(mapId);
          setData({ ...decoded, ...extendedData });
          setOptions(options);
        } else {
          setData(EDITOR_DEFAULTS.data);
          setOptions(EDITOR_DEFAULTS.options);
        }
        
        // setMetadata(editorMapMetadataStore.get(mapId));
        setMapId(mapId);
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
