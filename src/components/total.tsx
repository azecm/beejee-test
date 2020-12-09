import {ChangeEvent, Dispatch, memo, useCallback, useEffect, useRef} from "react";
import {connect} from "react-redux";
import {actionPageLoaded, AppActions, AppStore, getCurrentOrder, getWaiting} from "../utils/store";
import {numberEntriesPerPage} from "../utils/const";
import style from './total.module.scss';
import {locale} from "../utils/locale";
import {getData} from "../utils/transport";

export const TotalCount = memo(connect(
    (state: AppStore) => ({total: state.total, page: state.page})
)(TotalCountElement));

type TotalCountProps = Pick<AppStore, 'total' | 'page'> & { dispatch: Dispatch<AppActions> };

function TotalCountElement({total, page, dispatch}: TotalCountProps) {

    const pageMax = Math.ceil(total / numberEntriesPerPage);

    const refTimer = useRef<any>();
    const refInput = useRef<HTMLInputElement>(null);

    const onPage = useCallback(async (nextPage: number) => {
        if (getWaiting()) return;
        if (nextPage < 1 || nextPage > pageMax) return;
        const ord = getCurrentOrder();

        const data = await getData({sort_direction: ord.direction, sort_field: ord.columnName, page: nextPage});
        if (data) {
            dispatch(actionPageLoaded({
                list: data.tasks,
                total: +data.total_task_count,
                page: nextPage,
                ordered: ord
            }));
        }
    }, [pageMax, dispatch]);

    const onNext = useCallback(() => {
        onPage(page + 1);
    }, [onPage, page]);
    const onPrev = useCallback(() => {
        onPage(page - 1);
    }, [onPage, page]);

    useEffect(() => {
        if (refInput.current) {
            refInput.current.value = page + '';
        }
    }, [page]);

    const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const val = e.currentTarget.valueAsNumber;
        if (isNaN(val) || val < 1 || val > pageMax) return;
        clearTimeout(refTimer.current);
        refTimer.current = setTimeout(onPage, 800, val);
    }, [refTimer, onPage, pageMax]);

    return <div className={style.block}>
        <div>
            Всего записей: {total}<br/>
            Текущая страница: <input ref={refInput} min={1} max={pageMax} step={1} onChange={onChange} type="number"
                                     className={style.input}/> / {pageMax}
        </div>
        <div className={style.space}/>
        <button title={locale.prevPage} onClick={onPrev} disabled={page === 1}>←</button>
        <button title={locale.nextPage} onClick={onNext} disabled={page === pageMax}>→</button>
    </div>;
}
