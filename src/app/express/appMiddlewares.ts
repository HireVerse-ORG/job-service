import express, { Application} from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { tokenService } from '../../core/utils/token';

export function registerMiddlewares(app: Application) {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(morgan("dev"));
    app.use(cors());
    app.use(tokenService.attachTokenMiddleware());
}