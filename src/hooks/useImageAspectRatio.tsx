import { Image } from "react-native";
import React from "react";

export function useImageAspectRatio(uri?: string, fallback = 16 / 9) {
  const [ratio, setRatio] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!uri) return;
    let alive = true;
    Image.getSize(
      uri,
      (w, h) => alive && setRatio(w / h),
      () => alive && setRatio(fallback) // если не удалось — дефолт
    );
    return () => { alive = false; };
  }, [uri, fallback]);

  return ratio;
}
