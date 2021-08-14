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
    Div, Footer, Link, Button
} from '@vkontakte/vkui';
import {
    Icon12Verified, Icon16Clear,
    Icon28InfoOutline, Icon36Users
} from '@vkontakte/icons';

import configData from "../config.json";
import {cutDeclNum, declOfNum, fetchGroups, fetchGroupsById, handleError, regexpSearch} from "../functions";

const Home = ({
                  id,
                  accessToken,
                  go,
                  goToPage,
                  strings,
                  setGroup,
                  lastGroupIds,
                  groups,
                  setGroups,
                  setLastGroupIds,
                  snackbarError,
                  lastGroups,
                  setLastGroups,
                  groupOffset, setGroupOffset
              }) => {
    const [snackbar, setSnackbar] = useState(snackbarError);
    const [search, setSearch] = useState('');
    const [end, setEnd] = useState(true);

    let groupCount = 0;

    useEffect(() => {
        /**
         * Получение посещенных недавно сообществ
         * @returns {Promise<void>}
         */
        async function fetchLastGroups() {
            return new Promise((resolve) => {
                if (lastGroupIds.length > 0) {
                    fetchGroupsById(lastGroupIds, accessToken.access_token).then(data => {
                        if (data.response) {
                            setLastGroups(data.response);
                            resolve();
                        } else {
                            handleError(strings, setSnackbar, go, {}, {
                                default_error_msg: 'No response get groups by id'
                            });
                        }
                    }).catch(e => {
                        handleError(strings, setSnackbar, go, e, {
                            default_error_msg: 'Error get groups by id'
                        });
                    });
                } else {
                    setLastGroups([]);
                    resolve();
                }
            });
        }

        fetchLastGroups().then(()=>{
            if (!groups) {
                moreGroups().then();
            }
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Показать еще сообщества
     * @returns {Promise<void>}
     */
    const moreGroups = async function () {
        fetchGroups(groupOffset, accessToken.access_token).then(data => {
            if (data.response) {
                if (!groups) groups = {};
                groups.count = data.response.count;
                groups.items = (groups.items || []).concat(data.response.items);

                setGroups(groups);

                groupOffset += data.response.items.length;
                setGroupOffset(groupOffset);

                if (groupOffset < data.response.count) {
                    setEnd(false);
                } else {
                    setEnd(true);
                }
            } else {
                handleError(strings, setSnackbar, go, {}, {
                    default_error_msg: 'No response get groups'
                });
            }
        }).catch(e => {
            handleError(strings, setSnackbar, go, e, {
                default_error_msg: 'Error get groups'
            });
        });
    }

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
            handleError(strings, setSnackbar, go, e, {
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
            handleError(strings, setSnackbar, go, e, {
                default_error_msg: 'Error with sending data to Storage'
            });
        }
    }

    const onChangeSearch = (e) => {
        setSearch(e.currentTarget.value);
    }

    return (
        <Panel id={id}>
            <PanelHeader
                mode="secondary"
                left={<PanelHeaderButton><Icon28InfoOutline onClick={() => {
                    goToPage(configData.routes.about)
                }}/></PanelHeaderButton>}
            >
                {configData.name}
            </PanelHeader>

            {(lastGroups && lastGroups.length > 0) &&
            <Fragment>
                <Group>
                    <Header
                        aside={<Link
                            style={{color: 'var(--icon_secondary)'}} mode="tertiary"
                            onClick={clearLast}
                        >
                            <Icon16Clear/>
                        </Link>}>
                        {strings.recently_watched}
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
                                        <Avatar size={64} src={group.photo_100}/>
                                    </HorizontalCell>
                                );
                            })}
                        </div>
                    </HorizontalScroll>
                </Group>
            </Fragment>
            }

            <Group>
                <Header mode="primary" indicator={groups ? groups.count : 0}>{strings.all_communities}</Header>
                <Search
                    placeholder={strings.community_search}
                    onChange={onChangeSearch}
                    maxLength={configData.max_length_title}
                />

                {(!groups) && <PanelSpinner/>}

                {(groups && groups.items && groups.items.length < 1) &&
                <Fragment>
                    <Placeholder icon={<Icon36Users/>}>{strings.no_communities_found}</Placeholder>
                </Fragment>
                }

                {(groups && groups.items && groups.items.length > 0) &&
                <Fragment>
                    <List>
                        {groups.items.map((group) => {
                            if (search && !group.name.match(regexpSearch(search))) return null;

                            ++groupCount;
                            return (
                                <Cell
                                    key={group.id} before={<Avatar size={48} src={group.photo_100}/>}
                                    badge={group.verified ? <Icon12Verified/> : null}
                                    description={cutDeclNum(group.members_count, [strings.member.toLowerCase(), strings.two_members.toLowerCase(), strings.some_members.toLowerCase()])}
                                    onClick={() => {
                                        selectGroup(group)
                                    }}
                                >
                                    {group.name}
                                </Cell>
                            );
                        })}
                    </List>
                    {(end) &&
                    <Footer>{groupCount} {declOfNum(groupCount, [strings.community.toLowerCase(), strings.two_communities.toLowerCase(), strings.some_communities.toLowerCase()])}</Footer>
                    }
                    {(!end) &&
                    <Div>
                        <Button
                            stretched
                            mode="secondary"
                            size='l'
                            onClick={moreGroups}
                        >
                            {strings.show_more}</Button>
                    </Div>
                    }

                </Fragment>
                }
            </Group>
            {snackbar}
        </Panel>
    )
}

export default Home;