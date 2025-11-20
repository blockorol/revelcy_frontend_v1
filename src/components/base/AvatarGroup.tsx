import { Avatar } from '@components/ui/Avatar';
import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

interface Holder {
  walletAddress: string
  iconURL?: string;
}

interface AvatarGroupProps {
  holders: Holder[];
  maxAvatars?: number;
  size?: number;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  holders,
  maxAvatars = 3,
  size = 20,
}) => {
  const theme = useTheme();
  
  // Take up to maxAvatars holders, prioritizing those with iconURLs
  const validHolders = holders
    .filter((holder) => holder.iconURL !== undefined)
    .slice(0, maxAvatars);
  
  // If we don't have enough holders with iconURLs, fill with holders without iconURLs
  const remainingSlots = maxAvatars - validHolders.length;
  const additionalHolders = holders
    .filter((holder) => holder.iconURL === undefined)
    .slice(0, remainingSlots);
  
  const allHolders = [...validHolders, ...additionalHolders];

  const avatarSize = size;

  // Don't render anything if no holders
  if (allHolders.length === 0) {
    return null;
  }

  return (
    <View style={styles.avatarGroup}>
      {allHolders.map((holder, index) => (
        <View
          key={holder.walletAddress}
          style={[
            styles.avatarCircle,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
              backgroundColor: theme.colors.surfaceVariant,
              marginLeft: index === 0 ? 0 : -10,
              zIndex: index + 1,
            },
          ]}
        >
          <Avatar size={avatarSize} source={holder.iconURL} walletAddress={holder.walletAddress} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  avatarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
  },
  avatarCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});
