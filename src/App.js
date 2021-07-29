import React, {useState, useEffect} from 'react';
import bridge from '@vkontakte/vk-bridge';
import qs from 'querystring';
import {
    View,
    ScreenSpinner,
    AdaptivityProvider,
    AppRoot,
    ModalRoot,
    Button,
    ConfigProvider,
    withAdaptivity,
    SplitLayout,
    SplitCol,
    ModalCard, ModalPage
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
import Version from "./panels/Version";
import {definePlatform, fetchGroupsById, getStrings, handleError} from "./functions";
import FormAddPage from "./components/FormAddPage";
import FormEditAccess from "./components/FormEditAccess";
import AppModalPageHeader from "./components/AppModalPageHeader";
import FormSortPage from "./components/FormSortPage";
import FormCopyPage from "./components/FormCopyPage";

const App = withAdaptivity(() => {
    const [activePanel, setActivePanel] = useState(configData.routes.intro);
    const [activeModal, setActiveModal] = useState(null);
    const [user, setUser] = useState(null);
    const [popout, setPopout] = useState(<ScreenSpinner size='large'/>);
    const [userStatus, setUserStatus] = useState(null);
    const [lastGroupIds, setLastGroupIds] = useState([]);
    const [groups, setGroups] = useState(null);
    const [lastGroups, setLastGroups] = useState([]);
    const [snackbar, setSnackbar] = useState(false);
    const [accessToken, setAccessToken] = useState(null);
    const [group, setGroup] = useState(null);
    const [pageTitle, setPageTitle] = useState(null);
    const [modalData, setModalData] = useState({});
    const [pages, setPages] = useState(null);
    const [app, setApp] = useState(null);
    const [pageSort, setPageSort] = useState({field: 0, direction: 0});
    const [groupOffset, setGroupOffset] = useState(0);
    const [content, setContent] = useState({
        version: 0,
        page_id: 0,
        group_id: 0,
        title: "",
        source: "",
        created: 0,
        creator_id: 0,
        who_can_view: 0,
        who_can_edit: 0
    });

    const queryParams = qs.parse(window.location.search.slice(1));
    let strings = getStrings();

    if (queryParams.vk_language === 'ru') {
        strings.setLanguage('ru');
    } else {
        strings.setLanguage('en');
    }

    useEffect(() => {
        bridge.subscribe(({detail: {type, data}}) => {
            if (type === 'vk-connect') {
                if (typeof data === 'undefined') {
                    // outside VkMiniApp
                    setPopout(null);
                    setActivePanel(configData.routes.landing);
                }
            }
        });

        async function initData() {
            const user = await bridge.send('VKWebAppGetUserInfo');
            const data = {};

            try {
                const storageData = await bridge.send('VKWebAppStorageGet', {
                    keys: Object.values(configData.storage_keys)
                });

                await storageData.keys.forEach(({key, value}) => {
                    data[key] = value ? JSON.parse(value) : {};
                });

                setUserStatus(data[configData.storage_keys.status]);
                setAccessToken(data[configData.storage_keys.access_token]);
                setLastGroupIds(Object.values(data[configData.storage_keys.last_groups]));

                if (data[configData.storage_keys.status] && data[configData.storage_keys.status].tokenReceived) {
                    if (queryParams.vk_group_id) {
                        fetchGroupsById([queryParams.vk_group_id], data[configData.storage_keys.access_token].access_token).then(data => {
                            if (data.response) {
                                setGroup(data.response[0]);
                                setActivePanel(configData.routes.pages);
                            } else {
                                handleError(setSnackbar, go, {}, {
                                    default_error_msg: 'No response get groups by id'
                                });
                            }
                        }).catch(e => {
                            handleError(setSnackbar, go, e, {
                                default_error_msg: 'Error get groups by id'
                            });
                        });
                    } else {
                        setActivePanel(configData.routes.home);
                    }
                } else if (data[configData.storage_keys.status] && data[configData.storage_keys.status].hasSeenIntro) {
                    setActivePanel(configData.routes.token);
                }
            } catch (e) {
                handleError(setSnackbar, go, e, {
                    default_error_msg: 'Error get data from Storage'
                });
            }

            setUser(user);
            setPopout(null);

            bridge.send("VKWebAppRetargetingPixel", {"pixel_code": configData.pixel_code}).then((data) => {
                console.log(data);
            }).catch((e) => {
                console.log(e);
            });
        }

        initData().then();

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
     * Получение токена пользователя
     * @returns {Promise<void>}
     */
    const fetchToken = async function () {
        await bridge.send('VKWebAppGetAuthToken', {
            app_id: configData.app_id,
            scope: ['groups', 'pages'].join(',')
        }).then(data => {
            try {
                if (data.access_token) {
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

                    setActivePanel(configData.routes.home); // route after get token
                } else {
                    handleError(setSnackbar, go, {}, {
                        data: data,
                        default_error_msg: 'No access_token GetAuthToken'
                    });
                }
            } catch (e) {
                handleError(setSnackbar, go, e, {
                    default_error_msg: 'Error with sending data to Storage'
                });
            }
        }).catch(e => {
            handleError(setSnackbar, go, e, {
                default_error_msg: 'Error get token'
            });
        });
    };

    /**
     * Закрытие модального окна
     */
    const onCloseModal = function () {
        setModalData({});
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
                header="Создание страницы"
            >
                <FormAddPage
                    go={go} accessToken={accessToken} setSnackbar={setSnackbar} group={group} pages={pages}
                    onCloseModal={onCloseModal}
                />
            </ModalCard>

            <ModalCard
                id={configData.modals.redirectToCommunity}
                onClose={onCloseModal}
                icon={<Icon56CheckCircleOutline fill='var(--dynamic_green)'/>}
                header="Приложение установлено"
                subheader="Перейдите в приложение, установленное в сообществе."
                actions={
                    <Button
                        href={'https://vk.com/app' + configData.app_id + '_-' + modalData.group_id}
                        target='_blank' size="l" mode="primary" stretched>
                        Перейти
                    </Button>
                }
            >
            </ModalCard>

            <ModalCard
                id={configData.modals.accessPage}
                onClose={onCloseModal}
                header="Доступ к странице"
            >
                <FormEditAccess
                    modalData={modalData} pageTitle={pageTitle} accessToken={accessToken} onCloseModal={onCloseModal}
                    go={go} group={group} setPageTitle={setPageTitle}
                />
            </ModalCard>

            <ModalCard
                id={configData.modals.copyPage}
                onClose={onCloseModal}
                header="Копирование станицы"
            >
                <FormCopyPage
                    modalData={modalData} accessToken={accessToken} onCloseModal={onCloseModal}
                    go={go} setPageTitle={setPageTitle}
                    groups={groups} setGroups={setGroups}
                    groupOffset={groupOffset} setGroupOffset={setGroupOffset}
                />
            </ModalCard>

            <ModalPage
                id={configData.modals.sortPage}
                onClose={onCloseModal}
                header={<AppModalPageHeader
                    onClose={onCloseModal}
                    onSubmitFormId='formSortPage'
                >
                    Сортировка</AppModalPageHeader>}
            >
                <FormSortPage
                    modalData={modalData} pageSort={pageSort} setPageSort={setPageSort}
                    onCloseModal={onCloseModal} setSnackbar={setSnackbar} pages={pages} setPages={setPages}
                />
            </ModalPage>
        </ModalRoot>
    );

    return (
        <ConfigProvider platform={definePlatform(queryParams)}>
            <AdaptivityProvider>
                <AppRoot>
                    <SplitLayout popout={popout} modal={modal}>
                        <SplitCol>
                            <View activePanel={activePanel}>
                                <Landing
                                    id={configData.routes.landing} strings={strings}/>
                                <About
                                    queryParams={queryParams} strings={strings}
                                    id={configData.routes.about} go={go} snackbarError={snackbar}
                                    setModalData={setModalData} app={app} setApp={setApp}
                                    accessToken={accessToken} setActiveModal={setActiveModal}/>
                                <Intro
                                    id={configData.routes.intro} go={go} snackbarError={snackbar} user={user}
                                    setUserStatus={setUserStatus} userStatus={userStatus} strings={strings}/>
                                <Token
                                    id={configData.routes.token} strings={strings}
                                    fetchToken={fetchToken} snackbarError={snackbar}/>
                                <Home
                                    groupOffset={groupOffset} setGroupOffset={setGroupOffset}
                                    groups={groups} setGroups={setGroups} strings={strings}
                                    lastGroups={lastGroups} setLastGroups={setLastGroups}
                                    id={configData.routes.home} setGroup={setGroup} accessToken={accessToken}
                                    snackbarError={snackbar} lastGroupIds={lastGroupIds}
                                    setLastGroupIds={setLastGroupIds} go={go}/>
                                <Pages
                                    pageSort={pageSort} strings={strings}
                                    queryParams={queryParams} setModalData={setModalData}
                                    id={configData.routes.pages} group={group} accessToken={accessToken}
                                    snackbarError={snackbar} go={go} setPageTitle={setPageTitle}
                                    setPages={setPages} pages={pages} setActiveModal={setActiveModal}/>
                                <Page
                                    strings={strings}
                                    id={configData.routes.page} pageTitle={pageTitle} setContent={setContent}
                                    setModalData={setModalData} accessToken={accessToken} group={group}
                                    snackbarError={snackbar} go={go} setActiveModal={setActiveModal}/>
                                <Version
                                    strings={strings}
                                    id={configData.routes.wiki_version} content={content} group={group}
                                    accessToken={accessToken} snackbarError={snackbar} go={go}/>
                            </View>
                        </SplitCol>
                    </SplitLayout>
                </AppRoot>
            </AdaptivityProvider>
        </ConfigProvider>
    );
}, {viewWidth: true});

export default App;