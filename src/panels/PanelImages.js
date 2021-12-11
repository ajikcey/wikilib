import React, {Fragment, useEffect, useState} from 'react';

import {
    Div, Group,
    Panel,
    PanelHeader,
    PanelSpinner,
    PanelHeaderBack,
    File,
    HorizontalScroll,
    TabsItem,
    Tabs,
    Placeholder,
    Button,
    Snackbar,
    SimpleCell, Avatar, IconButton, Footer, FormStatus, Spinner
} from '@vkontakte/vkui';
import configData from "../config.json";
import {
    Icon24Camera, Icon24CheckCircleOutline,
    Icon24ErrorCircle,
    Icon24InfoCircleOutline, Icon28CopyOutline,
    Icon32SearchOutline,
    Icon56LockOutline
} from "@vkontakte/icons";
import {
    AddToCommunity, declOfNum,
    fetchImages,
    getGroupImageUploadServer, saveGroupImage,
    ShowError
} from "../functions";
import bridge from "@vkontakte/vk-bridge";
import {useRouter} from "@happysanta/router";
import {MODAL_IMAGE} from "../index";

const PanelImages = ({
                         id,
                         strings,
                         group,
                         setModalData,
                         snackbarError,
                         removeGroupToken,
                         groupToken,
                         addGroupToken
                     }) => {
    const [snackbar, setSnackbar] = useState(snackbarError);
    const [images, setImages] = useState(null);
    const [tab, setTab] = useState(0);
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const _URL = window.URL || window.webkitURL;

    const imageTypes = [
        {width: 160, height: 160},
        {width: 160, height: 240},
        {width: 24, height: 24},
        {width: 510, height: 128},
        {width: 50, height: 50},
    ];

    const getImageTypeStr = (o) => {
        return `${o.width}x${o.height}`;
    }

    useEffect(() => {

        if (groupToken) {
            getImages(0, 100, getImageTypeStr(imageTypes[tab])).then(() => {
            });
        }

        // eslint-disable-next-line
    }, [tab, groupToken]);


    const handleErrorImages = (e) => {
        console.log(e);

        if (e.error_data.error_reason.error_code === 27) {
            removeGroupToken();
        } else if (e.error_data.error_reason.error_code === 15 &&
            e.error_data.error_reason.error_msg === "Access denied: app must be installed in group as community app") {

            setSnackbar(null);
            setSnackbar(<Snackbar
                onClose={() => setSnackbar(null)}
                before={<Icon24InfoCircleOutline fill='var(--dynamic_blue)'/>}
                action={strings.install}
                onActionClick={() => AddToCommunity(setModalData, router)}
            >
                {strings.need_install_app}
            </Snackbar>);
        } else {
            ShowError(e, setModalData, router);
        }
    }

    async function getImages(offset, count, image_type) {
        setImages(null);

        await fetchImages(groupToken.access_token, offset, count, image_type).then(data => {
            if (data.response) {
                data.response.items = data.response.items.reverse(); // новые изображения в начале

                setImages(data.response);
            } else {
                setImages({});
                handleErrorImages(data);
            }
        }).catch(e => {
            setImages({});
            handleErrorImages(e);
        });
    }

    const changeTab = (i) => {
        setTab(i);
    }

    /**
     * Получение токена сообщества
     * @returns {Promise}
     */
    const fetchGroupToken = async function () {
        await bridge.send('VKWebAppGetCommunityToken', {
            app_id: configData.app_id,
            group_id: group.id,
            scope: configData.group_scope.join(',')
        }).then(data => {
            try {
                if (data.scope !== configData.group_scope.join(',')) {
                    setSnackbar(null);
                    setSnackbar(<Snackbar
                        onClose={() => setSnackbar(null)}
                        before={<Icon24ErrorCircle fill='var(--dynamic_red)'/>}
                    >
                        {strings.not_all_access_rights}
                    </Snackbar>);
                } else {
                    addGroupToken(data);
                }
            } catch (e) {
                console.log(e);
            }
        }).catch(e => {
            console.log(e);
        });
    }

    const uploadFile = (e) => {
        const image_file = e.target.files[0];
        if (!image_file) return false;
        e.target.value = null; // сброс значения, чтобы его снова можно было выбрать

        const image_type = imageTypes[tab];
        if (!image_type) return false;

        let img = new Image();
        img.src = _URL.createObjectURL(image_file);

        img.onload = (e) => {

            if (image_type.width * 3 !== e.target.width ||
                image_type.height * 3 !== e.target.height) {

                setSnackbar(null);
                setSnackbar(<Snackbar
                    onClose={() => setSnackbar(null)}
                    before={<Icon24ErrorCircle fill='var(--dynamic_red)'/>}
                >
                    {strings.wrong_image_size}
                </Snackbar>);
                return;
            }

            setLoading(true);
            getGroupImageUploadServer(getImageTypeStr(image_type), groupToken.access_token).then(data => {
                if (data.response && data.response.upload_url) {
                    let formData = new FormData();
                    formData.append('image', image_file);
                    formData.append('upload_url', data.response.upload_url);

                    fetch('https://senler.ru/others/proxy_vk_file.php', {
                        method: 'POST',
                        body: formData
                    }).then((response) => {
                        return response.json();
                    }).then(data => {
                        if (data.success) {
                            saveGroupImage(
                                data.vk_response.hash,
                                data.vk_response.image,
                                groupToken.access_token
                            ).then(data => {
                                images.items.unshift(data.response);
                                images.count++;

                                setLoading(false);
                                setSnackbar(null);
                                setSnackbar(<Snackbar
                                    onClose={() => setSnackbar(null)}
                                    before={<Icon24CheckCircleOutline fill='var(--dynamic_green)'/>}
                                >{strings.saved}</Snackbar>);
                            }).catch((e) => {
                                setLoading(false);
                                ShowError(e.message, setModalData, router);
                            });
                        } else {
                            setLoading(false);
                            ShowError(data, setModalData, router);
                        }
                    }).catch(e => {
                        setLoading(false);
                        setSnackbar(null);
                        setSnackbar(<Snackbar
                            onClose={() => setSnackbar(null)}
                            before={<Icon24ErrorCircle fill='var(--dynamic_red)'/>}
                        >
                            {e.message}
                        </Snackbar>);
                    });
                }
            }).catch(e => {
                setLoading(false);
                ShowError(e, setModalData, router);
            });
        }
    }

    const copy = (e, image) => {
        e.stopPropagation();

        bridge.send("VKWebAppCopyText", {text: image.id}).then((data) => {
            if (data.result === true) {
                if (bridge.supports('VKWebAppTapticNotificationOccurred')) {
                    bridge.send('VKWebAppTapticNotificationOccurred', {type: 'success'}).then();
                }

                setSnackbar(<Snackbar
                    onClose={() => setSnackbar(null)}
                    before={<Icon24CheckCircleOutline fill='var(--dynamic_green)'/>}
                >
                    {strings.copied_to_clipboard}
                </Snackbar>);
            }
        }).catch(() => {
        });
    }

    const show = (e, image) => {
        e.stopPropagation();

        setModalData({image: image});
        router.pushModal(MODAL_IMAGE);
    }

    return (
        <Panel id={id} centered={!groupToken}>
            <PanelHeader
                mode="secondary"
                left={<PanelHeaderBack onClick={() => router.popPage()}/>}
            >
                {strings.images}
            </PanelHeader>
            <Group>
                {!groupToken &&
                <Fragment>
                    <Placeholder
                        icon={<Icon56LockOutline/>}
                        header={strings.access_rights}
                        action={<Button size="l" onClick={fetchGroupToken}>{strings.grant_access}</Button>}
                    >
                        {strings.need_widget_token}
                    </Placeholder>
                </Fragment>
                }

                {!!groupToken &&
                <Fragment>
                    <Tabs>
                        <HorizontalScroll>
                            {imageTypes.map((type, i) => {
                                return (
                                    <TabsItem
                                        disabled={loading}
                                        key={i}
                                        onClick={() => changeTab(i)}
                                        selected={tab === i}
                                    >
                                        {getImageTypeStr(type)}
                                    </TabsItem>
                                );
                            })}
                        </HorizontalScroll>
                    </Tabs>

                    <Div>
                        <FormStatus
                            header={strings.upload_image}
                        >
                            <div style={{marginBottom: 12}}>{strings.upload_image_descr}</div>
                            <File
                                mode="primary"
                                before={loading ? <Spinner style={{marginLeft: 6}}/> : <Icon24Camera/>}
                                controlSize="l"
                                onChange={uploadFile}
                                disabled={loading}
                                accept="image/x-png, image/gif, image/jpeg"
                            >
                                {!loading && strings.select}
                            </File>
                        </FormStatus>
                    </Div>

                    {(!images) && <PanelSpinner/>}
                    {images &&
                    <Fragment>
                        {(!images.count) &&
                        <Placeholder icon={<Icon32SearchOutline/>}>{strings.not_found}</Placeholder>
                        }
                        {(!!images.count) &&
                        <Fragment>
                            {images.items.map((item) => {
                                return (
                                    <SimpleCell
                                        key={item.id}
                                        before={<Avatar mode="image" size={48} src={item.images[2].url}/>}
                                        after={<IconButton
                                            onClick={(e) => copy(e, item)}><Icon28CopyOutline/></IconButton>}
                                        description={item.type}
                                        onClick={(e) => show(e, item)}
                                    >
                                        {item.id}
                                    </SimpleCell>
                                );
                            })}
                            <Footer>{images.count} {declOfNum(images.count, [
                                strings.image.toLowerCase(),
                                strings.two_images.toLowerCase(),
                                strings.some_images.toLowerCase()
                            ])}</Footer>
                        </Fragment>
                        }
                    </Fragment>
                    }
                </Fragment>
                }
            </Group>
            {snackbar}
        </Panel>
    )
}

export default PanelImages;