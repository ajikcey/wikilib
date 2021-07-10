import React, {Fragment, useEffect, useState} from 'react';

import {
    Avatar, Cell, CellButton, Group, Header, HorizontalScroll, InfoRow, Link, List,
    Panel, PanelHeader, PanelHeaderBack, PanelSpinner,
    Snackbar, Tabs, TabsItem
} from '@vkontakte/vkui';

import bridge from "@vkontakte/vk-bridge";
import {
    Icon24Error, Icon28EditOutline, Icon28ViewOutline, Icon36CalendarOutline,
} from "@vkontakte/icons";
import configData from "../config.json";
import {timestampToDate} from "../functions";

const Page = ({id, accessToken, page, group, go, setActiveModal, snackbarError}) => {
    const [snackbar, setSnackbar] = useState(snackbarError);
    const [infoPage, setInfoPage] = useState(null);
    const [creator, setCreator] = useState(null);
    const [editor, setEditor] = useState(null);
    const [tab, setTab] = useState('first');

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
                        ><Icon24Error fill='#fff' width='14' height='14'/></Avatar>}
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
                        ><Icon24Error fill='#fff' width={14} height={14}/></Avatar>}
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
                        ><Icon24Error fill='#fff' width='14' height='14'/></Avatar>}
                    >
                        Error get page
                    </Snackbar>);
                }
            }).catch(e => {
                console.log(e);

                let error_msg = null;

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
                        ><Icon24Error fill='#fff' width={14} height={14}/></Avatar>}
                    >
                        {error_msg}
                    </Snackbar>);
                }
            });
        }

        fetchInfoPage();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const renamePage = () => {
        console.log(infoPage);

        setActiveModal(configData.modals.renamePageModal);
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
                            onClick={() => setTab('first')}
                            selected={tab === 'first'}
                        >
                            Информация
                        </TabsItem>
                        <TabsItem
                            onClick={() => setTab('second')}
                            selected={tab === 'second'}
                        >
                            Редактирование
                        </TabsItem>
                        <TabsItem
                            onClick={() => setTab('third')}
                            selected={tab === 'third'}
                        >
                            История
                        </TabsItem>
                        <TabsItem
                            onClick={() => setTab('fourth')}
                            selected={tab === 'fourth'}
                        >
                            Просмотр
                        </TabsItem>
                    </HorizontalScroll>
                </Tabs>

                {(tab === 'first' && !(infoPage && creator && editor)) && <PanelSpinner/>}
                {(tab === 'first' && (infoPage && creator && editor)) &&
                <Fragment>
                    <Group>
                        <Cell
                            before={<Icon28ViewOutline/>}
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

                        <CellButton
                            onClick={() => {
                                renamePage();
                            }}
                        >
                            Переименовать</CellButton>

                        <CellButton
                            href={'https://vk.com/page-' + group.id + '_' + page.id + '?act=edit&section=view'}
                            target='_blank' rel='noreferrer'
                        >
                            Перейти ВКонтакте</CellButton>
                    </Group>
                </Fragment>
                }
            </Group>
            {snackbar}
        </Panel>
    )
}

export default Page;