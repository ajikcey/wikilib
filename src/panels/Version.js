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
    const [formValues, setFormValues] = useState(null);

    useEffect(() => {

        /**
         * Получение информации о wiki-странице
         * @returns {Promise}
         */
        const fetchVersion = () => {
            return bridge.send("VKWebAppCallAPIMethod", {
                method: "pages.getVersion",
                params: {
                    version_id: historyItem.id,
                    group_id: page.group_id,
                    v: "5.131",
                    access_token: accessToken.access_token
                }
            });
        }

        /**
         * Получение данных редактора
         * @param creator_id
         * @returns {Promise}
         */
        const fetchUser = (creator_id) => {
            return bridge.send("VKWebAppCallAPIMethod", {
                method: "users.get",
                params: {
                    user_ids: creator_id,
                    fields: ['photo_200'].join(','),
                    v: "5.131",
                    access_token: accessToken.access_token
                }
            });
        }

        if (historyItem) {
            // если выбрана определенная версия wiki-страницы
            fetchVersion().then(data => {
                if (data.response) {
                    fetchUser(data.response.creator_id).then(u => {
                        if (u.response) {
                            data.response.creator = u.response[0]; // add creator info

                            setFormValues({text: data.response.source});
                            setVersion(data.response);
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
                } else {
                    setSnackbar(<Snackbar
                        onClose={() => setSnackbar(null)}
                        before={<Icon24ErrorCircle fill='var(--dynamic_red)'/>}
                    >
                        Error get version
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
                    error_msg = 'Error get version';
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
        } else {
            console.log(page);

            // если выбрана текущая (последняя) версия
            setFormValues({text: page.source});
            setVersion({});
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Применить данную версию wiki-страницы
     */
    const onSubmitVersion = (e) => {
        e.preventDefault();

        savePage(page.id, page.group_id, user.id, accessToken.access_token, page.title, formValues.text).then(() => {

            setSnackbar(<Snackbar
                onClose={() => setSnackbar(null)}
                before={<Icon24CheckCircleOutline fill='var(--dynamic_green)'/>}
            >
                Сохранено
            </Snackbar>);

            go(configData.routes.page);
        });
    }

    /**
     * Изменение данных в форме
     * @param e
     */
    const onChangeField = (e) => {
        setFormValues({
            [e.target.name]: e.target.value
        })
    }

    return (
        <Panel id={id}>
            <PanelHeader
                mode="secondary"
                left={<PanelHeaderBack onClick={() => go(configData.routes.page)}/>}
            >
                <PanelHeaderContent
                    status={(historyItem ? 'ver. ' + historyItem.id : 'текущая версия')}
                    before={<IconPage page={page}/>}
                >
                    {page.title}
                </PanelHeaderContent>
            </PanelHeader>

            <Group>
                {!(version && formValues) && <PanelSpinner/>}
                {(version && formValues) &&
                <Fragment>
                    {historyItem &&
                    <Fragment>
                        <SimpleCell
                            before={<Icon36CalendarOutline/>}
                            after={<Link
                                href={'https://vk.com/id' + version.creator.id} target='_blank'
                            >
                                <Avatar size={32} src={version.creator.photo_200}/></Link>}
                        >
                            <InfoRow header="Версия сохранена">
                                {timestampToDate(version.version_created)}
                            </InfoRow>
                        </SimpleCell>
                    </Fragment>
                    }
                    <FormLayout onSubmit={onSubmitVersion}>
                        <FormItem top="Текст">
                            <Textarea
                                rows={20}
                                name='text'
                                placeholder="Введите текст"
                                onChange={onChangeField}
                                value={formValues.text}/>
                        </FormItem>
                        <FormItem>
                            <Button
                                size="l" stretched
                                type=""
                            >
                                {historyItem ? 'Применить данную версию' : 'Сохранить'}</Button>
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