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
    Snackbar, Counter
} from '@vkontakte/vkui';

import configData from "../config.json";
import bridge from "@vkontakte/vk-bridge";
import {
    Icon24ErrorCircle,
    Icon28AddOutline,
    Icon28Document,
    Icon32SearchOutline,
} from "@vkontakte/icons";
import {cutDeclNum, cutNum, declOfNum, timestampToDate} from "../functions";

const Pages = ({id, accessToken, group, go, setPage, setActiveModal, snackbarError}) => {
    const [snackbar, setSnackbar] = useState(snackbarError);
    const [pages, setPages] = useState(null);

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
                    v: "5.131",
                    access_token: accessToken.access_token
                }
            }).then(data => {
                if (data.response) {
                    setPages(data.response.reverse()); // переворот массива, чтобы свежие изменения были вверху
                } else {
                    setPages([]);

                    setSnackbar(<Snackbar
                        onClose={() => setSnackbar(null)}
                        before={<Icon24ErrorCircle fill='var(--dynamic_red)'/>}
                    >
                        Error get pages
                    </Snackbar>);
                }
            }).catch(e => {
                console.log(e);

                setPages([]);

                let error_msg;

                if (e.error_data) {
                    switch (e.error_data.error_reason.error_msg) {
                        default:
                            error_msg = e.error_data.error_reason.error_msg;
                    }
                } else {
                    error_msg = 'Error get pages';
                }

                if (error_msg) {
                    setSnackbar(<Snackbar
                        onClose={() => setSnackbar(null)}
                        before={<Icon24ErrorCircle fill='var(--dynamic_red)'/>}
                    >
                        {error_msg}
                    </Snackbar>);
                }
            });
        }

        fetchPages().then(() => {});

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    /**
     * Выбор wiki-страницы для показа информации
     * @param item
     */
    const selectPage = function (item) {
        setPage(item);
        go(configData.routes.page);
    }

    return (
        <Panel id={id}>
            <PanelHeader
                mode="secondary"
                left={<PanelHeaderBack onClick={() => go(configData.routes.home)}/>}
            >
                <PanelHeaderContent
                    status={cutDeclNum(group.members_count, ['подписчик', 'подписчика', 'подписчиков'])}
                    before={<Avatar size={36} src={group.photo_200}/>}
                >
                    {group.name}
                </PanelHeaderContent>
            </PanelHeader>
            <Group header={<Header mode="primary" indicator={pages ? pages.length : 0}
            >
                Wiki-страницы</Header>}>
                <Search/>
                <CellButton
                    before={<Icon28AddOutline/>}
                    onClick={()=>{
                        setActiveModal(configData.modals.addPage)
                    }}
                    // href={'https://vk.com/pages?oid=-' + group.id + '&p=Title'}
                    // target='_blank' rel='noreferrer'
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
                            return (
                                <Cell
                                    key={page.id} before={<Icon28Document style={{color: 'var(--dynamic_gray)'}}/>}
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
                    <Footer>{pages.length} {declOfNum(pages.length, ['страница', 'страницы', 'страниц'])}</Footer>
                </Fragment>
                }
            </Group>
            {snackbar}
        </Panel>
    )
}

export default Pages;