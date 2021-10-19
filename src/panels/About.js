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
    PanelSpinner, Title, Text, UsersStack, Spacing, SimpleCell, Placeholder
} from '@vkontakte/vkui';

import configData from "../config.json";
import bridge from "@vkontakte/vk-bridge";
import {
    Icon12Verified, Icon24CheckCircleOutline,
    Icon28BookmarkOutline, Icon28UsersOutline, Icon32SearchOutline
} from "@vkontakte/icons";
import {cutDeclNum, handleError, fetchApp} from "../functions";

const About = ({
                   id,
                   go,
                   snackbarError,
                   accessToken,
                   setModalData,
                   setActiveModal,
                   strings,
                   queryParams
               }) => {
    const [snackbar, setSnackbar] = useState(snackbarError);
    const [app, setApp] = useState(null);

    useEffect(() => {

        fetchApp(accessToken.access_token).then(data => {
            if (data.response) {
                data.response.profiles.reverse(); // Show last friends first

                setApp(data.response);
            } else {
                setApp({});

                handleError(strings, setSnackbar, go, {}, {
                    data: data,
                    default_error_msg: 'No response get app'
                });
            }
        }).catch(e => {
            setApp({});

            handleError(strings, setSnackbar, go, e, {
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
        await bridge.send("VKWebAppAddToFavorites").then((data) => {
            if (data.result === true) {
                if (bridge.supports('VKWebAppTapticNotificationOccurred')) {
                    bridge.send('VKWebAppTapticNotificationOccurred', {type: 'success'});
                }

                setSnackbar(<Snackbar
                    onClose={() => setSnackbar(null)}
                    before={<Icon24CheckCircleOutline fill='var(--dynamic_green)'/>}
                >{strings.saved}</Snackbar>);
            } else {
                handleError(strings, setSnackbar, go, {}, {
                    data: data,
                    default_error_msg: 'No result AddToFavorites'
                });
            }
        }).catch(() => {
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
        }).catch(() => {
        });
    }

    const back = function () {
        if (queryParams.vk_group_id) {
            go(configData.routes.pages);
        } else {
            go(configData.routes.home);
        }
    }

    return (
        <Panel id={id}>
            <PanelHeader
                mode="secondary"
                left={<PanelHeaderBack onClick={back}/>}
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
                        <Text
                            style={{
                                color: 'var(--text_secondary)'
                            }}
                        >
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
                </Group>
                <Group>
                    <Header mode='secondary'>{strings.about_app}</Header>
                    <Div>
                        {strings.app_desc}
                    </Div>
                    <CellButton
                        before={<Icon28BookmarkOutline/>}
                        onClick={AddToFavorites}
                    >
                        {strings.save_to_bookmarks}</CellButton>
                    <CellButton
                        before={<Icon28UsersOutline/>}
                        onClick={AddToCommunity}
                    >
                        {strings.add_to_community}</CellButton>
                </Group>
                <Group>
                    <Header mode='secondary'>{strings.developer}</Header>

                    <SimpleCell
                        href={'https://vk.com/' + app.groups[0].screen_name} target='_blank'
                        before={<Avatar size={48} src={app.groups[0].photo_100}/>}
                        badge={app.groups[0].verified ? <Icon12Verified/> : null}
                        description={cutDeclNum(app.groups[0].members_count, [strings.member.toLowerCase(), strings.two_members.toLowerCase(), strings.some_members.toLowerCase()])}
                    >
                        {app.groups[0].name}
                    </SimpleCell>
                </Group>
            </Fragment>
            }
            {snackbar}
        </Panel>
    )
}

export default About;