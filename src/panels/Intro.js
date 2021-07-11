import React, {Fragment, useState} from 'react';

import {Group, Panel, PanelHeader, Avatar, Button, Placeholder, Snackbar} from '@vkontakte/vkui';
import bridge from "@vkontakte/vk-bridge";
import {Icon24ErrorCircle} from "@vkontakte/icons";

import configData from "../config.json";

const Intro = ({id, snackbarError, user, userStatus, setUserStatus, go}) => {
    const [snackbar, setSnackbar] = useState(snackbarError);

    /**
     * Просмотр приветствия
     * @returns {Promise<void>}
     */
    const viewIntro = async function () {
        if (bridge.supports('VKWebAppTapticNotificationOccurred')) {
            await bridge.send('VKWebAppTapticNotificationOccurred', {type: 'success'});
        }

        try {
            await bridge.send('VKWebAppStorageSet', {
                key: configData.storage_keys.status,
                value: JSON.stringify({hasSeenIntro: true})
            });

            setUserStatus({hasSeenIntro: true});
            go(configData.routes.token);
        } catch (e) {
            console.log(e);

            setSnackbar(<Snackbar
                layout='vertical'
                onClose={() => setSnackbar(null)}
                before={<Icon24ErrorCircle fill='var(--dynamic_red)'/>}
            >
                Error with sending data to Storage
            </Snackbar>);
        }
    };

    return (
        <Panel id={id} centered={true}>
            {(!userStatus && user) &&
            <Fragment>
                <PanelHeader>
                    {configData.name}
                </PanelHeader>

                <Group>
                    <Placeholder
                        style={{maxWidth: 620}}
                        icon={user.photo_200 && <Avatar src={user.photo_200}/>}
                        header={`Привет, ${user.first_name}!`}
                        action={<Button mode='commerce' size='l' onClick={viewIntro}>Открыть приложение</Button>}
                    >
                        Это приложение, с помощью которого можно посмотреть wiki-страницы во всех своих сообществах
                        ВКонтакте.
                    </Placeholder>
                </Group>
            </Fragment>
            }
            {snackbar}
        </Panel>
    )
}

export default Intro;