import React, {Fragment, useState} from 'react';

import {Group, Panel, PanelHeader, Avatar, Button, Placeholder} from '@vkontakte/vkui';
import bridge from "@vkontakte/vk-bridge";

import configData from "../config.json";
import {handleError} from "../functions";

const Intro = ({id, snackbarError, user, strings, userStatus, setUserStatus, go}) => {
    const [snackbar, setSnackbar] = useState(snackbarError);

    /**
     * Просмотр приветствия
     * @returns {Promise<void>}
     */
    const viewIntro = async function () {
        try {
            await bridge.send('VKWebAppStorageSet', {
                key: configData.storage_keys.status,
                value: JSON.stringify({hasSeenIntro: true})
            });

            setUserStatus({hasSeenIntro: true});
            go(configData.routes.token);
        } catch (e) {
            handleError(strings, setSnackbar, go, e, {
                default_error_msg: 'Error with sending data to Storage'
            });
        }
    };

    return (
        <Panel id={id} centered={true}>
            {(user && (!userStatus || !userStatus.hasSeenIntro)) &&
            <Fragment>
                <PanelHeader
                    mode="secondary"
                >
                    {configData.name}
                </PanelHeader>

                <Group>
                    <Placeholder
                        style={{maxWidth: 620}}
                        icon={user.photo_100 && <Avatar src={user.photo_100}/>}
                        header={`${strings.hello}, ${user.first_name}!`}
                        action={<Button mode='commerce' size='l' onClick={viewIntro}>{strings.open_app}</Button>}
                    >
                        {strings.acquaintance}
                    </Placeholder>
                </Group>
            </Fragment>
            }
            {snackbar}
        </Panel>
    )
}

export default Intro;