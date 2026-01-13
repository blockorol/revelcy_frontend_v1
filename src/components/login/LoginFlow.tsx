// components/LoginPopup.tsx
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, useWindowDimensions} from 'react-native';
import { useTheme, Text } from 'react-native-paper';
import ImageBackgroundOverlay, { Paddings } from '@components/base/container/ImageBackgroundOverlay';
import LoginFirstArea from '@components/login/LoginFirstArea';
import useIsMobile from '@hooks/useIsMobile';
import WalletConnectionChecker from '@components/login/WalletConnectionCheckerArea';
import UserAvatar from '@components/login/UserAvatar';
import { useAuth } from '@providers/AuthContext';
import { setInviteCode, updateAvatar, updateUsername } from '@api/auth';
import UserName from '@components/login/UserName';
import { ExtendedMD3Colors } from '@theme/types';
import InviteCode from '@components/login/InviteCode';

interface LoginFlowProps {
  loginFlowStateOverride?: LoginState;
  inviteCodeOverride?: string
  onCloseButton?: () => void;
}

export enum LoginState {
  FIRST = "FIRST",
  //WALLET_CONNECTING = "WALLET_CONNECTING",
  SET_INVITE_CODE = "SET_INVITE_CODE",
  SET_USER_NAME = "SET_USER_NAME",
  SET_AVATAR = "SET_AVATAR",
}

const WEB_PROP = {
  width: 440,
  height: 680,
  crossingItems: 304
}

const DEF_PADDINGS: Paddings = {
  top: 40,
  left:16,
  right:16,
  bottom: 48,
}

export default function LoginFlow({loginFlowStateOverride, inviteCodeOverride, onCloseButton}:LoginFlowProps) {
  const colors  = useTheme().colors as ExtendedMD3Colors;
  const isMobile = useIsMobile();
  const {height, width} = useWindowDimensions();
  const { login } = useAuth();
  const jwtCurrentRef = useRef("");
  const moveBetweenStateRef = useRef(false);

  
  useEffect(() => {
    return () => {
      if (jwtCurrentRef.current !=="" && !moveBetweenStateRef.current) {
        login(jwtCurrentRef.current);
      }
    };
  }, []);


  const activeProp = isMobile ? {
    width,
    height,
    crossingItems: 40
  } : WEB_PROP


  const [loginFlowState, setLoginFlowState] = useState<LoginState>(loginFlowStateOverride??LoginState.FIRST);

  useEffect(() => {
    if (moveBetweenStateRef.current) {
      moveBetweenStateRef.current = false;
    }
  }, [loginFlowState]);

  let currentArea;
  switch (loginFlowState) {
    case LoginState.FIRST:
       currentArea = (<LoginFirstArea
        height={"100%" }
        width={activeProp.width - DEF_PADDINGS.left - DEF_PADDINGS.right}
        toNext={() => {
          moveBetweenStateRef.current = true
          setLoginFlowState(LoginState.SET_INVITE_CODE)
        }}
        overrideSaveJwt={ (jwt: string, isNewUser: boolean) => {
          jwtCurrentRef.current = jwt
          if (!isNewUser && onCloseButton) {
            onCloseButton()
            return
          }
        }}
        onClose={onCloseButton}
       />)
       break;
    case LoginState.SET_INVITE_CODE:
      currentArea = (<InviteCode 
        height={"100%" }
        width={activeProp.width - DEF_PADDINGS.left - DEF_PADDINGS.right}
        inviteCodeOverride={inviteCodeOverride}
        toNext={() => {          
          moveBetweenStateRef.current = true
          setLoginFlowState(LoginState.SET_AVATAR)
        }}
        setInviteCodeToServer={ async (inviteCode: string) =>{
          try {
            const resp = await setInviteCode({
              inviteCode: inviteCode,
              jwt: jwtCurrentRef.current
            })
            jwtCurrentRef.current = resp.jwt
          } catch {
            return {
              ok: false
            }
          }
          return {
            ok: true
          }
        }}
      />)
      break;
   /* case LoginState.WALLET_CONNECTING:
      currentArea = (<WalletConnectionChecker 
        height={"100%" }
        width={activeProp.width - DEF_PADDINGS.left - DEF_PADDINGS.right}
        toBack={() => {setLoginFlowState(LoginState.FIRST)}}
        toNext={() => {
          setLoginFlowState(LoginState.SET_USER_NAME)
        }}
        jwt={jwtCurrentRef.current}
        overrideSaveJwt={ (jwt: string, isNewUser: boolean) => {
          jwtCurrentRef.current = jwt
          if (!isNewUser && onCloseButton) {
            onCloseButton()
            return
          }
        }}
        walletConnectionDate={undefined}
        humanity={undefined}
        balance={undefined}
       />)
       break;
    */
    case LoginState.SET_USER_NAME:
      currentArea = (<UserName 
        height={"100%" }
        width={activeProp.width - DEF_PADDINGS.left - DEF_PADDINGS.right}
        toNext={() => {          
          moveBetweenStateRef.current = true
          setLoginFlowState(LoginState.SET_AVATAR)
        }}
        setUsernameToServer={ async (username: string) =>{
          try {
            const resp = await updateUsername({
              username: username,
              jwt: jwtCurrentRef.current
            })
            jwtCurrentRef.current = resp.jwt
          } catch {
            return {
              ok: false
            }
          }
          return {
            ok: true
          }
        }}
      />)
      break;
    case LoginState.SET_AVATAR:
      currentArea = (<UserAvatar 
        height={"100%" }
        width={activeProp.width - DEF_PADDINGS.left - DEF_PADDINGS.right}
        toNext={() => {
          login(jwtCurrentRef.current);
        }}
        setUploadAvatarToServer={async (avatarUri: string) => {
          try {
            const response = await fetch(avatarUri);
            const blob = await response.blob();
      
            const file = new File([blob], 'avatar.png', { type: blob.type });
      
            const resp = await updateAvatar({file:file, jwt:jwtCurrentRef.current});
            jwtCurrentRef.current=resp.jwt
            
          } catch (err) {
            console.error(err);
          }
        }}
      />);
      break;
    default:
      currentArea =  <Text>Invalid login state {loginFlowState}</Text>; // <- защита от undefined
  }

  return (
    <ImageBackgroundOverlay
      width={activeProp.width}
      height={activeProp.height}
      crossingItems={activeProp.crossingItems}
      image={require('@assets/background_faces_with_revelcy.png')}
      backgroundColor={colors.surfaceContainerLow}
      paddings={DEF_PADDINGS} 
    >
      {currentArea}
  </ImageBackgroundOverlay>
  );
}

const styles = StyleSheet.create({
});