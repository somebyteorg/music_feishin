import { nanoid } from 'nanoid/non-secure';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';

import { EMOS_SERVER_ID, EMOS_SERVER_NAME, EMOS_SERVER_URL } from '/@/renderer/utils/emos-server';
import {
    ServerListItem,
    ServerListItemWithCredential,
    ServerType,
} from '/@/shared/types/domain-types';

const isEmosServer = (server: null | ServerListItemWithCredential | undefined) =>
    server?.id === EMOS_SERVER_ID &&
    server.type === ServerType.NAVIDROME &&
    server.url === EMOS_SERVER_URL;

export interface AuthSlice extends AuthState {
    actions: {
        addServer: (args: ServerListItemWithCredential) => void;
        deleteServer: (id: string) => void;
        getServer: (id: string) => null | ServerListItemWithCredential;
        logout: () => void;
        setCurrentServer: (server: null | ServerListItemWithCredential) => void;
        setMusicFolderId: (musicFolderId: string[] | undefined) => void;
        updateServer: (id: string, args: Partial<ServerListItemWithCredential>) => void;
    };
}

export interface AuthState {
    currentServer: null | ServerListItemWithCredential;
    deviceId: string;
    serverList: Record<string, ServerListItemWithCredential>;
}

export const useAuthStore = createWithEqualityFn<AuthSlice>()(
    persist(
        devtools(
            immer((set, get) => ({
                actions: {
                    addServer: (args) => {
                        if (!isEmosServer(args)) return;
                        set((state) => {
                            state.serverList = { [EMOS_SERVER_ID]: args };
                        });
                    },
                    deleteServer: (id) => {
                        set((state) => {
                            delete state.serverList[id];

                            if (state.currentServer?.id === id) {
                                state.currentServer = null;
                            }
                        });
                    },
                    getServer: (id) => {
                        const server = get().serverList[id];
                        if (server) return server;
                        return null;
                    },
                    logout: () => {
                        set((state) => {
                            state.currentServer = null;
                            state.serverList = {};
                        });
                    },
                    setCurrentServer: (server) => {
                        if (server && !isEmosServer(server)) return;
                        set((state) => {
                            state.currentServer = server;
                        });
                    },
                    setMusicFolderId: (musicFolderId: string[] | undefined) => {
                        set((state) => {
                            if (state.currentServer) {
                                state.currentServer.musicFolderId = musicFolderId;
                                const serverId = state.currentServer.id;
                                if (state.serverList[serverId]) {
                                    state.serverList[serverId].musicFolderId = musicFolderId;
                                }
                            }
                        });
                    },
                    updateServer: (id: string, args: Partial<ServerListItemWithCredential>) => {
                        if (id !== EMOS_SERVER_ID || !get().serverList[id]) return;
                        set((state) => {
                            const updatedServer = {
                                ...state.serverList[id],
                                ...args,
                                id: EMOS_SERVER_ID,
                                name: EMOS_SERVER_NAME,
                                preferRemoteUrl: false,
                                remoteUrl: undefined,
                                type: ServerType.NAVIDROME,
                                url: EMOS_SERVER_URL,
                            };
                            if (updatedServer.ndCredential) {
                                updatedServer.credential = new URLSearchParams({
                                    jwt: updatedServer.ndCredential,
                                    u: updatedServer.username,
                                }).toString();
                            }

                            if (
                                state.currentServer?.id === id &&
                                !('musicFolderId' in args) &&
                                state.currentServer.musicFolderId !== undefined
                            ) {
                                updatedServer.musicFolderId = state.currentServer.musicFolderId;
                            }

                            state.serverList[id] = updatedServer;
                            if (state.currentServer?.id === id) {
                                state.currentServer = updatedServer;
                            }
                        });
                    },
                },
                currentServer: null,
                deviceId: nanoid(),
                serverList: {},
            })),
            { name: 'emos_feishin_authentication' },
        ),
        {
            merge: (persistedState, currentState) => {
                const saved = persistedState as Partial<AuthState> | undefined;
                const server = saved?.currentServer;
                const currentServer =
                    isEmosServer(server) && server?.ndCredential && server.credential
                        ? server
                        : null;
                return {
                    ...currentState,
                    currentServer,
                    deviceId: saved?.deviceId || currentState.deviceId,
                    serverList: currentServer ? { [EMOS_SERVER_ID]: currentServer } : {},
                };
            },
            name: 'emos_feishin_authentication',
            version: 1,
        },
    ),
);

export const useCurrentServerId = (): string =>
    useAuthStore((state) => {
        const currentServer = state.currentServer;

        if (!currentServer) {
            return '';
        }

        return currentServer.id;
    }, shallow);

export const useCurrentServer = () =>
    useAuthStore((state) => {
        if (!state.currentServer) {
            return null;
        }

        return {
            enableAudiobooks: state.currentServer?.enableAudiobooks,
            features: state.currentServer?.features,
            id: state.currentServer?.id,
            isAdmin: state.currentServer?.isAdmin,
            musicFolderId: state.currentServer?.musicFolderId,
            name: state.currentServer?.name,
            preferInstantMix: state.currentServer?.preferInstantMix,
            preferRemoteUrl: state.currentServer?.preferRemoteUrl,
            remoteUrl: state.currentServer?.remoteUrl,
            savePassword: state.currentServer?.savePassword,
            type: state.currentServer?.type,
            url: state.currentServer?.url,
            userId: state.currentServer?.userId,
            username: state.currentServer?.username,
            version: state.currentServer?.version,
        };
    }, shallow) as ServerListItem;

export const useIsAdmin = () =>
    useAuthStore((state) => {
        return {
            isAdmin: state.currentServer?.isAdmin ?? false,
            userId: state.currentServer?.userId,
        };
    }, shallow);

export const useCurrentServerWithCredential = () =>
    useAuthStore((state) => state.currentServer) as ServerListItemWithCredential;

export const useServerList = () => useAuthStore((state) => state.serverList);

export const useAuthStoreActions = () => useAuthStore((state) => state.actions);

export const getServerById = (id?: string) => {
    if (!id) {
        return null;
    }

    return useAuthStore.getState().actions.getServer(id);
};

export const usePermissions = () => {
    const { isAdmin, userId } = useIsAdmin();

    return {
        playlists: {
            editOwner: isAdmin,
            editPublic: isAdmin,
        },
        radio: {
            create: true,
            delete: isAdmin,
            edit: isAdmin,
        },
        userId: userId,
    };
};
