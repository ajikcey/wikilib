import React, {Fragment, useEffect, useState} from 'react';

import {
    Avatar, CellButton, Footer, Group, HorizontalScroll, InfoRow, Link,
    Panel, PanelHeader, PanelHeaderBack, PanelSpinner, Placeholder,
    Snackbar, Tabs, TabsItem, IconButton, SimpleCell, PanelHeaderContent, Spacing
} from '@vkontakte/vkui';

import {
    Icon24CheckCircleOutline, Icon24DeleteOutline, Icon24ExternalLinkOutline,
    Icon24HistoryBackwardOutline, Icon24Linked,
    Icon24Write,
    Icon28CopyOutline,
    Icon28EditOutline,
    Icon32SearchOutline,
    Icon36CalendarOutline,
} from "@vkontakte/icons";
import configData from "../config.json";
import {
    copyToClipboard,
    cutDeclNum,
    declOfNum, fetchHistory, fetchPage,
    fetchUsers,
    fetchVersion, handleError,
    savePage,
    timestampToDate
} from "../functions";
import IconPage from "../components/IconPage";

const Page = ({id, accessToken, pageTitle, setContent, go, group, setModalData, setActiveModal, snackbarError}) => {
    const [snackbar, setSnackbar] = useState(snackbarError);
    const [infoPage, setInfoPage] = useState(null);
    const [creator, setCreator] = useState(null);
    const [editor, setEditor] = useState(null);
    const [history, setHistory] = useState(null);
    const [tab, setTab] = useState('info');

    useEffect(() => {

        fetchPage(pageTitle.id, pageTitle.group_id, 1, accessToken.access_token).then(data => {
            if (data.response) {
                fetchUsers([data.response.creator_id, data.response.editor_id], accessToken.access_token).then(data => {
                    if (data.response) {
                        setCreator(data.response[0]);

                        if (data.response[1]) {
                            setEditor(data.response[1]);
                        } else {
                            setEditor(data.response[0]); // creator_id == editor_id
                        }
                    } else {
                        handleError(setSnackbar, go, {}, {
                            data: data,
                            default_error_msg: 'No response get users'
                        });
                    }
                }).catch(e => {
                    handleError(setSnackbar, go, e, {
                        default_error_msg: 'Error get users'
                    });
                });

                setInfoPage(data.response);
            } else {
                handleError(setSnackbar, go, {}, {
                    data: data,
                    default_error_msg: 'No response get page'
                });
            }
        }).catch(e => {
            handleError(setSnackbar, go, e, {
                default_error_msg: 'Error get page'
            });
        });

        fetchHistory(pageTitle.id, pageTitle.group_id, accessToken.access_token).then(data => {
            if (data.response) {
                setHistory(data.response);
            } else {
                setHistory([]);

                handleError(setSnackbar, go, {}, {
                    data: data,
                    default_error_msg: 'No response get history'
                });
            }
        }).catch(e => {
            setHistory([]);

            handleError(setSnackbar, go, e, {
                default_error_msg: 'Error get history'
            });
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Изменение настройки, кто может просматривать страницу
     */
    const settingAccessPage = () => {
        setModalData({
            setSnackbar: setSnackbar,
        });
        setActiveModal(configData.modals.accessPage);
    }

    /**
     * Получение ссылки на wiki-страницу
     * @param page_id
     * @param group_id
     * @param protocol
     * @returns {string}
     */
    const calcLink = (page_id, group_id, protocol = false) => {
        return (protocol ? 'https://' : '') + 'vk.com/page-' + group_id + '_' + page_id;
    }

    /**
     * Копирование ссылку на wiki-страницу
     */
    const copy = () => {
        copyToClipboard(calcLink(pageTitle.id, pageTitle.group_id));

        setSnackbar(<Snackbar
            onClose={() => setSnackbar(null)}
            before={<Icon24CheckCircleOutline fill='var(--dynamic_green)'/>}
        >
            Скопировано в буфер обмена
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
        savePage(infoPage.id, infoPage.group_id, accessToken.access_token, infoPage.title, infoPage.source).then(() => {

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
        savePage(infoPage.id, infoPage.group_id, accessToken.access_token, infoPage.title, infoPage.source).then(() => {

            setSnackbar(null);
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
        fetchVersion(item.id, pageTitle.group_id, accessToken.access_token).then(data => {
            if (data.response) {
                setContent({
                    page_id: pageTitle.id,
                    version: data.response.id,
                    title: data.response.title,
                    source: data.response.source,
                    edited: data.response.version_created,
                    creator_id: data.response.creator_id,
                    who_can_view: pageTitle.who_can_view,
                    who_can_edit: pageTitle.who_can_edit
                });
                go(configData.routes.wiki_version);
            } else {
                handleError(setSnackbar, go, {}, {
                    data: data,
                    default_error_msg: 'No response get version'
                });
            }
        }).catch(e => {
            handleError(setSnackbar, go, e, {
                default_error_msg: 'Error get version'
            });
        });
    }

    /**
     * Редактирование wiki-страницы
     */
    const editPage = () => {
        setContent({
            version: 0,
            page_id: infoPage.id,
            title: infoPage.title,
            source: infoPage.source,
            edited: infoPage.edited,
            creator_id: infoPage.creator_id,
            who_can_view: infoPage.who_can_view,
            who_can_edit: infoPage.who_can_edit
        });
        go(configData.routes.wiki_version);
    }

    const back = () => {
        go(configData.routes.pages);
    }

    return (
        <Panel id={id}>
            <PanelHeader
                mode="secondary"
                left={<PanelHeaderBack onClick={back}/>}
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

                <Spacing size={16}/>

                {(tab === 'info') &&
                <Fragment>
                    {!(infoPage && creator && editor) && <PanelSpinner/>}
                    {(infoPage && creator && editor) &&
                    <Fragment>

                        <SimpleCell
                            before={<Icon24Linked width={28} height={28}/>}
                            after={<IconButton onClick={copy}><Icon28CopyOutline/></IconButton>}
                        >
                            <InfoRow header="Ссылка на страницу">
                                <Link
                                    href={calcLink(pageTitle.id, pageTitle.group_id, true)}
                                    target='_blank'
                                >
                                    {calcLink(pageTitle.id, pageTitle.group_id)}</Link>
                            </InfoRow>
                        </SimpleCell>
                        <SimpleCell
                            before={<Icon28EditOutline/>}
                            after={<Link
                                href={'https://vk.com/id' + pageTitle.editor_id} target='_blank'
                            >
                                <Avatar size={32} src={editor.photo_200}/></Link>}
                        >
                            <InfoRow header="Последнее изменение">
                                {timestampToDate(pageTitle.edited)}
                            </InfoRow>
                        </SimpleCell>
                        <SimpleCell
                            before={<Icon36CalendarOutline/>}
                            after={<Link
                                href={'https://vk.com/id' + pageTitle.creator_id} target='_blank'
                            >
                                <Avatar size={32} src={creator.photo_200}/></Link>}
                        >
                            <InfoRow header="Создано">
                                {timestampToDate(pageTitle.created)}
                            </InfoRow>
                        </SimpleCell>

                        <Spacing separator size={16}/>

                        <SimpleCell
                            indicator={nameAccess(pageTitle.who_can_view)}
                            onClick={settingAccessPage}
                        >
                            Просмотр</SimpleCell>
                        <SimpleCell
                            indicator={nameAccess(pageTitle.who_can_edit)}
                            onClick={settingAccessPage}
                        >
                            Редактирование</SimpleCell>

                        <Spacing separator size={16}/>

                        <CellButton
                            before={<Icon24Write/>}
                            onClick={() => {
                                editPage();
                            }}
                        >
                            Редактировать</CellButton>

                        <CellButton
                            before={<Icon24ExternalLinkOutline/>}
                            href={'https://vk.com/' + group.screen_name + '?w=page-' + group.id + '_' + pageTitle.id + '/market'}
                            target='_blank' rel='noreferrer'
                        >
                            Открыть редактор ВК</CellButton>

                        <CellButton
                            before={<Icon24DeleteOutline/>}
                            mode="danger"
                            onClick={delPage}
                        >
                            Удалить</CellButton>
                    </Fragment>
                    }
                </Fragment>
                }

                {(tab === 'history') &&
                <Fragment>
                    {(!history) && <PanelSpinner/>}
                    {(history && history.length < 1) &&
                    <Placeholder icon={<Icon32SearchOutline/>}>Не найдено</Placeholder>}
                    {(history && history.length > 0) &&
                    <Fragment>
                        {history.map((item) => {
                            return (
                                <SimpleCell
                                    badge={item.length}
                                    indicator={timestampToDate(item.date)}
                                    key={item.id}
                                    description={'v.' + item.id}
                                    onClick={() => {
                                        selectVersion(item)
                                    }}
                                >
                                    {item.editor_name}
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