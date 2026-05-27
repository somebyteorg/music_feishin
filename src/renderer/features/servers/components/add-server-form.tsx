import { closeAllModals } from '@mantine/modals';
import { useEffect, useState } from 'react';

import { useAuthStoreActions } from '/@/renderer/store';
import { Button } from '/@/shared/components/button/button';
import { Stack } from '/@/shared/components/stack/stack';
import { toast } from '/@/shared/components/toast/toast';
import { ServerListItemWithCredential } from '/@/shared/types/domain-types';
import { ServerType } from '/@/shared/types/types';

const EMOS_MUSIC_LINK_UUID = 'c7733ece-c263-4371-97d2-217bdef136ee',
    EMOS_MUSIC_NAME = '跃律',
    EMOS_MUSIC_URL = 'https://music.emos.best';

export const AddServerForm = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { addServer, setCurrentServer } = useAuthStoreActions();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);

        const emos_token = urlParams.get('token'),
            emos_user_id = urlParams.get('user_id'),
            emos_username = urlParams.get('username');

        if (emos_token && emos_user_id && emos_username) {
            setIsLoading(true);
            const serverItem: ServerListItemWithCredential = {
                credential: emos_token,
                id: EMOS_MUSIC_LINK_UUID,
                isAdmin: false,
                name: emos_username,
                type: ServerType.SUBSONIC,
                url: EMOS_MUSIC_URL,
                userId: emos_user_id,
                username: emos_username,
            };

            addServer(serverItem);
            setCurrentServer(serverItem);
            closeAllModals();

            window.history.replaceState({}, document.title, window.location.pathname);

            toast.success({
                message: `欢迎回来 ${emos_username}`,
            });
        }
    }, []);

    return (
        <>
            <Stack>
                <Button
                    loading={isLoading}
                    onClick={() => {
                        window.location.href = `https://emos.best/link?uuid=${EMOS_MUSIC_LINK_UUID}&name=${EMOS_MUSIC_NAME}&url=${EMOS_MUSIC_URL}/feishin`;
                    }}
                    variant="filled"
                >
                    使用 EMOS 快捷登录
                </Button>
            </Stack>
        </>
    );
};
