import React, {Fragment, useEffect, useState} from 'react';

import {
    Avatar, Cell, CellButton, Footer,
    Group,
    Header, List,
    Panel,
    PanelHeader,
    PanelHeaderBack, PanelHeaderContent, PanelSpinner,
    Placeholder,
    Search,
    Counter
} from '@vkontakte/vkui';

import configData from "../../config.json";
import {
    Icon24Filter,
    Icon28AddOutline,
    Icon32SearchOutline, Icon48BlockOutline,
} from "@vkontakte/icons";
import {cutDeclNum, cutNum, declOfNum, fetchPages, handleError, regexpSearch, timestampToDate} from "../../functions";
import IconPage from "../IconPage";
import {useFirstPageCheck, useRouter} from "@happysanta/router";
import {MODAL_ADD_PAGE, MODAL_SORT_PAGE, PAGE_HOME, PAGE_WIKI} from "../../index";

const PanelGroup = ({
                   id,
                   setAccessGroupToken,
                   accessGroupTokens,
                   accessToken,
                   group,
                   pageSort,
                   strings,
                   setPageTitle,
                   setModalData,
                   snackbarError,
                   getLastGroups,
                   addLastGroup,
                   pages,
                   setPages
               }) => {
    const [snackbar, setSnackbar] = useState(snackbarError);
    const [search, setSearch] = useState('');

    const router = useRouter();
    const isFirstPage = useFirstPageCheck();
    let pageCount = 0;

    useEffect(() => {
        if (group) {
            // после получения данных сообщества, чтобы не было "слишком много запросов в секунду"
            getLastGroups(accessToken.access_token).then(() => {
                addLastGroup(group);
            }).catch((e) => {
                console.log('getLastGroups', e);
            });

            fetchGroupPages();

            if (accessGroupTokens[group.id]) {
                setAccessGroupToken(accessGroupTokens[group.id]);
            } else {
                setAccessGroupToken(null);
            }
        }

        // eslint-disable-next-line
    }, [group]); // ждем получение группы из родительского потока

    function fetchGroupPages() {
        fetchPages(group.id, accessToken.access_token).then(data => {
            if (data.response) {

                let f = '';

                if (pageSort.field === 1) {
                    f = 'edited';
                } else if (pageSort.field === 2) {
                    f = 'views';
                } else {
                    f = 'created';
                }

                data.response.sort((a, b) => {
                    if (a[f] > b[f]) {
                        return (pageSort.direction === configData.directions.asc ? 1 : -1);
                    }
                    if (a[f] < b[f]) {
                        return (pageSort.direction === configData.directions.asc ? -1 : 1);
                    }
                    return 0;
                });

                setPages(data.response);
            } else {
                setPages([]);

                handleError(strings, setSnackbar, router, {}, {
                    data: data,
                    default_error_msg: 'No response get pages'
                });
            }
        }).catch(e => {
            setPages([]);

            handleError(strings, setSnackbar, router, e, {
                default_error_msg: 'Error get pages'
            });
        });
    }

    const selectPage = function (item) {
        setPageTitle(item);
        router.pushPage(PAGE_WIKI);
    }

    const addPage = function () {
        setModalData({
            setSnackbar: setSnackbar,
        });
        router.pushModal(MODAL_ADD_PAGE);
    }

    const onChangeSearch = (e) => {
        setSearch(e.currentTarget.value);
    }

    const onFiltersClick = () => {
        router.pushModal(MODAL_SORT_PAGE);
    }

    return (
        <Panel id={id} centered={!group || group.deactivated}>
            {(!group) && <PanelSpinner/>}

            {group &&
            <Fragment>
                <PanelHeader
                    mode="secondary"
                    left={<PanelHeaderBack onClick={() => isFirstPage ? router.replacePage(PAGE_HOME) : router.popPage()}/>}
                >
                    <PanelHeaderContent
                        status={cutDeclNum(group.members_count, [
                            strings.member.toLowerCase(),
                            strings.two_members.toLowerCase(),
                            strings.some_members.toLowerCase()
                        ])}
                        before={<Avatar size={36} src={group.photo_100}/>}
                    >
                        {group.name}
                    </PanelHeaderContent>
                </PanelHeader>
                {(!!group.deactivated) &&
                <Group>
                    <Placeholder
                        icon={<Icon48BlockOutline style={{color: 'var(--destructive)'}}/>}
                        header={strings.access_denied}
                    >
                        {strings.group_deactivated}
                    </Placeholder>
                </Group>
                }
                {(!group.deactivated) &&
                <Group>
                    <Header
                        mode="primary"
                        indicator={pages ? pages.length : ""}
                    >{strings.wiki_pages}</Header>

                    <Search
                        placeholder={strings.search_pages}
                        onChange={onChangeSearch}
                        icon={<Icon24Filter/>}
                        onIconClick={onFiltersClick}
                        maxLength={configData.max_length_title}
                    />
                    <CellButton
                        before={<Avatar size={38} shadow={false}><Icon28AddOutline/></Avatar>}
                        onClick={addPage}
                    >{strings.new_page}</CellButton>

                    {(!pages) && <PanelSpinner/>}
                    {(pages && pages.length < 1) &&
                    <Fragment>
                        <Placeholder icon={<Icon32SearchOutline/>}>{strings.no_pages_found}</Placeholder>
                    </Fragment>
                    }
                    {(pages && pages.length > 0) &&
                    <Fragment>
                        <List>
                            {pages.map((page) => {
                                if (search && !page.title.match(regexpSearch(search))) return null;

                                ++pageCount;
                                return (
                                    <Cell
                                        key={page.id} before={<IconPage page={page}/>}
                                        indicator={<Counter>{cutNum(page.views)}</Counter>}
                                        description={timestampToDate(page.edited) + ' • ' + (page.editor_name ?? '')}
                                        onClick={() => {
                                            selectPage(page);
                                        }}
                                    >
                                        {page.title}
                                    </Cell>
                                );
                            })}
                        </List>
                        <Footer>{pageCount} {declOfNum(pageCount, [
                            strings.page.toLowerCase(),
                            strings.two_pages.toLowerCase(),
                            strings.some_pages.toLowerCase()
                        ])}</Footer>
                    </Fragment>
                    }
                </Group>
                }
            </Fragment>
            }

            {snackbar}
        </Panel>
    )
}

export default PanelGroup;