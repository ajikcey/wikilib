import React, {useEffect, useState} from 'react';

import {
    Button, Div,
    FormItem, FormLayoutGroup,
    Group, Input, Link,
    Panel,
    PanelHeader,
    PanelHeaderBack, Select, Snackbar, Text, Title
} from '@vkontakte/vkui';
import {useRouter} from "@happysanta/router";
import configData from "../config.json";
import {Icon20HelpOutline, Icon24CheckCircleOutline} from "@vkontakte/icons";
import bridge from "@vkontakte/vk-bridge";
import {MODAL_TIMESTAMP} from "../index";

const PanelTime = ({id, strings, setModalData, snackbarError}) => {
    const [snackbar, setSnackbar] = useState(snackbarError);
    const [timezone, setTimezone] = useState(0);
    const [year, setYear] = useState(0);
    const [month, setMonth] = useState(0);
    const [day, setDay] = useState(0);
    const [hour, setHour] = useState(0);
    const [minute, setMinute] = useState(0);
    const [second, setSecond] = useState(0);

    const router = useRouter();

    useEffect(() => {
        let date = new Date();

        setTimezone(-date.getTimezoneOffset() / 60);
        setYear(date.getFullYear());
        setMonth(date.getMonth());
        setDay(date.getDate());

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const calcTimestamp = () => {
        let date = new Date(Date.UTC(year, month, day, hour, minute, second));
        date.setTime(date.getTime() - timezone * 3600 * 1000);
        return Math.floor(date.getTime() / 1000).toString();
    }

    const setTimestamp = (sec, timezone) => {
        sec = sec * 1000;
        sec += timezone * 3600 * 1000;

        let date = new Date(+sec);

        setYear(date.getUTCFullYear());
        setMonth(date.getUTCMonth());
        setDay(date.getUTCDate());
        setHour(date.getUTCHours());
        setMinute(date.getUTCMinutes());
        setSecond(date.getUTCSeconds());
    }

    const copy = (e) => {
        e.preventDefault();

        bridge.send("VKWebAppCopyText", {text: calcTimestamp()}).then((data) => {
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
        }).catch((e) => {
            console.log(e);
        });
    }

    const refresh = () => {
        let date = new Date();

        setTimezone(-date.getTimezoneOffset() / 60);
        setYear(date.getFullYear());
        setMonth(date.getMonth());
        setDay(date.getDate());
        setHour(date.getHours());
        setMinute(date.getMinutes());
        setSecond(date.getSeconds());
    }

    const reset = () => {
        setHour(0);
        setMinute(0);
        setSecond(0);
    }

    const find_date = () => {
        setModalData({
            setTimestamp: setTimestamp,
            setTimezone: setTimezone,
            timezone: timezone,
        });
        router.pushModal(MODAL_TIMESTAMP);
    }

    return (
        <Panel id={id}>
            <PanelHeader
                mode="secondary"
                left={<PanelHeaderBack onClick={() => router.popPage()}/>}
            >
                {strings.unix_time}
            </PanelHeader>
            <Group>
                <Div style={{textAlign: "center"}}>
                    <Title style={{marginBottom: 8, marginTop: 20}} level="2" weight="medium">
                        {calcTimestamp()}
                        <Link href="https://vk.com/@wikilib-unixtime" target="_blank"><Icon20HelpOutline/></Link>
                    </Title>
                    <Text style={{marginBottom: 24, color: 'var(--text_secondary)'}}>
                        {strings.unix_time_descr}
                    </Text>
                </Div>
                <Div style={{display: 'flex'}}>
                    <Button
                        size="l"
                        stretched
                        mode="secondary"
                        style={{marginRight: 8}}
                        onClick={find_date}
                    >
                        {strings.find_date}
                    </Button>
                    <Button size="l" stretched onClick={copy}>{strings.copy}</Button>
                </Div>
            </Group>
            <Group>
                <FormLayoutGroup mode="horizontal">
                    <FormItem top={strings.timezone}>
                        <Select
                            value={timezone}
                            onChange={(e) => setTimezone(+e.currentTarget.value)}
                            options={configData.timezones.map((item) => ({value: item.offset, label: item.name}))}
                        />
                    </FormItem>
                    <FormItem top={strings.date}>
                        <Input
                            type="date"
                            value={year + '-' + `${month + 1}`.padStart(2, '0') + '-' + `${day}`.padStart(2, '0')}
                            onChange={(e) => {
                                let matches = e.currentTarget.value.split('-');
                                console.log(matches);

                                setYear(+matches[0]);
                                setMonth(+matches[1] - 1);
                                setDay(+matches[2]);
                            }}
                        />
                    </FormItem>
                </FormLayoutGroup>
                <FormLayoutGroup mode="horizontal">
                    <FormItem top={strings.hours}>
                        <Select
                            value={hour}
                            onChange={(e) => setHour(+e.currentTarget.value)}
                            options={Array(24).fill(1).map((el, i) => ({
                                value: i,
                                label: `${i}`,
                            }))}
                        />
                    </FormItem>
                    <FormItem top={strings.minutes}>
                        <Select
                            value={minute}
                            onChange={(e) => setMinute(+e.currentTarget.value)}
                            options={Array(60).fill(1).map((el, i) => ({
                                value: i,
                                label: `${i}`,
                            }))}
                        />
                    </FormItem>
                    <FormItem top={strings.seconds}>
                        <Select
                            value={second}
                            onChange={(e) => setSecond(+e.currentTarget.value)}
                            options={Array(60).fill(1).map((el, i) => ({
                                value: i,
                                label: `${i}`,
                            }))}
                        />
                    </FormItem>
                </FormLayoutGroup>
                <Div style={{display: 'flex'}}>
                    <Button size="l" stretched mode="secondary" onClick={reset}>
                        {strings.reset_time}
                    </Button>
                    <Button style={{marginLeft: 8}} stretched size="l" mode="secondary" onClick={refresh}>
                        {strings.current_time}
                    </Button>
                </Div>
            </Group>
            {snackbar}
        </Panel>
    )
}

export default PanelTime;