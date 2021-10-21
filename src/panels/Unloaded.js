import React from 'react';

import {Group, Panel, PanelHeader, Button, Placeholder} from '@vkontakte/vkui';
import {Icon24WarningTriangleOutline} from "@vkontakte/icons";
import configData from "../config.json";

const Unloaded = ({id, strings}) => {

    /**
     * Просмотр приветствия
     * @returns {Promise<void>}
     */
    const viewIntro = async function () {
        document.location.reload();
    };

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
                    icon={<Icon24WarningTriangleOutline/>}
                    action={<Button mode='secondary' onClick={viewIntro}>{strings.reload_app}</Button>}
                >
                    {strings.unloaded_app}
                </Placeholder>
            </Group>
        </Panel>
    )
}

export default Unloaded;