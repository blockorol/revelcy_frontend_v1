// ExampleTokenPremarketPageNormal.tsx
import React, { createContext, useContext, useMemo, useState } from "react";
import { View, Pressable, ScrollView } from "react-native";
import { Card, Text, TextInput, Button } from "react-native-paper";
import { UniversalOverlayProvider, useOverlay } from "@storage/UniversalOverlayProvider";
import { useIsMobileForTwoScreenWithDemention } from "@hooks/useIsMobile";
import type {
  TokenInfo,
  TokenMainInfo,
  TokenCommunityInfo,
  TokenDynamicInfo,
  HoldersInfo,
} from "@api/token";
import BN from "bn.js";
import { PublicKey } from "@solana/web3.js";
import { TokenPremarketPageNormal, TokenPremarketPageMobile } from "screens/TokenPremarketPage";

// ─────────────────────────────────────────────────────────────
// Вариант 1: локально оборачиваем UniversalOverlayProvider
// ─────────────────────────────────────────────────────────────

// ---------- Provider для моков ----------
interface MockTokenCtx {
  token: TokenInfo;
  setToken: React.Dispatch<React.SetStateAction<TokenInfo>>;
}
const MockTokenContext = createContext<MockTokenCtx | null>(null);
const useMockToken = () => {
  const ctx = useContext(MockTokenContext);
  if (!ctx) throw new Error("useMockToken must be used within <MockTokenProvider>");
  return ctx;
};

const nowSec = Math.floor(Date.now() / 1000);
const oneDay = 86400;

// вспомогательный валидный ключ для предзаполнения
const pkFromByte = (v: number) => new PublicKey(new Uint8Array(32).fill(v));

function makeInitialMockToken(): TokenInfo {
  const holders: HoldersInfo[] = Array.from({ length: 5 }).map((_, i) => ({
    id: `user_${i + 1}`,
    // адреса холдеров — просто строки, НЕ base58
    walletAddress: `holder_wallet_${i + 1}`,
    joinTimestamp: nowSec - (i + 1) * (oneDay / 2),
    amountTokenDec: new BN(1 * 1e9 * (i + 1)),
    amountSolLamp: new BN(1 * 1e9 * (i + 1)),
    iconURL: i===4?"https://picsum.photos/seed/forest/512":undefined,
    username: `user_${i + 1}`,
  }));

  const mainInfo: TokenMainInfo = {
    id: "demo-token-1",
    premarketPubkey: pkFromByte(123),
    name: "Forest Friends",
    description: "A cozy community token to fund a family-friendly museum quest.",
    symbol: "FOREST",
    imageURL: "https://picsum.photos/seed/forest/512",
    ipfsURI: "ipfs://bafybeigdyrzt4demoexample",
    links: { telegram: "https://t.me/forestfriends", twitter: "https://x.com/forestfriends" },
    premarketGoalSolLamp: new BN(500 * 1e9),
    premarketDeadline: nowSec + 7 * oneDay,
    premarketCreated: nowSec - oneDay,
    createdByPubkey: "holder_wallet_1",
    state: 'premarket',
    finishDate: undefined,
    isExtended: false,
    tokenMint: undefined
  };

  const communityInfo: TokenCommunityInfo = {
    description: "Join the Forest Friends to unlock interactive museum tours and family quests.Join the Forest Friends to unlock interactive museum tours and family quests.Join the Forest Friends to unlock interactive museum tours and family quests.Join the Forest Friends to unlock interactive museum tours and family quests.",
    tokenBannerURL: "https://picsum.photos/seed/forestbanner/1200/300",
    links: [
      { text: "Telegram Join to us 01234", url: "https://t.me/forestfriends", type: "tg" },
      { text: "X / Twitter", url: "https://x.com/forestfriends", type: "x" },
      { text: "Website", url: "https://forestfriends.example", type: "other" },
    ],
  };

  const dynamicInfo: TokenDynamicInfo = {
    holdersCount: holders.length,
    holders,
    currentPriceLamp: Math.floor(0.12 * 1e9),
    marketCapTokenDec: new BN(1_000_000),
    marketCapSolLamp: new BN(120 * 1e1),
    reservedTokenLamp: new BN(200_000),
    reservedSolLamp: new BN(1_234 * 1e9),
    change24h: 5.4,
  };

  return { mainInfo, communityInfo, dynamicInfo };
}

const MockTokenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<TokenInfo>(makeInitialMockToken());
  const value = useMemo(() => ({ token, setToken }), [token]);
  return <MockTokenContext.Provider value={value}>{children}</MockTokenContext.Provider>;
};

