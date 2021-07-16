import React, {useEffect, useState} from 'react';

import {
    Avatar,
    Button,
    FormItem, FormLayout,
    Group, InfoRow, Link,
    Panel, PanelHeader, PanelHeaderBack, PanelHeaderContent, SimpleCell, Snackbar, Textarea
} from '@vkontakte/vkui';

import {
    Icon24CheckCircleOutline,
    Icon36CalendarOutline,
} from "@vkontakte/icons";
import configData from "../config.json";
import {fetchUsers, handleError, savePage, timestampToDate} from "../functions";

const Version = ({id, accessToken, content, user, go, snackbarError}) => {
    const [snackbar, setSnackbar] = useState(snackbarError);
    const [formValues, setFormValues] = useState(null);
    const [creator, setCreator] = useState({});

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

        savePage(content.id, content.group_id, user.id, accessToken.access_token, content.title, formValues.text).then(() => {

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
        setFormValues({
            [e.target.name]: e.target.value
        })
    }

    return (
        <Panel id={id}>
            <PanelHeader
                mode="secondary"
                left={<PanelHeaderBack onClick={() => go(configData.routes.page)}/>}
            >
                <PanelHeaderContent
                    status={(content.version ? 'v.' + content.version : 'текущая версия')}
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

                <FormLayout onSubmit={onSubmitVersion}>
                    <FormItem top="Текст">
                        <Textarea
                            rows={20}
                            name='text'
                            placeholder="Введите текст"
                            onChange={onChangeField}
                            value={content.source}/>
                    </FormItem>
                    <FormItem>
                        <Button
                            size="l" stretched
                            type=""
                        >
                            {content.version ? 'Применить данную версию' : 'Сохранить'}</Button>
                    </FormItem>
                </FormLayout>
            </Group>
            {snackbar}
        </Panel>
    )
}

export default Version;