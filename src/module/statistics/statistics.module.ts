import { Container } from "inversify";
import TYPES from "../../core/container/container.types";
import { StatisticsController } from "./statistics.controller";

const loadStatisticsContainer = (container: Container) => {
    container.bind<StatisticsController>(TYPES.StatisticsController).to(StatisticsController);
}

export {loadStatisticsContainer}