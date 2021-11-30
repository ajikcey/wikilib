import React from 'react';

import {Button, Group, Panel, PanelHeader, Placeholder} from '@vkontakte/vkui';
import {Icon56LockOutline} from '@vkontakte/icons';

import configData from "../../config.json";

const PanelToken = ({id, fetchToken, strings, snackbarError}) => {

    return (
        <Panel id={id} centered={true}>
            <PanelHeader
                mode="secondary"
            >
                {configData.name}
            </PanelHeader>
            <Group>
                <Placeholder
                    style={{maxWidth: 620}}
                    icon={<Icon56LockOutline/>}
                    header={strings.access_rights}
                    action={<Button size="l" onClick={fetchToken}>{strings.grant_access}</Button>}
                >
                    {strings.need_token}
                </Placeholder>
            </Group>
            {snackbarError}
        </Panel>
    )
}

export default PanelToken;