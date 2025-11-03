import { useWallet } from "@storage/wallet-adapter";

export function getConnectToWallet (): () => Promise<boolean> {
    const { connected, connect} = useWallet();

    return async () => {
        if (connected) {
            return true
        }
        try {
            console.log('Connecting to wallet...');
            await connect();
            return true;
        } catch (err) {
            console.warn('Wallet connection failed:', err);
            return false;
        }
    }
};
