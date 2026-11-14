import { memo } from 'react';
import { Fragment } from 'react/jsx-runtime';

import { HotkeyManagerSettings } from '/@/renderer/features/settings/components/hotkeys/hotkey-manager-settings';
import { MediaSessionSettings } from '/@/renderer/features/settings/components/hotkeys/media-session-settings';
import { Divider } from '/@/shared/components/divider/divider';
import { Stack } from '/@/shared/components/stack/stack';

const sections = [
    { component: MediaSessionSettings, key: 'media-session' },
    { component: HotkeyManagerSettings, key: 'hotkey-manager' },
];

export const HotkeysTab = memo(() => {
    return (
        <Stack gap="md">
            {sections.map(({ component: Section, key }, index) => (
                <Fragment key={key}>
                    <Section />
                    {index < sections.length - 1 && <Divider />}
                </Fragment>
            ))}
        </Stack>
    );
});
