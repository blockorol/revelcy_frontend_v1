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
        iconActive:'revelcy-r',
        iconNotActive:'revelcy-r',
        label: "About",
        labelShort:"About",
        route:"/"
    },
    {
        iconActive:'binoculars',
        iconNotActive:'binoculars-outlined',
        label: "Explore",
        labelShort:"Explore",
        route:"/discover"
    },
    {
        iconActive:"plus",
        iconNotActive:"plus",
        label: "Create Premarket",
        labelShort:"Create",
        route:"/token/create"
    }
]

