import { createApp } from 'vue';
import App from './App.vue';
import SolanaWallets from 'solana-wallets-vue';
import { WalletMultiButton } from 'solana-wallets-vue';
import 'solana-wallets-vue/styles.css';

import {
    PhantomWalletAdapter,
    SlopeWalletAdapter,
    SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';

const walletOptions = {
    wallets: [
        new PhantomWalletAdapter(),
        new SlopeWalletAdapter(),
        new SolflareWalletAdapter(),
    ],
    autoConnect: true,
}

createApp(App)
    .use(SolanaWallets, walletOptions, WalletMultiButton)
    .mount('#app');
