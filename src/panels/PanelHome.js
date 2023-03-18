import React, {Fragment, useEffect, useState} from 'react';

import {
    Avatar,
    Group,
    Header,
    Panel,
    PanelHeader,
    Cell,
    List,
    Search,
    PanelHeaderButton,
    Placeholder,
    PanelSpinner,
    Div, Footer, Button
} from '@vkontakte/vkui';
import {
    Icon12Verified,
    Icon28InfoOutline, Icon36Users
} from '@vkontakte/icons';

import configData from "../config.json";
import {cutDeclNum, declOfNum, fetchGroups, handleError, regexpSearch} from "../functions";
import HorizontalScrollGroups from "../components/HorizontalScrollGroups";
import {useRouter} from "@happysanta/router";
import {PAGE_ABOUT, PAGE_GROUP} from "../index";

const PanelHome = ({
                       id,
                       accessToken,
                       strings,
                       setPages,
                       setGroup,
                       groups,
                       setGroups,
                       snackbarError,
                       lastGroups,
                       getLastGroups,
                       clearLastGroups,
                       groupOffset, setGroupOffset
                   }) => {
    const [snackbar, setSnackbar] = useState(snackbarError);
    const [search, setSearch] = useState('');
    const [end, setEnd] = useState(true);

    const router = useRouter();
    let groupCount = 0;

    useEffect(() => {
        setPages(null); // reset

        getLastGroups(accessToken.access_token).then().catch((e) => {
            console.log('getLastGroups', e);
        });

        if (!groups) {
            moreGroups().then();
        }

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
                handleError(strings, setSnackbar, router, {}, {
                    default_error_msg: 'No response get groups'
                });
            }
        }).catch(e => {
            handleError(strings, setSnackbar, router, e, {
                default_error_msg: 'Error get groups'
            });
        });
    }

    const selectGroup = (item) => {
        setGroup(item);
        router.pushPage(PAGE_GROUP);
    }

    const onChangeSearch = (e) => {
        setSearch(e.currentTarget.value);
    }

    return (
        <Panel id={id}>
            <PanelHeader
                mode="secondary"
                before={<PanelHeaderButton><Icon28InfoOutline onClick={() => {
                    router.pushPage(PAGE_ABOUT)
                }}/></PanelHeaderButton>}
            >
                {configData.name}
            </PanelHeader>

            <HorizontalScrollGroups
                clearLastGroups={clearLastGroups}
                selectGroup={selectGroup}
                lastGroups={lastGroups}
                strings={strings}
            />

            <Group>
                <Header
                    mode="primary" indicator={groups ? groups.count : ""}
                >
                    {strings.all_communities}
                </Header>
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
                                    description={cutDeclNum(group.members_count, [
                                        strings.member.toLowerCase(),
                                        strings.two_members.toLowerCase(),
                                        strings.some_members.toLowerCase()
                                    ])}
                                    onClick={() => {
                                        selectGroup(group)
                                    }}
                                >{group.name}</Cell>
                            );
                        })}
                    </List>
                    {(end) &&
                    <Footer>{groupCount} {declOfNum(groupCount, [
                        strings.community.toLowerCase(),
                        strings.two_communities.toLowerCase(),
                        strings.some_communities.toLowerCase()
                    ])}</Footer>
                    }
                    {(!end) &&
                    <Div>
                        <Button
                            stretched
                            mode="secondary"
                            size='l'
                            onClick={moreGroups}
                        >{strings.show_more}</Button>
                    </Div>
                    }

                </Fragment>
                }
            </Group>
            {snackbar}
        </Panel>
    )
}

export default PanelHome;