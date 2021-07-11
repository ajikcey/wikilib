import React, {Fragment, useEffect, useState} from 'react';

import {
    Avatar, Cell, CellButton, Footer, Group, HorizontalScroll, InfoRow, Link,
    Panel, PanelHeader, PanelHeaderBack, PanelSpinner, Placeholder,
    Snackbar, Tabs, TabsItem, IconButton
} from '@vkontakte/vkui';

import bridge from "@vkontakte/vk-bridge";
import {
    Icon24CheckCircleOutline,
    Icon24ErrorCircle, Icon24ExternalLinkOutline, Icon24Write, Icon28CopyOutline,
    Icon28EditOutline,
    Icon28HashtagOutline,
    Icon28ViewOutline,
    Icon32SearchOutline,
    Icon36CalendarOutline,
} from "@vkontakte/icons";
import configData from "../config.json";
import {copyToClipboard, declOfNum, timestampToDate} from "../functions";

const Page = ({id, accessToken, page, group, go, setActiveModal, snackbarError}) => {
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
                    page_id: page.id,
                    owner_id: ('-' + page.group_id),
                    v: "5.131",
                    access_token: accessToken.access_token
                }
            }).then(data => {
                if (data.response) {
                    fetchUsers([data.response.creator_id, data.response.editor_id]);

                    setInfoPage(data.response);
                } else {
                    setSnackbar(<Snackbar
                        layout='vertical'
                        onClose={() => setSnackbar(null)}
                        before={<Avatar size={24} style={{backgroundColor: 'var(--dynamic_red)'}}
                        ><Icon24ErrorCircle fill='#fff' width='14' height='14'/></Avatar>}
                    >
                        Error get page
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
                        layout='vertical'
                        onClose={() => setSnackbar(null)}
                        before={<Avatar size={24} style={{backgroundColor: 'var(--dynamic_red)'}}
                        ><Icon24ErrorCircle fill='#fff' width={14} height={14}/></Avatar>}
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
                        layout='vertical'
                        onClose={() => setSnackbar(null)}
                        before={<Avatar size={24} style={{backgroundColor: 'var(--dynamic_red)'}}
                        ><Icon24ErrorCircle fill='#fff' width='14' height='14'/></Avatar>}
                    >
                        Error get page
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
                        layout='vertical'
                        onClose={() => setSnackbar(null)}
                        before={<Avatar size={24} style={{backgroundColor: 'var(--dynamic_red)'}}
                        ><Icon24ErrorCircle fill='#fff' width={14} height={14}/></Avatar>}
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
                    page_id: page.id,
                    group_id: group.id,
                    v: "5.131",
                    access_token: accessToken.access_token
                }
            }).then(data => {
                if (data.response) {
                    setHistory(data.response);
                } else {
                    setSnackbar(<Snackbar
                        layout='vertical'
                        onClose={() => setSnackbar(null)}
                        before={<Avatar size={24} style={{backgroundColor: 'var(--dynamic_red)'}}
                        ><Icon24ErrorCircle fill='#fff' width='14' height='14'/></Avatar>}
                    >
                        Error get history
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
                        layout='vertical'
                        onClose={() => setSnackbar(null)}
                        before={<Avatar size={24} style={{backgroundColor: 'var(--dynamic_red)'}}
                        ><Icon24ErrorCircle fill='#fff' width={14} height={14}/></Avatar>}
                    >
                        {error_msg}
                    </Snackbar>);
                }
            });
        }

        fetchInfoPage();
        fetchHistory();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const renamePage = () => {
        console.log(infoPage);

        setActiveModal(configData.modals.renamePageModal);
    }

    const copyId = () => {
        copyToClipboard(infoPage.id);

        setSnackbar(<Snackbar
            layout='vertical'
            onClose={() => setSnackbar(null)}
            before={<Icon24CheckCircleOutline fill='var(--dynamic_green)'/>}
        >
            Скопировано в буфер
        </Snackbar>);
    }

    return (
        <Panel id={id}>
            <PanelHeader
                left={<PanelHeaderBack onClick={() => go(configData.routes.pages)}/>}
            >
                {page.title}
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

                {(tab === 'info' && !(infoPage && creator && editor)) && <PanelSpinner/>}
                {(tab === 'info' && (infoPage && creator && editor)) &&
                <Fragment>
                    <Group>
                        <CellButton
                            before={<Icon24Write/>}
                            onClick={() => {
                                renamePage();
                            }}
                        >
                            Переименовать</CellButton>
                        <CellButton
                            before={<Icon24ExternalLinkOutline/>}
                            href={'https://vk.com/page-' + group.id + '_' + page.id + '?act=edit&section=edit'}
                            target='_blank' rel='noreferrer'
                        >
                            Открыть редактор ВКонтакте</CellButton>
                    </Group>
                    <Group>
                        <Cell
                            before={<Icon28HashtagOutline/>}
                            after={<IconButton onClick={copyId}><Icon28CopyOutline/></IconButton>}
                        >
                            <InfoRow header="ID страницы">
                                {infoPage.id}
                            </InfoRow>
                        </Cell>
                        <Cell
                            before={<Icon28ViewOutline/>}
                            after={<Link
                                href={'https://vk.com/page-' + group.id + '_' + infoPage.id} target='_blank'
                            ><Icon24ExternalLinkOutline/></Link>}
                        >
                            <InfoRow header="Всего просмотров">
                                {infoPage.views}
                            </InfoRow>
                        </Cell>
                        <Cell
                            before={<Icon28EditOutline/>}
                            after={<Link
                                href={'https://vk.com/id' + editor.id} target='_blank'
                            >
                                <Avatar size={32} src={editor.photo_200}/></Link>}
                        >
                            <InfoRow header="Последнее изменение">
                                {timestampToDate(infoPage.edited)}
                            </InfoRow>
                        </Cell>
                        <Cell
                            before={<Icon36CalendarOutline/>}
                            after={<Link
                                href={'https://vk.com/id' + creator.id} target='_blank'
                            >
                                <Avatar size={32} src={creator.photo_200}/></Link>}
                        >
                            <InfoRow header="Создано">
                                {timestampToDate(infoPage.created)}
                            </InfoRow>
                        </Cell>
                    </Group>
                </Fragment>
                }

                {(tab === 'history' && !(history)) && <PanelSpinner/>}
                {(tab === 'history' && (history && history.length < 1)) &&
                <Placeholder icon={<Icon32SearchOutline/>}>Не найдено</Placeholder>}
                {(tab === 'history' && (history && history.length > 0)) &&
                <Fragment>
                    <Group>
                        {history.map((item) => {
                            return (
                                <Cell
                                    after={timestampToDate(item.date)}
                                    key={item.id}
                                    description={'Размер текста: ' + item.length}
                                >
                                    {page.editor_name}
                                </Cell>
                            );
                        })}
                    </Group>
                    <Footer>{history.length} {declOfNum(history.length, ['изменение', 'изменения', 'изменений'])}</Footer>
                </Fragment>
                }
            </Group>
            {snackbar}
        </Panel>
    )
}

export default Page;