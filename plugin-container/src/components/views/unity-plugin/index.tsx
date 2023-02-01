/** @format */

import { FunctionComponent, useEffect, useState } from 'react';
import { ComponentProps } from '@app/types/component-props';
import styled from 'styled-components';
import { styles } from './unity-plugin.styles';
import { UnityContext } from 'react-unity-webgl';
import { useRouter } from 'next/router';
import { useUnityContainerContext } from '@app/contexts/unity-container-provider';
import { LoadingBar } from '@app/components/molecules/loading-bar';
import { useCogPlugin } from '@app/contexts/cog-plugin-provider';
import { Anchor } from '@app/types/anchor';

// Stop Unity alerting error messages. gg unity
window.alert = () => {};

export interface UnityPluginProps extends ComponentProps {
    unityContext: UnityContext;
    quitUnity: () => Promise<void>;
}

const StyledUnityPlugin = styled('div')`
    ${styles}
`;

const UnityPlugin: FunctionComponent<UnityPluginProps> = (props: UnityPluginProps) => {
    const { ...otherProps } = props;
    const router = useRouter();
    const { isLoading, progress, unityContext, showUnity, hideUnity } = useUnityContainerContext();
    const { broadcastMessage, registerPlugin, dispatchActionEncoded } = useCogPlugin();
    const [account, setAccount] = useState('');
    const [isUnityReady, setIsUnityReady] = useState(false);

    // -- Register plugin
    useEffect(() => {
        registerPlugin(500, 750, Anchor.BottomRight);
    }, []);

    // -- Messages from shell
    useEffect(() => {
        const handleMessage = (message: any) => {
            // console.log(`message: `, message);
            const { method, args } = message.data;
            switch (method) {
                case 'MSG_HELLO_CLICK': {
                    console.log('Unity plugin container received hello click');
                    break;
                }

                case 'ready': {
                    const [account] = args;
                    console.log('Unity container received ready. account: ', account);
                    setAccount(account);
                    break;
                }
            }
        };

        window.addEventListener('message', handleMessage);

        return () => window.removeEventListener('message', handleMessage);
    });

    useEffect(() => {
        if (account && unityContext) {
            console.log('Unity plugin container sending OnReady to Unity');
            unityContext.send('COG', 'OnReady', account);
        }
    }, [account, isUnityReady]);

    useEffect(() => {
        showUnity(unityContext);
    }, [unityContext]);

    // -- Messages from Unity
    useEffect(() => {
        if (!unityContext) {
            return;
        }

        unityContext.on('unityReady', () => {
            setIsUnityReady(true);
        });

        unityContext.on('dispatchActionEncoded', (actionHex: string) => {
            dispatchActionEncoded(actionHex);
        });

        unityContext.on('sceneLoaded', (sceneName: string) => {
            console.log(`plugin container: Received sceneLoaded event. sceneName: ${sceneName}`);
        });

        unityContext.on('testCall', () => {
            console.log(`plugin container: Received testCall event.`);
        });

        return () => {
            unityContext.removeEventListener('sceneLoaded');
            unityContext.removeEventListener('registerWithShell');
            unityContext.removeEventListener('dispatchActionEncoded');
            unityContext.removeEventListener('testCall');
        };
    }, [unityContext]);

    useEffect(() => {
        const handleRouteChangeStart = (url: string) => {
            if (url === router.pathname) {
                return;
            }
            hideUnity(unityContext);
        };

        router.events.on('routeChangeStart', handleRouteChangeStart);
        return () => {
            router.events.off('routeChangeStart', handleRouteChangeStart);
        };
    }, [unityContext]);

    return (
        <StyledUnityPlugin {...otherProps} isLoading={isLoading}>
            {isLoading && <LoadingBar progress={progress} />}
        </StyledUnityPlugin>
    );
};

export default UnityPlugin;
