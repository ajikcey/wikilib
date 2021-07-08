import React, {Fragment, useEffect, useState} from 'react';

import bridge from "@vkontakte/vk-bridge";
import {
    Avatar, Group, Header, Panel, PanelHeader,
    Cell, List, HorizontalScroll, HorizontalCell, Search, PanelHeaderButton, Snackbar, Link, Placeholder, PanelSpinner
} from '@vkontakte/vkui';
import {
    Icon12Verified, Icon24Error,
    Icon28InfoOutline, Icon36Users
} from '@vkontakte/icons';

import configData from "../config.json";

const Home = ({id, accessToken, go, setCommunity, snackbarError}) => {
    const [snackbar, setSnackbar] = useState(snackbarError);
    const [communities, setCommunities] = useState(null);
    const [lastCommunities, setLastCommunities] = useState([]);
    const [countCommunities, setCountCommunities] = useState(0);

    useEffect(() => {

        /**
         * Получение сообществ пользователя
         * @returns {Promise<void>}
         */
        async function fetchCommunities() {
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
                    setCommunities(data.response.items);
                    setCountCommunities(data.response.count);
                } else {
                    setSnackbar(<Snackbar
                        layout='vertical'
                        onClose={() => setSnackbar(null)}
                        before={<Avatar size={24} style={{backgroundColor: 'var(--dynamic_red)'}}
                        ><Icon24Error fill='#fff' width='14' height='14'/></Avatar>}
                    >
                        Error get groups
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
                    {e.error_data ? e.error_data.error_reason.error_msg : 'Error get groups'}
                </Snackbar>);
            });
        }

        /**
         * Получение посещенных недавно сообществ
         * @returns {Promise<void>}
         */
        async function fetchLastCommunities() {
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
                    setLastCommunities(data.response.items);
                } else {
                    setSnackbar(<Snackbar
                        layout='vertical'
                        onClose={() => setSnackbar(null)}
                        before={<Avatar size={24} style={{backgroundColor: 'var(--dynamic_red)'}}
                        ><Icon24Error fill='#fff' width='14' height='14'/></Avatar>}
                    >
                        Error get groups
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
                    {e.error_data ? e.error_data.error_reason.error_msg : 'Error get groups'}
                </Snackbar>);
            });
        }

        fetchCommunities();
        fetchLastCommunities();
    }, []);

    /**
     * Очистка недавно просмотренных сообществ
     * @returns {Promise<void>}
     */
    const clearLast = async function () {
        setLastCommunities([]);
    }

    /**
     * Выбор сообщества для показа wiki-страниц
     * @param item
     */
    const selectCommunity = function (item) {
        setCommunity(item);
        go(configData.routes.community);
    }

    return (
        <Panel id={id}>
            <PanelHeader
                left={<PanelHeaderButton><Icon28InfoOutline/></PanelHeaderButton>}
            >
                {configData.name}
            </PanelHeader>

            {(lastCommunities.length > 0) &&
            <Fragment>
                <Group header={<Header aside={<Link onClick={clearLast}>Очистить</Link>}>
                    Недавно просмотренные</Header>}>

                    <HorizontalScroll showArrows getScrollToLeft={i => i - 320} getScrollToRight={i => i + 320}>
                        <div style={{display: 'flex'}}>
                            {lastCommunities.map((item) => {
                                return (
                                    <HorizontalCell key={item.id} header={item.name}
                                                    onClick={() => {
                                                        selectCommunity(item)
                                                    }}
                                    >
                                        <Avatar size={64} src={item.photo_200}/>
                                    </HorizontalCell>
                                );
                            })}
                        </div>
                    </HorizontalScroll>
                </Group>
            </Fragment>
            }

            <Group header={<Header mode="primary" indicator={countCommunities}>Все сообщества</Header>}>
                <Search/>
                <List>
                    {(!communities) && <PanelSpinner/>}
                    {(communities && communities.length < 1) &&
                    <Fragment>
                        <Placeholder
                            icon={<Icon36Users/>}
                        >
                            Сообществ не найдено
                        </Placeholder>
                    </Fragment>
                    }
                    {(communities && communities.length > 0) &&
                    <Fragment>
                        {communities.map((item) => {
                            return (
                                <Cell key={item.id} before={<Avatar size={48} src={item.photo_200}/>}
                                      badge={item.verified ? <Icon12Verified/> : null}
                                      description={'Участников: ' + item.members_count}
                                      onClick={() => {
                                          selectCommunity(item)
                                      }}
                                >
                                    {item.name}
                                </Cell>
                            );
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