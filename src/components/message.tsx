import {memo} from "react";
import {connect} from "react-redux";
import {AppStore} from "../utils/store";
import style from './message.module.scss';
import {locale} from "../utils/locale";

export const Message = memo(connect(
    (state: AppStore) => ({message: state.message})
)(MessageElement));

function MessageElement({message: {type, text}}: Pick<AppStore, 'message'>) {
    return <div>
        {locale.labelInfoMessage} <span className={type ? style[type] : void (0)}>{text}</span>
    </div>;
}
