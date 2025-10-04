// routes.ts
export const exampleRoutes = {
  premarket: {
    convertors: "helping function",
    card: "Premarket Card",
    community: "community block",
    prebc: "conding curve",
    premarket_settings_edit: "",
    premarket: "",
  },
  service: {
    notification: "Нотификации (SnackBar)",
  },
  ui: {
    color: "Цвета",
    chips: "Chips",
    fonts: "Шрифты",
    icons: "Иконки",
    back: "",
    circle: "График-донат",
    image_overlay_small: "",
    image_overlay: "",
    image: "",
    one_container: "одинарный контейнер",
    two_container: "двойной контейнер",
  },
  user: {
    profileWidget: "логин и разлогин",
    checker_login_logic: "",
    login_username: "",
    login: "",
    user_card: "",
  },
} as const;

type Routes = typeof exampleRoutes;
export type Section = keyof Routes;
type SectionMap<S extends Section> = Routes[S];
export type Slug<S extends Section = Section> = Extract<keyof SectionMap<S>, string>;

export type RouteItem = { label: string; href: string; slug: string };

const humanize = (s: string) => s.replace(/_/g, " ");

// Название страницы с fallback, БЕЗ обращения к .length
export function getRouteLabel<S extends Section>(section: S, slug: Slug<S>): string {
  const label = exampleRoutes[section][slug] as unknown as string;
  return label || humanize(slug);
}

// Роуты секции
export function getSectionRoutes<S extends Section>(section: S): RouteItem[] {
  const map = exampleRoutes[section] as Record<string, string>;
  return Object.entries(map).map(([slug, label]) => ({
    slug,
    label: label || humanize(slug),
    href: `/example/${section}/${slug}`,
  }));
}

// Все секции
export function getAllRoutes() {
  return (Object.keys(exampleRoutes) as Section[]).map((section) => ({
    section,
    routes: getSectionRoutes(section),
  }));
}
