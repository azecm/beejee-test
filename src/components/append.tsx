import {locale} from "../utils/locale";
import style from './append.module.scss';
import {useForm} from "react-hook-form";
import {useCallback} from "react";
import * as yup from "yup";
import {messageShow, reloadData} from "../utils/store";
import {connectAddTask} from "../utils/transport";
import {testField} from "../utils/util";

const schema = yup.object().shape({
    email: yup.string().email().required()
});

export function Append() {
    const {register, getValues, reset} = useForm();

    const onSubmit = useCallback(async () => {
        let {username, email, text} = getValues() as { username: string, email: string, text: string };
        username = testField(username);
        text = testField(text);
        let valid = false;
        try {
            valid = await (schema.validate({email}) as Promise<any>);
        } catch (e) {
        }

        if (valid && username && text) {
            const data = await connectAddTask({username, text, email});
            if (data) {
                if (data.id) {
                    messageShow('info', locale.infoAdded);
                    reset({username: '', email: '', text: ''});
                    await reloadData();
                } else {
                    messageShow('error', JSON.stringify(data));
                }
            }
        } else {
            if (!valid) {
                messageShow('error', locale.errorEmail);
            } else {
                messageShow('error', locale.errorOther);
            }
        }

    }, [getValues, reset]);

    return <table className={style.block}>
        <tr>
            <td>{locale.colUserName}:</td>
            <td><input name="username" ref={register}/></td>
        </tr>
        <tr>
            <td>{locale.colEmail}:</td>
            <td><input name="email" ref={register}/></td>
        </tr>
        <tr>
            <td>{locale.colText}:</td>
            <td><input name="text" ref={register}/></td>
        </tr>
        <tr>
            <td colSpan={2}>
                <button onClick={onSubmit}>{locale.appendButton}</button>
            </td>
        </tr>
    </table>
}
