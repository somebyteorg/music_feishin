import { Navigate } from 'react-router';

import LoginRoute from '/@/renderer/features/login/routes/login-route';
import { AppRoute } from '/@/renderer/router/routes';
import { useCurrentServerWithCredential } from '/@/renderer/store';

const ActionRequiredRoute = () => {
    const server = useCurrentServerWithCredential();
    return server?.ndCredential && server.credential ? (
        <Navigate replace to={AppRoute.HOME} />
    ) : (
        <LoginRoute />
    );
};

export default ActionRequiredRoute;
