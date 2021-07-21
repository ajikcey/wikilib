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
    Counter, PanelHeaderButton
} from '@vkontakte/vkui';

import configData from "../config.json";
import bridge from "@vkontakte/vk-bridge";
import {
    Icon24Filter,
    Icon28AddOutline, Icon28InfoOutline,
    Icon32SearchOutline,
} from "@vkontakte/icons";
import {cutDeclNum, cutNum, declOfNum, handleError, timestampToDate} from "../functions";
import IconPage from "../components/IconPage";

const Pages = ({
                   id,
                   accessToken,
                   queryParams,
                   group,
                   go,
                   setPageTitle,
                   setActiveModal,
                   snackbarError,
                   pages,
                   setPages
               }) => {
    const [snackbar, setSnackbar] = useState(snackbarError);
    const [search, setSearch] = useState('');
    // const [sort, setSort] = useState({});

    let pageCount = 0;

    useEffect(() => {

        /**
         * Получение wiki-страниц сообщества
         * @returns {Promise<void>}
         */
        async function fetchPages() {
            await bridge.send("VKWebAppCallAPIMethod", {
                method: "pages.getTitles",
                params: {
                    group_id: group.id,
                    v: configData.vk_api_version,
                    access_token: accessToken.access_token
                }
            }).then(data => {
                if (data.response) {
                    setPages(data.response.reverse()); // переворот массива, чтобы свежие изменения были вверху
                } else {
                    setPages([]);

                    handleError(setSnackbar, go, {}, {
                        data: data,
                        default_error_msg: 'No response get pages'
                    });
                }
            }).catch(e => {
                setPages([]);

                handleError(setSnackbar, go, e, {
                    default_error_msg: 'Error get pages'
                });
            });
        }

        fetchPages().then(() => {
        });

        // eslint-disable-next-line
    }, []);

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
            <PanelHeader
                mode="secondary"
                left={(queryParams.vk_group_id ?
                    <PanelHeaderButton><Icon28InfoOutline onClick={() => {
                        go(configData.routes.about)
                    }}/></PanelHeaderButton> : <PanelHeaderBack onClick={back}/>)}
            >
                {(!queryParams.vk_group_id) && <PanelHeaderContent
                    status={cutDeclNum(group.members_count, ['подписчик', 'подписчика', 'подписчиков'])}
                    before={<Avatar size={36} src={group.photo_200}/>}
                >
                    {group.name}
                </PanelHeaderContent>
                }

                {(!!queryParams.vk_group_id) && <Fragment>{configData.name}</Fragment>
                }
            </PanelHeader>
            <Group>
                <Header
                    mode="primary"
                    indicator={pages ? pages.length : 0}
                >
                    Wiki-страницы</Header>

                <Search
                    placeholder='Поиск страниц'
                    onChange={onChangeSearch}
                    icon={<Icon24Filter/>}
                    onIconClick={onFiltersClick}
                />
                <CellButton
                    before={<Icon28AddOutline/>}
                    onClick={addPage}
                >
                    Новая страница</CellButton>

                {(!pages) && <PanelSpinner/>}
                {(pages && pages.length < 1) &&
                <Fragment>
                    <Placeholder icon={<Icon32SearchOutline/>}>Не найдено</Placeholder>
                </Fragment>
                }
                {(pages && pages.length > 0) &&
                <Fragment>
                    <List>
                        {pages.map((page) => {
                            if (search && !page.title.match(new RegExp(search, "i"))) return null;

                            ++pageCount;
                            return (
                                <Cell
                                    key={page.id} before={<IconPage page={page}/>}
                                    indicator={<Counter>{cutNum(page.views)}</Counter>}
                                    description={timestampToDate(page.edited) + ' ' + page.editor_name}
                                    onClick={() => {
                                        selectPage(page);
                                    }}
                                >
                                    {page.title}
                                </Cell>
                            );
                        })}
                    </List>
                    <Footer>{pageCount} {declOfNum(pageCount, ['wiki-страница', 'wiki-страницы', 'wiki-страниц'])}</Footer>
                </Fragment>
                }
            </Group>
            {snackbar}
        </Panel>
    )
}

export default Pages;