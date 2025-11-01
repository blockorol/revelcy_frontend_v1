import React from 'react';
import { View, Pressable } from 'react-native';
import { Text, useTheme, Surface, IconButton, Portal, Modal } from 'react-native-paper';
import { SvgIcon } from '@components/base/SvgIcon';

interface QuestionMarkModalProps {
  visible: boolean;
  onClose: () => void;
}

export const QuestionMarkModal: React.FC<QuestionMarkModalProps> = ({
  visible,
  onClose,
}) => {
  const { colors } = useTheme();

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={{
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
        }}
      >
        <Pressable
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
          }}
          onPress={onClose}
        />
        <Pressable onPress={(e) => e.stopPropagation()}>
          <Surface
            style={{
              backgroundColor: '#1A1A1A',
              borderRadius: 16,
              padding: 24,
              margin: 20,
              maxWidth: 400,
              width: '90%',
              elevation: 4,
            }}
          >
        {/* Header */}
        <View
          style={{
            alignItems: 'center',
            marginBottom: 32,
            position: 'relative',
          }}
        >
          {/* Close button */}
          <IconButton
            icon="close"
            size={20}
            onPress={onClose}
            iconColor="#FFFFFF"
            style={{
              position: 'absolute',
              top: -8,
              right: -8,
            }}
          />
          
          {/* Revelcy Logo */}
          <View
            style={{
              backgroundColor: '#00FF88',
              paddingHorizontal: 16,
              paddingVertical: 6,
              borderRadius: 20,
              marginBottom: 16,
            }}
          >
            <Text style={{ color: '#000000', fontWeight: 'bold', fontSize: 16 }}>
              Revelcy
            </Text>
          </View>
          
          {/* Main Title */}
          <Text 
            variant="headlineMedium" 
            style={{ 
              color: '#FFFFFF', 
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: 8,
            }}
          >
            Premarkets for Pumpfun
          </Text>
          
          {/* Subtitle */}
          <Text 
            variant="titleMedium" 
            style={{ 
              color: '#00FF88', 
              textAlign: 'center',
              fontWeight: '600',
            }}
          >
            Buy before launch. Build strong community.
          </Text>
        </View>

        {/* Steps */}
        <View style={{ gap: 24 }}>
          {/* Step 1 */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 16 }}>
            <View
              style={{
                backgroundColor: '#00FF88',
                width: 32,
                height: 32,
                borderRadius: 16,
                justifyContent: 'center',
                alignItems: 'center',
                flexShrink: 0,
              }}
            >
              <Text style={{ color: '#000000', fontWeight: 'bold', fontSize: 16 }}>
                1
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text 
                variant="titleMedium" 
                style={{ 
                  color: '#FFFFFF', 
                  fontWeight: 'bold',
                  marginBottom: 4,
                }}
              >
                Create or find a Token Premarket
              </Text>
            </View>
          </View>

          {/* Step 2 */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 16 }}>
            <View
              style={{
                backgroundColor: '#00FF88',
                width: 32,
                height: 32,
                borderRadius: 16,
                justifyContent: 'center',
                alignItems: 'center',
                flexShrink: 0,
              }}
            >
              <Text style={{ color: '#000000', fontWeight: 'bold', fontSize: 16 }}>
                2
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text 
                variant="titleMedium" 
                style={{ 
                  color: '#FFFFFF', 
                  fontWeight: 'bold',
                  marginBottom: 4,
                }}
              >
                Book your place on bonding curve
              </Text>
              <Text 
                variant="bodyMedium" 
                style={{ 
                  color: '#B0B0B0', 
                  lineHeight: 20,
                }}
              >
                You can leave any time, but you will lose your spot and others will get a better price
              </Text>
            </View>
          </View>

          {/* Step 3 */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 16 }}>
            <View
              style={{
                backgroundColor: '#00FF88',
                width: 32,
                height: 32,
                borderRadius: 16,
                justifyContent: 'center',
                alignItems: 'center',
                flexShrink: 0,
              }}
            >
              <Text style={{ color: '#000000', fontWeight: 'bold', fontSize: 16 }}>
                3
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text 
                variant="titleMedium" 
                style={{ 
                  color: '#FFFFFF', 
                  fontWeight: 'bold',
                  marginBottom: 4,
                }}
              >
                Congrats! You are now the insider
              </Text>
              <Text 
                variant="bodyMedium" 
                style={{ 
                  color: '#B0B0B0', 
                  lineHeight: 20,
                }}
              >
                Join Token Community and contribute Achieve premarket goal together
              </Text>
            </View>
          </View>

          {/* Step 4 */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 16 }}>
            <View
              style={{
                backgroundColor: '#00FF88',
                width: 32,
                height: 32,
                borderRadius: 16,
                justifyContent: 'center',
                alignItems: 'center',
                flexShrink: 0,
              }}
            >
              <Text style={{ color: '#000000', fontWeight: 'bold', fontSize: 16 }}>
                4
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text 
                variant="titleMedium" 
                style={{ 
                  color: '#FFFFFF', 
                  fontWeight: 'bold',
                  marginBottom: 4,
                }}
              >
                Token goes live on Pumpfun
              </Text>
              <Text 
                variant="bodyMedium" 
                style={{ 
                  color: '#B0B0B0', 
                  lineHeight: 20,
                }}
              >
                Everyone receives their tokens If goal is not achieved, you will get a refund
              </Text>
            </View>
          </View>
        </View>
          </Surface>
        </Pressable>
      </Modal>
    </Portal>
  );
};
