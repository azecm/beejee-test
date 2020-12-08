import {useForm} from "react-hook-form";
import {locale} from "../utils/locale";
import {Dispatch, memo, useCallback} from "react";
import {connectLogin} from "../utils/transport";
import style from './auth.module.scss'
import {connect} from "react-redux";
import {actionAuth, AppActions, AppStore} from "../utils/store";


export const Auth = memo(connect(
    (state: AppStore) => ({token: state.token})
)(AuthElement));

function AuthElement({token, dispatch}:Pick<AppStore, 'token'> & {dispatch: Dispatch<AppActions>}) {
    if(token){
        return <Logout dispatch={dispatch}/>;
    }
    else{
        return <Login dispatch={dispatch}/>;
    }
}

function Logout({dispatch}:{dispatch: Dispatch<AppActions>}){
    const onLogout = useCallback(()=>{
        dispatch(actionAuth(''));
    },[dispatch]);

    return <div className={style.block}>
        <button onClick={onLogout}>{locale.authLogOut}</button>
    </div>
}

function Login({dispatch}:{dispatch: Dispatch<AppActions>}){
    const {register, getValues} = useForm();

    const onEnter = useCallback(async () => {
        let {user_name, user_pass} = getValues() as { user_name: string, user_pass: string };
        user_name = user_name.trim();
        user_pass = user_pass.trim();

        const data = await connectLogin(user_name, user_pass);
        if (data) {
            dispatch(actionAuth(data.token));
        }

    }, [getValues, dispatch]);
    return <div className={style.block}>
        <span className={style.label}>{locale.auth}:</span>
        <input placeholder={locale.authName} name="user_name" ref={register}/>
        <input placeholder={locale.authPass} name="user_pass" ref={register}/>
        <button onClick={onEnter}>{locale.authSubmit}</button>
    </div>

}
