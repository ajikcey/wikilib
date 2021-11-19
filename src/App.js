import React, {useState, useEffect} from 'react';
import bridge from '@vkontakte/vk-bridge';
import qs from 'querystring';
import {
    View,
    AdaptivityProvider,
    AppRoot,
    ModalRoot,
    Button,
    ConfigProvider,
    withAdaptivity,
    SplitLayout,
    SplitCol,
    ModalCard, ModalPage, useAdaptivity, ViewWidth, Textarea, FormItem
} from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';
import {Icon56CheckCircleOutline} from "@vkontakte/icons";

import './App.css';

import Home from './panels/Home';
import Intro from './panels/Intro';
import Landing from './panels/Landing';

import configData from "./config.json";
import Token from "./panels/Token";
import Pages from "./panels/Pages";
import About from "./panels/About";
import Page from "./panels/Page";
import {definePlatform, fetchGroupsById, getStrings, handleError} from "./functions";
import FormAddPage from "./components/FormAddPage";
import FormEditAccess from "./components/FormEditAccess";
import AppModalPageHeader from "./components/AppModalPageHeader";
import FormSortPage from "./components/FormSortPage";
import FormCopyPage from "./components/FormCopyPage";
import Unloaded from "./panels/Unloaded";
import FormEditPage from "./components/FormEditPage";

