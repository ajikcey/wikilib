import React, {useEffect, useState} from 'react';

import {
    Button, DatePicker,
    FormItem, FormLayoutGroup,
    Gradient,
    Group, Link,
    Panel,
    PanelHeader,
    PanelHeaderBack, Select, Snackbar, Text, Title
} from '@vkontakte/vkui';
import {useRouter} from "@happysanta/router";
import configData from "../config.json";
import {Icon16HelpOutline, Icon24CheckCircleOutline, Icon28CopyOutline} from "@vkontakte/icons";
import bridge from "@vkontakte/vk-bridge";

const PanelTime = ({id, strings, snackbarError}) => {
    const [snackbar, setSnackbar] = useState(snackbarError);
    const [timezoneOffset, setTimezoneOffset] = useState(0);
    const [year, setYear] = useState(0);
    const [month, setMonth] = useState(0);
    const [day, setDay] = useState(0);
    const [hour, setHour] = useState(0);
    const [minute, setMinute] = useState(0);
    const [second, setSecond] = useState(0);

    const router = useRouter();
    const current_date = new Date();

    useEffect(() => {
        refresh();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const calcTimestamp = () => {
        let d = new Date(Date.UTC(year, month, day, hour, minute, second));
        d.setTime(d.getTime() - timezoneOffset * 3600 * 1000)
        return Math.floor(d.getTime() / 1000).toString();
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

        setTimezoneOffset(-date.getTimezoneOffset() / 60);
        setYear(date.getFullYear());
        setMonth(date.getMonth());
        setDay(date.getDate());
        setHour(date.getHours());
        setMinute(date.getMinutes());
        setSecond(date.getSeconds());
    }

    return (
        <Panel id={id}>
            <PanelHeader
                mode="secondary"
                left={<PanelHeaderBack onClick={() => router.popPage()}/>}
            >
                {strings.unix_time}
            </PanelHeader>
            <Gradient style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: 32,
            }}>
                <Title style={{marginBottom: 8, marginTop: 20}} level="2" weight="medium">
                    {calcTimestamp()}
                    <Link><Icon28CopyOutline onClick={copy}/></Link>
                </Title>
                <Text style={{marginBottom: 24, color: 'var(--text_secondary)'}}>
                    {strings.unix_time_descr}
                    <Link href="https://vk.com/@wikilib-unixtime" target="_blank"><Icon16HelpOutline/></Link>
                </Text>
            </Gradient>
            <Group>
                <FormItem top="Дата">
                    <DatePicker
                        defaultValue={{
                            day: current_date.getDate(),
                            month: current_date.getMonth() + 1,
                            year: current_date.getFullYear()
                        }}
                        min={{
                            day: current_date.getDate(),
                            month: current_date.getMonth() + 1,
                            year: current_date.getFullYear()
                        }}
                        onDateChange={(value) => {
                            setYear(value.year);
                            setMonth(value.month);
                            setDay(value.day);
                        }}
                    />
                </FormItem>
                <FormLayoutGroup mode="horizontal">
                    <FormItem top="Часы">
                        <Select
                            value={hour}
                            onChange={(e) => {
                                setHour(+e.currentTarget.value);
                                calcTimestamp();
                            }}
                            options={Array(24).fill(1).map((el, i) => ({
                                value: i,
                                label: `${i}`.padStart(2, '0'),
                            }))}
                        />
                    </FormItem>
                    <FormItem top="Минуты">
                        <Select
                            value={minute}
                            onChange={(e) => {
                                setMinute(+e.currentTarget.value);
                                calcTimestamp();
                            }}
                            options={Array(60).fill(1).map((el, i) => ({
                                value: i,
                                label: `${i}`.padStart(2, '0'),
                            }))}
                        />
                    </FormItem>
                    <FormItem top="Секунды">
                        <Select
                            value={second}
                            onChange={(e) => {
                                setSecond(+e.currentTarget.value);
                                calcTimestamp();
                            }}
                            options={Array(60).fill(1).map((el, i) => ({
                                value: i,
                                label: `${i}`.padStart(2, '0'),
                            }))}
                        />
                    </FormItem>
                </FormLayoutGroup>
                <FormItem top="Часовой пояс">
                    <Select
                        value={timezoneOffset}
                        onChange={(e) => {
                            setTimezoneOffset(+e.currentTarget.value);
                            calcTimestamp();
                        }}
                        options={configData.timezones.map((item) => ({value: item.offset, label: item.name}))}
                    />
                </FormItem>
                <FormItem>
                    <Button
                        mode="secondary"
                        size="m"
                        stretched
                        onClick={refresh}
                    >
                        {strings.refresh}
                    </Button>
                </FormItem>
            </Group>
            {snackbar}
        </Panel>
    )
}

export default PanelTime;