import React, {Fragment, useState} from 'react';

import {Group, Panel, PanelHeader, Avatar, Button, Placeholder, PanelSpinner} from '@vkontakte/vkui';
import bridge from "@vkontakte/vk-bridge";

import configData from "../config.json";
import {handleError} from "../functions";
import {PAGE_TOKEN, STORAGE_STATUS} from "../index";
import {useRouter} from "@happysanta/router";

const PanelIntro = ({id, snackbarError, strings, userStatus, user, setUserStatus}) => {
    const [snackbar, setSnackbar] = useState(snackbarError);

    const router = useRouter();

    const viewIntro = async function () {
        try {
            await bridge.send('VKWebAppStorageSet', {
                key: STORAGE_STATUS,
                value: JSON.stringify({hasSeenIntro: true})
            });

            setUserStatus({hasSeenIntro: true});
            router.replacePage(PAGE_TOKEN);
        } catch (e) {
            handleError(strings, setSnackbar, router, e, {
                default_error_msg: 'Error with sending data to Storage'
            });
        }
    };

    return (
        <Panel id={id} centered={true}>
            {(!user && !userStatus) && <PanelSpinner/>}
            {(user && (!userStatus || !userStatus.hasSeenIntro)) &&
            <Fragment>
                <PanelHeader mode="secondary">{configData.name}</PanelHeader>
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

export default PanelIntro;