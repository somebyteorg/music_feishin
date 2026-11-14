import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useLocation, useNavigate } from 'react-router';

import { api } from '/@/renderer/api';
import { PageHeader } from '/@/renderer/components/page-header/page-header';
import NavidromeIcon from '/@/renderer/features/servers/assets/navidrome.png';
import { AnimatedPage } from '/@/renderer/features/shared/components/animated-page';
import { PageErrorBoundary } from '/@/renderer/features/shared/components/page-error-boundary';
import { queryClient } from '/@/renderer/lib/react-query';
import { AppRoute } from '/@/renderer/router/routes';
import { useAuthStore, useCurrentServer } from '/@/renderer/store';
import {
    EMOS_LOGIN_URL,
    EMOS_SERVER_ID,
    EMOS_SERVER_NAME,
    EMOS_SERVER_URL,
} from '/@/renderer/utils/emos-server';
import { Button } from '/@/shared/components/button/button';
import { Center } from '/@/shared/components/center/center';
import { Paper } from '/@/shared/components/paper/paper';
import { PasswordInput } from '/@/shared/components/password-input/password-input';
import { Stack } from '/@/shared/components/stack/stack';
import { TextInput } from '/@/shared/components/text-input/text-input';
import { Text } from '/@/shared/components/text/text';
import { useForm } from '/@/shared/hooks/use-form';
import { ServerType } from '/@/shared/types/domain-types';

const signIn = async (body: Record<string, string>) => {
    await queryClient.cancelQueries();
    useAuthStore.getState().actions.logout();
    queryClient.clear();
    const data = await api.controller.authenticate(EMOS_SERVER_URL, body, ServerType.NAVIDROME);
    const server = {
        ...data,
        id: EMOS_SERVER_ID,
        name: EMOS_SERVER_NAME,
        type: ServerType.NAVIDROME,
        url: EMOS_SERVER_URL,
    };
    const { addServer, setCurrentServer } = useAuthStore.getState().actions;
    addServer(server);
    setCurrentServer(server);
};

const LoginRoute = () => {
    const { t } = useTranslation();
    const { pathname, search } = useLocation();
    const navigate = useNavigate();
    const isEmosCallback = pathname === AppRoute.EMOS_LOGIN;
    const callbackToken = isEmosCallback ? (new URLSearchParams(search).get('token') ?? '') : null;
    const [isLoading, setIsLoading] = useState(isEmosCallback);
    const [error, setError] = useState('');
    const startedCallbackToken = useRef<null | string>(null);
    const currentServer = useCurrentServer();
    const form = useForm({ initialValues: { password: '', username: '' } });

    useEffect(() => {
        if (callbackToken === null || startedCallbackToken.current === callbackToken) return;
        startedCallbackToken.current = callbackToken;
        window.history.replaceState(
            window.history.state,
            '',
            `${window.location.pathname}${window.location.search}#${AppRoute.EMOS_LOGIN}`,
        );
        setIsLoading(true);
        setError('');
        signIn({ action: 'emos', token: callbackToken })
            .then(() => navigate(AppRoute.HOME, { replace: true }))
            .catch((err: unknown) => {
                setError(err instanceof Error ? err.message : t('error.authenticationFailed'));
            })
            .finally(() => setIsLoading(false));
    }, [callbackToken, navigate, t]);

    if (currentServer && !isEmosCallback && !isLoading) {
        return <Navigate replace to={AppRoute.HOME} />;
    }

    const handleSubmit = form.onSubmit(async (values) => {
        setIsLoading(true);
        setError('');
        try {
            await signIn(values);
            navigate(AppRoute.HOME, { replace: true });
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : t('error.authenticationFailed'));
        } finally {
            setIsLoading(false);
        }
    });

    return (
        <AnimatedPage>
            <PageHeader />
            <Center style={{ height: '100%', width: '100vw' }}>
                <Paper p="xl" style={{ maxWidth: '400px', width: '100%' }}>
                    <form onSubmit={handleSubmit}>
                        <Stack gap="xl">
                            <Stack align="center" gap="md">
                                <img alt="Navidrome" height="80" src={NavidromeIcon} width="80" />
                                <Text fw={600} size="xl">
                                    {EMOS_SERVER_NAME}
                                </Text>
                            </Stack>
                            {error && (
                                <Text c="red" role="alert">
                                    {error}
                                </Text>
                            )}
                            <Button
                                fullWidth
                                loading={isLoading}
                                onClick={() => window.location.assign(EMOS_LOGIN_URL)}
                                variant="filled"
                            >
                                {t('form.emosLogin')}
                            </Button>
                            <Stack gap="md">
                                <TextInput
                                    autoComplete="username"
                                    disabled={isLoading}
                                    label={t('form.addServer.input', { context: 'username' })}
                                    required
                                    variant="filled"
                                    {...form.getInputProps('username')}
                                />
                                <PasswordInput
                                    autoComplete="current-password"
                                    disabled={isLoading}
                                    label={t('form.addServer.input', { context: 'password' })}
                                    required
                                    variant="filled"
                                    {...form.getInputProps('password')}
                                />
                            </Stack>
                            <Button
                                disabled={!form.values.username || !form.values.password}
                                fullWidth
                                loading={isLoading}
                                type="submit"
                            >
                                {t('common.login', { defaultValue: 'Login' })}
                            </Button>
                        </Stack>
                    </form>
                </Paper>
            </Center>
        </AnimatedPage>
    );
};

const LoginRouteWithBoundary = () => (
    <PageErrorBoundary>
        <LoginRoute />
    </PageErrorBoundary>
);

export default LoginRouteWithBoundary;
