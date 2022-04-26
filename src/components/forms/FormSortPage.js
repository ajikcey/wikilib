import {Button, FormItem, FormLayout, SegmentedControl, Select} from "@vkontakte/vkui";
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

    const onSwitchDirection = (value) => {
        setDirection(value);
    };

    return (
        <FormLayout id='formSortPage' onSubmit={onSubmit}>
            <FormItem top={props.strings.sorting_field}>
                <Select
                    name='field'
                    onChange={onChangeField}
                    defaultValue={0}
                    options={[
                        {value: 0, label: props.strings.sort_by_creation_date},
                        {value: 1, label: props.strings.sort_by_editing_date},
                        {value: 2, label: props.strings.sort_by_views},
                        {value: 3, label: props.strings.sort_by_title},
                    ]}
                />
            </FormItem>
            <FormItem top={props.strings.sorting_direction}>
                <SegmentedControl
                    onChange={onSwitchDirection}
                    name='direction'
                    value={direction === ASC ? ASC : DESC}
                    options={[
                        {value: DESC, label: props.strings.descending},
                        {value: ASC, label: props.strings.ascending},
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