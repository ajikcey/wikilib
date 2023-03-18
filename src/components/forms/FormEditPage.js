import configData from "../../config.json";
import {Icon24CheckCircleOutline, Icon24ExternalLinkOutline} from "@vkontakte/icons";
import {
    Div, Button,
    Caption,
    FormItem,
    FormLayout,
    Snackbar,
    Textarea,
    usePlatform,
    Platform
} from "@vkontakte/vkui";
import React, {useState} from "react";
import {handleError, savePage} from "../../functions";
import {useRouter} from "@happysanta/router";

const FromEditPage = (props) => {
    const [text, setText] = useState(props.modalData.source);
    const [textError, setTextError] = useState(null);
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const platform = usePlatform();

    const onSubmit = async (e) => {
        e.preventDefault();
        let system_error = null;

        if (textError) return;

        const result = {
            text: text.trim()
        };

        setText(result.text);
        if (!result.text) {
            setTextError({error_msg: props.strings.enter_text});
            return;
        }

        if (loading) return;
        setLoading(true);

        await savePage(props.modalData.page_id, props.group.id, props.accessToken.access_token, null, result.text).then(() => {
            // success
        }).catch(e => {
            system_error = [e, {
                default_error_msg: 'Error save access'
            }];
        });

        if (system_error) {
            handleError(props.strings, props.modalData.setSnackbar, router, system_error[0], system_error[1]);
            setLoading(false);
            router.popPage();
            return;
        }

        props.modalData.getPageData().then();

        props.modalData.setSnackbar(<Snackbar
            onClose={() => props.modalData.setSnackbar(null)}
            before={<Icon24CheckCircleOutline fill='var(--vkui--color_accent_green)'/>}
        >{props.strings.saved}</Snackbar>);

        router.popPage();
        props.modalData.setTab('info');
    }

    /**
     * Изменение текста
     * @param e
     */
    const onChangeText = (e) => {
        setText(e.currentTarget.value);

        if (!e.currentTarget.value) {
            setTextError({error_msg: props.strings.enter_text});
        } else {
            setTextError(null);
        }
    }

    return (
        <FormLayout onSubmit={onSubmit}>
            <FormItem
                style={{paddingBottom: 0, paddingLeft: 0, paddingRight: 0}}
                status={textError ? 'error' : ''}
                bottom={
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <Caption>{textError && textError.error_msg ? textError.error_msg : ''}</Caption>
                        <Caption>{text.length + '/' + configData.max_length_text}</Caption>
                    </div>
                }
            >
                <div style={{position: 'relative'}}>
                    <Textarea
                        rows={10}
                        name='text'
                        placeholder={props.strings.enter_text}
                        onChange={onChangeText}
                        value={text}
                        maxLength={configData.max_length_text}
                    />
                </div>
            </FormItem>
            <FormItem
                style={{paddingBottom: 0, paddingLeft: 0, paddingRight: 0}}
            >
                <Div style={{display: 'flex', padding: 0}}>
                    {(platform === Platform.VKCOM) &&
                    <Button
                        size="l" mode="secondary"
                        style={{marginRight: 8}}
                        href={'https://vk.com/page-' + props.group.id + '_' + props.modalData.page_id}
                        target='_blank' rel='noreferrer' stretched={1}
                        after={<Icon24ExternalLinkOutline/>}
                    >{props.strings.open_vk_editor}</Button>
                    }
                    <Button
                        type='submit'
                        size="l"
                        loading={loading}
                        stretched={1}
                    >{props.modalData.version ? props.strings.apply_this_version : props.strings.save}</Button>
                </Div>
            </FormItem>
        </FormLayout>
    );
}

export default FromEditPage;