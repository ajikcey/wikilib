import {Button, FormItem, FormLayout, NativeSelect, SliderSwitch} from "@vkontakte/vkui";
import React, {useState} from "react";
import {useRouter} from "@happysanta/router";
import {ASC, DESC} from "../../index";

const FormEditAccess = (props) => {
    const [field, setField] = useState(props.pageSort.field);
    const [direction, setDirection] = useState(props.pageSort.direction);

    const router = useRouter();

    const onSubmit = function (e) {
        e.preventDefault();

        props.pageSort.field = field;
        props.pageSort.direction = direction;
        props.setPageSort(props.pageSort);

        let f = '';

        if (field === 1) {
            f = 'edited';
        } else if (field === 2) {
            f = 'views';
        } else if (field === 3) {
            f = 'title';
        } else {
            f = 'created';
        }

        props.pages.sort((a, b) => {
            if (a[f] > b[f]) {
                return (direction === ASC ? 1 : -1);
            }
            if (a[f] < b[f]) {
                return (direction === ASC ? -1 : 1);
            }
            return 0;
        });

        props.setPages(props.pages);
        router.popPage();
    };

    const onChangeField = function (e) {
        setField(+e.currentTarget.value);
    };

    const onSwitchDirection = function (value) {
        setDirection(value);
    };

    return (
        <FormLayout id='formSortPage' onSubmit={onSubmit}>
            <FormItem top={props.strings.sorting_field}>
                <NativeSelect name='field' onChange={onChangeField} defaultValue={field}>
                    <option value={0}>{props.strings.sort_by_creation_date}</option>
                    <option value={1}>{props.strings.sort_by_editing_date}</option>
                    <option value={2}>{props.strings.sort_by_views}</option>
                    <option value={3}>{props.strings.sort_by_title}</option>
                </NativeSelect>
            </FormItem>
            <FormItem top={props.strings.sorting_direction}>
                <SliderSwitch
                    onSwitch={onSwitchDirection}
                    name='direction'
                    activeValue={direction === ASC ?? DESC}
                    options={[
                        {value: DESC, name: props.strings.descending},
                        {value: ASC, name: props.strings.ascending},
                    ]}
                />
            </FormItem>
            <FormItem>
                <Button
                    type='submit'
                    size="l"
                    mode="primary"
                    stretched
                >{props.strings.apply}</Button>
            </FormItem>
        </FormLayout>
    );
}

export default FormEditAccess;