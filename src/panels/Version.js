import React, {useEffect, useState} from 'react';

import {
    Avatar,
    CellButton,
    Group, InfoRow, Link,
    Panel, PanelHeader, PanelHeaderBack, PanelHeaderContent, SimpleCell
} from '@vkontakte/vkui';

import {
    Icon24ExternalLinkOutline,
    Icon36CalendarOutline,
} from "@vkontakte/icons";
import configData from "../config.json";
import {fetchUsers, handleError, timestampToDate} from "../functions";
import IconPage from "../components/IconPage";
import FromEditPage from "../components/FormEditPage";

const Version = ({id, accessToken, content, group, go, snackbarError}) => {
    const [snackbar, setSnackbar] = useState(snackbarError);
    const [creator, setCreator] = useState({});

    useEffect(() => {

        fetchUsers([content.creator_id], accessToken.access_token).then(data => {
            if (data.response) {
                setCreator(data.response[0]);
            } else {
                handleError(setSnackbar, go, {}, {
                    data: data,
                    default_error_msg: 'No response get users'
                });
            }
        }).catch(e => {
            handleError(setSnackbar, go, e, {
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
                    status={(content.version ? 'v.' + content.version : 'текущая версия')}
                    before={<IconPage page={content}/>}
                >
                    {content.title}
                </PanelHeaderContent>
            </PanelHeader>

            <Group>
                <SimpleCell
                    before={<Icon36CalendarOutline/>}
                    after={<Link
                        href={'https://vk.com/id' + content.creator_id} target='_blank'
                    >
                        <Avatar size={32} src={creator.photo_200}/></Link>}
                >
                    <InfoRow header="Версия сохранена">
                        {timestampToDate(content.edited)}
                    </InfoRow>
                </SimpleCell>

                <CellButton
                    before={<Icon24ExternalLinkOutline/>}
                    href={'https://vk.com/page-' + group.id + '_' + content.page_id + '?act=edit&section=edit' + (content.version ? '&hid=' + content.version : '')}
                    target='_blank' rel='noreferrer'
                >
                    Открыть редактор ВК</CellButton>

                <FromEditPage
                    content={content}
                    go={go}
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