const App = withAdaptivity(() => {
    const [activePanel, setActivePanel] = useState(configData.routes.intro);
    const [activeModal, setActiveModal] = useState(null);
    const [popout, setPopout] = useState(null);
    const [userStatus, setUserStatus] = useState(null);
    const [user, setUser] = useState(null);
    const [groups, setGroups] = useState(null);
    const [lastGroups, setLastGroups] = useState([]);
    const [snackbar, setSnackbar] = useState(false);
    const [accessToken, setAccessToken] = useState(null);
    const [group, setGroup] = useState(null);
    const [pageTitle, setPageTitle] = useState(null);
    const [modalData, setModalData] = useState({});
    const [pages, setPages] = useState(null);
    const [pageSort, setPageSort] = useState({field: 0, direction: 'desc'});
    const [groupOffset, setGroupOffset] = useState(0);

    const queryParams = qs.parse(window.location.search.slice(1));
    let strings = getStrings();

    const {viewWidth} = useAdaptivity();
    const isMobile = viewWidth <= ViewWidth.MOBILE;

    if (queryParams && Object.keys(queryParams).length > 0) {
        if (queryParams.vk_language === 'ru') {
            strings.setLanguage('ru');
        } else {
            strings.setLanguage('en');
        }
    }

    if (bridge.supports('VKWebAppResizeWindow')) {
        bridge.send("VKWebAppResizeWindow", {
            "width": window.innerWidth,
            "height": Math.min(Math.max(window.screen.availHeight - 250, configData.window_min_height), configData.window_max_height)
        }).then();
    }

    useEffect(() => {
        bridge.subscribe(({detail: {type, data}}) => {
            if (type === 'vk-connect') {
                if (typeof data === 'undefined') {
                    // outside VkMiniApp
                    go(configData.routes.landing);
                }
            }
        });

        async function initData() {
            const data = {};

            try {
                const storageData = await bridge.send('VKWebAppStorageGet', {
                    keys: Object.values(configData.storage_keys)
                });

                storageData.keys.forEach(({key, value}) => {
                    data[key] = value ? JSON.parse(value) : {};
                });

                setUserStatus(data[configData.storage_keys.status]);
                setAccessToken(data[configData.storage_keys.access_token]);

                if (data[configData.storage_keys.status] && data[configData.storage_keys.status].tokenReceived) {
                    const lastGroupIds = Object.values(data[configData.storage_keys.last_groups]);

                    if (queryParams.vk_group_id) {
                        go(configData.routes.pages);

                        await getLastGroups(lastGroupIds, data[configData.storage_keys.access_token].access_token);

                        fetchGroupsById([queryParams.vk_group_id], data[configData.storage_keys.access_token].access_token).then(data => {
                            if (data.response) {
                                setGroup(data.response[0]); // асинхронное получение данных сообщества
                            } else {
                                handleError(strings, setSnackbar, go, {}, {
                                    default_error_msg: 'No response get groups by id'
                                });
                            }
                        }).catch(e => {
                            handleError(strings, setSnackbar, go, e, {
                                default_error_msg: 'Error get groups by id'
                            });
                        });
                    } else {
                        go(configData.routes.home);

                        getLastGroups(lastGroupIds, data[configData.storage_keys.access_token].access_token).then();
                    }

                } else if (data[configData.storage_keys.status] && data[configData.storage_keys.status].hasSeenIntro) {
                    go(configData.routes.token);
                } else {
                    bridge.send('VKWebAppGetUserInfo').then((user) => setUser(user)).catch();
                }
            } catch (e) {
                handleError(strings, setSnackbar, go, e, {
                    default_error_msg: 'Error get data from Storage'
                });
            }
        }

        initData().then().catch(() => {
            go(configData.routes.unloaded);
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Переход на другую панель
     * @param panel
     */
    const go = panel => {
        setSnackbar(false);
        setActivePanel(panel);
    };

    /**
     * Получение посещенных недавно сообществ
     * @param ids
     * @param access_token
     * @returns {Promise<unknown>}
     */
    async function getLastGroups(ids, access_token) {
        return new Promise((resolve) => {
            if (ids && ids.length > 0) {
                fetchGroupsById(ids, access_token).then(data => {
                    if (data.response) {
                        setLastGroups(data.response);
                        resolve();
                    } else {
                        setLastGroups([]);
                    }
                }).catch(() => {
                    setLastGroups([]);
                });
            } else {
                setLastGroups([]);
                resolve();
            }
        });
    }

    /**
     * Добавление просмотренного сообщества
     * @param added_group
     */
    async function addLastGroup(added_group) {
        const group_ids = lastGroups.map(g => g.id);

        const index = group_ids.indexOf(added_group.id);
        if (index > -1) {
            // если это сообщество уже есть в списке, удаляем его
            lastGroups.splice(index, 1);
        }

        lastGroups.unshift(added_group); // добавляем в начало

        if (lastGroups.length > configData.max_last_groups) {
            // ограничиваем количество недавних сообществ
            lastGroups.splice(configData.max_last_groups, lastGroups.length - configData.max_last_groups);
        }

        bridge.send('VKWebAppStorageSet', {
            key: configData.storage_keys.last_groups,
            value: JSON.stringify(lastGroups.map(g => g.id))
        }).then().catch();
    }

    /**
     * Получение токена пользователя
     * @returns {Promise<void>}
     */
    const fetchToken = async function () {
        await bridge.send('VKWebAppGetAuthToken', {
            app_id: configData.app_id,
            scope: configData.scope.join(',')
        }).then(data => {
            try {
                if (!data.access_token) {
                    handleError(strings, setSnackbar, go, {}, {
                        default_error_msg: 'No access token'
                    });
                } else if (data.scope !== configData.scope.join(',')) {
                    handleError(strings, setSnackbar, go, {}, {
                        default_error_msg: strings.not_all_access_rights
                    });
                } else {
                    setAccessToken(data);

                    bridge.send('VKWebAppStorageSet', {
                        key: configData.storage_keys.access_token,
                        value: JSON.stringify(data)
                    });

                    userStatus.tokenReceived = true;

                    bridge.send('VKWebAppStorageSet', {
                        key: configData.storage_keys.status,
                        value: JSON.stringify(userStatus)
                    });

                    go(configData.routes.home); // route after get token
                }
            } catch (e) {
                handleError(strings, setSnackbar, go, e, {
                    default_error_msg: 'Error with sending data to Storage'
                });
            }
        }).catch();
    };

    /**
     * Закрытие модального окна
     */
    const onCloseModal = function () {
        setActiveModal(null); // null для скрытия
    };

    const modal = (
        <ModalRoot
            activeModal={activeModal}
            onClose={onCloseModal}
        >
            <ModalCard
                id={configData.modals.addPage}
                onClose={onCloseModal}
                header={strings.create_page}
            >
                <FormAddPage
                    modalData={modalData} go={go} accessToken={accessToken} group={group}
                    onCloseModal={onCloseModal} strings={strings} setPageTitle={setPageTitle}
                />
            </ModalCard>

            <ModalCard
                id={configData.modals.redirectToCommunity}
                onClose={onCloseModal}
                icon={<Icon56CheckCircleOutline fill='var(--dynamic_green)'/>}
                header={strings.app_installed}
                subheader={strings.app_installed_subheader}
                actions={
                    <Button
                        href={'https://vk.com/app' + configData.app_id + '_-' + modalData.group_id}
                        target='_blank' size="l" mode="primary" stretched>
                        {strings.open_app}
                    </Button>
                }
            >
            </ModalCard>

            <ModalCard
                id={configData.modals.accessPage}
                onClose={onCloseModal}
                header={strings.accessing_page}
            >
                <FormEditAccess
                    modalData={modalData} accessToken={accessToken} onCloseModal={onCloseModal}
                    go={go} group={group} strings={strings}
                />
            </ModalCard>

            <ModalCard
                id={configData.modals.copyPage}
                onClose={onCloseModal}
                header={strings.copy_page}
            >
                <FormCopyPage
                    modalData={modalData} accessToken={accessToken} onCloseModal={onCloseModal}
                    go={go} setGroup={setGroup} strings={strings}
                />
            </ModalCard>

            <ModalCard
                id={configData.modals.editPage}
                onClose={onCloseModal}
                header={strings.edit_page}
            >
                <FormEditPage
                    modalData={modalData} accessToken={accessToken} onCloseModal={onCloseModal}
                    go={go} group={group} strings={strings}
                />
            </ModalCard>

            <ModalCard
                id={configData.modals.error}
                onClose={onCloseModal}
                header={strings.error}
            >
                <FormItem
                    style={{paddingBottom: 0, paddingLeft: 0, paddingRight: 0}}
                >
                    <div style={{position: 'relative'}}>
                        <Textarea
                            rows={10}
                            name='text'
                            value={modalData.error}
                        />
                    </div>
                </FormItem>
            </ModalCard>

            <ModalPage
                id={configData.modals.sortPage}
                onClose={onCloseModal}
                header={<AppModalPageHeader
                    onClose={onCloseModal}
                    onSubmitFormId='formSortPage'
                >
                    {strings.sorting}</AppModalPageHeader>}
            >
                <FormSortPage
                    modalData={modalData} pageSort={pageSort} setPageSort={setPageSort} strings={strings}
                    onCloseModal={onCloseModal} pages={pages} setPages={setPages}
                />
            </ModalPage>
        </ModalRoot>
    );

    return (
        <ConfigProvider platform={definePlatform(queryParams)} transitionMotionEnabled={true}>
            <AdaptivityProvider>
                <AppRoot>
                    <SplitLayout popout={popout} modal={modal}>
                        <SplitCol animate={isMobile}>
                            <View activePanel={activePanel}>
                                <Landing
                                    id={configData.routes.landing} strings={strings}/>
                                <Intro
                                    id={configData.routes.intro} go={go} snackbarError={snackbar} user={user}
                                    setUserStatus={setUserStatus} userStatus={userStatus} strings={strings}/>
                                <Home
                                    groupOffset={groupOffset} setGroupOffset={setGroupOffset}
                                    groups={groups} setGroups={setGroups} strings={strings}
                                    lastGroups={lastGroups} setLastGroups={setLastGroups}
                                    id={configData.routes.home} setGroup={setGroup} accessToken={accessToken}
                                    snackbarError={snackbar} go={go}/>
                                <Pages
                                    pageSort={pageSort} strings={strings} addLastGroup={addLastGroup}
                                    queryParams={queryParams} setModalData={setModalData}
                                    id={configData.routes.pages} group={group} accessToken={accessToken}
                                    snackbarError={snackbar} go={go} setPageTitle={setPageTitle}
                                    setPages={setPages} pages={pages} setActiveModal={setActiveModal}/>
                                <Page
                                    strings={strings} setPopout={setPopout}
                                    id={configData.routes.page} pageTitle={pageTitle}
                                    setModalData={setModalData} accessToken={accessToken} group={group}
                                    snackbarError={snackbar} go={go} setActiveModal={setActiveModal}/>
                                <Token
                                    id={configData.routes.token} strings={strings}
                                    fetchToken={fetchToken} snackbarError={snackbar}/>
                                <About
                                    queryParams={queryParams} strings={strings}
                                    id={configData.routes.about} go={go} snackbarError={snackbar}
                                    setModalData={setModalData}
                                    accessToken={accessToken} setActiveModal={setActiveModal}/>
                                <Unloaded
                                    strings={strings} id={configData.routes.unloaded}/>
                            </View>
                        </SplitCol>
                    </SplitLayout>
                </AppRoot>
            </AdaptivityProvider>
        </ConfigProvider>
    );
}, {viewWidth: true});

export default App;