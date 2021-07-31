import React, {useEffect, useState} from 'react';

import {
    Avatar,
    CellButton,
    Group, InfoRow, Link,
    Panel, PanelHeader, PanelHeaderBack, PanelHeaderContent, SimpleCell, usePlatform, VKCOM
} from '@vkontakte/vkui';

import {
    Icon36CalendarOutline, Icon36LinkOutline,
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
                    status={(content.version ? 'v.' + content.version : strings.current_version.toLowerCase())}
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
                    <InfoRow header={strings.version_saved}>
                        {timestampToDate(content.edited)}
                    </InfoRow>
                </SimpleCell>

                {(platform === VKCOM) &&
                <CellButton
                    description={strings.only_on_pc}
                    before={<Icon36LinkOutline/>}
                    href={'https://vk.com/page-' + group.id + '_' + content.page_id + '?act=edit&section=edit' + (content.version ? '&hid=' + content.version : '')}
                    target='_blank' rel='noreferrer'
                >{strings.open_vk_editor}</CellButton>
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