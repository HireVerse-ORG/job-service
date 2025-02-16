import { Application } from "express";
import { errorHandler, notFoundHandler } from "./errorHandler";
import { skillRoutes } from "../../module/skills/skill.routes";
import { jobCategoryRoutes } from "../../module/category/category.routes";
import { jobRoutes } from "../../module/job/job.routes";
import { jobApplicationRoutes } from "../../module/jobapplication/application.routes";
import { interviewRoutes } from "../../module/interview/interview.routes";
import { statisticsRoutes } from "../../module/statistics/statistics.routes";

export function registerRoutes(app:Application, prefix="/api/jobs") {
    app.get(`${prefix}/health`, (req, res) => {
        res.json("Job Server is healthy 🚀")
    })

    app.use(`${prefix}/interview`, interviewRoutes);
    app.use(`${prefix}/statistics`, statisticsRoutes);
    app.use(`${prefix}`, skillRoutes);
    app.use(`${prefix}`, jobCategoryRoutes);
    app.use(`${prefix}`, jobApplicationRoutes);
    app.use(`${prefix}`, jobRoutes);
    
    app.use(notFoundHandler);
    app.use(errorHandler);
}