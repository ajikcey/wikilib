import React, {Fragment, useEffect, useState} from 'react';

import {
    Avatar, CellButton, Footer, Group, HorizontalScroll, InfoRow, Link,
    Panel, PanelHeader, PanelHeaderBack, PanelSpinner, Placeholder,
    Snackbar, Tabs, TabsItem, IconButton, SimpleCell, Header, PanelHeaderContent, Spacing
} from '@vkontakte/vkui';

import bridge from "@vkontakte/vk-bridge";
import {
    Icon24CheckCircleOutline, Icon24DeleteOutline,
    Icon24ErrorCircle,
    Icon24ExternalLinkOutline, Icon24HistoryBackwardOutline, Icon24TextOutline,
    Icon24Write,
    Icon28CopyOutline,
    Icon28EditOutline,
    Icon28HashtagOutline,
    Icon32SearchOutline,
    Icon36CalendarOutline,
} from "@vkontakte/icons";
import configData from "../config.json";
import {copyToClipboard, cutDeclNum, declOfNum, savePage, timestampToDate} from "../functions";
import IconPage from "../components/IconPage";

const Page = ({id, accessToken, pageTitle, setPage, user, group, go, setTempAccess, setHistoryItem, setActiveModal, snackbarError}) => {
    const [snackbar, setSnackbar] = useState(snackbarError);
    const [infoPage, setInfoPage] = useState(null);
    const [creator, setCreator] = useState(null);
    const [editor, setEditor] = useState(null);
    const [history, setHistory] = useState(null);
    const [tab, setTab] = useState('info');

    useEffect(() => {

        /**
         * Получение информации о wiki-странице
         * @returns {Promise<void>}
         */
        async function fetchInfoPage() {
            await bridge.send("VKWebAppCallAPIMethod", {
                method: "pages.get",
                params: {
                    page_id: pageTitle.id,
                    owner_id: ('-' + pageTitle.group_id),
                    need_source: 1,
                    v: "5.131",
                    access_token: accessToken.access_token
                }
            }).then(data => {
                if (data.response) {
                    fetchUsers([data.response.creator_id, data.response.editor_id]);

                    setInfoPage(data.response);
                } else {
                    setSnackbar(<Snackbar
                        onClose={() => setSnackbar(null)}
                        before={<Icon24ErrorCircle fill='var(--dynamic_red)'/>}
                    >
                        No response get page
                    </Snackbar>);
                }
            }).catch(e => {
                console.log(e);

                let error_msg;

                if (e.error_data) {
                    switch (e.error_data.error_reason.error_msg) {
                        default:
                            error_msg = e.error_data.error_reason.error_msg;
                    }
                } else {
                    error_msg = 'Error get page';
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

        /**
         * Получение пользователей
         * @param creator_id
         * @param editor_id
         * @returns {Promise<void>}
         */
        async function fetchUsers(creator_id, editor_id) {
            await bridge.send("VKWebAppCallAPIMethod", {
                method: "users.get",
                params: {
                    user_ids: [creator_id, editor_id].join(','),
                    fields: ['photo_200'].join(','),
                    v: "5.131",
                    access_token: accessToken.access_token
                }
            }).then(data => {
                if (data.response) {
                    setCreator(data.response[0]);

                    if (data.response[1]) {
                        setEditor(data.response[1]);
                    } else {
                        setEditor(data.response[0]); // creator_id == editor_id
                    }
                } else {
                    setSnackbar(<Snackbar
                        onClose={() => setSnackbar(null)}
                        before={<Icon24ErrorCircle fill='var(--dynamic_red)'/>}
                    >
                        No response get users
                    </Snackbar>);
                }
            }).catch(e => {
                console.log(e);

                let error_msg;

                if (e.error_data) {
                    switch (e.error_data.error_reason.error_msg) {
                        default:
                            error_msg = e.error_data.error_reason.error_msg;
                    }
                } else {
                    error_msg = 'Error get users';
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

        /**
         * Возвращает список всех старых версий вики-страницы.
         * @returns {Promise<void>}
         */
        async function fetchHistory() {
            await bridge.send("VKWebAppCallAPIMethod", {
                method: "pages.getHistory",
                params: {
                    page_id: pageTitle.id,
                    group_id: group.id,
                    v: "5.131",
                    access_token: accessToken.access_token
                }
            }).then(data => {
                if (data.response) {
                    setHistory(data.response);
                } else {
                    setSnackbar(<Snackbar
                        onClose={() => setSnackbar(null)}
                        before={<Icon24ErrorCircle fill='var(--dynamic_red)'/>}
                    >
                        No response get history
                    </Snackbar>);
                }
            }).catch(e => {
                console.log(e);

                let error_msg;

                if (e.error_data) {
                    switch (e.error_data.error_reason.error_msg) {
                        default:
                            error_msg = e.error_data.error_reason.error_msg;
                    }
                } else {
                    error_msg = 'Error get history';
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

        fetchInfoPage().then(() => {});
        fetchHistory().then(() => {});

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Переименование wiki-страницы
     */
    const renamePage = () => {
        setActiveModal(configData.modals.renamePage);
    }

    /**
     * Изменение настройки, что может просматривать страницу
     */
    const settingAccessPage = () => {
        setTempAccess({
            who_can_view: infoPage.who_can_view,
            who_can_edit: infoPage.who_can_edit,
        });
        setActiveModal(configData.modals.accessPage);
    }

    /**
     * Копирование ID wiki-страницы
     */
    const copyId = () => {
        copyToClipboard(infoPage.id);

        setSnackbar(<Snackbar
            onClose={() => setSnackbar(null)}
            before={<Icon24CheckCircleOutline fill='var(--dynamic_green)'/>}
        >
            Скопировано в буфер
        </Snackbar>);
    }

    /**
     * Название уровня доступа
     * @param key
     * @returns {string}
     */
    const nameAccess = (key) => {
        switch (key) {
            case configData.wiki_access.staff:
                return "Только руководители";
            case configData.wiki_access.member:
                return "Только участники";
            case configData.wiki_access.all:
                return "Все";
            default:
                return "";
        }
    }

    /**
     * Восстановление wiki-страницы
     */
    const restorePage = () => {
        savePage(infoPage.id, infoPage.group_id, user.id, accessToken.access_token, infoPage.title, infoPage.source).then(() => {

            setSnackbar(null);
            setSnackbar(<Snackbar
                onClose={() => setSnackbar(null)}
                before={<Icon24HistoryBackwardOutline fill='var(--accent)'/>}
            >
                Страница восстановлена
            </Snackbar>);
        });
    }

    /**
     * Удаление wiki-страницы
     */
    const delPage = () => {
        savePage(infoPage.id, infoPage.group_id, user.id, accessToken.access_token, infoPage.title, infoPage.source).then(() => {

            setSnackbar(<Snackbar
                onClose={() => setSnackbar(null)}
                action="Восстановить"
                onActionClick={restorePage}
                before={<Icon24DeleteOutline fill='var(--dynamic_red)'/>}
            >
                Страница удалена
            </Snackbar>);
        });
    }

    /**
     * Выбор версии wiki-страницы для сохранения
     * @param item
     */
    const selectVersion = function (item) {
        console.log('infoPage', infoPage);

        setPage(infoPage);
        setHistoryItem(item);
        go(configData.routes.wiki_version);
    }

    /**
     * Редактирование wiki-страницы
     */
    const editPage = () => {
        console.log('infoPage', infoPage);

        setPage(infoPage);
        setHistoryItem(null); // reset selected version before edit current
        go(configData.routes.wiki_version);
    }

    return (
        <Panel id={id}>
            <PanelHeader
                mode="secondary"
                left={<PanelHeaderBack onClick={() => go(configData.routes.pages)}/>}
            >
                <PanelHeaderContent
                    status={cutDeclNum(pageTitle.views, ['просмотр', 'просмотра', 'просмотров'])}
                    before={<IconPage page={pageTitle}/>}
                >
                    {pageTitle.title}
                </PanelHeaderContent>
            </PanelHeader>

            <Group>
                <Tabs>
                    <HorizontalScroll>
                        <TabsItem
                            onClick={() => setTab('info')}
                            selected={tab === 'info'}
                        >
                            Информация
                        </TabsItem>
                        <TabsItem
                            onClick={() => setTab('history')}
                            selected={tab === 'history'}
                        >
                            История
                        </TabsItem>
                    </HorizontalScroll>
                </Tabs>

                {(tab === 'info') && <Fragment>
                    {!(infoPage && creator && editor) && <PanelSpinner/>}
                    {(infoPage && creator && editor) &&
                    <Fragment>

                        <Header mode="secondary">Меню</Header>
                        <CellButton
                            before={<Icon24ExternalLinkOutline/>}
                            href={'https://vk.com/page-' + group.id + '_' + pageTitle.id + '?act=edit&section=edit'}
                            target='_blank' rel='noreferrer'
                        >
                            Открыть редактор ВКонтакте</CellButton>

                        <CellButton
                            before={<Icon24Write/>}
                            onClick={() => {
                                editPage();
                            }}
                        >
                            Редактировать</CellButton>

                        <CellButton
                            before={<Icon24TextOutline/>}
                            onClick={() => {
                                renamePage();
                            }}
                        >
                            Переименовать</CellButton>

                        <CellButton
                            before={<Icon24DeleteOutline/>}
                            mode="danger"
                            onClick={delPage}
                        >
                            Удалить</CellButton>

                        <Spacing separator size={16}/>

                        <Header mode="secondary">Настройки</Header>
                        <SimpleCell
                            indicator={nameAccess(infoPage.who_can_view)}
                            onClick={settingAccessPage}
                        >
                            Просмотр</SimpleCell>
                        <SimpleCell
                            indicator={nameAccess(infoPage.who_can_edit)}
                            onClick={settingAccessPage}
                        >
                            Редактирование</SimpleCell>

                        <Spacing separator size={16}/>

                        <SimpleCell
                            before={<Icon28HashtagOutline/>}
                            after={<IconButton onClick={copyId}><Icon28CopyOutline/></IconButton>}
                        >
                            <InfoRow header="ID страницы">
                                {infoPage.id}
                            </InfoRow>
                        </SimpleCell>
                        <SimpleCell
                            before={<Icon28EditOutline/>}
                            after={<Link
                                href={'https://vk.com/id' + editor.id} target='_blank'
                            >
                                <Avatar size={32} src={editor.photo_200}/></Link>}
                        >
                            <InfoRow header="Последнее изменение">
                                {timestampToDate(infoPage.edited)}
                            </InfoRow>
                        </SimpleCell>
                        <SimpleCell
                            before={<Icon36CalendarOutline/>}
                            after={<Link
                                href={'https://vk.com/id' + creator.id} target='_blank'
                            >
                                <Avatar size={32} src={creator.photo_200}/></Link>}
                        >
                            <InfoRow header="Создано">
                                {timestampToDate(infoPage.created)}
                            </InfoRow>
                        </SimpleCell>
                    </Fragment>
                    }
                </Fragment>
                }

                {(tab === 'history') && <Fragment>
                    {(!history) && <PanelSpinner/>}
                    {(history && history.length < 1) &&
                    <Placeholder icon={<Icon32SearchOutline/>}>Не найдено</Placeholder>}
                    {(history && history.length > 0) &&
                    <Fragment>
                        {history.map((item) => {
                            return (
                                <SimpleCell
                                    indicator={timestampToDate(item.date)}
                                    key={item.id}
                                    description={'ver. ' + item.id}
                                    onClick={()=>{selectVersion(item)}}
                                >
                                    {pageTitle.editor_name}
                                </SimpleCell>
                            );
                        })}
                        <Footer>{history.length} {declOfNum(history.length, ['изменение', 'изменения', 'изменений'])}</Footer>
                    </Fragment>
                    }
                </Fragment>
                }
            </Group>

            {snackbar}
        </Panel>
    )
}

export default Page;