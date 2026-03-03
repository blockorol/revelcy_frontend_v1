import { getWhitelistUsers, TokenInfo, WhitelistUserDTO } from "@api/token";
import { UserCard } from "@components/user/UserCard";
import { AppTheme } from "@theme/types";
import { convertLamportToSmallCount } from "@utils/premarket";
import { View } from "react-native";
import {Text} from '@components/ui/Text'
import React, { useEffect, useMemo, useState } from "react";
import { Menu, useTheme, TouchableRipple, Divider } from "react-native-paper";
import RevelcySegmentedButtons from "@components/ui/SegmentedButton";
import { SvgIcon } from "@components/base/SvgIcon";
import { convertTokenToPersent } from "@services/pumpfun/adds";
import shortString from "@utils/address_shorter";

interface Props {
  tokenData: TokenInfo;
  holdersAmount: number;
  isMobile: boolean;
  limited: boolean;
}
const DEFAULT_SHOW_COUNT = 10;
const STEP_SHOW_COUNT = 10;
const ACCEPTED_PAGE_SIZE = 100;
export function HoldersInfo({ tokenData, holdersAmount, isMobile, limited}: Props) {
  const [showCount, setShowCount] = useState(DEFAULT_SHOW_COUNT)
  const [order, setOrder] = useState<OrderValue>("SUPPLY")
  const { colors } = useTheme() as AppTheme;
  const [sectionType, setSectionType] = useState("Joined")
  const [acceptedUsers, setAcceptedUsers] = useState<WhitelistUserDTO[]>([]);
  const [acceptedTotal, setAcceptedTotal] = useState<number | undefined>(undefined);
  const [acceptedCursor, setAcceptedCursor] = useState(0);
  const [acceptedHasMore, setAcceptedHasMore] = useState<boolean>(true);
  const [acceptedLoading, setAcceptedLoading] = useState(false);
  const holders = tokenData.dynamicInfo.holders

  useEffect(() => {
    setShowCount(DEFAULT_SHOW_COUNT);
  }, [sectionType]);

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

  return list;
}, [holders, order]);

  useEffect(() => {
    if (!tokenData.mainInfo.isWhitelistEnabled) {
      setAcceptedUsers([]);
      setAcceptedTotal(undefined);
      setAcceptedCursor(0);
      setAcceptedHasMore(false);
      setAcceptedLoading(false);
      return;
    }
    setAcceptedUsers([]);
    setAcceptedTotal(undefined);
    setAcceptedCursor(0);
    setAcceptedHasMore(true);
    setAcceptedLoading(false);
  }, [tokenData.mainInfo.id, tokenData.mainInfo.isWhitelistEnabled]);

  useEffect(() => {
    if (sectionType !== "Accepted") return;
    if (!tokenData.mainInfo.isWhitelistEnabled) return;
    if (acceptedLoading) return;
    if (!acceptedHasMore) return;
    if (acceptedUsers.length >= showCount) return;

    let disposed = false;

    (async () => {
      setAcceptedLoading(true);
      try {
        let nextCursor = acceptedCursor;
        let nextUsers = [...acceptedUsers];
        let nextTotal = acceptedTotal;
        let hasMore: boolean = acceptedHasMore;

        while (!disposed && nextUsers.length < showCount) {
          if (!hasMore) break;
          const result = await getWhitelistUsers({
            premarket_id: tokenData.mainInfo.id,
            cursor: nextCursor,
            limit: ACCEPTED_PAGE_SIZE,
          });

          const pageItems = result.items ?? [];
          nextUsers = [...nextUsers, ...pageItems];
          nextTotal = result.total ?? nextTotal;
          nextCursor += pageItems.length;

          const noNewItems = pageItems.length === 0;
          const reachedTotal = typeof nextTotal === "number" && nextCursor >= nextTotal;
          const lastPage = pageItems.length < ACCEPTED_PAGE_SIZE;
          hasMore = !(noNewItems || reachedTotal || lastPage);
        }

        if (disposed) return;
        setAcceptedUsers(nextUsers);
        setAcceptedTotal(nextTotal);
        setAcceptedCursor(nextCursor);
        setAcceptedHasMore(hasMore);
      } catch (e) {
        if (disposed) return;
        console.warn("[HoldersInfo] failed to fetch accepted whitelist users", e);
        setAcceptedUsers([]);
        setAcceptedTotal(undefined);
        setAcceptedCursor(0);
        setAcceptedHasMore(false);
      } finally {
        if (!disposed) setAcceptedLoading(false);
      }
    })();

    return () => {
      disposed = true;
    };
  }, [
    sectionType,
    tokenData.mainInfo.id,
    tokenData.mainInfo.isWhitelistEnabled,
    showCount,
    acceptedUsers,
    acceptedTotal,
    acceptedCursor,
    acceptedHasMore,
  ]);

  const joinedList = useMemo(() => sortedHolders.slice(0, showCount), [sortedHolders, showCount]);
  const acceptedList = useMemo(() => acceptedUsers.slice(0, showCount), [acceptedUsers, showCount]);
  const isAcceptedSection = sectionType === "Accepted";
  const displayCount = isAcceptedSection
    ? acceptedTotal ?? acceptedUsers.length
    : holdersAmount;
  const canShowMore = !limited && (isAcceptedSection
    ? acceptedHasMore || showCount < displayCount
    : showCount < displayCount);


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
      <View style={{flexDirection: 'row', alignItems: 'center', justifyContent:'space-between', height: 40}}>
        <View style={{flexDirection: 'row', gap: 8}}>
          <Text variant="titleLarge"  selectionColor={colors.onSurface}>People</Text>
          <Text
            variant="titleLarge"
            style={{
              color: colors.onSurfaceVariant,
              fontVariant: ["tabular-nums"],
              minWidth: 44,
              textAlign: "left",
            }}
          >
            {displayCount}
          </Text>
          {tokenData.mainInfo.isWhitelistEnabled && <RevelcySegmentedButtons value={sectionType} onValueChange={setSectionType} buttons={[
          // { value: 'Applied', label: 'Applied', checkedColor: colors.primary, uncheckedColor: colors.onSurfaceVariant},
          { value: 'Accepted', label: 'Accepted', checkedColor: colors.primary, uncheckedColor: colors.onSurfaceVariant},
          { value: 'Joined', label: 'Joined', checkedColor: colors.primary, uncheckedColor: colors.onSurfaceVariant},
        ]} />}
        </View>
        
        {!isAcceptedSection && <OrderMenu value={order} onChange={setOrder}/>}
      </View>
     
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 20, rowGap: 16 }}>
        {!isAcceptedSection && joinedList.map((holder) => {
          const amount = convertLamportToSmallCount(holder.amountSolLamp)
          const percent = convertTokenToPersent(holder.amountTokenDec)
          return (
            <View key={holder.walletAddress} style={{}}>
              <UserCard 
                baseInfo={{
                  userId: holder.id,
                  username: holder.username,
                  walletAddress: holder.walletAddress,
                  avatarUrl: holder.iconURL??null
                }}
                tokenInfo={{
                  userJoined: holder.joinTimestamp,
                  amount: amount,
                  amountProcent: Number(percent.toFixed(2)),
                  isCreator: tokenData.mainInfo.createdByPubkey === holder?.walletAddress
                }}
              />
            </View>
          );
        })}
        {isAcceptedSection && acceptedList.map((user) => {
          const walletAddress = user.wallets?.[0] ?? user.id;
          const displayName = user.username?.trim() ? user.username : shortString(walletAddress, 4);
          const isCreator = user.wallets?.includes(tokenData.mainInfo.createdByPubkey) ?? false;
          return (
            <View key={user.id}>
              <UserCard
                baseInfo={{
                  userId: user.id,
                  username: displayName,
                  walletAddress,
                  avatarUrl: user.avatar_url ?? null,
                }}
                tokenInfo={{
                  isCreator,
                  hideEntryStats: true,
                }}
              />
            </View>
          );
        })}
      </View>
      {canShowMore &&
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
    const fg = active ? colors.primary : colors.onSurface;
    const bg = colors.surfaceContainerHigh;

    return (
      <TouchableRipple
        onPress={() => { onChange(target); close(); }}
        rippleColor="transparent"
        style={[commonItemStyle, { backgroundColor: bg }]}
      >
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: 'flex-start', gap: 4}}>
          <Text variant='labelMedium' prominent style={{ color: fg }}>{label}</Text>
          <SvgIcon name={icon as any} size={16} color={fg} />
        </View>
      </TouchableRipple>
    );
  };

  const currentDef = items[0];
  const anchorFg = colors.primary 
  const anchorBg = visible ? colors.surfaceContainerHigh : "transparent";

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
        justifyContent: "center",
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
      onDismiss={close}
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
