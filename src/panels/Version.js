import React, {useEffect, useState} from 'react';

import {
    Avatar,
    Group, InfoRow,
    Panel, PanelHeader, PanelHeaderBack, PanelHeaderContent, SimpleCell, usePlatform, VKCOM
} from '@vkontakte/vkui';

import {
    Icon28CalendarOutline, Icon28LinkCircleOutline,
} from "@vkontakte/icons";
import configData from "../config.json";
import {fetchUsers, handleError, timestampToDate} from "../functions";
import IconPage from "../components/IconPage";
import FromEditPage from "../components/FormEditPage";

const Version = ({id, accessToken, content, group, strings, go, snackbarError}) => {
    const [snackbar, setSnackbar] = useState(snackbarError);
    const [creator, setCreator] = useState({});

    const platform = usePlatform();

    useEffect(() => {

        fetchUsers([content.creator_id], accessToken.access_token).then(data => {
            if (data.response) {
                setCreator(data.response[0]);
            } else {
                handleError(strings, setSnackbar, go, {}, {
                    data: data,
                    default_error_msg: 'No response get users'
                });
            }
        }).catch(e => {
            handleError(strings, setSnackbar, go, e, {
                default_error_msg: 'Error get users'
            });
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const back = function () {
        go(configData.routes.page);
    }

    return (
        <Panel id={id}>
            <PanelHeader
                mode="secondary"
                left={<PanelHeaderBack onClick={back}/>}
            >
                <PanelHeaderContent
                    status={content.title}
                    before={<IconPage page={content}/>}
                >
                    {strings.editing}
                </PanelHeaderContent>
            </PanelHeader>

            <Group>
                <SimpleCell
                    href={'https://vk.com/id' + content.creator_id}
                    target='_blank'
                    before={<Icon28CalendarOutline/>}
                    after={<Avatar size={32} src={creator.photo_100}/>}
                >
                    <InfoRow header={strings.version_saved}>
                        {timestampToDate(content.edited)}
                    </InfoRow>
                </SimpleCell>

                {(platform === VKCOM) &&
                <SimpleCell
                    href={'https://vk.com/page-' + group.id + '_' + content.page_id + '?act=edit&section=edit' + (content.version ? '&hid=' + content.version : '')}
                    target='_blank' rel='noreferrer'
                    before={<Icon28LinkCircleOutline/>}
                >{strings.open_vk_editor}
                </SimpleCell>
                }

                <FromEditPage
                    content={content}
                    go={go}
                    strings={strings}
                    accessToken={accessToken}
                    setSnackbar={setSnackbar}
                    group={group}
                />
            </Group>
            {snackbar}
        </Panel>
    )
}

export default Version;