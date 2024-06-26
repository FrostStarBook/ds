import DownstreamLogo from '@app/assets/downstream-logo-dark.svg';
import { useConfig } from '@app/hooks/use-config';
import { GameStateProvider, usePlayer } from '@app/hooks/use-game-state';
import { SessionProvider, useSession } from '@app/hooks/use-session';
import { WalletProviderProvider, useWalletProvider } from '@app/hooks/use-wallet-provider';
import { TextButton } from '@app/styles/button.styles';
import { GameConfig } from '@downstream/core';
import Image from 'next/image';
import { useEffect } from 'react';

const AUTH_PORT = 7947;

const Login = ({}: { config: Partial<GameConfig> | undefined }) => {
    const { connectMetamask } = useWalletProvider();
    const player = usePlayer();
    const { session } = useSession();

    useEffect(() => {
        if (!session) {
            return;
        }
        if (!player) {
            return;
        }
        const auth = btoa(JSON.stringify(session));
        window.location.href = `http://localhost:${AUTH_PORT}/session/${auth}`;
    }, [session, player]);

    return (
        <div className="page" style={{ margin: '0 auto', width: 200 }}>
            <Image src={DownstreamLogo} alt="Downstream Logo" className="logo" width={200} />
            <p>Authenticate by signing in to Downstream with your wallet.</p>
            {(!session || !player) && <TextButton onClick={connectMetamask}>CONNECT</TextButton>}
        </div>
    );
};

export default function IndexPage() {
    const config = useConfig();

    return (
        <WalletProviderProvider config={config}>
            <GameStateProvider config={config}>
                <SessionProvider>
                    <Login config={config} />
                </SessionProvider>
            </GameStateProvider>
        </WalletProviderProvider>
    );
}
