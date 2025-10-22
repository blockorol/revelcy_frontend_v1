// hooks/useIsMobile.ts
import { useContentArea } from "@hooks/useContentArea";
import { useWindowDimensions } from "react-native"

export const MAX_WIDTH_SIZE = 800;
export const MAX_WIDTH_TWO_CONTAINER_SIZE = 872;
export const MAX_WIDTH_ONE_CONTAINER_SIZE = 480;

export const MAX_WIDTH_MOBILE = 680
const MAX_WIDTH_DESKTOP = 680

export default function useIsMobile(): boolean {
    const { width} = useWindowDimensions();
    return width < MAX_WIDTH_ONE_CONTAINER_SIZE;
}

export function useIsMobileForOneScreenWithDemention(): IsMobileWithDemetionsResp {
    const { width} = useWindowDimensions();
    const {contentHeight} = useContentArea(); 

    return {
        isMobile: width < MAX_WIDTH_ONE_CONTAINER_SIZE,
        width:width,
        height: contentHeight
    };
}

export function useIsMobileForTwoScreen(): boolean {
    const { width} = useWindowDimensions();
    return width < MAX_WIDTH_TWO_CONTAINER_SIZE;
}

export function useIsMobileForTwoScreenWithDemention(): IsMobileWithDemetionsTwoScreenResp {
    const { width } = useWindowDimensions();
    const {contentHeight} = useContentArea(); 
    const isMobile = width < MAX_WIDTH_TWO_CONTAINER_SIZE;
    return {
        maxWidth: isMobile ? MAX_WIDTH_MOBILE : MAX_WIDTH_DESKTOP,
        screen: {
            width: width,
            height:  contentHeight,
        },
        left: {
            width: isMobile?width:400,
            height: isMobile?undefined:contentHeight
        },
        right:  {
            width: isMobile?width:width-400,
            height: isMobile?undefined:contentHeight
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
    const { width} = useWindowDimensions();
    const {contentHeight} = useContentArea(); 
    return {
        isMobile: width < MAX_WIDTH_SIZE,
        width:width,
        height: contentHeight
    };
}
