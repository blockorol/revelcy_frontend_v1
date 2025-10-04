import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

interface Holder {
  iconURL?: string;
}

const DEFAULT_AVATAR = require('@assets/avatar-placeholder.png');

interface AvatarGroupProps {
  holders: Holder[];
  maxAvatars?: number;
  size?: number;
  showDefaultAvatar?: boolean;
  defaultAvatarSource?: typeof DEFAULT_AVATAR;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  holders,
  maxAvatars = 3,
  size = 20,
  showDefaultAvatar = true,
  defaultAvatarSource = DEFAULT_AVATAR,
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
  const borderWidth = 1;

  return (
    <View style={styles.avatarGroup}>
      {allHolders.length > 0 ? (
        allHolders.map((holder, index) => (
          <View
            key={holder.iconURL || `default-${index}`}
            style={[
              styles.avatarCircle,
              {
                width: avatarSize,
                height: avatarSize,
                borderRadius: avatarSize / 2,
                backgroundColor: theme.colors.surfaceVariant,
                marginLeft: index === 0 ? 0 : -10,
                zIndex: index + 1,
                borderColor: theme.colors.onPrimary,
                borderWidth: borderWidth,
              },
            ]}
          >
            <Image
              source={holder.iconURL ? { uri: holder.iconURL } : defaultAvatarSource}
              style={styles.avatarImage}
            />
          </View>
        ))
      ) : showDefaultAvatar ? (
        // Show default avatar if no holders at all
        <View
          style={[
            styles.avatarCircle,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
              backgroundColor: theme.colors.surfaceVariant,
              borderColor: theme.colors.onPrimary,
              borderWidth: borderWidth,
            },
          ]}
        >
          <Image
            source={defaultAvatarSource}
            style={styles.avatarImage}
          />
        </View>
      ) : null}
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
