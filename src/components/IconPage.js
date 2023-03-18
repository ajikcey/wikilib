import configData from "../config.json";
import {Icon24Article} from "@vkontakte/icons";
import {Image} from "@vkontakte/vkui";

/**
 * Выбор иконки для wiki-страницы в зависимости от настроек доступа
 * - красная, если могут смотреть только администраторы
 * - оранжевая, если могут редактировать участники
 * - синяя, если могут смотреть только участники
 * - серая по умолчанию
 * @returns {JSX.Element}
 * @constructor
 */
const IconPage = (props) => {
    let color = '--vkui--color_accent_gray';

    if (props.page.who_can_view === configData.wiki_access.staff ||
        props.page.who_can_edit === configData.wiki_access.all) {
        color = '--vkui--color_accent_red';
    } else if (props.page.who_can_edit === configData.wiki_access.member) {
        color = '--vkui--color_accent_orange';
    } else if (props.page.who_can_view === configData.wiki_access.member) {
        color = '--vkui--color_icon_accent';
    }

    return (
        <Image size={36} style={{backgroundColor: 'var(' + color + ')'}}>
            <Icon24Article style={{color: '#fff'}}/>
        </Image>
    );
}

export default IconPage;