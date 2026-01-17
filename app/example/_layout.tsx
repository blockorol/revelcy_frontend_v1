import { NETWORK } from "env";
import { Stack, Redirect } from "expo-router";

export default function Layout() {
  if (NETWORK === "mainnet-beta") {
    return <Redirect href="/+not-found" />;
  }

  return <Stack />;
}
