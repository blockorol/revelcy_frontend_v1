// app/token/[tokenId].tsx
import { useLocalSearchParams } from 'expo-router';
import TokenPremarketPageById from '@screens/TokenPremarketPage';

const ADDRESS_CONVERTORS: Record<string, string> = {
  mostro: "Ht8uGBziZw9CE4dhv33hUyzUZmznosTmG4M2U81uhXDo",
  beer: "5J644u4QgS69SYSu7Cd1UdSPqBqp2U754ZosMRyKsfS"
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
