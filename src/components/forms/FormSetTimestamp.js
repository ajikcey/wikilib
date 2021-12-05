import {Button, FormItem, FormLayout, Input, Select} from "@vkontakte/vkui";
import React, {useState} from "react";
import {useRouter} from "@happysanta/router";
import configData from "../../config.json";

const FromSetTimestamp = (props) => {
    const [valueError, setValueError] = useState(null);

    const router = useRouter();

    const onSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const formProps = Object.fromEntries(formData);

        if (!formProps.timestamp) {
            setValueError({error_msg: props.strings.enter});
            return;
        }

        props.modalData.setTimezone(formProps.timezone);
        props.modalData.setTimestamp(formProps.timestamp, formProps.timezone);
        router.popPage();
    }

    return (
        <FormLayout onSubmit={onSubmit}>
            <FormItem
                top={props.strings.unix_time}
                style={{paddingLeft: 0, paddingRight: 0}}
                status={valueError ? 'error' : ''}
                bottom={valueError && valueError.error_msg ? valueError.error_msg : ''}
            >
                <Input type="number" name="timestamp" autoFocus={true}/>
            </FormItem>
            <FormItem
                top={props.strings.timezone}
                style={{paddingLeft: 0, paddingRight: 0}}
            >
                <Select
                    name="timezone"
                    defaultValue={props.modalData.timezone}
                    options={configData.timezones.map((item) => ({value: item.offset, label: item.name}))}
                />
            </FormItem>
            <Button
                type='submit'
                size="l"
                mode="primary"
                stretched
            >
                {props.strings.continue}
            </Button>
        </FormLayout>
    );
}

export default FromSetTimestamp;