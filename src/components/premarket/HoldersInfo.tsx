import { TokenInfo} from "@api/token";
import { UserCard } from "@components/user/UserCard";
import { AppTheme } from "@theme/types";
import shortString from "@utils/address_shorter";
import { convertLamportToSmallCount } from "@utils/premarket";
import { View } from "react-native";
import {Text} from '@components/ui/Text'
import React, { useMemo, useState } from "react";
import { Menu, useTheme, TouchableRipple, Divider } from "react-native-paper";
import { SvgIcon } from "@components/base/SvgIcon";

const TOTAL_TOKEN_COUNT = 1_000_000_000
interface Props {
  tokenData: TokenInfo;
  holdersAmount: number;
  isMobile: boolean;
  limited: boolean;
}
const DEFAULT_SHOW_COUNT = 2;
const STEP_SHOW_COUNT = 2;
export function HoldersInfo({ tokenData, holdersAmount, isMobile, limited}: Props) {
  const [showCount, setShowCount] = useState(DEFAULT_SHOW_COUNT)
  const [order, setOrder] = useState<OrderValue>("SUPPLY")
  const { colors } = useTheme() as AppTheme;
  const holders = tokenData.dynamicInfo.holders
  const totalRaised = convertLamportToSmallCount(tokenData.dynamicInfo.reservedSolLamp)
  const sortedHolders = useMemo(() => {
  if (!holders) return [];

  const list = [...holders]; // не мутируем исходный массив

  switch (order) {
    case "JOINED_ASC":
      list.sort((a, b) => a.joinTimestamp - b.joinTimestamp);
      break;

    case "JOINED_DESC":
      list.sort((a, b) => b.joinTimestamp - a.joinTimestamp);
      break;

    case "SUPPLY":
    default:
      list.sort((a, b) => b.amountSolLamp.cmp(a.amountSolLamp));
      break;
  }

  return list.slice(0, showCount);
}, [holders, order, showCount]);


  return (
    <View
      style={{
        backgroundColor: isMobile?undefined:colors.surfaceContainerLowest,
        borderRadius: isMobile?16:24 ,
        padding: 24,
        paddingBottom: 24,
        gap: 16,
      }}
    >
      <View style={{flexDirection: 'row', alignContent:'center', justifyContent:'space-between'}}>
        <View style={{flexDirection: 'row', gap: 8}}>
          <Text variant="titleLarge" selectionColor={colors.onSurface}>People</Text>
          <Text variant="titleLarge" style={{color:colors.onSurfaceVariant}}>{holdersAmount}</Text>
        </View>
        <OrderMenu value={order} onChange={setOrder}/>
      </View>
     
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 20, rowGap: 16 }}>
        {sortedHolders.map((holder, ) => {
          const amount = convertLamportToSmallCount(holder.amountSolLamp)
          return (
            <View key={holder.walletAddress} style={{}}>
              <UserCard 
                baseInfo={{
                  userId: holder.id,
                  username: shortString(holder.walletAddress),
                  walletAddress: holder.walletAddress,
                  avatarUrl: holder.iconURL??null
                }}
                tokenInfo={{
                  userJoined: holder.joinTimestamp,
                  amount: amount,
                  amountProcent:(100*amount/TOTAL_TOKEN_COUNT),
                  isCreator: tokenData.mainInfo.createdByPubkey === holder?.walletAddress
                }}
              />
            </View>
          );
        })
        }
      </View>
      {!limited&&showCount<holdersAmount&&
        <TouchableRipple
        style={{
          height: 40,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 16
        }}
        onPress={() => { setShowCount(showCount+STEP_SHOW_COUNT) }}
        >
          <View style={{
            flexDirection: "row",
            gap: 2,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Text variant='labelMedium' prominent selectionColor={colors.onSurface}>Show more</Text>
            <SvgIcon name='caret-down' color={colors.onSurface} size={16}/>
          </View>
        </TouchableRipple>
      }
    </View>
  );
}

type OrderValue = "SUPPLY" | "JOINED_ASC" | "JOINED_DESC";

type PropsOrderMenu = {
  value: OrderValue;
  onChange: (v: OrderValue) => void;
  anchor?: React.ReactNode;
};

export const OrderMenu: React.FC<PropsOrderMenu> = ({ value, onChange, anchor }) => {
  const { colors } = useTheme() as AppTheme;
  const [visible, setVisible] = useState(false);

  const open = () => setVisible(true);
  const close = () => setVisible(false);

  const defs = useMemo(
    () => ([
      { label: "Highest",  icon: "percent" as const, target: "SUPPLY" as const },
      { label: "Earliest", icon: "hourglass-up" as const, target: "JOINED_ASC" as const },
      { label: "Latest",   icon: "hourglass-down" as const, target: "JOINED_DESC" as const },
    ]),
    []
  );

  const items = useMemo(() => {
    const cur = defs.find(d => d.target === value)!;
    const rest = defs.filter(d => d.target !== value);
    return [cur, ...rest];
  }, [defs, value]);

  const commonItemStyle = {
    height: 40,
    paddingRight: 12,
    paddingLeft: 32,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
  };

  const contentStyle = useMemo(
    () => ({
      backgroundColor: colors.surfaceContainerHigh,
      borderRadius: 12,
      padding: 0,
      overflow: "hidden" as const,
    }),
    [colors.surfaceContainerHigh]
  );

  const Item: React.FC<{ label: string; icon: "percent" | "hourglass-up" | "hourglass-down"; target: OrderValue; active?: boolean; }> =
  ({ label, icon, target, active }) => {
    const fg = active ? colors.onPrimary : colors.onSurface;
    const bg = active ? colors.primary : colors.surfaceContainerHigh;

    return (
      <TouchableRipple
        onPress={() => { onChange(target); close(); }}
        style={[commonItemStyle, { backgroundColor: bg }]}
      >
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: 'flex-end', gap: 4 }}>
          <Text variant='labelMedium' prominent style={{ color: fg }}>{label}</Text>
          <SvgIcon name={icon as any} size={16} color={fg} />
        </View>
      </TouchableRipple>
    );
  };

  const currentDef = items[0];
  const anchorFg = visible ? colors.onSecondaryContainer : colors.primary;
  const anchorBg = visible ? colors.secondaryContainer : "transparent";

  const defaultAnchor = (
    <TouchableRipple
      onPress={open}
      style={{
        borderRadius: 12,
        backgroundColor: anchorBg,
        paddingRight: 12,
        paddingLeft: 32,
        height: 40,
        alignSelf: "flex-start",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        <Text variant="labelMedium" prominent style={{ color: anchorFg }}>
          {currentDef.label}
        </Text>
        <SvgIcon name={currentDef.icon as any} size={16} color={anchorFg} />
      </View>
    </TouchableRipple>
  );

  return (
    <Menu
      visible={visible}
      onDismiss={() => { /* не закрываем по клику вне */ }}
      anchor={anchor ?? defaultAnchor}
      contentStyle={contentStyle}
    >
      <Item label={items[0].label} icon={items[0].icon} target={items[0].target} active />

      <Divider style={{ opacity: 0.12 }} />

      {items.slice(1).map(it => (
        <Item key={it.target} label={it.label} icon={it.icon} target={it.target} />
      ))}
    </Menu>
  );
};
