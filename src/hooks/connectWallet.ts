import { useWallet } from "@storage/wallet-adapter";

export function getConnectToWallet(): () => Promise<boolean> {
    const { connected, connect } = useWallet();

    const connectFn = async (): Promise<boolean> => {
        if (connected) {
            return true;
        }
        try {
            console.log('Connecting to wallet...');
            const result = await connect();
            return result === undefined ? true : (result as boolean);
        } catch (err) {
            console.warn('Wallet connection failed:', err);
            return false;
        }
    };

    return connectFn;
};
