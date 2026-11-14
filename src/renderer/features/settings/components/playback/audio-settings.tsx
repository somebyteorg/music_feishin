import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import {
    SettingOption,
    SettingsSection,
} from '/@/renderer/features/settings/components/settings-section';
import { usePlaybackSettings, useSettingsStoreActions } from '/@/renderer/store/settings.store';
import { Switch } from '/@/shared/components/switch/switch';

export const AudioSettings = memo(() => {
    const { t } = useTranslation();
    const settings = usePlaybackSettings();
    const { setSettings } = useSettingsStoreActions();

    const audioOptions: SettingOption[] = [
        {
            control: (
                <Switch
                    defaultChecked={settings.webAudio}
                    onChange={(e) => {
                        setSettings({
                            playback: { webAudio: e.currentTarget.checked },
                        });
                    }}
                />
            ),
            description: t('setting.webAudio', { context: 'description' }),
            note: t('common.restartRequired'),
            title: t('setting.webAudio'),
        },
        {
            control: (
                <Switch
                    defaultChecked={settings.preservePitch}
                    onChange={(e) => {
                        setSettings({
                            playback: { preservePitch: e.currentTarget.checked },
                        });
                    }}
                />
            ),
            description: t('setting.preservePitch', { context: 'description' }),
            title: t('setting.preservePitch'),
        },
        {
            control: (
                <Switch
                    defaultChecked={settings.audioFadeOnStatusChange}
                    onChange={(e) => {
                        setSettings({
                            playback: { audioFadeOnStatusChange: e.currentTarget.checked },
                        });
                    }}
                />
            ),
            description: t('setting.audioFadeOnStatusChange', { context: 'description' }),
            title: t('setting.audioFadeOnStatusChange'),
        },
    ];

    return <SettingsSection options={audioOptions} title={t('page.setting.audio')} />;
});
