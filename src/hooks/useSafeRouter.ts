// useSafeRouter.ts
import { useRouter as useExpoRouter } from "expo-router";

function isPhantomInAppBrowser(): boolean {
  if (typeof window === "undefined") return false;

  const ua = navigator.userAgent || "";
  return /Phantom/i.test(ua) && /Android|iPhone|iPad|iPod/i.test(ua);
}

export function useRouter() {
  const router = useExpoRouter();

  const safePush = (route: string) => {
    const target = route.startsWith("/") ? route : `/${route}`;

    if (isPhantomInAppBrowser()) {
      router.replace(target);
    } else {
      router.push(target);
    }
  };

  return {
    ...router,
    push: safePush, // 🔁 переопределяем только push
  };
}
