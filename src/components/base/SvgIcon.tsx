import React from "react";
import type SvgProps from "react-native-svg/lib/typescript/ReactNativeSVG";

import AddCircleOutlined from "@assets/basic_icon/add-circle-outlined.svg";
import ArrowDownFilled from "@assets/basic_icon/arrow-down-filled.svg";
import ArrowDown from "@assets/basic_icon/arrow-down.svg";
import ArrowLeft from "@assets/basic_icon/arrow-left.svg";
import ArrowUpFilled from "@assets/basic_icon/arrow-up-filled.svg";
import ArrowUp from "@assets/basic_icon/arrow-up.svg";
import ArrowsClockwise from "@assets/basic_icon/arrows-clockwise.svg";
import BinocularsOutlined from "@assets/basic_icon/binoculars-outlined.svg";
import Binoculars from "@assets/basic_icon/binoculars.svg";
import Books from "@assets/basic_icon/books.svg";
import Buy from "@assets/basic_icon/buy.svg";
import CaretDown from "@assets/basic_icon/caret-down.svg";
import CaretLeft from '@assets/basic_icon/caret-left.svg';
import Check from "@assets/basic_icon/check.svg";
import CopyIcon from "@assets/basic_icon/copy_icon.svg";
import HeartOutlined from "@assets/basic_icon/heart-outlined.svg";
import Heart from "@assets/basic_icon/heart.svg";
import HourglassDown from "@assets/basic_icon/hourglass-down.svg";
import HourglassUp from "@assets/basic_icon/hourglass-up.svg";
import InstagramLogoOutlined from "@assets/basic_icon/instagram-logo-outlined.svg";
import InfoCircle from "@assets/basic_icon/info-circle.svg";
import NotificationOutlined from "@assets/basic_icon/notification-outlined.svg";
import Mail from "@assets/basic_icon/mail.svg";
import Menu from "@assets/basic_icon/menu.svg";
import Percent from "@assets/basic_icon/percent.svg";
import Pumpfun from "@assets/basic_icon/pumpfun.svg";
import Privy from "@assets/basic_icon/privy.svg";
import PlantOutlined from "@assets/basic_icon/plant-outlined.svg";
import Plus from "@assets/basic_icon/plus.svg";
import QuestionMarkCircle from "@assets/basic_icon/question-mark-circle.svg";
import QuestionMark from "@assets/basic_icon/question-mark.svg";
import RevelcyLogo from "@assets/basic_icon/revelcy-logo.svg";
import RevelcyR from "@assets/basic_icon/revelcy-r.svg";
import RobotOutlined from "@assets/basic_icon/robot-outlined.svg";
import Rocket from "@assets/basic_icon/Rocket.svg";
import RocketSide from "@assets/basic_icon/rocket_side.svg";
import OneCoin from "@assets/basic_icon/one_coin.svg";
import TwoCoins from "@assets/basic_icon/two_coins.svg";
import RingingClock from "@assets/basic_icon/ringig_clock.svg";
import Send from "@assets/basic_icon/send.svg";
import Search from "@assets/basic_icon/search.svg";
import SortArrows from "@assets/basic_icon/sort_arrows.svg";
import SmileOutlined from "@assets/basic_icon/smile-outlined.svg";
import SmileSadOutlined from "@assets/basic_icon/smile-sad-outlined.svg";
import Smile from "@assets/basic_icon/smile.svg";
import StarOutlined from "@assets/basic_icon/star-outlined.svg";
import Star from "@assets/basic_icon/star.svg";
import TgLogo from "@assets/basic_icon/tg-logo.svg";
import WalletOutlined from "@assets/basic_icon/wallet-outlined.svg";
import WorldOutlined from "@assets/basic_icon/world-outlined.svg";
import XCircleOutlined from "@assets/basic_icon/x-circle-outlined.svg";
import XBase from "@assets/basic_icon/x-base.svg";
import XLogo from "@assets/basic_icon/x-logo.svg";
import {
  TouchableOpacity,
  GestureResponderEvent,
  ViewStyle,
  View,
  Platform,
} from "react-native";
import { Text, Tooltip, useTheme } from "react-native-paper";
import { makeTransparent } from "@utils/colors";

