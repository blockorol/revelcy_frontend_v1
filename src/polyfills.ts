import 'react-native-get-random-values';
import { Buffer } from 'buffer';
import { DEV_MODE } from '../env';

global.Buffer = Buffer;

// Initialize Eruda for mobile debugging when DEV_MODE is enabled
if (typeof window !== 'undefined' && DEV_MODE) {
    // @ts-ignore
    import('eruda').then((eruda) => {
        eruda.default.init();
        console.log('[Eruda] Mobile debugging console initialized');
    }).catch((err) => {
        console.error('[Eruda] Failed to initialize:', err);
    });
}
