import React, {Fragment, useEffect, useState} from 'react';

import bridge from "@vkontakte/vk-bridge";
import {
    Avatar,
    Group,
    Header,
    Panel,
    PanelHeader,
    Cell,
    List,
    HorizontalScroll,
    HorizontalCell,
    Search,
    PanelHeaderButton,
    Snackbar,
    Placeholder,
    PanelSpinner,
    Footer, Link
} from '@vkontakte/vkui';
import {
    Icon12Verified, Icon16Clear, Icon24ErrorCircle,
    Icon28InfoOutline, Icon36Users
} from '@vkontakte/icons';

import configData from "../config.json";
import {cutDeclNum, declOfNum} from "../functions";

const Home = ({id, accessToken, go, setGroup, cachedLastGroups, snackbarError}) => {
    const [snackbar, setSnackbar] = useState(snackbarError);
    const [groups, setGroups] = useState(null);
    const [lastCommunityIds] = useState(cachedLastGroups);
    const [lastGroups, setLastGroups] = useState([]);
    const [countGroups, setCountGroups] = useState(0);

    useEffect(() => {

        const handleError = (e, options) => {
            let error_msg = options.default_error_msg;

            if (e.error_data) {
                if (e.error_data.error_reason) {
                    if (typeof e.error_data.error_reason === 'object') {
                        if ([
                            'User authorization failed: access_token has expired.',
                            'User authorization failed: access_token was given to another ip address.'
                        ].indexOf(e.error_data.error_reason.error_msg) > -1) {
                            go(configData.routes.token); // refresh token
                        } else if (e.error_data.error_reason.error_msg) {
                            error_msg = e.error_data.error_reason.error_msg;
                        }
                    } else {
                        error_msg = e.error_data.error_reason; // бывает строкой
                    }
                } else if (e.error_data.error_msg) {
                    if ([
                        'User authorization failed: access_token has expired.',
                        'User authorization failed: access_token was given to another ip address.'
                    ].indexOf(e.error_data.error_msg) > -1) {
                        go(configData.routes.token); // refresh token
                    } else {
                        error_msg = e.error_data.error_msg;
                    }
                }
            }

            error_msg = (error_msg || JSON.stringify(e));

            if (error_msg) {
                setSnackbar(<Snackbar
                    layout='vertical'
                    onClose={() => setSnackbar(null)}
                    before={<Icon24ErrorCircle fill='var(--dynamic_red)'/>}
                >
                    {error_msg}
                </Snackbar>);
            }
        }

        /**
         * Получение сообществ пользователя
         * @returns {Promise<void>}
         */
        async function fetchGroups() {
            await bridge.send("VKWebAppCallAPIMethod", {
                method: "groups.get",
                params: {
                    extended: 1,
                    fields: ['members_count', 'verified'].join(','),
                    filter: 'moder',
                    offset: 0,
                    count: 1000,
                    v: "5.131",
                    access_token: accessToken.access_token
                }
            }).then(data => {
                if (data.response) {
                    setGroups(data.response.items);
                    setCountGroups(data.response.count);
                } else {
                    setGroups([]);

                    console.log(data);

                    handleError({}, {
                        default_error_msg: 'Error get groups'
                    });
                }
            }).catch(e => {
                setGroups([]);

                console.log(e);

                handleError(e, {
                    default_error_msg: 'Error get groups'
                });
            });
        }

        /**
         * Получение посещенных недавно сообществ
         * @returns {Promise<void>}
         */
        async function fetchLastGroups() {
            if (lastCommunityIds.length > 0) {
                await bridge.send("VKWebAppCallAPIMethod", {
                    method: "groups.getById",
                    params: {
                        group_ids: lastCommunityIds.join(','),
                        fields: ['members_count', 'verified'].join(','),
                        v: "5.131",
                        access_token: accessToken.access_token
                    }
                }).then(data => {
                    if (data.response) {
                        setLastGroups(data.response);
                    } else {
                        setLastGroups([]);

                        console.log(data);

                        handleError({}, {
                            default_error_msg: 'Error get groups by id'
                        });
                    }
                }).catch(e => {
                    setLastGroups([]);

                    console.log(e);

                    handleError(e, {
                        default_error_msg: 'Error get groups by id'
                    });
                });
            }
        }

        fetchGroups();
        fetchLastGroups();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Очистка недавно просмотренных сообществ
     * @returns {Promise<void>}
     */
    const clearLast = async function () {
        setLastGroups([]);

        try {
            await bridge.send('VKWebAppStorageSet', {
                key: configData.storage_keys.last_groups,
                value: JSON.stringify([])
            });
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
    }

    /**
     * Выбор сообщества для показа wiki-страниц
     * @param item
     */
    const selectGroup = function (item) {
        const index = lastCommunityIds.indexOf(item.id);
        if (index > -1) {
            // если сообщество уже есть в списке, удаляем его, чтобы потом добавить в начало
            lastCommunityIds.splice(index, 1);
        }
        lastCommunityIds.unshift(item.id);

        if (lastCommunityIds.length > configData.max_last_groups) {
            lastCommunityIds.splice(configData.max_last_groups, lastCommunityIds.length - configData.max_last_groups);
        }

        try {
            bridge.send('VKWebAppStorageSet', {
                key: configData.storage_keys.last_groups,
                value: JSON.stringify(lastCommunityIds)
            });

            setGroup(item);
            go(configData.routes.pages);
        } catch (e) {
            console.log(e);

            setSnackbar(<Snackbar
                layout='vertical'
                onClose={() => setSnackbar(null)}
                before={<Avatar size={24} style={{backgroundColor: 'var(--dynamic_red)'}}
                ><Icon24ErrorCircle fill='#fff' width={14} height={14}/></Avatar>}
            >
                Error with sending data to Storage
            </Snackbar>);
        }
    }

    return (
        <Panel id={id}>
            <PanelHeader
                left={<PanelHeaderButton><Icon28InfoOutline onClick={() => {
                    go(configData.routes.about)
                }}/></PanelHeaderButton>}
            >
                {configData.name}
            </PanelHeader>

            {(lastGroups.length > 0) &&
            <Fragment>
                <Group
                    header={<Header
                        aside={<Link
                            style={{color: 'var(--icon_secondary)'}} mode="tertiary"
                            onClick={clearLast}
                        >
                            <Icon16Clear/>
                        </Link>}>
                        Недавно просмотренные
                    </Header>}>

                    <HorizontalScroll showArrows getScrollToLeft={i => i - 320} getScrollToRight={i => i + 320}>
                        <div style={{display: 'flex'}}>
                            {lastGroups.map((group) => {
                                return (
                                    <HorizontalCell
                                        key={group.id} header={group.name}
                                        onClick={() => {
                                            selectGroup(group)
                                        }}
                                    >
                                        <Avatar size={64} src={group.photo_200}/>
                                    </HorizontalCell>
                                );
                            })}
                        </div>
                    </HorizontalScroll>
                </Group>
            </Fragment>
            }

            <Group header={<Header mode="primary" indicator={countGroups}>Все сообщества</Header>}>
                <Search/>

                {(!groups) && <PanelSpinner/>}
                {(groups && groups.length < 1) &&
                <Fragment>
                    <Placeholder icon={<Icon36Users/>}>Сообществ не найдено</Placeholder>
                </Fragment>
                }
                {(groups && groups.length > 0) &&
                <Fragment>

                    <List>
                        {groups.map((group) => {
                            return (
                                <Cell
                                    key={group.id} before={<Avatar size={48} src={group.photo_200}/>}
                                    badge={group.verified ? <Icon12Verified/> : null}
                                    description={cutDeclNum(group.members_count, ['подписчик', 'подписчика', 'подписчиков'])}
                                    onClick={() => {
                                        selectGroup(group)
                                    }}
                                >
                                    {group.name}
                                </Cell>
                            );
                        })}
                    </List>
                    <Footer>{countGroups} {declOfNum(countGroups, ['сообщество', 'сообщества', 'сообществ'])}</Footer>
                </Fragment>
                }
            </Group>
            {snackbar}
        </Panel>
    )
}

export default Home;