export const icons = {
  "add-circle-outlined": AddCircleOutlined,
  "arrow-down-filled": ArrowDownFilled,
  "arrow-down": ArrowDown,
  "arrow-left": ArrowLeft,
  "arrow-up-filled": ArrowUpFilled,
  "arrow-up": ArrowUp,
  "arrows-clockwise": ArrowsClockwise,
  "binoculars-outlined": BinocularsOutlined,
  binoculars: Binoculars,
  books: Books,
  buy: Buy,
  "caret-down": CaretDown,
  'caret-left':CaretLeft,
  check: Check,
  "copy-icon": CopyIcon,
  "heart-outlined": HeartOutlined,
  heart: Heart,
  "hourglass-down": HourglassDown,
  "hourglass-up": HourglassUp,
  "instagram-logo-outlined": InstagramLogoOutlined,
  "info-circle": InfoCircle,
  "notification-outlined": NotificationOutlined,
  mail: Mail,
  menu: Menu,
  percent: Percent,
  pumpfun: Pumpfun,
  "plant-outlined": PlantOutlined,
  plus: Plus,
  privy: Privy,
  "revelcy-logo": RevelcyLogo,
  "revelcy-r": RevelcyR,
  "robot-outlined": RobotOutlined,
  rocket: Rocket,
  "rocket-side": RocketSide,
  "one-coin": OneCoin,
  "two-coins": TwoCoins,
  "ringing-clock": RingingClock,
  send: Send,
  "question-mark-circle": QuestionMarkCircle,
  "question-mark": QuestionMark,
  search: Search,
  "sort-arrows": SortArrows,
  "smile-outlined": SmileOutlined,
  "smile-sad-outlined": SmileSadOutlined,
  smile: Smile,
  "star-outlined": StarOutlined,
  star: Star,
  "tg-logo": TgLogo,
  "wallet-outlined": WalletOutlined,
  "world-outlined": WorldOutlined,
  "x-base": XBase,
  "x-circle-outlined": XCircleOutlined,
  "x-logo": XLogo,
};

export const withStroke: Partial<Record<IconName, boolean>> = {
  pumpfun: true,
};

export type IconName = keyof typeof icons;

export interface SvgIconProps {
  name: IconName;
  textUnder?: string;
  sizeAround?: number;
  size?: number;
  color?: string;
  style?: SvgProps["style"];
  elementRef?: React.Ref<any>;
}

export const SvgIcon: React.FC<SvgIconProps> = ({
  name,
  size = 24,
  sizeAround,
  color,
  style,
  elementRef,
}) => {
  const Icon = icons[name];
  if (!Icon) return null;
  const withStrokeVal = withStroke[name] ?? false;

  return (
    <View
      style={{
        width: sizeAround,
        height: sizeAround,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Icon
        width={size}
        height={size}
        stroke={withStrokeVal ? color : undefined}
        fill={color}
        style={style}
        ref={elementRef}
      />
    </View>
  );
};

export interface SvgIconButtonProps extends SvgIconProps {
  onPress: (event: GestureResponderEvent) => void;
  containerStyle?: ViewStyle;
  tooltipText?: string;
}

export const SvgIconButton: React.FC<SvgIconButtonProps> = ({
  name,
  textUnder,
  size = 24,
  color,
  style,
  elementRef,
  onPress,
  containerStyle,
  tooltipText
}) => {
  const theme = useTheme();
  const button = ( <TouchableOpacity
      onPress={onPress}
      style={{ alignSelf: "flex-start", alignItems: "center" }}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <View
        style={[
          containerStyle,
          {
            justifyContent: "center",
            alignItems: "center",
            position: "absolute", // <- фон под иконкой
          },
        ]}
      />
      <View
        style={[
          {
            justifyContent: "center",
            alignItems: "center",
            width: containerStyle?.width ?? size,
            height: containerStyle?.height ?? size,
          },
        ]}
      >
        <SvgIcon
          name={name}
          size={size}
          color={color}
          style={[style]}
          elementRef={elementRef}
        />
      </View>
      {textUnder && (
        <Text
          variant="labelSmall"
          style={{ textAlign: "center", color: color }}
        >
          {textUnder}
        </Text>
      )}
    </TouchableOpacity>)
    return button
  //   if (!tooltipText) {
  //     return button
  //   }

  // return (
  //   <Tooltip
  //     title={tooltipText}
  //     leaveTouchDelay={5}
  //     theme={{
  //       ...theme,
  //       roundness: 12,
  //       colors: {
  //         ...theme.colors,
  //         surface: makeTransparent(theme.colors.primary, 0.4),
  //         onSurface: makeTransparent(theme.colors.onPrimary, 0.2),
  //       },
  //     }}

  //   >
  //       {button}
  //   </Tooltip>
  // );
};
