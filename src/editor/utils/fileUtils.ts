
export const getCanvasImage = async (canvas: HTMLCanvasElement): Promise<File> => {
  const dataUrl = canvas.toDataURL('image/png');
  const blob = await (await fetch(dataUrl)).blob();
  return new File([blob], `map-${Date.now()}.png`, { type: blob.type });
};
