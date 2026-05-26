import { useCallback, useState } from "react";

export const useForceRerender = () => {
  const [_version, setVersion] = useState(0);
  const forceRerender = useCallback(() => { setVersion(prev => prev + 1); }, []);
  return forceRerender;
}