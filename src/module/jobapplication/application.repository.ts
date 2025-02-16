import { MongoBaseRepository } from "@hireverse/service-common/dist/repository";
import { injectable } from "inversify";
import JobApplication, { IJobApplication, JobApplicationStatus } from "./application.modal";
import { IJobApplicationRepository } from "./interface/application.repository.interface";
import { PipelineStage, RootFilterQuery, UpdateQuery } from "mongoose";
import { InternalError } from "@hireverse/service-common/dist/app.errors";

@injectable()
export class JobApplicationRepository extends MongoBaseRepository<IJobApplication> implements IJobApplicationRepository {
    constructor() {
        super(JobApplication)
    }

    async checkIfApplied(userId: string, jobId: string) {
        const application = await this.repository.findOne({ userId, jobId });
        return !!application;
    }

    async updateMany(filter?: RootFilterQuery<IJobApplication>, updateQuery?: UpdateQuery<IJobApplication>): Promise<boolean> {
        try {
            const updated = await this.repository.updateMany(filter, updateQuery)
            return updated.acknowledged
        } catch (error) {
            throw new InternalError("Failed to perofrm update many operation")
        }
    }

    async countJobApplications(filter?: RootFilterQuery<IJobApplication>): Promise<number> {
        try {
            return await this.repository.countDocuments(filter);
        } catch (error) {
            throw new InternalError("Failed to count job applications");
        }
    }

    async getApplicationTrend(companyId: string, year: number): Promise<Array<{ month: string; count: number }>> {
        try {
            const startDate = new Date(`${year}-01-01T00:00:00Z`);
            const endDate = new Date(`${year + 1}-01-01T00:00:00Z`);

            const pipeline: PipelineStage[] = [
                {
                    $match: {
                        companyProfileId: companyId,
                        createdAt: { $gte: startDate, $lt: endDate }
                    }
                },
                {
                    $group: {
                        _id: { month: { $month: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { "_id.month": 1 } },
                {
                    $project: {
                        _id: 0,
                        month: {
                            $let: {
                                vars: {
                                    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                                },
                                in: {
                                    $arrayElemAt: ["$$months", { $subtract: ["$_id.month", 1] }]
                                }
                            }
                        },
                        count: 1
                    }
                }
            ];

            const trend = await this.repository.aggregate(pipeline);

            const allMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const completeTrend = allMonths.map(month => {
                const data = trend.find((entry: any) => entry.month === month);
                return { month, count: data ? data.count : 0 };
            });

            return completeTrend;
        } catch (error) {
            throw new InternalError("Failed to get application trend");
        }
    }

    async getMyApplicationTrend(userId: string, year: number): Promise<Array<{ month: string; count: number }>> {
        try {
            const startDate = new Date(`${year}-01-01T00:00:00Z`);
            const endDate = new Date(`${year + 1}-01-01T00:00:00Z`);

            const pipeline: PipelineStage[] = [
                {
                    $match: {
                        userId,
                        createdAt: { $gte: startDate, $lt: endDate }
                    }
                },
                {
                    $group: {
                        _id: { month: { $month: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { "_id.month": 1 } },
                {
                    $project: {
                        _id: 0,
                        month: {
                            $let: {
                                vars: {
                                    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                                },
                                in: {
                                    $arrayElemAt: ["$$months", { $subtract: ["$_id.month", 1] }]
                                }
                            }
                        },
                        count: 1
                    }
                }
            ];

            const trend = await this.repository.aggregate(pipeline);

            const allMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const completeTrend = allMonths.map(month => {
                const data = trend.find((entry: any) => entry.month === month);
                return { month, count: data ? data.count : 0 };
            });

            return completeTrend;
        } catch (error) {
            throw new InternalError("Failed to get application trend");
        }
    }

    async getApplicationStatusChartData(userId: string): Promise<Array<{ status: string; count: number }>> {
        const excludedStatuses = [
            JobApplicationStatus.PENDING,
            JobApplicationStatus.WITHDRAWN,
            JobApplicationStatus.DECLINED,
            JobApplicationStatus.FAILED,
        ];

        const pipeline:PipelineStage[] = [
            {
                $match: {
                    userId,
                    status: { $nin: excludedStatuses },
                },
            },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    status: "$_id",
                    count: 1,
                },
            },
        ];

        const result = await this.repository.aggregate(pipeline);

        const order = [
            JobApplicationStatus.APPLIED,
            JobApplicationStatus.IN_REVIEW,
            JobApplicationStatus.SHORTLISTED,
            JobApplicationStatus.INTERVIEW,
            JobApplicationStatus.OFFERED,
            JobApplicationStatus.HIRED,
        ];

        result.sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status));

        return result;
    }

}