import React from 'react';

import {Button, Group, Panel, PanelHeader, Placeholder} from '@vkontakte/vkui';
import {Icon56InfoOutline} from '@vkontakte/icons';

import configData from "../config.json";

const Token = ({id, fetchToken, snackbarError}) => {

    return (
        <Panel id={id} centered={true}>
            <PanelHeader>
                {configData.name}
            </PanelHeader>
            <Group>
                <Placeholder
                    icon={<Icon56InfoOutline/>}
                    header="Права доступа"
                    action={<Button size="l" onClick={fetchToken}>Продолжить</Button>}
                >
                    Для работы сервиса необходимо выдать доступ к сообществам и wiki-страницам.
                </Placeholder>
            </Group>
            {snackbarError}
        </Panel>
    )
}

export default Token;