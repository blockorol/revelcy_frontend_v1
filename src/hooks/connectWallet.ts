import { useWallet } from "@storage/wallet-adapter";

export function getConnectToWallet (): () => Promise<boolean> {
    const { connected, connect, select, wallet} = useWallet();

    return async () => {
        if (connected) {
            return true
        }
        try {
            if (!wallet) {
                if (!select) {
                    console.error('select is not defined after useWallet')
                    return false;
                }
                console.warn('Selecting Phantom...')
                await select('Phantom');
            } else {
                console.error('wallet is defined after useWallet')
            }
            console.log('Connecting to wallet...');
            await connect();
            return true;
        } catch (err) {
            console.warn('Wallet connection failed:', err);
            return false;
        }
    }
};
