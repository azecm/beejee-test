import {OrderedBy, OrderedDir, RequestGetMessage, RequestResult} from "../types";
import {messageShow, setWaiting} from "./store";
import {locale} from "./locale";

const mainUrl = 'https://uxcandy.com/~shapoval/test-task-backend/v2/';
const developer = 'Ivan-2020-12-08'; // Name


interface GetDataParams {
    sort_field: OrderedBy
    sort_direction: OrderedDir
    page: number
}

export async function getData(paramsSrc: GetDataParams): Promise<RequestGetMessage | null> {
    const params = new URLSearchParams(Object.assign({developer}, paramsSrc as any));
    return onRequest<RequestGetMessage>(mainUrl + '?' + params.toString(), {method: 'get'});
}

export async function postData<T>(command: 'create' | 'login' |'edit', initData: RequestInit): Promise<T | null> {
    const params = new URLSearchParams({developer});
    return onRequest<T>(mainUrl + command + '?' + params.toString(), {...initData, method: 'post'});
}

async function onRequest<T>(url: string, initData: RequestInit): Promise<T | null> {
    setWaiting(true);
    try {
        return onSuccess(await fetch(url, initData).then(r => r.json()));
    } catch (e) {
        setWaiting(false);
        onNetworkError();
        return null;
    }
}

function onSuccess<T>(data: RequestResult<T | string>) {
    setWaiting(false);
    if (data.status === 'ok') {
        return (data.message||true) as T;
    } else {
        onResultError(data.message);
        return null;
    }
}

function onResultError(message: any) {
    messageShow('error', `+${locale.resultError}: ${JSON.stringify(message)}`);
}

function onNetworkError() {
    messageShow('error', locale.networkError);
}

export async function connectAddTask(props: { username: string, email: string, text: string }) {
    const form = new FormData();
    for (const [k, v] of Object.entries(props)) {
        form.append(k, v);
    }
    return postData<ResultAdd>('create', {body: form});
}

interface ResultAdd {
    id: number
    username: string
    email: string
    text: string
    status: number
}


export async function connectLogin(username: string, password: string) {
    const form = new FormData();
    form.append('username', username);
    form.append('password', password);
    return postData<{ token: string }>('login', {body: form});
}

export async function connectEdit(id: number, props:{token: string, text?: string, status?: number}) {
    const form = new FormData();
    for (const [k, v] of Object.entries(props)) {
        if(v!==void(0)) form.append(k, v.toString());
    }
    return postData<boolean>(`edit/${id}` as 'edit', {body: form});
}
