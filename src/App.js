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
    ModalCard, ModalPage, useAdaptivity, ViewWidth, Textarea, FormItem, ScreenSpinner
} from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';
import {Icon24TextOutline, Icon56CheckCircleOutline} from "@vkontakte/icons";

import './App.css';

import PanelHome from './panels/PanelHome';
import PanelIntro from './panels/PanelIntro';
import PanelLanding from './panels/PanelLanding';
import configData from "./config.json";
import PanelToken from "./panels/PanelToken";
import PanelAbout from "./panels/PanelAbout";
import {definePlatform, fetchGroupsById, getStrings, handleError} from "./functions";
import FormAddPage from "./components/forms/FormAddPage";
import FormEditAccess from "./components/forms/FormEditAccess";
import AppModalPageHeader from "./components/AppModalPageHeader";
import FormSortPage from "./components/forms/FormSortPage";
import FormCopyPage from "./components/forms/FormCopyPage";
import PanelUnloaded from "./panels/PanelUnloaded";
import FormEditPage from "./components/forms/FormEditPage";
import FormRenamePage from "./components/forms/FormRenamePage";
import PanelImages from "./panels/PanelImages";
import {useLocation, useRouter} from "@happysanta/router";
import {
    MODAL_ACCESS_PAGE,
    MODAL_ADD_PAGE,
    MODAL_COPY_PAGE,
    MODAL_EDIT_PAGE,
    MODAL_ERROR,
    MODAL_GROUP,
    MODAL_IMAGE,
    MODAL_RENAME_PAGE,
    MODAL_SORT_PAGE, MODAL_TIMESTAMP,
    PAGE_GROUP,
    PAGE_HOME,
    PAGE_TOKEN,
    PAGE_UNLOADED,
    PANEL_ABOUT,
    PANEL_GROUP,
    PANEL_HOME,
    PANEL_IMAGES,
    PANEL_LANDING,
    PANEL_MAIN, PANEL_RESOLVE_SCREEN_NAME, PANEL_TIME,
    PANEL_TOKEN,
    PANEL_UNLOADED,
    PANEL_WIKI,
    POPOUT_MENU_WIDGET, POPOUT_SCREEN_SPINNER,
    STORAGE_ACCESS_GROUP_TOKENS,
    STORAGE_ACCESS_TOKEN,
    STORAGE_LAST_GROUP,
    STORAGE_STATUS,
    VIEW_MAIN
} from "./index";
import PanelGroup from "./panels/PanelGroup";
import PanelWiki from "./panels/PanelWiki";
import PopoutMenuWidget from "./components/popouts/PopoutMenuWidget";
import PanelTime from "./panels/PanelTime";
import FormSetTimestamp from "./components/forms/FormSetTimestamp";
import PanelResolveScreenName from "./panels/PanelResolveScreenName";

