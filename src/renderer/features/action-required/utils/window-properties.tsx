export const isLegacyAuth = () =>
    window.LEGACY_AUTHENTICATION === true || window.LEGACY_AUTHENTICATION === 'true';

export const isServerLock = () => true;
