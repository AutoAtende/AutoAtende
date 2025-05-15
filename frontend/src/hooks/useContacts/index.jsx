import {useState, useEffect, useContext} from "react";
import { toast } from "../../helpers/toast";

import api from "../../services/api";
import { GlobalContext } from "../../context/GlobalContext";

const useContacts = ({searchParam, pageNumber, date, dateStart, dateEnd, typeContact}) => {
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(false);
    const [contacts, setContacts] = useState([]);
    const [count, setCount] = useState(0);
    const { makeRequestUpdateVCard } = useContext(GlobalContext);

    useEffect(async () => {
        setLoading(true);
        try {
            const {data} = await api.get("/contacts", {
                params: {
                    searchParam,
                    pageNumber,
                    date,
                    dateStart,
                    dateEnd,
                    typeContact: typeContact || undefined
                },
            });
            setContacts(data.contacts);

            setHasMore(data.hasMore);
            setCount(data.count);
            setLoading(false);
        } catch (err) {
            setLoading(false);
            toast.error(err);
        }
    }, [searchParam, pageNumber, date, dateStart, dateEnd, makeRequestUpdateVCard]);

    return {contacts, loading, hasMore, count};
};

export default useContacts;
