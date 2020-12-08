import {MessageEntity, MessageType, OrderedBy, OrderedDir, TaskItem} from "../types";
import {Action, createStore} from "redux";
import {getData} from "./transport";
import {locale} from "./locale";

const APP_PAGE_LOADED = 'APP_PAGE_LOADED';
const APP_MESSAGE = 'APP_MESSAGE';
const APP_AUTH = 'APP_AUTH';
const APP_WAITING = 'APP_WAITING';

let timerMessage: any;

// ========================

type PageLoadedParams = Pick<AppStore, 'list' | 'total' | 'page' | 'ordered'>;

export function actionPageLoaded(params: PageLoadedParams): Action<typeof APP_PAGE_LOADED> & { payload: PageLoadedParams } {
    return {
        type: APP_PAGE_LOADED,
        payload: params
    }
}

function actionMessage(type: MessageType, text: string): Action<typeof APP_MESSAGE> & { payload: MessageEntity } {
    return {
        type: APP_MESSAGE,
        payload: {type, text} as MessageEntity
    }
}

function actionWaiting(waiting: boolean): Action<typeof APP_WAITING> & { payload: Pick<AppStore, 'waiting'> } {
    return {
        type: APP_WAITING,
        payload: {waiting}
    }
}

export function actionAuth(token: string): Action<typeof APP_AUTH> & { payload: Pick<AppStore, 'token'> } {
    if(token){
        localStorage.setItem('token', token);
    }
    else{
        localStorage.removeItem('token');
    }

    return {
        type: APP_AUTH,
        payload: {token}
    }
}

// ========================

export type AppActions =
    ReturnType<typeof actionPageLoaded> |
    ReturnType<typeof actionMessage> |
    ReturnType<typeof actionWaiting> |
    ReturnType<typeof actionAuth>;


const initialState = {
    list: [] as TaskItem[],
    total: 0,
    page: 0,
    waiting: false,
    token: localStorage.getItem('token')||'',
    ordered: {
        columnName: 'id' as OrderedBy,
        direction: 'asc' as OrderedDir
    },
    message: {
        text: '',
        type: null as MessageType
    } as MessageEntity,

};
export type AppStore = typeof initialState;
export const appStore = createStore(appReducer);

const {dispatch} = appStore;

export function appReducer(state = initialState, action: AppActions): AppStore {
    switch (action.type) {
        case APP_PAGE_LOADED:
        case APP_WAITING:
        case APP_AUTH:
            return {...state, ...action.payload};
        case APP_MESSAGE:
            return onMessage(state, action.payload);
        default:
            return state;
    }
}

// ========================

export function initData(list: TaskItem[], total: number) {
    dispatch(actionPageLoaded({list, total, page: 1, ordered: {direction: 'asc', columnName: 'id'}}));
}

export async function reloadData() {
    const ord = getCurrentOrder();
    const page = getCurrentPage();

    const data = await getData({sort_direction: ord.direction, sort_field: ord.columnName, page});
    if (data) {
        dispatch(actionPageLoaded({
            list: data.tasks,
            total: +data.total_task_count,
            page: page,
            ordered: ord
        }));
    }
}

export function getCurrentPage() {
    return appStore.getState().page;
}

export function getCurrentOrder() {
    return appStore.getState().ordered;
}

export function getWaiting() {
    return appStore.getState().waiting;
}

export function getAuth() {
    const flag  = !!localStorage.getItem('token');
    if(appStore.getState().token && !flag){
        dispatch(actionAuth(''));
        messageShow('error', locale.errorAuth);
    }
    return flag;
}

export function setWaiting(flag: boolean) {
    dispatch(actionWaiting(flag));
}

// ========================

function onMessage(state: AppStore, message: MessageEntity) {
    clearTimeout(timerMessage);
    timerMessage = setTimeout(messageReset, 5000);
    return {...state, message};
}

export function messageReset() {
    clearTimeout(timerMessage);
    dispatch(actionMessage(null, ''))
}

export function messageShow(type: MessageType, text: string) {
    dispatch(actionMessage(type, text))
}

// ========================