// ---------- Модалка для правки ВСЕХ полей ----------
const MockDataModal: React.FC = () => {
  const { token, setToken } = useMockToken();
  const { close } = useOverlay();

  // mainInfo
  const [id, setId] = useState(token.mainInfo.id);
  const [premarketPubkeyStr, setPremarketPubkeyStr] = useState(token.mainInfo.premarketPubkey.toBase58());
  const [name, setName] = useState(token.mainInfo.name);
  const [description, setDescription] = useState(token.mainInfo.description);
  const [symbol, setSymbol] = useState(token.mainInfo.symbol);
  const [imageURL, setImageURL] = useState(token.mainInfo.imageURL ?? "");
  const [ipfsURI, setIpfsURI] = useState(token.mainInfo.ipfsURI);
  const [linksTelegram, setLinksTelegram] = useState(token.mainInfo.links.telegram ?? "");
  const [linksTwitter, setLinksTwitter] = useState(token.mainInfo.links.twitter ?? "");
  const [linksWebsite, setLinksWebsite] = useState(token.mainInfo.links.webSite ?? "");
  const [goalSolLamp, setGoalSolLamp] = useState(token.mainInfo.premarketGoalSolLamp.toString());
  const [deadline, setDeadline] = useState(String(token.mainInfo.premarketDeadline)); // epoch sec
  const [createdTs, setCreatedTs] = useState(String(token.mainInfo.premarketCreated)); // epoch sec
  const [createdByPubkey, setCreatedByPubkey] = useState(token.mainInfo.createdByPubkey);
  const [stateStr, setStateStr] = useState(String(token.mainInfo.state as any));

  // communityInfo
  const [commDescription, setCommDescription] = useState(token.communityInfo.description);
  const [commBanner, setCommBanner] = useState(token.communityInfo.tokenBannerURL ?? "");
  const [commLinks, setCommLinks] = useState<TokenCommunityInfo["links"]>(token.communityInfo.links ?? []);

  // dynamicInfo
  const [currentPriceLamp, setCurrentPriceLamp] = useState(String(token.dynamicInfo.currentPriceLamp));
  const [marketCapTokenDec, setMarketCapTokenDec] = useState(token.dynamicInfo.marketCapTokenDec.toString());
  const [marketCapSolLamp, setMarketCapSolLamp] = useState(token.dynamicInfo.marketCapSolLamp.toString());
  const [reservedTokenLamp, setReservedTokenLamp] = useState(token.dynamicInfo.reservedTokenLamp.toString());
  const [reservedSolLamp, setReservedSolLamp] = useState(token.dynamicInfo.reservedSolLamp.toString());
  const [change24h, setChange24h] = useState(String(token.dynamicInfo.change24h));
  const holders = token.dynamicInfo.holders;

  const addCommLink = () => {
    const next = [...(commLinks ?? []), { text: "", url: "", type: "other" as const }];
    setCommLinks(next);
  };
  const updateCommLink = (i: number, field: "text" | "url" | "type", value: string) => {
    const next = [...(commLinks ?? [])];
    const item = { ...(next[i] ?? { text: "", url: "", type: "other" as const }) };
    if (field === "type" && !["x", "tg", "other"].includes(value)) return;
    (item as any)[field] = value;
    next[i] = item;
    setCommLinks(next);
  };
  const removeCommLink = (i: number) => {
    const next = [...(commLinks ?? [])];
    next.splice(i, 1);
    setCommLinks(next);
  };

  const apply = () => {
    // без шума пытаемся распарсить pubkey, иначе оставим старый
    let nextPremarketPk = token.mainInfo.premarketPubkey;
    try {
      if (premarketPubkeyStr && premarketPubkeyStr.trim().length > 0) {
        nextPremarketPk = new PublicKey(premarketPubkeyStr.trim());
      }
    } catch {
      // невалидный base58 -> оставим прежний
    }

    setToken(prev => {
      const nextMainInfo: TokenMainInfo = {
        ...prev.mainInfo,
        id,
        premarketPubkey: nextPremarketPk,
        name,
        description,
        symbol,
        imageURL: imageURL || undefined,
        ipfsURI,
        links: { telegram: linksTelegram || undefined, twitter: linksTwitter || undefined, webSite: linksWebsite || undefined },
        premarketGoalSolLamp: safeBN(goalSolLamp),
        premarketDeadline: Number(deadline) || 0,
        premarketCreated: Number(createdTs) || 0,
        createdByPubkey,
        state: stateStr as any,
      };

      const nextCommunityInfo: TokenCommunityInfo = {
        description: commDescription,
        tokenBannerURL: commBanner || undefined,
        links: (commLinks ?? []).map(l => ({
          text: l.text ?? "",
          url: l.url ?? "",
          type: (["x", "tg", "other"].includes((l as any).type) ? (l as any).type : "other") as "x" | "tg" | "other",
        })),
      };

      const nextDynamicInfo: TokenDynamicInfo = {
        holdersCount: holders.length,
        holders: holders.map(h => ({
          ...h,
          amountSolLamp: BN.isBN(h.amountSolLamp) ? h.amountSolLamp : safeBN(String(h.amountSolLamp ?? "0")),
          joinTimestamp: Number(h.joinTimestamp) || 0,
          iconURL: h.iconURL || undefined,
        })),
        currentPriceLamp: Number(currentPriceLamp) || 0,
        marketCapTokenDec: safeBN(marketCapTokenDec),
        marketCapSolLamp: safeBN(marketCapSolLamp),
        reservedTokenLamp: safeBN(reservedTokenLamp),
        reservedSolLamp: safeBN(reservedSolLamp),
        change24h: Number(change24h) || 0,
      };

      const nextToken: TokenInfo = {
        mainInfo: nextMainInfo,
        communityInfo: nextCommunityInfo,
        dynamicInfo: nextDynamicInfo,
      };

      return nextToken;
    });

    close();
  };

  return (
    <Card style={{ maxWidth: 920, width: "96%", paddingVertical: 12 }}>
      <Card.Title title="Edit mock TokenInfo (all fields)" />
      <Card.Content>
        <ScrollView style={{ maxHeight: 600 }}>

          {/* MAIN INFO */}
          <Text style={{ marginTop: 8, marginBottom: 6, fontWeight: "600" }}>Main Info</Text>
          <TextInput label="id" mode="outlined" value={id} onChangeText={setId} style={{ marginBottom: 8 }} />
          <TextInput
            label="premarketPubkey (base58)"
            mode="outlined"
            value={premarketPubkeyStr}
            onChangeText={setPremarketPubkeyStr}
            style={{ marginBottom: 8 }}
          />
          <TextInput label="name" mode="outlined" value={name} onChangeText={setName} style={{ marginBottom: 8 }} />
          <TextInput label="description" mode="outlined" multiline value={description} onChangeText={setDescription} style={{ marginBottom: 8 }} />
          <TextInput label="symbol" mode="outlined" value={symbol} onChangeText={setSymbol} style={{ marginBottom: 8 }} />
          <TextInput label="imageURL" mode="outlined" value={imageURL} onChangeText={setImageURL} style={{ marginBottom: 8 }} />
          <TextInput label="ipfsURI" mode="outlined" value={ipfsURI} onChangeText={setIpfsURI} style={{ marginBottom: 8 }} />
          <TextInput label="links.telegram" mode="outlined" value={linksTelegram} onChangeText={setLinksTelegram} style={{ marginBottom: 8 }} />
          <TextInput label="links.twitter" mode="outlined" value={linksTwitter} onChangeText={setLinksTwitter} style={{ marginBottom: 8 }} />
          <TextInput label="links.webSite" mode="outlined" value={linksWebsite} onChangeText={setLinksWebsite} style={{ marginBottom: 8 }} />
          <TextInput label="premarketGoalSolLamp (BN, integer string)" mode="outlined" value={goalSolLamp} onChangeText={setGoalSolLamp} keyboardType="numeric" style={{ marginBottom: 8 }} />
          <TextInput label="premarketDeadline (epoch sec)" mode="outlined" value={deadline} onChangeText={setDeadline} keyboardType="numeric" style={{ marginBottom: 8 }} />
          <TextInput label="premarketCreated (epoch sec)" mode="outlined" value={createdTs} onChangeText={setCreatedTs} keyboardType="numeric" style={{ marginBottom: 8 }} />
          <TextInput label="createdByPubkey (string)" mode="outlined" value={createdByPubkey} onChangeText={setCreatedByPubkey} style={{ marginBottom: 8 }} />
          <TextInput label="state (string/enum)" mode="outlined" value={stateStr} onChangeText={setStateStr} style={{ marginBottom: 12 }} />

          {/* COMMUNITY INFO */}
          <Text style={{ marginTop: 12, marginBottom: 6, fontWeight: "600" }}>Community Info</Text>
          <TextInput label="description" mode="outlined" multiline value={commDescription} onChangeText={setCommDescription} style={{ marginBottom: 8 }} />
          <TextInput label="tokenBannerURL" mode="outlined" value={commBanner} onChangeText={setCommBanner} style={{ marginBottom: 8 }} />

          <View style={{ gap: 8 }}>
            {(commLinks ?? []).map((l, i) => (
              <View key={`cl-${i}`} style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 8 }}>
                <Text style={{ marginBottom: 6, fontWeight: "600" }}>Link #{i + 1}</Text>
                <TextInput label="text" mode="outlined" value={l.text} onChangeText={(v) => updateCommLink(i, "text", v)} style={{ marginBottom: 8 }} />
                <TextInput label="url" mode="outlined" value={l.url} onChangeText={(v) => updateCommLink(i, "url", v)} style={{ marginBottom: 8 }} />
                <TextInput
                  label="type (tg | x | other)"
                  mode="outlined"
                  value={l.type}
                  onChangeText={(v) => updateCommLink(i, "type", v)}
                  style={{ marginBottom: 8 }}
                />
                <Button mode="outlined" onPress={() => removeCommLink(i)}>Remove link</Button>
              </View>
            ))}
            <Button mode="contained" onPress={addCommLink}>Add link</Button>
          </View>

          {/* DYNAMIC INFO */}
          <Text style={{ marginTop: 12, marginBottom: 6, fontWeight: "600" }}>Dynamic Info</Text>
          <TextInput label="currentPriceLamp (number)" mode="outlined" value={currentPriceLamp} onChangeText={setCurrentPriceLamp} keyboardType="numeric" style={{ marginBottom: 8 }} />
          <TextInput label="marketCapTokenDec (BN, integer string)" mode="outlined" value={marketCapTokenDec} onChangeText={setMarketCapTokenDec} keyboardType="numeric" style={{ marginBottom: 8 }} />
          <TextInput label="marketCapSolLamp (BN, integer string)" mode="outlined" value={marketCapSolLamp} onChangeText={setMarketCapSolLamp} keyboardType="numeric" style={{ marginBottom: 8 }} />
          <TextInput label="reservedTokenLamp (BN, integer string)" mode="outlined" value={reservedTokenLamp} onChangeText={setReservedTokenLamp} keyboardType="numeric" style={{ marginBottom: 8 }} />
          <TextInput label="reservedSolLamp (BN, integer string)" mode="outlined" value={reservedSolLamp} onChangeText={setReservedSolLamp} keyboardType="numeric" style={{ marginBottom: 8 }} />
          <TextInput label="change24h (%)" mode="outlined" value={change24h} onChangeText={setChange24h} keyboardType="numeric" style={{ marginBottom: 12 }} />


        </ScrollView>
      </Card.Content>

      <Card.Actions style={{ justifyContent: "flex-end", paddingHorizontal: 16 }}>
        <Button onPress={close}>Cancel</Button>
        <Button mode="contained" onPress={apply}>Apply</Button>
      </Card.Actions>
    </Card>
  );
};

