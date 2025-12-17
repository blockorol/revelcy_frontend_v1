// app/token/[tokenId].tsx
import { useLocalSearchParams } from 'expo-router';
import TokenPremarketPageById from '@screens/TokenPremarketPage';

const ADDRESS_CONVERTORS: Record<string, string> = {
  mostro: "Ht8uGBziZw9CE4dhv33hUyzUZmznosTmG4M2U81uhXDo",
  secret_beer: "Gs4xGhrH1cfFoE5FPVd6DWtTMsrNENLD5Vg2zyQGbcp",
  sylvan: "iXHUK2U8XPXEDmhGNxZN9Heii3DXe9Wdo2j1JvhmrkD"
}

function resolveTokenId(tokenID: string): string {
  return ADDRESS_CONVERTORS[tokenID] ?? tokenID;
}
export default function TokenPremarketPage() {
  const {premarketId} = useLocalSearchParams();
  const premarketIdValue=Array.isArray(premarketId)?premarketId[0]:premarketId
  const convertedPremarketIdValue = resolveTokenId(premarketIdValue)
  return <TokenPremarketPageById tokenId ={convertedPremarketIdValue} />;
}
