// hooks/useIsMobile.ts
import { useWindowDimensions } from "react-native"

export const MAX_WIDTH_SIZE = 800;
export const MAX_WIDTH_TWO_CONTAINER_SIZE = 872;
export const MAX_WIDTH_ONE_CONTAINER_SIZE = 480;

export const MAX_WIDTH_MOBILE = 680
const MAX_WIDTH_DESKTOP = 680

const MOBILE_MENU_HEIGHT = 24

export default function useIsMobile(): boolean {
    const { width, scale} = useWindowDimensions();
    // console.log(`useIsMobile: width= ${width}, scale= ${scale}`)
    return width < MAX_WIDTH_ONE_CONTAINER_SIZE;
}

export function useIsMobileForOneScreenWithDemention(): IsMobileWithDemetionsResp {
    const { width, height} = useWindowDimensions();

    return {
        isMobile: width < MAX_WIDTH_ONE_CONTAINER_SIZE,
        width:width,
        height: height
    };
}

export function useIsMobileForTwoScreen(): boolean {
    const { width} = useWindowDimensions();
    return width < MAX_WIDTH_TWO_CONTAINER_SIZE;
}

export function useIsMobileForTwoScreenWithDemention(): IsMobileWithDemetionsTwoScreenResp {
    const { width, height } = useWindowDimensions();
    const possibleHeight = height-MOBILE_MENU_HEIGHT;
    const isMobile = width < MAX_WIDTH_TWO_CONTAINER_SIZE;
    return {
        maxWidth: isMobile ? MAX_WIDTH_MOBILE : MAX_WIDTH_DESKTOP,
        screen: {
            width: width,
            height:  possibleHeight >0 ? possibleHeight:0,
        },
        left: {
            width: isMobile?width:400,
            height: isMobile?undefined:height
        },
        right:  {
            width: isMobile?width:width-400,
            height: isMobile?undefined:height
        },
        isMobile: isMobile
    }
}

interface IsMobileWithDemetionsTwoScreenResp {
    isMobile: boolean;
    maxWidth: number;
    screen: {
        width: number;
        height: number;
    };
    left: {
        width: number;
        height?: number;
    };
    right: {
        width: number;
        height?: number;
    };
}

interface IsMobileWithDemetionsResp {
    isMobile: boolean;
    width: number;
    height: number;
}

export function useIsMobileWithDemention(): IsMobileWithDemetionsResp {
    const { width, height} = useWindowDimensions();
    return {
        isMobile: width < MAX_WIDTH_SIZE,
        width:width,
        height: height
    };
}