const App = withAdaptivity(() => {
    const location = useLocation();
    const router = useRouter();
    const queryParams = qs.parse(window.location.search.slice(1));
    let strings = getStrings();

    const {viewWidth} = useAdaptivity();
    const isMobile = viewWidth <= ViewWidth.MOBILE;

    const [userStatus, setUserStatus] = useState(null);
    const [user, setUser] = useState(null);
    const [groups, setGroups] = useState(null);
    let [lastGroups, setLastGroups] = useState([]);
    const [lastGroupIds, setLastGroupIds] = useState([]);
    const [snackbar, setSnackbar] = useState(false);
    const [accessToken, setAccessToken] = useState(null);
    const [accessGroupTokens, setAccessGroupTokens] = useState({});
    const [accessGroupToken, setAccessGroupToken] = useState(null);
    const [group, setGroup] = useState(null);
    const [pageTitle, setPageTitle] = useState(null);
    const [modalData, setModalData] = useState({});
    const [popoutData, setPopoutData] = useState({});
    const [pages, setPages] = useState(null);
    const [pageSort, setPageSort] = useState({field: 0, direction: 'desc'});
    const [groupOffset, setGroupOffset] = useState(0);
    const [vk_is_recommended, setVk_is_recommended] = useState(queryParams.vk_is_recommended);
    const [vk_are_notifications_enabled, setVk_are_notifications_enabled] = useState(queryParams.vk_are_notifications_enabled);
    const [vk_is_favorite, setVk_is_favorite] = useState(queryParams.vk_is_favorite);

    if (queryParams && Object.keys(queryParams).length > 0) {
        if (queryParams.vk_language === 'ru') {
            strings.setLanguage('ru');
        } else {
            strings.setLanguage('en');
        }
    }

    useEffect(() => {

        init().then().catch(e => {
            console.log('init', e);
            router.replacePage(PAGE_UNLOADED);
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function init() {
        const data = {};

        const storageData = await bridge.send('VKWebAppStorageGet', {
            keys: [
                STORAGE_LAST_GROUP,
                STORAGE_STATUS,
                STORAGE_ACCESS_TOKEN,
                STORAGE_ACCESS_GROUP_TOKENS,
            ]
        });

        storageData.keys.forEach(({key, value}) => {
            data[key] = value ? JSON.parse(value) : {};
        });

        setUserStatus(data[STORAGE_STATUS]);
        setAccessToken(data[STORAGE_ACCESS_TOKEN]);
        setAccessGroupTokens(data[STORAGE_ACCESS_GROUP_TOKENS]);

        if (data[STORAGE_STATUS] && data[STORAGE_STATUS].tokenReceived) {
            setLastGroupIds(Object.values(data[STORAGE_LAST_GROUP]));

            if (queryParams.vk_group_id) {
                router.replacePage(PAGE_GROUP);

                fetchGroupsById(
                    [queryParams.vk_group_id],
                    data[STORAGE_ACCESS_TOKEN].access_token
                ).then(data => {
                    if (data.response) {
                        setGroup(data.response[0]); // асинхронное получение данных сообщества
                    } else {
                        handleError(strings, setSnackbar, router, {}, {
                            default_error_msg: 'No response get groups by id'
                        });
                    }
                }).catch(e => {
                    handleError(strings, setSnackbar, router, e, {
                        default_error_msg: 'Error get groups by id'
                    });
                });
            } else {
                router.replacePage(PAGE_HOME);
            }
        } else if (data[STORAGE_STATUS] && data[STORAGE_STATUS].hasSeenIntro) {
            router.replacePage(PAGE_TOKEN);
        } else {
            bridge.send('VKWebAppGetUserInfo').then((user) => setUser(user)).catch();
        }
    }

    async function getLastGroups(access_token) {
        return new Promise((resolve, reject) => {
            // отсутствуют недавние сообщества
            if (!lastGroupIds || lastGroupIds.length < 1) {
                resolve();
                return;
            }

            // сообщества уже получены
            if (lastGroups && lastGroups.length > 0) {
                resolve();
                return;
            }

            fetchGroupsById(lastGroupIds, access_token).then(async data => {
                if (data.response) {
                    setLastGroups(data.response);
                    lastGroups = data.response; // работает только такой способ
                    resolve();
                } else {
                    reject();
                }
            }).catch((e) => {
                reject(e);
            });
        });
    }

    function addLastGroup(added_group) {
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
            key: STORAGE_LAST_GROUP,
            value: JSON.stringify(lastGroups.map(g => g.id))
        }).then().catch((e) => {
            console.log('VKWebAppStorageSet', e);
        });
    }

    function clearLastGroups() {
        setLastGroups([]);
        setLastGroupIds([]);

        bridge.send('VKWebAppStorageSet', {
            key: STORAGE_LAST_GROUP,
            value: JSON.stringify([])
        }).then().catch(e => console.log('VKWebAppStorageSet', e));
    }

    const fetchToken = async function () {
        await bridge.send('VKWebAppGetAuthToken', {
            app_id: configData.app_id,
            scope: configData.scope.join(',')
        }).then(data => {
            try {
                if (!data.access_token) {
                    handleError(strings, setSnackbar, router, {}, {
                        default_error_msg: 'No access token'
                    });
                } else if (data.scope !== configData.scope.join(',')) {
                    handleError(strings, setSnackbar, router, {}, {
                        default_error_msg: strings.not_all_access_rights
                    });
                } else {
                    setAccessToken(data);

                    bridge.send('VKWebAppStorageSet', {
                        key: STORAGE_ACCESS_TOKEN,
                        value: JSON.stringify(data)
                    });

                    userStatus.tokenReceived = true;

                    bridge.send('VKWebAppStorageSet', {
                        key: STORAGE_STATUS,
                        value: JSON.stringify(userStatus)
                    });

                    router.replacePage(PAGE_HOME);
                }
            } catch (e) {
                handleError(strings, setSnackbar, router, e, {
                    default_error_msg: 'Error with sending data to Storage'
                });
            }
        }).catch(e => {
            console.log('fetchToken', e);
        });
    }

    const modal = (
        <ModalRoot
            activeModal={location.getModalId()}
            onClose={() => router.popPage()}
        >
            <ModalCard
                id={MODAL_ADD_PAGE}
                onClose={() => router.popPage()}
                header={strings.create_page}
            >
                <FormAddPage
                    modalData={modalData} accessToken={accessToken} group={group}
                    strings={strings} setPageTitle={setPageTitle}
                />
            </ModalCard>
            <ModalCard
                id={MODAL_GROUP}
                onClose={() => router.popPage()}
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
                id={MODAL_ACCESS_PAGE}
                onClose={() => router.popPage()}
                header={strings.accessing_page}
            >
                <FormEditAccess
                    modalData={modalData} accessToken={accessToken}
                    group={group} strings={strings}
                />
            </ModalCard>
            <ModalCard
                id={MODAL_COPY_PAGE}
                onClose={() => router.popPage()}
                header={strings.copy_page}
            >
                <FormCopyPage
                    modalData={modalData} accessToken={accessToken}
                    setGroup={setGroup} strings={strings}
                />
            </ModalCard>
            <ModalCard
                className="ModalCardFullWidth"
                id={MODAL_EDIT_PAGE}
                onClose={() => router.popPage()}
                header={strings.edit_page}
            >
                <FormEditPage
                    modalData={modalData} accessToken={accessToken}
                    group={group} strings={strings}
                />
            </ModalCard>
            <ModalCard
                id={MODAL_RENAME_PAGE}
                onClose={() => router.popPage()}
                header={strings.rename_page}
                icon={<Icon24TextOutline width={56} height={56}/>}
                subheader={strings.rename_page_desc}
            >
                <FormRenamePage
                    group={group} pageTitle={pageTitle} strings={strings}
                />
            </ModalCard>
            <ModalCard
                id={MODAL_IMAGE}
                onClose={() => router.popPage()}
            >
                {modalData.image && <img
                    alt='' src={modalData.image.images[2].url}/>}
            </ModalCard>
            <ModalCard
                id={MODAL_TIMESTAMP}
                onClose={() => router.popPage()}
                header={strings.find_date}
            >
                <FormSetTimestamp
                    modalData={modalData} strings={strings}
                />
            </ModalCard>
            <ModalCard
                id={MODAL_ERROR}
                onClose={() => router.popPage()}
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
                id={MODAL_SORT_PAGE}
                onClose={() => router.popPage()}
                header={<AppModalPageHeader
                    onClose={() => router.popPage()}
                    onSubmitFormId='formSortPage'
                >
                    {strings.sorting}</AppModalPageHeader>}
            >
                <FormSortPage
                    modalData={modalData} pageSort={pageSort} setPageSort={setPageSort} strings={strings}
                    pages={pages} setPages={setPages}
                />
            </ModalPage>
        </ModalRoot>
    );

    const popout = (() => {
        if (location.getPopupId() === POPOUT_MENU_WIDGET) {
            return <PopoutMenuWidget
                group={group} popoutData={popoutData}
                setModalData={setModalData} strings={strings}
            />;
        } else if (location.getPopupId() === POPOUT_SCREEN_SPINNER) {
            return <ScreenSpinner/>;
        }
    })();

    const addGroupToken = (groupToken) => {
        setAccessGroupToken(groupToken);

        let t = accessGroupTokens;
        if (!t) t = {};
        t[group.id] = groupToken;

        setAccessGroupTokens(t);

        bridge.send('VKWebAppStorageSet', {
            key: STORAGE_ACCESS_GROUP_TOKENS,
            value: JSON.stringify(t)
        }).then().catch((e) => {
            console.log(e);
        });
    }

    const removeGroupToken = () => {
        setAccessGroupToken(null);

        let t = accessGroupTokens;
        if (!t) t = {};
        delete t[group.id];

        setAccessGroupTokens(t);

        bridge.send('VKWebAppStorageSet', {
            key: STORAGE_ACCESS_GROUP_TOKENS,
            value: JSON.stringify(t)
        }).then().catch((e) => {
            console.log(e);
        });
    }

    return (
        <ConfigProvider platform={definePlatform(queryParams)} transitionMotionEnabled={false}>
            <AdaptivityProvider>
                <AppRoot>
                    <SplitLayout popout={popout} modal={modal}>
                        <SplitCol animate={isMobile}>
                            <View id={VIEW_MAIN} activePanel={location.getViewActivePanel(VIEW_MAIN)}>
                                <PanelLanding
                                    id={PANEL_LANDING}
                                    strings={strings}/>
                                <PanelIntro
                                    id={PANEL_MAIN}
                                    snackbarError={snackbar} user={user}
                                    setUserStatus={setUserStatus} userStatus={userStatus} strings={strings}/>
                                <PanelHome
                                    id={PANEL_HOME}
                                    groupOffset={groupOffset} setGroupOffset={setGroupOffset}
                                    groups={groups} setGroups={setGroups} strings={strings}
                                    lastGroups={lastGroups} clearLastGroups={clearLastGroups}
                                    setGroup={setGroup} accessToken={accessToken} setPages={setPages}
                                    snackbarError={snackbar} getLastGroups={getLastGroups}/>
                                <PanelGroup
                                    id={PANEL_GROUP}
                                    setAccessGroupToken={setAccessGroupToken} accessGroupTokens={accessGroupTokens}
                                    pageSort={pageSort} strings={strings} addLastGroup={addLastGroup}
                                    queryParams={queryParams} setModalData={setModalData} getLastGroups={getLastGroups}
                                    group={group} accessToken={accessToken}
                                    snackbarError={snackbar} setPageTitle={setPageTitle}
                                    setPages={setPages} pages={pages}/>
                                <PanelWiki
                                    id={PANEL_WIKI}
                                    strings={strings} pageTitle={pageTitle} setPopoutData={setPopoutData}
                                    setModalData={setModalData} accessToken={accessToken} group={group}
                                    snackbarError={snackbar}/>
                                <PanelToken
                                    id={PANEL_TOKEN}
                                    strings={strings}
                                    fetchToken={fetchToken} snackbarError={snackbar}/>
                                <PanelImages
                                    id={PANEL_IMAGES}
                                    strings={strings} group={group}
                                    setModalData={setModalData}
                                    groupToken={accessGroupToken} addGroupToken={addGroupToken}
                                    removeGroupToken={removeGroupToken} snackbarError={snackbar}/>
                                <PanelTime
                                    id={PANEL_TIME}
                                    setModalData={setModalData}
                                    strings={strings} snackbarError={snackbar}/>
                                <PanelResolveScreenName
                                    id={PANEL_RESOLVE_SCREEN_NAME}
                                    setModalData={setModalData} accessToken={accessToken}
                                    strings={strings} snackbarError={snackbar}/>
                                <PanelAbout
                                    id={PANEL_ABOUT}
                                    queryParams={queryParams} strings={strings}
                                    snackbarError={snackbar} setModalData={setModalData}
                                    vk_is_recommended={vk_is_recommended} setVk_is_recommended={setVk_is_recommended}
                                    vk_are_notifications_enabled={vk_are_notifications_enabled}
                                    setVk_are_notifications_enabled={setVk_are_notifications_enabled}
                                    vk_is_favorite={vk_is_favorite} setVk_is_favorite={setVk_is_favorite}
                                    accessToken={accessToken}/>
                                <PanelUnloaded
                                    id={PANEL_UNLOADED}
                                    setModalData={setModalData}
                                    init={init} strings={strings}/>
                            </View>
                        </SplitCol>
                    </SplitLayout>
                </AppRoot>
            </AdaptivityProvider>
        </ConfigProvider>
    );
}, {viewWidth: true});

export default App;