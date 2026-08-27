import { MapSaveData, validMapSaveData } from "../editorTypes";

export const saveMapDataToDisk = (saveData: MapSaveData) => {
  const filename = `${saveData.name || 'untitled-map'}.map.json`;
  const blobParts = [JSON.stringify(saveData)];
  const file = new File(blobParts, filename);
  downloadFile(file, filename, 'application/json');
}

const FILE_SIZE_MAX = 5 * (1 << 20); // 5MiB - prevent maliciously large file sizes

export const readMapDataFromFile = async (file: File): Promise<MapSaveData> => {
  if (!file) return Promise.reject('no file provided.');
  if (!file.size) return Promise.reject('file is empty.');
  if (file.size > FILE_SIZE_MAX) return Promise.reject('file size is too large.');
  return new Promise((res, rej) => {
    let aborted = false;
    const timeout = setTimeout(() => {
      aborted = true;
      rej('timed out reading file');
    }, 1000);
    const reader = new FileReader();
    reader.onload = () => {
      if (aborted) return;
      clearTimeout(timeout);
      try {
        const text = reader.result;
        if (typeof text !== 'string') {
          rej('unable to read map data: ArrayBuffer not supported.');
          return;
        }
        const data = JSON.parse(text);
        if (validMapSaveData(data)) {
          res(data);
        } else {
          rej('unable to read map data: save file was corrupted.');
        }
      } catch (error) {
        rej(`unable to read map data: ${error}`);
      }
    };
    reader.onerror = () => {
      if (aborted) return;
      clearTimeout(timeout);
      rej(`unable to read map data: could not read file "${file.name}"`);
    };
    reader.readAsText(file);
  });
}

export const downloadFile = (content: File, fileName: string, contentType: string) => {
  // Create a Blob from the content
  const blob = new Blob([content], { type: contentType });
  // Generate a temporary URL for the Blob
  const url = window.URL.createObjectURL(blob);
  // Create a hidden anchor element
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName; // Suggested file name
  // Trigger the download by "clicking" the link
  document.body.appendChild(link);
  link.click();
  // Clean up: remove the link and revoke the URL
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
