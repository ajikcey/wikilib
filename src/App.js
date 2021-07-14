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
import {Icon24ErrorCircle, Icon56CheckCircleOutline} from "@vkontakte/icons";

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
    const [page, setPage] = useState(null);
    const [pageTitle, setPageTitle] = useState(null);
    const [historyItem, setHistoryItem] = useState(null);

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

                setAccessToken(data[configData.storage_keys.access_token]);
                setLastGroupIds(Object.values(data[configData.storage_keys.last_groups]));
                setUserStatus(data[configData.storage_keys.status]);

                if (data[configData.storage_keys.status].tokenReceived) {
                    setActivePanel(configData.routes.home);
                } else if (data[configData.storage_keys.status].hasSeenIntro) {
                    setActivePanel(configData.routes.token);
                }
            } catch (e) {
                console.log(e);

                setSnackbar(<Snackbar
                    onClose={() => setSnackbar(null)}
                    before={<Icon24ErrorCircle fill='var(--dynamic_red)'/>}
                >
                    Error get data from Storage
                </Snackbar>);
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
                    console.log(data);

                    setSnackbar(<Snackbar
                        onClose={() => setSnackbar(null)}
                        before={<Icon24ErrorCircle fill='var(--dynamic_red)'/>}
                    >
                        Empty token
                    </Snackbar>);
                }
            } catch (e) {
                console.log(e);

                setSnackbar(<Snackbar
                    onClose={() => setSnackbar(null)}
                    before={<Icon24ErrorCircle fill='var(--dynamic_red)'/>}
                >
                    Error with sending data to Storage
                </Snackbar>);
            }
        }).catch(e => {
            console.log(e);

            setSnackbar(<Snackbar
                onClose={() => setSnackbar(null)}
                before={<Icon24ErrorCircle fill='var(--dynamic_red)'/>}
            >
                Error get token
            </Snackbar>);
        });
    }

    const onCloseModal = function () {
        setActiveModal(null); // null для скрытия
    }

    const onSubmitModal = function () {
        setActiveModal(null); // null для скрытия
    }

    const modal = (
        <ModalRoot
            activeModal={activeModal}
            onClose={onCloseModal}
        >
            <ModalCard
                id={configData.modals.addPage}
                onClose={onCloseModal}
                header="Создание страницы"
                actions={
                    <Button size="l" mode="primary" stretched onClick={onSubmitModal}>
                        Создать
                    </Button>
                }
            >
                <Input defaultValue="" autoFocus={true} placeholder='Введите название страницы'/>
            </ModalCard>

            <ModalCard
                id={configData.modals.redirectToCommunity}
                onClose={onCloseModal}
                icon={<Icon56CheckCircleOutline fill='var(--dynamic_green)'/>}
                header="Приложение установлено"
                subheader="Перейдите в приложение, установленное в сообществе."
                actions={
                    <Button
                        href={'https://vk.com/app' + configData.app_id + '_-' + 205670119}
                        // href={'https://vk.com/app' + configData.app_id + '_-' + group.group_id}
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
                actions={
                    <Button size="l" mode="primary" onClick={onSubmitModal}>
                        Сохранить
                    </Button>
                }
            >
                <FormLayout>
                    <FormItem top="Кто может просматривать эту страницу?">
                        <Radio name="who_can_view" value={configData.wiki_access.all} defaultChecked>Все</Radio>
                        <Radio name="who_can_view" value={configData.wiki_access.member}>Только участники</Radio>
                        <Radio name="who_can_view" value={configData.wiki_access.staff}>Только руководители</Radio>
                    </FormItem>
                </FormLayout>
                <FormLayout>
                    <FormItem top="Кто может редактировать эту страницу?">
                        <Radio name="who_can_edit" value={configData.wiki_access.all} defaultChecked>Все</Radio>
                        <Radio name="who_can_edit" value={configData.wiki_access.member}>Только участники</Radio>
                        <Radio name="who_can_edit" value={configData.wiki_access.staff}>Только руководители</Radio>
                    </FormItem>
                </FormLayout>
            </ModalCard>
        </ModalRoot>
    );

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
                                <Landing id={configData.routes.landing}/>
                                <About id={configData.routes.about} go={go} snackbarError={snackbar}
                                       accessToken={accessToken} setActiveModal={setActiveModal}/>
                                <Intro id={configData.routes.intro} go={go} snackbarError={snackbar} user={user}
                                       setUserStatus={setUserStatus} userStatus={userStatus}/>
                                <Token id={configData.routes.token} fetchToken={fetchToken} snackbarError={snackbar}/>
                                <Home id={configData.routes.home} setGroup={setGroup} accessToken={accessToken}
                                      snackbarError={snackbar} lastGroupIds={lastGroupIds}
                                      setLastGroupIds={setLastGroupIds}
                                      go={go}/>
                                <Pages id={configData.routes.pages} group={group} accessToken={accessToken}
                                       snackbarError={snackbar} go={go} setPageTitle={setPageTitle}
                                       setActiveModal={setActiveModal}/>
                                <Page id={configData.routes.page} pageTitle={pageTitle} setPage={setPage} group={group}
                                      user={user}
                                      accessToken={accessToken} setHistoryItem={setHistoryItem}
                                      snackbarError={snackbar} go={go} setActiveModal={setActiveModal}/>
                                <Version id={configData.routes.wiki_version} historyItem={historyItem} page={page}
                                         accessToken={accessToken} user={user}
                                         snackbarError={snackbar} go={go}/>
                            </View>
                        </SplitCol>
                    </SplitLayout>
                </AppRoot>
            </AdaptivityProvider>
        </ConfigProvider>
    );
}, {viewWidth: true});

export default App;