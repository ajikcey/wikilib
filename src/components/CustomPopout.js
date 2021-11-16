import {
    getClassName,
    ModalDismissButton,
    PopoutWrapper,
    usePlatform,
    ViewWidth,
    withAdaptivity
} from "@vkontakte/vkui";

/**
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
const CustomPopout = withAdaptivity(({children, onClose, viewWidth}) => {
    const platform = usePlatform();
    const baseClassNames = getClassName('formEditPage', platform);
    const isMobile = viewWidth <= ViewWidth.MOBILE;

    return (
        <PopoutWrapper
            alignY={isMobile ? 'bottom' : 'center'}
            onClick={onClose}>
            <div
                className={baseClassNames}
                style={{
                    backgroundColor: "var(--background_content)",
                    borderRadius: 12,
                    position: "relative",
                    margin: 5,
                    padding: 12
                }}>
                {children}
                {viewWidth >= ViewWidth.SMALL_TABLET && <ModalDismissButton onClick={onClose}/>}
            </div>
        </PopoutWrapper>
    )
}, {
    viewWidth: true
})

export default CustomPopout;