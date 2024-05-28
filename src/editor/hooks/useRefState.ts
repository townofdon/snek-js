
import React, { useRef, useState } from "react";

type SetStateValue<T> = T | ((prev: T) => T)

export const useRefState = <T,>(initialValue: T): [T, React.MutableRefObject<T>, (value: SetStateValue<T>) => void] => {
  const [data, _setData] = useState<T>(initialValue)
  const dataRef = useRef(data);
  dataRef.current = data;

  const setData = (value: SetStateValue<T>) => {
    if (typeof value === 'function') {
      _setData((prev: T) => {
        const current = (value as ((prev: T) => T))(prev);
        dataRef.current = current;
        return current;
      })
    } else {
      _setData(value);
      dataRef.current = value;
    }
  }

  return [data, dataRef, setData];
}
