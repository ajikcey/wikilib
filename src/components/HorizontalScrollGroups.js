import {
    HorizontalCell, Avatar, HorizontalScroll, Header, Link, Group
} from '@vkontakte/vkui';
import {Icon16Clear} from "@vkontakte/icons";

/**
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
const HorizontalScrollGroups = (props) => {
    const SCROLL_OFFSET = 320;

    return (
        (props.lastGroups && props.lastGroups.length > 0) &&
        <Group>
            <Header
                aside={<Link
                    style={{color: 'var(--icon_secondary)'}} mode="tertiary"
                    onClick={() => props.clearLastGroups()}
                >
                    <Icon16Clear/>
                </Link>}>
                {props.strings.recently_watched}
            </Header>
            <HorizontalScroll
                showArrows
                getScrollToLeft={i => i - SCROLL_OFFSET}
                getScrollToRight={i => i + SCROLL_OFFSET}>

                <div style={{display: 'flex'}}>
                    {props.lastGroups.map((group) => {
                        return (
                            <HorizontalCell
                                key={group.id}
                                onClick={() => {
                                    props.selectGroup(group)
                                }}
                                header={<div style={{
                                    WebkitBoxOrient: 'vertical',
                                    WebkitLineClamp: 2,
                                    display: '-webkit-box',
                                    overflow: 'hidden',
                                    wordBreak: 'break-word'
                                }}>{group.name}</div>}
                            >
                                <Avatar size={64} src={group.photo_100}/>
                            </HorizontalCell>
                        );
                    })}
                </div>
            </HorizontalScroll>
        </Group>
    )
}

export default HorizontalScrollGroups;