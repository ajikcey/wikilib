import React, {Fragment, useState} from 'react';

import {Group, Panel, PanelHeader, Avatar, Button, Placeholder, Snackbar} from '@vkontakte/vkui';

import configData from "../config.json";
import bridge from "@vkontakte/vk-bridge";
import {Icon24Error} from "@vkontakte/icons";

const Intro = ({id, snackbarError, fetchedUser, userStatus, go}) => {
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
                value: JSON.stringify({
                    hasSeenIntro: true
                })
            });

            go(configData.routes.token);
        } catch (e) {
            console.log(e);

            setSnackbar(<Snackbar
                layout='vertical'
                onClose={() => setSnackbar(null)}
                before={<Avatar size={24} style={{backgroundColor: 'var(--dynamic_red)'}}
                ><Icon24Error fill='#fff' width='14' height='14'/></Avatar>}
            >
                Error with sending data to Storage
            </Snackbar>);
        }
    };

    return (
        <Panel id={id} centered={true}>
            {(!userStatus && fetchedUser) &&
            <Fragment>
                <PanelHeader>
                    {configData.name}
                </PanelHeader>

                <Group>
                    <Placeholder
                        icon={fetchedUser.photo_200 && <Avatar src={fetchedUser.photo_200}/>}
                        header={`Привет, ${fetchedUser.first_name}!`}
                        action={<Button mode='commerce' size='l' onClick={viewIntro}>OK, все понятно!</Button>}
                    >
                        Этот сервис позволяет хранить все wiki-страницы в одном месте.
                    </Placeholder>
                </Group>
            </Fragment>
            }
            {snackbar}
        </Panel>
    )
}

export default Intro;