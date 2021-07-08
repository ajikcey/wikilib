import React, {useState} from 'react';

import {Button, Group, Panel, PanelHeader, Placeholder} from '@vkontakte/vkui';
import {Icon56InfoOutline} from '@vkontakte/icons';

import configData from "../config.json";

const Token = ({id, fetchToken, snackbarError}) => {
    const [snackbar, setSnackbar] = useState(snackbarError);

    return (
        <Panel id={id}>
            <PanelHeader>
                {configData.name}
            </PanelHeader>
            <Group>
                <Placeholder
                    icon={<Icon56InfoOutline/>}
                    header="Права доступа"
                    action={<Button size="l" onClick={fetchToken}>Выдать доступ</Button>}
                >
                    Для работы сервиса необходимо выдать доступ к сообществам и wiki-страницам.
                </Placeholder>
            </Group>
            {snackbar}
        </Panel>
    )
}

export default Token;