import React, { useEffect, useState } from "react";

import { EditorData, EditorOptions as EditorOptionsType } from "../../types";

import * as styles from './EditorOptions.css';
import { decodeMapData, encodeMapData } from "../utils/editorUtils";
import { EDITOR_DEFAULTS } from "../editorConstants";

interface EditorOptionsProps {
  data: EditorData;
  setData: (data: EditorData) => void;
}

export const EditorOptions = ({ data, setData }: EditorOptionsProps) => {
  // const [encodedData, setEncodedData] = useState('');
  const [options, setOptions] = useState<EditorOptionsType>({ ...EDITOR_DEFAULTS.options });
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    try {
      const query = new URLSearchParams(window.location.search);
      const data = query.get('data');
      if (data) {
        // setEncodedData(data);
        const [decoded, options] = decodeMapData(data);
        setData(decoded);
        setOptions(options);
      }
    } catch (err) {
      console.error(err.message);
      setErrorMsg('Unable to parse data from url');
    }
  }, [])

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
  }
  
  const handleKeyDown = (ev: React.KeyboardEvent) => {
    ev.stopPropagation();
  }
  
  const handleSave = () => {
    // TODO: update url without reloading the page - see:
    // - https://developer.mozilla.org/en-US/docs/Web/API/History/pushState
    // - https://stackoverflow.com/a/3354511 - popstate event
    try {
      setErrorMsg('');
      const encoded = encodeMapData(data, options);
      // setEncodedData(encoded);
      const query = new URLSearchParams(window.location.search);
      query.set('data', encoded);
      window.location.search = query.toString();
    } catch (err) {
      console.error(err.message);
      setErrorMsg('Export unsuccessful');
    }
  }

  // const handleImport = () => {
  //   try {
  //     setErrorMsg('');
  //     const [decoded, options] = decodeMapData(encodedData);
  //     setData(decoded);
  //     setOptions(options);
  //   } catch (err) {
  //     console.error(err.message);
  //     setErrorMsg('Import unsuccessful');
  //   }
  // }

  return (
    <div className={styles.editorOptionsContainer}>
      <form className={styles.form} onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
        {/* <textarea value={encodedData} onChange={(ev) => { setEncodedData(ev.currentTarget.value) }} rows={18} /> */}
        {errorMsg && (
          <div className={styles.error}>
            <span>{errorMsg}</span>
          </div>
        )}
        {/* <button onClick={handleImport}>Import</button> */}
        <button onClick={handleSave}>Save</button>
      </form>
    </div>
  );
}
