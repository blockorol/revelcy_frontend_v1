// app/token/[tokenId].tsx
import { useLocalSearchParams } from 'expo-router';
import TokenPremarketPageById from '@screens/TokenPremarketPage';

// todo: remove me, it's only for safe the name, should be moved to DB
const ADDRESS_CONVERTORS: Record<string, string> = {
  mostro: "Ht8uGBziZw9CE4dhv33hUyzUZmznosTmG4M2U81uhXDo",
  secret_beer: "Gs4xGhrH1cfFoE5FPVd6DWtTMsrNENLD5Vg2zyQGbcp",
  sylvan: "iXHUK2U8XPXEDmhGNxZN9Heii3DXe9Wdo2j1JvhmrkD"
}

export default function TokenPremarketPage() {
  const {premarketId} = useLocalSearchParams();
  const premarketIdValue=Array.isArray(premarketId)?premarketId[0]:premarketId
  // should be tokenAddress or short tokenId
  return <TokenPremarketPageById tokenId ={premarketIdValue} />;
}
