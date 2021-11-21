import React, {Fragment, useEffect, useState} from 'react';

import {
    Div, Group,
    Panel,
    PanelHeader,
    PanelSpinner,
    PanelHeaderBack, File, HorizontalScroll, TabsItem, Tabs, Placeholder, Button, Snackbar
} from '@vkontakte/vkui';
import configData from "../config.json";
import {
    Icon24Camera,
    Icon24ErrorCircle,
    Icon24InfoCircleOutline,
    Icon32SearchOutline,
    Icon56LockOutline
} from "@vkontakte/icons";
import {AddToCommunity, fetchImages, ShowError} from "../functions";
import bridge from "@vkontakte/vk-bridge";

const Images = ({
                    id,
                    strings,
                    go,
                    group,
                    setModalData,
                    setActiveModal,
                    snackbarError,
                    groupToken,
                    addGroupToken
                }) => {
    const [snackbar, setSnackbar] = useState(snackbarError);
    const [images, setImages] = useState(null);
    const [tab, setTab] = useState(0);

    useEffect(() => {

        if (groupToken) {
            getImages(0, 100, imageTypes[tab]).then(() => {
            });
        }

        // eslint-disable-next-line
    }, [tab, groupToken]);


    const handleErrorImages = (e) => {
        console.log(e);

        if (e.error_data.error_reason.error_code === 15 &&
            e.error_data.error_reason.error_msg === "Access denied: app must be installed in group as community app") {
            setSnackbar(null);
            setSnackbar(<Snackbar
                onClose={() => setSnackbar(null)}
                before={<Icon24InfoCircleOutline fill='var(--dynamic_blue)'/>}
                action={strings.install}
                onActionClick={() => AddToCommunity(setModalData, setActiveModal)}
            >
                {strings.need_install_app}
            </Snackbar>);
        } else {
            ShowError(e, setModalData, setActiveModal);
        }
    }


    async function getImages(offset, count, image_type) {
        setImages(null);

        fetchImages(groupToken.access_token, offset, count, image_type).then(data => {
            if (data.response) {
                setImages(data.response);
            } else {
                setImages({count: 0});
            }
        }).catch(e => {
            setImages({count: 0});
            handleErrorImages(e);
        });
    }

    const back = () => {
        go(configData.routes.page);
    }

    const imageTypes = [
        '160x160',
        '160x240',
        '24x24',
        '510x128',
        '50x50',
    ];

    const changeTab = (i) => {
        setTab(i);
    }

    /**
     * Получение токена сообщества
     * @returns {Promise<void>}
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

    const selectFile = (e) => {
        console.log(e);

        let file = e.target.files[0];
        console.log(file);
    }

    return (
        <Panel id={id}>
            <PanelHeader
                mode="secondary"
                left={<PanelHeaderBack onClick={back}/>}
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
                                        key={i}
                                        onClick={() => changeTab(i)}
                                        selected={tab === i}
                                    >
                                        {type}
                                    </TabsItem>
                                );
                            })}
                        </HorizontalScroll>
                    </Tabs>

                    <Div>
                        <File
                            mode="secondary"
                            before={<Icon24Camera/>}
                            controlSize="l"
                            onChange={selectFile}
                            accept="image/x-png, image/gif, image/jpeg"
                        >
                            Загрузить фото
                        </File>
                    </Div>

                    {(!images) && <PanelSpinner/>}
                    {images &&
                    <Fragment>
                        {(images.count < 1) &&
                        <Fragment>
                            <Placeholder icon={<Icon32SearchOutline/>}>{strings.not_found}</Placeholder>
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

export default Images;