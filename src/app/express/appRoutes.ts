import { Application } from "express";
import { errorHandler, notFoundHandler } from "./errorHandler";
import { skillRoutes } from "../../module/skills/skill.routes";
import { jobCategoryRoutes } from "../../module/category/category.routes";

export function registerRoutes(app:Application, prefix="/api/jobs") {
    app.get(`${prefix}/health`, (req, res) => {
        res.json("Job Server is healthy 🚀")
    })

    app.use(`${prefix}`, skillRoutes)
    app.use(`${prefix}`, jobCategoryRoutes)
    app.use(notFoundHandler);
    app.use(errorHandler);
}