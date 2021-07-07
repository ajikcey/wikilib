import React, {Fragment, useEffect, useState} from 'react';

import {
    Avatar,
    Group, Header,
    IconButton,
    Panel,
    PanelHeader,
    Cell, List, HorizontalScroll, HorizontalCell, Search, PanelHeaderButton, PanelSpinner, Snackbar
} from '@vkontakte/vkui';
import {
    Icon12Verified, Icon24Error,
    Icon28InfoOutline,
    Icon28MessageOutline
} from '@vkontakte/icons';
import configData from "../config.json";
import bridge from "@vkontakte/vk-bridge";

const Home = ({id, accessToken, snackbarError}) => {
    const [snackbar, setSnackbar] = useState(snackbarError);
    const [groups, setGroups] = useState([]);
    const [countGroups, setCountGroups] = useState(0);

    useEffect(() => {
        /**
         * Получение сообществ пользователя
         * @returns {Promise<void>}
         */
        async function fetchGroups () {
            await bridge.send("VKWebAppCallAPIMethod", {
                method: "groups.get",
                params: {
                    extended: 1,
                    fields: ['members_count', 'verified'].join(','),
                    filter: 'moder',
                    offset: 0,
                    count: 100,
                    v: "5.131",
                    access_token: accessToken.access_token
                }
            }).then(data => {
                if (data.response) {
                    setGroups(data.response.items);
                    setCountGroups(data.response.count);
                } else {
                    setSnackbar(<Snackbar
                        layout='vertical'
                        onClose={() => setSnackbar(null)}
                        before={<Avatar size={24} style={{backgroundColor: 'var(--dynamic_red)'}}
                        ><Icon24Error fill='#fff' width='14' height='14'/></Avatar>}
                    >
                        Error getting groups
                    </Snackbar>);
                }
            }).catch(e => {
                console.log(e);

                setSnackbar(<Snackbar
                    layout='vertical'
                    onClose={() => setSnackbar(null)}
                    before={<Avatar size={24} style={{backgroundColor: 'var(--dynamic_red)'}}
                    ><Icon24Error fill='#fff' width='14' height='14'/></Avatar>}
                >
                    {e.error_data.error_reason.error_msg}
                </Snackbar>);
            });
        }

        fetchGroups();
    }, []);

    return (
        <Panel id={id}>
            <PanelHeader
                left={<PanelHeaderButton><Icon28InfoOutline/></PanelHeaderButton>}
            >
                {configData.name}
            </PanelHeader>
            <Group header={<Header>Недавно просмотренные</Header>}>
                <HorizontalScroll showArrows getScrollToLeft={i => i - 320} getScrollToRight={i => i + 320}>
                    <div style={{display: 'flex'}}>

                        {groups.length === 0 && <PanelSpinner/>}
                        {groups.length > 0 &&
                        <Fragment>
                            {groups.map((item) => {
                                return (
                                    <HorizontalCell key={item.id} header={item.name}>
                                        <Avatar size={64} src={item.photo_200}/>
                                    </HorizontalCell>
                                )
                            })}
                        </Fragment>
                        }
                    </div>
                </HorizontalScroll>
            </Group>
            <Group header={<Header mode="primary" indicator={countGroups}>Все сообщества</Header>}>
                <Search/>

                <List>
                    {groups.length === 0 && <PanelSpinner/>}
                    {groups.length > 0 &&
                    <Fragment>
                        {groups.map((item) => {
                            return (
                                <Cell key={item.id} before={<Avatar size={48} src={item.photo_200}/>} badge={item.verified ? <Icon12Verified/> : null}
                                      after={<IconButton><Icon28MessageOutline/></IconButton>}
                                      description={'Участников: ' + item.members_count}>{item.name}</Cell>
                            )
                        })}
                    </Fragment>
                    }
                </List>
            </Group>
            {snackbar}
        </Panel>
    )
}

export default Home;