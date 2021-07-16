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
    Placeholder,
    PanelSpinner,
    Footer, Link, Spacing
} from '@vkontakte/vkui';
import {
    Icon12Verified, Icon16Clear,
    Icon28InfoOutline, Icon36Users
} from '@vkontakte/icons';

import configData from "../config.json";
import {cutDeclNum, declOfNum, handleError} from "../functions";

const Home = ({id, accessToken, go, setGroup, lastGroupIds, setLastGroupIds, snackbarError}) => {
    const [snackbar, setSnackbar] = useState(snackbarError);
    const [groups, setGroups] = useState(null);

    const [lastGroups, setLastGroups] = useState([]);
    const [countGroups, setCountGroups] = useState(0);

    useEffect(() => {
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
                    v: configData.vk_api_version,
                    access_token: accessToken.access_token
                }
            }).then(data => {
                if (data.response) {
                    setGroups(data.response.items);
                    setCountGroups(data.response.count);
                } else {
                    setGroups([]);

                    handleError(setSnackbar, go, {}, {
                        default_error_msg: 'No response get groups'
                    });
                }
            }).catch(e => {
                setGroups([]);

                handleError(setSnackbar, go, e, {
                    default_error_msg: 'Error get groups'
                });
            });
        }

        /**
         * Получение посещенных недавно сообществ
         * @returns {Promise<void>}
         */
        async function fetchLastGroups() {
            if (lastGroupIds.length > 0) {
                await bridge.send("VKWebAppCallAPIMethod", {
                    method: "groups.getById",
                    params: {
                        group_ids: lastGroupIds.join(','),
                        fields: ['members_count', 'verified'].join(','),
                        v: configData.vk_api_version,
                        access_token: accessToken.access_token
                    }
                }).then(data => {
                    if (data.response) {
                        setLastGroups(data.response);
                    } else {
                        setLastGroups([]);

                        handleError(setSnackbar, go, {}, {
                            default_error_msg: 'No response get groups by id'
                        });
                    }
                }).catch(e => {
                    setLastGroups([]);

                    handleError(setSnackbar, go, e, {
                        default_error_msg: 'Error get groups by id'
                    });
                });
            } else {
                setLastGroups([]);
            }
        }

        fetchGroups().then(() => {
        });
        fetchLastGroups().then(() => {
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Очистка недавно просмотренных сообществ
     * @returns {Promise<void>}
     */
    const clearLast = async function () {
        setLastGroupIds([]);
        setLastGroups([]);

        try {
            await bridge.send('VKWebAppStorageSet', {
                key: configData.storage_keys.last_groups,
                value: JSON.stringify([])
            });
        } catch (e) {
            handleError(setSnackbar, go, e, {
                default_error_msg: 'Error with sending data to Storage'
            });
        }
    }

    /**
     * Выбор сообщества для показа wiki-страниц
     * @param item
     */
    const selectGroup = function (item) {
        const index = lastGroupIds.indexOf(item.id);
        if (index > -1) {
            // если сообщество уже есть в списке, удаляем его, чтобы потом добавить в начало
            lastGroupIds.splice(index, 1);
        }
        lastGroupIds.unshift(item.id);

        if (lastGroupIds.length > configData.max_last_groups) {
            lastGroupIds.splice(configData.max_last_groups, lastGroupIds.length - configData.max_last_groups);
        }

        try {
            bridge.send('VKWebAppStorageSet', {
                key: configData.storage_keys.last_groups,
                value: JSON.stringify(lastGroupIds)
            }).then(() => {
            });

            setGroup(item);
            go(configData.routes.pages);
        } catch (e) {
            handleError(setSnackbar, go, e, {
                default_error_msg: 'Error with sending data to Storage'
            });
        }
    }

    return (
        <Panel id={id}>
            <PanelHeader
                mode="secondary"
                left={<PanelHeaderButton><Icon28InfoOutline onClick={() => {
                    go(configData.routes.about)
                }}/></PanelHeaderButton>}
            >
                {configData.name}
            </PanelHeader>

            <Group>
                {(lastGroups.length > 0) &&
                <Fragment>
                    <Header
                        aside={<Link
                            style={{color: 'var(--icon_secondary)'}} mode="tertiary"
                            onClick={clearLast}
                        >
                            <Icon16Clear/>
                        </Link>}>
                        Недавно просмотренные
                    </Header>

                    <HorizontalScroll showArrows getScrollToLeft={i => i - 320} getScrollToRight={i => i + 320}>
                        <div style={{display: 'flex'}}>
                            {lastGroups.map((group) => {
                                return (
                                    <HorizontalCell
                                        key={group.id}
                                        onClick={() => {
                                            selectGroup(group)
                                        }}
                                        header={<div style={{
                                            WebkitBoxOrient: 'vertical',
                                            WebkitLineClamp: 2,
                                            display: '-webkit-box',
                                            overflow: 'hidden',
                                            wordBreak: 'break-word'
                                        }}>{group.name}</div>}
                                    >
                                        <Avatar size={64} src={group.photo_200}/>
                                    </HorizontalCell>
                                );
                            })}
                        </div>
                    </HorizontalScroll>

                    <Spacing separator size={16}/>
                </Fragment>
                }

                <Header mode="primary" indicator={countGroups}>Все сообщества</Header>
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