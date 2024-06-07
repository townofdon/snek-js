import { useEffect } from "react";
import { decodeMapData } from "../utils/editorUtils";
import { EditorData, EditorOptions } from "../../types";
import toast from "react-hot-toast";

interface UseLoadMapDataParams {
  setData: (data: EditorData) => void;
  setOptions: (options: EditorOptions) => void;
}

export const useLoadMapData = ({ setData, setOptions }: UseLoadMapDataParams) => {
  useEffect(() => {
    try {
      const query = new URLSearchParams(window.location.search);
      const data = query.get('data');
      if (data) {
        const [decoded, options] = decodeMapData(data);
        setData(decoded);
        setOptions(options);
      }
    } catch (err) {
      console.error(err.message);
      toast.error('Unable to load map data from url');
    }
  }, [])
}
