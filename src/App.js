import React, {useState, useEffect} from 'react';
import bridge from '@vkontakte/vk-bridge';
import qs from 'querystring';
import {
    View,
    ScreenSpinner,
    AdaptivityProvider,
    AppRoot,
    Snackbar,
    ModalRoot,
    Input,
    Button,
    ConfigProvider,
    withAdaptivity,
    SplitLayout,
    SplitCol,
    ModalCard,
    VKCOM, IOS, ANDROID, FormItem, Radio, FormLayout
} from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';
import {Icon24CheckCircleOutline, Icon56CheckCircleOutline} from "@vkontakte/icons";

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
import {fetchPage, handleError, savePage} from "./functions";

const App = withAdaptivity(() => {
    const [activePanel, setActivePanel] = useState(configData.routes.intro);
    const [activeModal, setActiveModal] = useState(null);
    const [user, setUser] = useState(null);
    const [popout, setPopout] = useState(<ScreenSpinner size='large'/>);
    const [userStatus, setUserStatus] = useState(null);
    const [lastGroupIds, setLastGroupIds] = useState([]);
    const [snackbar, setSnackbar] = useState(false);
    const [accessToken, setAccessToken] = useState(null);
    const [group, setGroup] = useState(null);
    const [pageTitle, setPageTitle] = useState(null);
    const [modalData, setModalData] = useState({});
    const [content, setContent] = useState({
        version: 0,
        group_id: 0,
        title: "",
        source: "",
        created: 0,
        creator_id: 0,
        who_can_view: 0,
        who_can_edit: 0
    });

    const params = window.location.search.slice(1);
    const paramsAsObject = qs.parse(params);

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

        async function fetchData() {
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

                if (data[configData.storage_keys.status].tokenReceived) {
                    setActivePanel(configData.routes.home);
                } else if (data[configData.storage_keys.status].hasSeenIntro) {
                    setActivePanel(configData.routes.token);
                }
            } catch (e) {
                handleError(setSnackbar, go, e, {
                    default_error_msg: 'Error get data from Storage'
                });
            }

            setUser(user);
            setPopout(null);
        }

        fetchData().then(() => {
        });
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

    const onCloseModal = function () {
        setActiveModal(null); // null для скрытия
    };

    const onSubmitModal = function () {
        setActiveModal(null); // null для скрытия
    };

    /**
     * Сохранение настроек доступа к wiki-странице
     * @param e
     */
    const onSubmitAccess = function (e) {
        e.preventDefault();

        // str to int
        modalData.who_can_view = +modalData.who_can_view;
        modalData.who_can_edit = +modalData.who_can_edit;

        bridge.send("VKWebAppCallAPIMethod", {
            method: "pages.saveAccess",
            params: {
                page_id: pageTitle.id,
                group_id: pageTitle.group_id,
                view: modalData.who_can_view,
                edit: modalData.who_can_edit,
                v: configData.vk_api_version,
                access_token: accessToken.access_token
            }
        }).then(data => {
            if (data.response) {
                // hot update
                pageTitle.who_can_view = modalData.who_can_view;
                pageTitle.who_can_edit = modalData.who_can_edit;

                setActiveModal(null); // null для скрытия
                modalData.setSnackbar(null);
                modalData.setSnackbar(<Snackbar
                    onClose={() => modalData.setSnackbar(null)}
                    before={<Icon24CheckCircleOutline fill='var(--dynamic_green)'/>}
                >
                    Сохранено
                </Snackbar>);
            } else {
                handleError(modalData.setSnackbar, go, {}, {
                    default_error_msg: 'No response save access'
                });
            }
        }).catch(e => {
            handleError(modalData.setSnackbar, go, e, {
                default_error_msg: 'Error save access'
            });
        });
    };

    /**
     * Создание новой страницы
     * @param e
     */
    const onSubmitAddPage = function (e) {
        e.preventDefault();

        savePage(0, group.id, accessToken.access_token, modalData.title, "").then(data => {
            if (data.response) {

                fetchPage(data.response, group.id, 0, accessToken.access_token).then((data)=>{
                    if (data.response) {
                        setActiveModal(null); // null для скрытия
                        setPageTitle(data.response);
                        go(configData.routes.page);
                    } else {
                        handleError(modalData.setSnackbar, go, {}, {
                            default_error_msg: 'No response get page'
                        });
                    }
                }).catch(e => {
                    handleError(modalData.setSnackbar, go, e, {
                        default_error_msg: 'Error get page'
                    });
                });

            } else {
                handleError(modalData.setSnackbar, go, {}, {
                    default_error_msg: 'No response save page'
                });
            }
        }).catch(e => {
            handleError(modalData.setSnackbar, go, e, {
                default_error_msg: 'Error save page'
            });
        });
    };

    /**
     * Изменение данных в модальном окне
     * @param e
     */
    const onChangeModalData = function (e) {
        modalData[e.currentTarget.name] = e.currentTarget.value;
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
                <FormLayout onSubmit={onSubmitAddPage}>
                    <FormItem
                        top="Введите название страницы"
                        style={{paddingLeft: 0, paddingRight: 0}}
                    >
                        <Input
                            name='title'
                            autoFocus={true}
                            placeholder=''
                            onChange={onChangeModalData}
                        />
                    </FormItem>
                    <Button size="l" mode="primary" stretched type='submit'>
                        Создать
                    </Button>
                </FormLayout>
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
                id={configData.modals.renamePage}
                onClose={onCloseModal}
                header="Название страницы"
                actions={
                    <Button size="l" mode="primary" stretched onClick={onSubmitModal}>
                        Сохранить
                    </Button>
                }
            >
                <Input defaultValue="" autoFocus={true} placeholder='Введите название страницы'/>
            </ModalCard>

            <ModalCard
                id={configData.modals.accessPage}
                onClose={onCloseModal}
                header="Доступ к странице"
            >
                <FormLayout onSubmit={onSubmitAccess}>
                    <FormItem top="Кто может просматривать эту страницу?">
                        <Radio
                            name="who_can_view"
                            value={configData.wiki_access.all}
                            defaultChecked={modalData.who_can_view === configData.wiki_access.all}
                            onChange={onChangeModalData}
                        >
                            Все</Radio>
                        <Radio
                            name="who_can_view"
                            value={configData.wiki_access.member}
                            defaultChecked={modalData.who_can_view === configData.wiki_access.member}
                            onChange={onChangeModalData}
                        >
                            Только участники</Radio>
                        <Radio
                            name="who_can_view"
                            value={configData.wiki_access.staff}
                            defaultChecked={modalData.who_can_view === configData.wiki_access.staff}
                            onChange={onChangeModalData}
                        >
                            Только руководители</Radio>
                    </FormItem>
                    <FormItem top="Кто может редактировать эту страницу?">
                        <Radio
                            name="who_can_edit"
                            value={configData.wiki_access.all}
                            defaultChecked={modalData.who_can_edit === configData.wiki_access.all}
                            onChange={onChangeModalData}
                            disabled={group && group.is_closed > 0}
                        >
                            Все</Radio>
                        <Radio
                            name="who_can_edit"
                            value={configData.wiki_access.member}
                            defaultChecked={modalData.who_can_edit === configData.wiki_access.member}
                            onChange={onChangeModalData}
                        >
                            Только участники</Radio>
                        <Radio
                            name="who_can_edit"
                            value={configData.wiki_access.staff}
                            defaultChecked={modalData.who_can_edit === configData.wiki_access.staff}
                            onChange={onChangeModalData}
                        >
                            Только руководители</Radio>
                    </FormItem>
                    <Button size="l" mode="primary" stretched type='submit'>
                        Сохранить
                    </Button>
                </FormLayout>
            </ModalCard>
        </ModalRoot>
    );

    /**
     * Определение платформы (VKCOM, IOS, ANDROID)
     * @returns {Platform.VKCOM|Platform.IOS|Platform.ANDROID}
     */
    function fetchPlatform() {
        return (['desktop_web'].indexOf(paramsAsObject.vk_platform) > -1 ? VKCOM :
            (['mobile_ipad', 'mobile_iphone', 'mobile_iphone_messenger'].indexOf(paramsAsObject.vk_platform) > -1 ? IOS : ANDROID));
    }

    return (
        <ConfigProvider platform={fetchPlatform()}>
            <AdaptivityProvider>
                <AppRoot>
                    <SplitLayout popout={popout} modal={modal}>
                        <SplitCol>
                            <View activePanel={activePanel}>
                                <Landing
                                    id={configData.routes.landing}/>
                                <About
                                    id={configData.routes.about} go={go} snackbarError={snackbar}
                                    setModalData={setModalData}
                                    accessToken={accessToken} setActiveModal={setActiveModal}/>
                                <Intro
                                    id={configData.routes.intro} go={go} snackbarError={snackbar} user={user}
                                    setUserStatus={setUserStatus} userStatus={userStatus}/>
                                <Token
                                    id={configData.routes.token} fetchToken={fetchToken} snackbarError={snackbar}/>
                                <Home
                                    id={configData.routes.home} setGroup={setGroup} accessToken={accessToken}
                                    snackbarError={snackbar} lastGroupIds={lastGroupIds}
                                    setLastGroupIds={setLastGroupIds} go={go}/>
                                <Pages
                                    id={configData.routes.pages} group={group} accessToken={accessToken}
                                    snackbarError={snackbar} go={go} setPageTitle={setPageTitle}
                                    setActiveModal={setActiveModal} setModalData={setModalData}/>
                                <Page
                                    id={configData.routes.page} pageTitle={pageTitle} setContent={setContent}
                                    setModalData={setModalData} accessToken={accessToken}
                                    snackbarError={snackbar} go={go} setActiveModal={setActiveModal}/>
                                <Version
                                    id={configData.routes.wiki_version} content={content}
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