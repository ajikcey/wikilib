import React from 'react';

import {Group, Panel, PanelHeader, Button, Placeholder} from '@vkontakte/vkui';
import {Icon24WarningTriangleOutline} from "@vkontakte/icons";
import configData from "../config.json";
import {ShowError} from "../functions";
import {useRouter} from "@happysanta/router";

const PanelUnloaded = ({id, init, strings, setModalData}) => {
    const router = useRouter();

    const reload = () => {
        init().then().catch(e => {
            console.log('reload', e);
            ShowError(e, setModalData, router);
        });
    }

    return (
        <Panel id={id} centered={true}>
            <PanelHeader mode="secondary">{configData.name}</PanelHeader>
            <Group>
                <Placeholder
                    style={{maxWidth: 620}}
                    icon={<Icon24WarningTriangleOutline/>}
                    action={<Button mode='secondary' onClick={() => reload()}>{strings.reload_app}</Button>}
                >
                    {strings.unloaded_app}
                </Placeholder>
            </Group>
        </Panel>
    )
}

export default PanelUnloaded;