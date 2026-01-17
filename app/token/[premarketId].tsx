// app/token/[tokenId].tsx
import { useLocalSearchParams } from 'expo-router';
import TokenPremarketPageById from '@screens/TokenPremarketPage';

export default function TokenPremarketPage() {
  const {premarketId} = useLocalSearchParams();
  const premarketIdValue=Array.isArray(premarketId)?premarketId[0]:premarketId
  // should be tokenAddress or short tokenId
  return <TokenPremarketPageById tokenId ={premarketIdValue} />;
}
