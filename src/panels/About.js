import React, {Fragment, useEffect, useState} from 'react';

import {
    Group,
    Panel,
    PanelHeader,
    Div,
    PanelHeaderBack,
    Header,
    Avatar,
    CellButton,
    Snackbar,
    PanelSpinner, Title, Text, UsersStack, Spacing
} from '@vkontakte/vkui';

import configData from "../config.json";
import bridge from "@vkontakte/vk-bridge";
import {
    Icon12Verified, Icon24CheckCircleOutline,
    Icon28BookmarkOutline, Icon28UsersOutline
} from "@vkontakte/icons";
import {cutDeclNum, handleError} from "../functions";

const About = ({id, go, snackbarError, accessToken, setModalData, setActiveModal}) => {
    const [snackbar, setSnackbar] = useState(snackbarError);
    const [app, setApp] = useState(null);

    useEffect(() => {
        /**
         * Получение информации о приложении
         * @returns {Promise<void>}
         */
        async function fetchApp() {
            await bridge.send("VKWebAppCallAPIMethod", {
                method: "apps.get",
                params: {
                    app_id: configData.app_id,
                    return_friends: 1,
                    fields: ['photo_100', 'members_count'].join(','),
                    extended: 1,
                    v: configData.vk_api_version,
                    access_token: accessToken.access_token
                }
            }).then(data => {
                if (data.response) {
                    setApp(data.response);
                } else {
                    handleError(setSnackbar, go, {}, {
                        data: data,
                        default_error_msg: 'No response get app'
                    });
                }
            }).catch(e => {
                handleError(setSnackbar, go, e, {
                    default_error_msg: 'Error get app'
                });
            });
        }

        fetchApp().then(() => {
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Добавление приложения в избранное
     * @returns {Promise<void>}
     */
    const AddToFavorites = async () => {
        await bridge.send("VKWebAppAddToFavorites").then((data) => {
            if (data.result === true) {
                if (bridge.supports('VKWebAppTapticNotificationOccurred')) {
                    bridge.send('VKWebAppTapticNotificationOccurred', {type: 'success'});
                }

                setSnackbar(<Snackbar
                    onClose={() => setSnackbar(null)}
                    before={<Icon24CheckCircleOutline fill='var(--dynamic_green)'/>}
                >
                    Сохранено
                </Snackbar>);
            } else {
                handleError(setSnackbar, go, {}, {
                    data: data,
                    default_error_msg: 'No result AddToFavorites'
                });
            }
        }).catch((e) => {
            handleError(setSnackbar, go, e, {
                default_error_msg: 'Error AddToFavorites'
            });
        });
    }

    /**
     * Добавление приложения в сообщество
     * @returns {Promise<void>}
     */
    const AddToCommunity = async () => {
        await bridge.send("VKWebAppAddToCommunity").then((data) => {
            if (data.group_id) {
                if (bridge.supports('VKWebAppTapticNotificationOccurred')) {
                    bridge.send('VKWebAppTapticNotificationOccurred', {type: 'success'});
                }

                setModalData({group_id: data.group_id});
                setActiveModal(configData.modals.redirectToCommunity);
            }
        });
    }

    const back = function () {
        go(configData.routes.home);
    }

    return (
        <Panel id={id}>
            <PanelHeader
                mode="secondary"
                left={<PanelHeaderBack onClick={back}/>}
            >
            </PanelHeader>

            {(!app) && <PanelSpinner/>}
            {(app) &&
            <Fragment>
                <Group>
                    <Div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                    }}>
                        <Avatar mode="app" size={80} src={app.items[0].icon_150}/>
                        <Title
                            style={{marginBottom: 0, marginTop: 5}} level="2"
                            weight="medium"
                        >
                            {app.items[0].title}
                        </Title>
                        <Text
                            style={{
                                color: 'var(--text_secondary)'
                            }}
                        >
                            {cutDeclNum(app.items[0].members_count, ['участник', 'участника', 'участников'])}
                        </Text>
                        {(app.profiles.length > 0) &&
                        <Fragment>
                            <Spacing size={16}/>
                            <UsersStack
                                photos={
                                    app.profiles.reverse().map(function (item) {
                                        return item.photo_100
                                    })
                                }
                                size="m"
                                layout="vertical"
                            >
                                {cutDeclNum(app.profiles.length, ['друг', 'друга', 'друзей'])}
                            </UsersStack>
                        </Fragment>
                        }
                    </Div>
                </Group>
                <Group>
                    <Header mode='secondary'>О приложении</Header>
                    <Div>
                        {app.items[0].description}
                    </Div>
                    <CellButton
                        before={<Icon28BookmarkOutline/>}
                        onClick={AddToFavorites}
                    >
                        Сохранить в закладки</CellButton>
                    <CellButton
                        before={<Icon28UsersOutline/>}
                        onClick={AddToCommunity}
                    >
                        Добавить в сообщество</CellButton>
                </Group>
                <Group>
                    <Header mode='secondary'>Разработчик</Header>
                    <CellButton
                        before={<Avatar size={48} src={app.groups[0].photo_100}/>}
                        badge={app.groups[0].verified ? <Icon12Verified/> : null}
                        href={'https://vk.com/' + app.groups[0].screen_name} target='_blank'
                        description={cutDeclNum(app.groups[0].members_count, ['подписчик', 'подписчика', 'подписчиков'])}
                    >
                        {app.groups[0].name}
                    </CellButton>
                </Group>
            </Fragment>
            }
            {snackbar}
        </Panel>
    )
}

export default About;