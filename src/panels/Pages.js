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
    Counter, Button
} from '@vkontakte/vkui';

import configData from "../config.json";
import {
    Icon24Filter,
    Icon28AddOutline,
    Icon32SearchOutline, Icon48BlockOutline,
} from "@vkontakte/icons";
import {cutDeclNum, cutNum, declOfNum, fetchPages, handleError, regexpSearch, timestampToDate} from "../functions";
import IconPage from "../components/IconPage";

const Pages = ({
                   id,
                   accessToken,
                   group,
                   pageSort,
                   strings,
                   go,
                   setPageTitle,
                   setActiveModal,
                   setModalData,
                   snackbarError,
                   addLastGroup,
                   pages,
                   setPages
               }) => {
    const [snackbar, setSnackbar] = useState(snackbarError);
    const [search, setSearch] = useState('');

    let pageCount = 0;

    useEffect(() => {
        /**
         * Получение wiki-страниц сообщества
         * @returns {Promise<void>}
         */
        async function fetchGroupPages() {
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

                    handleError(strings, setSnackbar, go, {}, {
                        data: data,
                        default_error_msg: 'No response get pages'
                    });
                }
            }).catch(e => {
                setPages([]);

                handleError(strings, setSnackbar, go, e, {
                    default_error_msg: 'Error get pages'
                });
            });
        }

        if (group) {
            fetchGroupPages().then(() => {
                addLastGroup(group);
            }).catch();
        }

        // eslint-disable-next-line
    }, [group]); // ждем получение группы из родительского потока

    /**
     * Выбор wiki-страницы для показа информации
     * @param item
     */
    const selectPage = function (item) {
        setPageTitle(item);
        go(configData.routes.page);
    }

    /**
     * Создание wiki-страницы
     */
    const addPage = function () {
        setModalData({
            setSnackbar: setSnackbar,
        });
        setActiveModal(configData.modals.addPage);
    }

    const back = function () {
        setPages(null);
        go(configData.routes.home);
    }

    const onChangeSearch = (e) => {
        setSearch(e.currentTarget.value);
    }

    const onFiltersClick = () => {
        setActiveModal(configData.modals.sortPage);
    }

    return (
        <Panel id={id}>
            {(!group) && <PanelSpinner/>}

            {group &&
            <Fragment>
                <PanelHeader
                    mode="secondary"
                    left={<PanelHeaderBack onClick={back}/>}
                >
                    <PanelHeaderContent
                        status={cutDeclNum(group.members_count, [strings.member.toLowerCase(), strings.two_members.toLowerCase(), strings.some_members.toLowerCase()])}
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
                        action={<Button size="l" onClick={back}>{strings.back}</Button>}
                    >
                        {strings.group_deactivated}
                    </Placeholder>
                </Group>
                }
                {(!group.deactivated) &&
                <Group>
                    <Header
                        mode="primary"
                        indicator={pages ? pages.length : 0}
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
                                        description={timestampToDate(page.edited) + ' ' + (page.editor_name ?? '')}
                                        onClick={() => {
                                            selectPage(page);
                                        }}
                                    >
                                        {page.title}
                                    </Cell>
                                );
                            })}
                        </List>
                        <Footer>{pageCount} {declOfNum(pageCount, [strings.page.toLowerCase(), strings.two_pages.toLowerCase(), strings.some_pages.toLowerCase()])}</Footer>
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

export default Pages;