function safeBN(s: string): BN {
  try {
    return new BN(String(s || "0"));
  } catch {
    return new BN(0);
  }
}

// ---------- Кнопка вызова модалки (полупрозрачная поверх) ----------
const MockFloatingOverlayButton: React.FC = () => {
  const { open } = useOverlay();
  return (
    <Pressable
      onPress={() => open(<MockDataModal />)}
      style={{
        position: "absolute",
        top: 16,
        right: 16,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 999,
        backgroundColor: "rgba(0,0,0,0.35)",
      }}
      accessibilityLabel="Open mock data modal"
    >
      <Text style={{ color: "white", fontWeight: "600" }}>Mock data</Text>
    </Pressable>
  );
};

// ---------- Внутренняя часть ----------
const Inner: React.FC = () => {
  const { token } = useMockToken();
  const { isMobile, left, right, screen } = useIsMobileForTwoScreenWithDemention();

  return (
    <View style={{ flex: 1, position: "relative", minHeight: screen.height }}>

    {isMobile ?
        (<TokenPremarketPageMobile
            token={token}
            refetchTokenInfo={async ()=>{}}
            screenDem={screen}
            />)
        :(<TokenPremarketPageNormal
            token={token}
            refetchTokenInfo={async ()=>{}}
            rigth={right}
            left={left}
            screenDem={screen}
            />)}
  <MockFloatingOverlayButton />
    </View>
  );
};

// ---------- Экспортируемая страница ----------
export default function ExampleTokenPremarketPageNormal() {
  return (
    <MockTokenProvider>
      {/* Локально «затеняем» глобальный Overlay */}
      <UniversalOverlayProvider>
        <Inner />
      </UniversalOverlayProvider>
    </MockTokenProvider>
  );
}
