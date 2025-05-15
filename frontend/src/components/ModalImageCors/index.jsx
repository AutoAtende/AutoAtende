import React, {useState, useEffect} from "react";
import makeStyles from '@mui/styles/makeStyles';
import clsx from "clsx";

import ModalImage from "react-modal-image";
import api from "../../services/api";

const useStyles = makeStyles(theme => ({
    messageMedia: {
        objectFit: "cover",
        width: 250,
        height: 200,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
    },

    messageMediaDeleted: {
        filter: "grayscale(1)",
        opacity: 0.4
    }
}));

const ModalImageCors = ({imageUrl, isDeleted}) => {
    const classes = useStyles();
    const [fetching, setFetching] = useState(true);
    const [blobUrl, setBlobUrl] = useState("");

    useEffect(async () => {
        if (!imageUrl) return;

        api.get(imageUrl, {
            responseType: "blob",
        }).then(({data, headers}) => {
            const url = window.URL.createObjectURL(
                new Blob([data], {type: headers["content-type"]})
            );
            setBlobUrl(url);
            setFetching(false);
        })
            .catch(() => {
                setFetching(false);
            });

    }, [imageUrl]);

    return (
        <ModalImage
            className={[clsx(classes.messageMedia, {
                [classes.messageMediaDeleted]: isDeleted
            })]}
            loading="lazy"
            smallSrcSet={fetching ? imageUrl : blobUrl}
            medium={fetching ? imageUrl : blobUrl}
            large={fetching ? imageUrl : blobUrl}
            showRotate="true"
            alt="image"
        />
    );
};

export default ModalImageCors;
