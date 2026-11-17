import { useState } from "react";
import { Image, type ImageProps } from "react-native";

export function PremarketCover({ uri, fallbackUri, style }: {
  uri: string;
  fallbackUri?: string;
  style: ImageProps["style"];
}) {
  const [failedUri, setFailedUri] = useState<string>();
  const useFallback = Boolean(fallbackUri && failedUri === uri);

  return (
    <Image
      source={{ uri: useFallback ? fallbackUri : uri }}
      onError={fallbackUri && !useFallback ? () => setFailedUri(uri) : undefined}
      style={style}
    />
  );
}
