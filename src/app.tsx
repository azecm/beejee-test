import {Message} from "./components/message";
import {TotalCount} from "./components/total";
import {Table} from "./components/table";
import {useEffect} from "react";
import {onAppInit} from "./utils/init";
import {Append} from "./components/append";
import {Auth} from "./components/auth";


export function App() {
    useEffect(() => {
        onAppInit();
    }, []);
    return <div>
        <Message/>
        <Table/>
        <TotalCount/>
        <Append/>
        <Auth/>
    </div>;
}
