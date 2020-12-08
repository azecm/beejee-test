import {Dispatch, memo, useCallback, useState} from "react";
import {connect} from "react-redux";
import {
    actionPageLoaded,
    AppActions,
    AppStore, getAuth,
    getCurrentPage,
    getWaiting,
    messageShow,
    reloadData
} from "../utils/store";
import {ColumnName, OrderedBy, TaskItem} from "../types";
import {connectEdit, getData} from "../utils/transport";
import style from './table.module.scss';
import {locale} from "../utils/locale";
import {useForm} from "react-hook-form";
import {testField} from "../utils/util";


const columnOrder = ['id', 'username', 'email', 'status', 'text', 'image_path'] as ColumnName[];

const columnName: { [s in ColumnName]: { label: string, sortable: boolean, width: number, center: boolean, editable?: boolean } } = {
    id: {label: locale.colId, sortable: true, width: 4, center: true},
    username: {label: locale.colUserName, sortable: true, width: 10, center: true},
    email: {label: locale.colEmail, sortable: true, width: 10, center: false},
    status: {label: locale.colStatus, sortable: true, width: 4, center: true},
    text: {label: locale.colText, sortable: false, width: 15, center: false, editable: true},
    image_path: {label: locale.colImage, sortable: false, width: 4, center: true},
};


export function Table() {
    return <table className={style.table}>
        <TableHeader/>
        <TableBody/>
    </table>;
}

export const TableHeader = memo(connect(
    (state: AppStore) => ({token: state.token})
)(TableHeaderElement));

function TableHeaderElement({token}: Pick<AppStore, 'token'>) {
    return <thead>
    <tr>
        {columnOrder.map(key =>
            <TH key={key} colName={key} {...columnName[key]}/>
        )}
        {
            token ? <th/> : null
        }
    </tr>
    </thead>;
}

export const TH = memo(connect(
    (state: AppStore) => ({ordered: state.ordered})
)(THElement));

type THProps =
    Pick<AppStore, 'ordered'>
    & { label: string, sortable: boolean, colName: ColumnName, dispatch: Dispatch<AppActions> };

function THElement({label, sortable, colName, ordered, dispatch}: THProps) {
    const onClick = useCallback(async () => {
        if (getWaiting()) return;
        const direction = colName === ordered.columnName ? (ordered.direction === 'asc' ? 'desc' : 'asc') : 'asc';
        const page = getCurrentPage();
        const data = await getData({sort_direction: direction, sort_field: colName as OrderedBy, page});
        if (data) {
            dispatch(actionPageLoaded({
                list: data.tasks,
                total: +data.total_task_count,
                page,
                ordered: {direction, columnName: colName as OrderedBy}
            }));
        }
    }, [colName, dispatch, ordered]);

    return <th onClick={sortable ? onClick : void (0)} className={sortable ? style.active : void (0)}>
        <OrderArrow colName={colName} ordered={ordered}/>
        {label}
    </th>;
}

function OrderArrow({colName, ordered: {columnName, direction}}: Pick<AppStore, 'ordered'> & { colName: ColumnName }) {
    if (colName === columnName) {
        return <span>{direction === 'asc' ? '↓' : '↑'}</span>;
    } else {
        return null;
    }
}

export const TableBody = memo(connect(
    (state: AppStore) => ({list: state.list, token: state.token})
)(TableBodyElement));

function TableBodyElement({list, token}: Pick<AppStore, 'list' | 'token'>) {
    return <tbody>
    {list.map(row => <Row key={row.id} row={row} token={token}/>)}
    </tbody>;
}

function Row({row, token}: { row: TaskItem, token: string }) {
    const {register, getValues} = useForm();
    const [modify, setModify] = useState(false);

    const onBegin = useCallback(() => {
        setModify(true);
    }, [setModify]);
    const onCancel = useCallback(() => {
        setModify(false);
    }, []);
    const onSave = useCallback(async () => {
        setModify(false);
        if(!getAuth()) return;
        let {text} = getValues();
        text = testField(text);
        const status = Math.floor(row.status/10)*10 + 1;
        const data = await connectEdit(row.id, {token, text, status});
        if (data) {
            await reloadData();
            messageShow('info', locale.infoSaved);
        }
    }, [getValues, row, token]);

    const onFinish = useCallback(async() => {
        setModify(false);
        if(!getAuth()) return;
        let {text} = getValues();
        text = testField(text);
        const status = 10 + (row.status%10);
        const data = await connectEdit(row.id, {token, text, status});
        if (data) {
            await reloadData();
            messageShow('info', locale.infoFinished);
        }
    }, [getValues, row, token]);


    return <tr className={style.row}>
        {columnOrder.map(label => <td style={{
            width: `${columnName[label].width}em`,
            maxWidth: `${columnName[label].width}em`,
            textAlign: columnName[label].center ? 'center' : void (0)
        }} title={row[label] as string}>
            <Cell key={label} label={label} row={row} modify={modify} register={register}/>
        </td>)}
        {
            token
                ? <td>
                    {modify
                        ? <>
                            <button onClick={onSave}>{locale.modifySave}</button>
                            <button onClick={onCancel}>{locale.modifyCancel}</button>
                            <button onClick={onFinish}>{locale.modifyFinish}</button>
                        </>
                        : <button onClick={onBegin}>{locale.modifyBegin}</button>
                    }
                </td>
                : null
        }
    </tr>
}

function Cell({label, row, modify, register}: { label: ColumnName, row: TaskItem, modify: boolean, register: any }) {
    if (label.startsWith('image')) {
        return <img src={row[label] as string} className={style.icon} alt=""/>;
    } else {
        return <>{
            modify && columnName[label].editable
                ? <input name={label} defaultValue={row[label]} ref={register}/>
                : row[label]
        }</>;
    }
}
