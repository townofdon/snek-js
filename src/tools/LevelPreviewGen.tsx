import React, { useEffect, useState } from "react"
import { createRoot } from "react-dom/client";

import { useRefState } from "@/editor/hooks/useRefState";
import { LevelPreview, offLevelPreviewLoaded, onLevelPreviewLoaded } from "@/engine/levelPreview/LevelPreview";
import { ALL_LEVELS } from "@/levels/levelConstants";
import { getEpisodeFromLevel } from "@/levels/levelUtils";
import { Level } from "@/types";
import { requireElementById } from "@/ui/uiUtils";
import { LEVEL_PREVIEW_SIZE, LEVEL_THUMBNAIL_EXT, LEVEL_THUMBNAIL_SIZE } from "@/constants";


enum Pass {
  Preview,
  Thumbnail,
}

const LevelPreviewGen = () => {
  const [generating, setGenerating] = useState(false);
  const [pass, passRef, setPass] = useRefState(Pass.Preview);
  const [levelIdx, setLevelIdx] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleClick = async () => {
    if (generating) return;
    try {
      setPass(Pass.Preview);
      setGenerating(true);
      setLevelIdx(0);
      setSuccess(false);
      setError('');
    } catch (err) {
      setError(err.message);
      setSuccess(false);
      setGenerating(false);
    }
  }

  useEffect(() => {
    if (success) {
      const timeout = setTimeout(() => {
        setSuccess(false);
      }, 5000);
      return () => {
        clearTimeout(timeout);
      }
    }
  }, [success]);

  useEffect(() => {
    const onLoaded = (level: Level, canvas: HTMLCanvasElement) => {
      (async () => {
        const suffix = String(passRef.current === Pass.Preview ? LEVEL_PREVIEW_SIZE : LEVEL_THUMBNAIL_SIZE);
        const slug = level.id + '_' + suffix;
        try {
          await saveCanvasImage(slug, canvas);
          setLevelIdx(prev => {
            const next = prev + 1;
            if (ALL_LEVELS[next]) {
              return next;
            }
            if (passRef.current === Pass.Preview) {
              setPass(Pass.Thumbnail);
              return 0;
            }
            setSuccess(true);
            setGenerating(false);
            return 0;
          })
        } catch (err) {
          setError(err.message);
          setSuccess(false);
          setGenerating(false);
        }
      })()
    }
    onLevelPreviewLoaded(onLoaded);
    return () => {
      offLevelPreviewLoaded(onLoaded);
    }
  }, []);

  return (
    <main style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: 100,
      boxSizing: 'border-box',
      gap: 30,
    }}>
      <h1 className="minimood title-gradient">Level Preview Gen</h1>
      <button
        className="newbutton"
        disabled={generating}
        onClick={handleClick}
      >
        {generating ? 'generating...' : 'Generate'}
      </button>
      {generating && pass === Pass.Preview && <p>generating previews...</p>}
      {generating && pass === Pass.Thumbnail && <p>generating thumbnails...</p>}
      {generating && pass === Pass.Preview && (
        <LevelPreview
          level={ALL_LEVELS[levelIdx]}
          width={LEVEL_PREVIEW_SIZE}
          height={LEVEL_PREVIEW_SIZE}
        />
      )}
      {generating && pass === Pass.Thumbnail && (
        <LevelPreview
          level={ALL_LEVELS[levelIdx]}
          width={LEVEL_THUMBNAIL_SIZE}
          height={LEVEL_THUMBNAIL_SIZE}
        />
      )}
      {success && (
        <div><p className="color-w minimood" style={{ fontSize: '1.5em' }}>Success!</p></div>
      )}
      {error && (
        <div><p className="color-k" style={{ fontSize: '1.2em' }}>{error}</p></div>
      )}
    </main>
  )
}

const saveCanvasImage = async (levelSlug: string, canvas: HTMLCanvasElement) => {
  const blob = await new Promise<Blob>((res, rej) => {
    let cancel = false;
    const timeout = setTimeout(() => {
      cancel = true;
      rej('timed out');
    }, 5000);
    canvas.toBlob((blob) => {
      if (cancel) return;
      clearTimeout(timeout);
      res(blob);
    });
  })
  // const blob = await (await fetch(dataUrl)).blob();
  const res = await fetch(`http://localhost:3002/write-file?slug=${levelSlug}`, {
    method: 'POST',
    headers: {
      'Content-Type': `image/${LEVEL_THUMBNAIL_EXT}`,
    },
    body: blob,
  });
  if (res.status >= 400) {
    let errMsg: string = `${res.status} ${res.statusText}`;
    try {
      const errBody = await res.json();
      errMsg = errBody.err;
    } catch (err) {
      errMsg = `${res.status} ${res.statusText}`;
    }
    throw new Error(errMsg);
  }
};

createRoot(requireElementById('level-preview-gen-root')).render(
  <React.StrictMode>
    <LevelPreviewGen />
  </React.StrictMode>
);
