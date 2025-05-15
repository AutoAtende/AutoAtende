import express from "express";
import isAuth from "../middleware/isAuth";
import isSuper from "../middleware/isSuper";
import SuperUtilsController from "../controllers/SuperUtilsController";

const superUtils = express.Router();

superUtils.get('/api/backup', isAuth, isSuper, SuperUtilsController.backup);

export default superUtils;