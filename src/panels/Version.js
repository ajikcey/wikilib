import React, {useEffect, useState} from 'react';

import {
    Avatar,
    Button, CellButton,
    FormItem, FormLayout,
    Group, InfoRow, Link,
    Panel, PanelHeader, PanelHeaderBack, PanelHeaderContent, SimpleCell, Snackbar, Textarea, usePlatform, VKCOM
} from '@vkontakte/vkui';

import {
    Icon24CheckCircleOutline, Icon24ExternalLinkOutline,
    Icon36CalendarOutline,
} from "@vkontakte/icons";
import configData from "../config.json";
import {fetchUsers, handleError, savePage, timestampToDate} from "../functions";
import IconPage from "../components/IconPage";

const Version = ({id, accessToken, content, go, snackbarError}) => {
    const [snackbar, setSnackbar] = useState(snackbarError);
    const [creator, setCreator] = useState({});

    const platform = usePlatform();

    let formValues = {};

    useEffect(() => {

        fetchUsers([content.creator_id], accessToken.access_token).then(data => {
            if (data.response) {
                setCreator(data.response[0]);
            } else {
                handleError(setSnackbar, go, {}, {
                    data: data,
                    default_error_msg: 'No response get users'
                });
            }
        }).catch(e => {
            handleError(setSnackbar, go, e, {
                default_error_msg: 'Error get users'
            });
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Применить данную версию wiki-страницы
     */
    const onSubmitVersion = (e) => {
        e.preventDefault();

        formValues.text.trim();

        if (!formValues.text) {
            console.log('Empty text'); // todo: form error
            return;
        }

        savePage(content.page_id, content.group_id, accessToken.access_token, content.title, formValues.text).then(() => {

            setSnackbar(<Snackbar
                onClose={() => setSnackbar(null)}
                before={<Icon24CheckCircleOutline fill='var(--dynamic_green)'/>}
            >
                Сохранено
            </Snackbar>);

            go(configData.routes.page);
        });
    }

    /**
     * Изменение данных в форме
     * @param e
     */
    const onChangeField = (e) => {
        formValues[e.currentTarget.name] = e.currentTarget.value;
    }

    return (
        <Panel id={id}>
            <PanelHeader
                mode="secondary"
                left={<PanelHeaderBack onClick={() => go(configData.routes.page)}/>}
            >
                <PanelHeaderContent
                    status={(content.version ? 'v.' + content.version : 'текущая версия')}
                    before={<IconPage page={content}/>}
                >
                    {content.title}
                </PanelHeaderContent>
            </PanelHeader>

            <Group>
                <SimpleCell
                    before={<Icon36CalendarOutline/>}
                    after={<Link
                        href={'https://vk.com/id' + content.creator_id} target='_blank'
                    >
                        <Avatar size={32} src={creator.photo_200}/></Link>}
                >
                    <InfoRow header="Версия сохранена">
                        {timestampToDate(content.edited)}
                    </InfoRow>
                </SimpleCell>

                <CellButton
                    before={<Icon24ExternalLinkOutline/>}
                    href={'https://vk.com/page-' + content.group_id + '_' + content.page_id + '?act=edit&section=edit' + (content.version ? '&hid=' + content.version : '')}
                    target='_blank' rel='noreferrer'
                >
                    Перейти в редактор ВКонтакте</CellButton>

                <FormLayout onSubmit={onSubmitVersion}>
                    <FormItem top="Текст">
                        <Textarea
                            rows={20}
                            name='text'
                            placeholder="Введите текст"
                            onChange={onChangeField}
                            defaultValue={content.source}
                        />
                    </FormItem>
                    <FormItem style={{textAlign: 'right'}}>
                        <Button
                            size="l"
                            stretched={platform !== VKCOM}
                        >
                            {content.version ? 'Применить данную версию' : 'Сохранить'}
                        </Button>
                    </FormItem>
                </FormLayout>
            </Group>
            {snackbar}
        </Panel>
    )
}

export default Version;