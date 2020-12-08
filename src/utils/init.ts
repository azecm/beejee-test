import {initData, messageReset, messageShow} from "./store";
import {getData} from "./transport";

export async function onAppInit() {

    messageShow('info', 'Загрузка данных');
    const data = await getData({page: 1, sort_direction: 'asc', sort_field: 'id'});
    if (data) {
        initData(data.tasks, +data.total_task_count);
        messageReset();
    }
}
