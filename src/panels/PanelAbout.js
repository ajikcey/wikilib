import React, {Fragment, useEffect, useState} from 'react';

import {
    Group,
    Panel,
    PanelHeader,
    Div,
    PanelHeaderBack,
    Avatar,
    SimpleCell,
    PanelSpinner, Title, Text, UsersStack, Spacing, Placeholder, Separator
} from '@vkontakte/vkui';

import bridge from "@vkontakte/vk-bridge";
import {
    Icon28BookmarkOutline,
    Icon28Notifications,
    Icon28UsersOutline,
    Icon32SearchOutline,
    Icon28LikeOutline,
    Icon28ThumbsUpOutline,
    Icon28WriteOutline, Icon28NotificationDisableOutline, Icon20Check
} from "@vkontakte/icons";
import {cutDeclNum, handleError, fetchApp, AddToCommunity} from "../functions";
import {useRouter} from "@happysanta/router";
import configData from "../config.json";

const PanelAbout = ({
                        id,
                        snackbarError,
                        accessToken,
                        setModalData,
                        strings,
                        vk_is_recommended, setVk_is_recommended,
                        vk_are_notifications_enabled, setVk_are_notifications_enabled,
                        vk_is_favorite, setVk_is_favorite
                    }) => {
    const [snackbar, setSnackbar] = useState(snackbarError);
    const [app, setApp] = useState(null);

    const router = useRouter();

    useEffect(() => {
        fetchApp(configData.app_id, accessToken.access_token).then(data => {
            if (data.response) {
                data.response.profiles.reverse(); // Show last friends first

                setApp(data.response);
            } else {
                setApp({});

                handleError(strings, setSnackbar, router, {}, {
                    data: data,
                    default_error_msg: 'No response get app'
                });
            }
        }).catch(e => {
            setApp({});

            handleError(strings, setSnackbar, router, e, {
                default_error_msg: 'Error get app'
            });
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Добавление приложения в избранное
     * @returns {Promise<void>}
     */
    const AddToFavorites = async () => {
        if (vk_is_favorite) return;

        await bridge.send("VKWebAppAddToFavorites").then((data) => {
            if (data.result === true) {
                if (bridge.supports('VKWebAppTapticNotificationOccurred')) {
                    bridge.send('VKWebAppTapticNotificationOccurred', {type: 'success'});
                }

                setVk_is_favorite(1);
            } else {
                handleError(strings, setSnackbar, router, {}, {
                    data: data,
                    default_error_msg: 'No result AddToFavorites'
                });
            }
        }).catch(() => {
        });
    }

    /**
     * Запросить разрешение на отправку уведомлений
     * @returns {Promise<void>}
     */
    const AllowNotifications = async () => {
        if (vk_are_notifications_enabled) {
            await bridge.send("VKWebAppDenyNotifications").then((data) => {
                if (data.result === true) {
                    if (bridge.supports('VKWebAppTapticNotificationOccurred')) {
                        bridge.send('VKWebAppTapticNotificationOccurred', {type: 'success'});
                    }

                    setVk_are_notifications_enabled(0);
                } else {
                    handleError(strings, setSnackbar, router, {}, {
                        data: data,
                        default_error_msg: 'No result VKWebAppDenyNotifications'
                    });
                }
            }).catch(() => {
            });
        } else {
            await bridge.send("VKWebAppAllowNotifications").then((data) => {
                if (data.result === true) {
                    if (bridge.supports('VKWebAppTapticNotificationOccurred')) {
                        bridge.send('VKWebAppTapticNotificationOccurred', {type: 'success'});
                    }

                    setVk_are_notifications_enabled(1);
                } else {
                    handleError(strings, setSnackbar, router, {}, {
                        data: data,
                        default_error_msg: 'No result VKWebAppAllowNotifications'
                    });
                }
            }).catch(() => {
            });
        }
    }

    /**
     * Запросить рекомендацию приложения
     * @returns {Promise<void>}
     */
    const recommend = async () => {
        if (vk_is_recommended) return;

        await bridge.send("VKWebAppRecommend").then((data) => {
            if (data.result === true) {
                if (bridge.supports('VKWebAppTapticNotificationOccurred')) {
                    bridge.send('VKWebAppTapticNotificationOccurred', {type: 'success'});
                }

                setVk_is_recommended(1);
            } else {
                handleError(strings, setSnackbar, router, {}, {
                    data: data,
                    default_error_msg: 'No result VKWebAppRecommend'
                });
            }
        }).catch(() => {
        });
    }

    return (
        <Panel id={id} centered={!app}>
            <PanelHeader
                mode="secondary"
                left={<PanelHeaderBack onClick={() => router.popPage()}/>}
            >
            </PanelHeader>
            {(!app) && <PanelSpinner/>}
            {(app && !app.items) &&
                <Placeholder icon={<Icon32SearchOutline/>}>{strings.information_not_found}</Placeholder>}
            {(app && app.items) &&
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
                            <Text weight="regular" style={{color: 'var(--text_secondary)'}}>
                                {cutDeclNum(app.items[0].members_count, [strings.app_user.toLowerCase(), strings.two_app_users.toLowerCase(), strings.some_app_users.toLowerCase()])}
                            </Text>
                            {(app.profiles.length > 0) &&
                                <Fragment>
                                    <Spacing size={16}/>
                                    <UsersStack
                                        photos={
                                            app.profiles.map(function (item) {
                                                return item.photo_100
                                            })
                                        }
                                        size="m"
                                        layout="vertical"
                                    >
                                        {cutDeclNum(app.profiles.length, [strings.friend.toLowerCase(), strings.two_friends.toLowerCase(), strings.some_friends.toLowerCase()])}
                                    </UsersStack>
                                </Fragment>
                            }
                        </Div>
                        <Separator style={{margin: "12px 0"}}/>
                        <SimpleCell
                            before={vk_is_recommended ? <Icon20Check width={28} height={28}/> : <Icon28ThumbsUpOutline/>}
                            onClick={recommend}
                        >{vk_is_recommended ? strings.already_recommend : strings.recommend}</SimpleCell>
                        <SimpleCell
                            before={vk_is_favorite ? <Icon20Check width={28} height={28}/> : <Icon28BookmarkOutline/>}
                            onClick={AddToFavorites}
                        >{vk_is_favorite ? strings.added_to_bookmarks : strings.add_to_bookmarks}</SimpleCell>
                        <SimpleCell
                            before={vk_are_notifications_enabled ? <Icon28NotificationDisableOutline/> : <Icon28Notifications/>}
                            onClick={AllowNotifications}
                        >{vk_are_notifications_enabled ? strings.deny_notifications : strings.allow_notifications}</SimpleCell>
                        <SimpleCell
                            before={<Icon28UsersOutline/>}
                            onClick={() => AddToCommunity(setModalData, router)}
                        >{strings.add_to_community}</SimpleCell>
                        <SimpleCell
                            before={<Icon28LikeOutline/>}
                            href='https://vk.com/topic-205670119_48228061'
                            target='_blank'
                        >{strings.write_feedback}</SimpleCell>
                        <SimpleCell
                            before={<Icon28WriteOutline/>}
                            href={'https://vk.com/im?sel=-' + app.groups[0].id}
                            target='_blank'
                        >{strings.contact_support}</SimpleCell>
                    </Group>
                </Fragment>
            }
            {snackbar}
        </Panel>
    )
}

export default PanelAbout;