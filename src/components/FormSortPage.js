import {Button, FormItem, FormLayout, NativeSelect, SliderSwitch} from "@vkontakte/vkui";
import React, {useState} from "react";

/**
 * Форма редактирования настроек сортировки wiki-страницы
 * @returns {JSX.Element}
 * @constructor
 */
const FormEditAccess = (props) => {
    const [field, setField] = useState(props.pageSort.field);
    const [direction, setDirection] = useState(props.pageSort.direction);

    /**
     * Сохранение настроек
     * @param e
     */
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
        } else {
            f = 'created';
        }

        props.pages.sort((a, b) => {
            if (a[f] > b[f]) {
                return (direction ? 1 : -1);
            }
            if (a[f] < b[f]) {
                return (direction ? -1 : 1);
            }
            return 0;
        });

        props.setPages(props.pages);
        props.onCloseModal();
    };

    const onChangeField = function (e) {
        setField(+e.currentTarget.value);
    };

    const onSwitchDirection = function (value) {
        setDirection(+value);
    };

    return (
        <FormLayout id='formSortPage' onSubmit={onSubmit}>
            <FormItem top="Сортировать">
                <NativeSelect name='field' onChange={onChangeField} defaultValue={field}>
                    <option value={0}>По дате создания</option>
                    <option value={1}>По дате редактирования</option>
                    <option value={2}>По просмотрам</option>
                </NativeSelect>
            </FormItem>
            <FormItem top="Направление">
                <SliderSwitch
                    onSwitch={onSwitchDirection}
                    name='direction'
                    activeValue={direction ? direction : 0}
                    options={[
                        {value: 0, name: 'По убыванию'},
                        {value: 1, name: 'По возрастанию'},
                    ]}
                />
            </FormItem>
            <FormItem>
                <Button size="l" mode="primary" stretched>Применить</Button>
            </FormItem>
        </FormLayout>
    );
}

export default FormEditAccess;