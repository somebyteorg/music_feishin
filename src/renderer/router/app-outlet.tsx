import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router';

import { AppRoute } from '/@/renderer/router/routes';
import { useAuthStoreActions, useCurrentServerWithCredential } from '/@/renderer/store';

export const AppOutlet = () => {
    const server = useCurrentServerWithCredential();
    const { logout } = useAuthStoreActions();
    const hasMissingCredentials = Boolean(server && (!server.credential || !server.ndCredential));

    useEffect(() => {
        if (hasMissingCredentials) logout();
    }, [hasMissingCredentials, logout]);

    if (!server || hasMissingCredentials) {
        return <Navigate replace to={AppRoute.LOGIN} />;
    }

    return <Outlet />;
};
