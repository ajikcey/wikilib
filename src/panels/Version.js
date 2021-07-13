import React, {Fragment, useEffect, useState} from 'react';

import {
    Avatar,
    Button,
    FormItem, FormLayout,
    Group, InfoRow, Link,
    Panel, PanelHeader, PanelHeaderBack, PanelHeaderContent, PanelSpinner, SimpleCell, Snackbar, Textarea
} from '@vkontakte/vkui';

import bridge from "@vkontakte/vk-bridge";
import {
    Icon24CheckCircleOutline,
    Icon24ErrorCircle, Icon36CalendarOutline,
} from "@vkontakte/icons";
import configData from "../config.json";
import {savePage, timestampToDate} from "../functions";
import IconPage from "../components/IconPage";

const Version = ({id, accessToken, historyItem, page, user, go, snackbarError}) => {
    const [snackbar, setSnackbar] = useState(snackbarError);
    const [version, setVersion] = useState(null);
    const [creator, setCreator] = useState(null);
    const [text, setText] = useState(null);

    useEffect(() => {

        /**
         * Получение информации о wiki-странице
         * @returns {Promise<void>}
         */
        async function fetchVersion() {
            await bridge.send("VKWebAppCallAPIMethod", {
                method: "pages.getVersion",
                params: {
                    version_id: historyItem.id,
                    group_id: page.group_id,
                    v: "5.131",
                    access_token: accessToken.access_token
                }
            }).then(data => {
                if (data.response) {
                    fetchUsers([data.response.creator_id]);

                    setVersion(data.response);
                    setText(data.response.source);
                } else {
                    setSnackbar(<Snackbar
                        onClose={() => setSnackbar(null)}
                        before={<Icon24ErrorCircle fill='var(--dynamic_red)'/>}
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
                        onClose={() => setSnackbar(null)}
                        before={<Icon24ErrorCircle fill='var(--dynamic_red)'/>}
                    >
                        {error_msg}
                    </Snackbar>);
                }
            });
        }

        /**
         * Получение данных редактора
         * @param creator_id
         * @returns {Promise<void>}
         */
        async function fetchUsers(creator_id) {
            await bridge.send("VKWebAppCallAPIMethod", {
                method: "users.get",
                params: {
                    user_ids: [creator_id].join(','),
                    fields: ['photo_200'].join(','),
                    v: "5.131",
                    access_token: accessToken.access_token
                }
            }).then(data => {
                if (data.response) {
                    setCreator(data.response[0]);
                } else {
                    setSnackbar(<Snackbar
                        onClose={() => setSnackbar(null)}
                        before={<Icon24ErrorCircle fill='var(--dynamic_red)'/>}
                    >
                        Error get user
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
                    error_msg = 'Error get user';
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

        if (historyItem) {
            // если выбрана определенная версия wiki-страницы
            fetchVersion().then(() => {
            });
        } else {
            setText(page.text);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Применить данную версию wiki-страницы
     */
    const onSubmitVersion = (e) => {
        e.preventDefault();

        let text = '';
        savePage(page.id, page.group_id, user.id, accessToken.access_token, page.title, text).then(() => {

            setSnackbar(<Snackbar
                onClose={() => setSnackbar(null)}
                before={<Icon24CheckCircleOutline fill='var(--dynamic_green)'/>}
            >
                Сохранено
            </Snackbar>);

            go(configData.routes.page);
        });
    }

    return (
        <Panel id={id}>
            <PanelHeader
                mode="secondary"
                left={<PanelHeaderBack onClick={() => go(configData.routes.page)}/>}
            >
                <PanelHeaderContent
                    status={'ver. ' + (historyItem ? historyItem.id : 'current')}
                    before={<IconPage page={page}/>}
                >
                    {page.title}
                </PanelHeaderContent>
            </PanelHeader>

            <Group>
                {!(text) && <PanelSpinner/>}
                {(text) &&
                <Fragment>
                    <FormLayout onSubmit={onSubmitVersion}>
                        <FormItem top="Текст">
                            <Textarea rows={10} placeholder="Введите текст" value={text}/>
                        </FormItem>
                        {historyItem &&
                        <Fragment>
                            <SimpleCell
                                before={<Icon36CalendarOutline/>}
                                after={<Link
                                    href={'https://vk.com/id' + creator.id} target='_blank'
                                >
                                    <Avatar size={32} src={creator.photo_200}/></Link>}
                            >
                                <InfoRow header="Версия сохранена">
                                    {timestampToDate(version.version_created)}
                                </InfoRow>
                            </SimpleCell>
                        </Fragment>
                        }
                        <FormItem>
                            <Button size="l" stretched type="">Применить данную версию</Button>
                        </FormItem>
                    </FormLayout>
                </Fragment>
                }
            </Group>

            {snackbar}
        </Panel>
    )
}

export default Version;