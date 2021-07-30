import configData from "../config.json";
import {Icon24Article} from "@vkontakte/icons";
import {Avatar} from "@vkontakte/vkui";

/**
 * Выбор иконки для wiki-страницы в зависимости от настроек доступа
 * - красная, если могут смотреть только администраторы или редактировать все
 * - оранжевая, если могут редактировать участники
 * - синяя, если могут смотреть только участники
 * - серая по умолчанию
 * @returns {JSX.Element}
 * @constructor
 */
const IconPage = (props) => {
    let color = '--dynamic_gray';

    if (props.page.who_can_view === configData.wiki_access.staff ||
        props.page.who_can_edit === configData.wiki_access.all) {
        color = '--dynamic_red';
    } else if (props.page.who_can_edit === configData.wiki_access.member) {
        color = '--dynamic_orange';
    } else if (props.page.who_can_view === configData.wiki_access.member) {
        color = '--dynamic_blue';
    }

    return (
        <Avatar mode="app" shadow={false} size={38} style={{backgroundColor: 'var(' + color + ')'}}>
            <Icon24Article style={{color: '#fff'}}/>
        </Avatar>
    );
}

export default IconPage;