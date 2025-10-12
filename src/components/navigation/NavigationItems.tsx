import { IconName } from "@components/base/SvgIcon";

interface NavigationItemBaseProps {
  iconActive: IconName;
  iconNotActive: IconName;
  label: string;
  labelShort: string;
  route: string;
}

export const navigationItems: NavigationItemBaseProps[] = [
    {
        iconActive:'binoculars',
        iconNotActive:'binoculars-outlined',
        label: "Explore",
        labelShort:"Explore",
        route:"/discover"
    },
    {
        iconActive:'books',
        iconNotActive:'books',
        label: "Resources",
        labelShort:"Resources",
        route:"/resources"
    },
    {
        iconActive:"plus",
        iconNotActive:"plus",
        label: "Create Premarket",
        labelShort:"Create",
        route:"/token/create"
    }
]

