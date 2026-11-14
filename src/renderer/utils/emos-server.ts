export const EMOS_SERVER_ID = 'emos-music';
export const EMOS_SERVER_NAME = '跃律';
export const EMOS_SERVER_URL = new URL('/navidrome', window.location.origin).href;
export const EMOS_LOGIN_URL = 'https://emos.best/api/sign?state=emos_music_feishin';

const hasEmptyQuery = window.location.href.split('#', 1)[0].endsWith('?');

if (hasEmptyQuery) {
    window.history.replaceState(
        window.history.state,
        '',
        `${window.location.pathname}${window.location.search}${window.location.hash}`,
    );
}
