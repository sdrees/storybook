import { useEffect, useState } from 'react';
import type { Response } from '../../../types/response';

export function useGetButtonPath() {
  const [buttonPath, setButtonPath] = useState<Response<string>>(null);

  useEffect(() => {
    const getButtonPath = async () => {
      try {
        const response = await fetch('/index.json');
        const json = await response.json();
        const buttonPathInner = json.entries['example-button--primary'].importPath;
        setButtonPath({
          data: buttonPathInner,
          error: null,
        });
      } catch (e) {
        setButtonPath({
          data: null,
          error: e,
        });
      }
    };
    getButtonPath();
  }, []);

  return buttonPath;
}
