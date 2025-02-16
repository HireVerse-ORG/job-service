import { IPaginationResponse, MongoBaseRepository } from "@hireverse/service-common/dist/repository";
import { injectable } from "inversify";
import Job, { IJob, JobStatus } from "./job.modal";
import { IJobRepository } from "./interface/job.repository.interface";
import { FilterQuery, PipelineStage, QueryOptions, RootFilterQuery, Types } from "mongoose";
import { ISkill } from "../skills/skill.modal";
import { IJobCategory } from "../category/category.modal";
import { InternalError } from "@hireverse/service-common/dist/app.errors";
import { JobSearchDTO } from "./dto/job.dto";

@injectable()
export class JobRepository extends MongoBaseRepository<IJob> implements IJobRepository {
    constructor() {
        super(Job)
    }

    async countJobs(filter?: RootFilterQuery<IJob>): Promise<number> {
        try {
            return await this.repository.countDocuments(filter);
        } catch (error) {
            throw new InternalError("Failed to perform count operation");
        }
    }

    async getJobPostTrend(companyId: string, year: number): Promise<Array<{ month: string; count: number }>> {
        try {
            const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
            const endDate = new Date(`${year + 1}-01-01T00:00:00.000Z`);

            const pipeline:PipelineStage[] = [
                {
                    $match: {
                        userId: companyId,
                        createdAt: { $gte: startDate, $lt: endDate },
                    },
                },
                {
                    $group: {
                        _id: { month: { $month: "$createdAt" } },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { "_id.month": 1 } },
                {
                    $project: {
                        _id: 0,
                        month: {
                            $arrayElemAt: [
                                ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                                { $subtract: ["$_id.month", 1] },
                            ],
                        },
                        count: 1,
                    },
                },
            ];

            const trend = await this.repository.aggregate(pipeline);

            const allMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const completeTrend = allMonths.map(month => {
                const data = trend.find((entry: { month: string; count: number }) => entry.month === month);
                return { month, count: data ? data.count : 0 };
            });

            return completeTrend;
        } catch (error) {
            throw new InternalError("Failed to get job post trend");
        }
    }

    async populatedFind(filter: FilterQuery<IJob>,
        skillFilter: FilterQuery<ISkill>,
        categoryFilter: FilterQuery<IJobCategory>,
        options?: QueryOptions<IJob>
    ): Promise<IJob[]> {
        try {
            const jobs = await this.repository
                .find(
                    {
                        ...filter,
                    },
                    null,
                    options
                )
                .populate({ path: "skills", match: skillFilter })
                .populate({ path: "categories", match: categoryFilter });

            return jobs;
        } catch (error) {
            throw new InternalError("Failed to fetch job list");
        }
    }

    async populatedFindOne(filter: FilterQuery<IJob>,
        skillFilter: FilterQuery<ISkill> = {},
        categoryFilter: FilterQuery<IJobCategory> = {},
        options?: QueryOptions<IJob>
    ): Promise<IJob | null> {
        try {
            const jobs = await this.repository
                .findOne(
                    {
                        ...filter,
                    },
                    null,
                    options
                )
                .populate({ path: "skills", match: skillFilter })
                .populate({ path: "categories", match: categoryFilter });

            return jobs;
        } catch (error) {
            throw new InternalError("Failed to fetch job list");
        }
    }

    async populatedPaginate(
        page: number,
        limit: number,
        filter: FilterQuery<IJob> = {},
        skillFilter: FilterQuery<ISkill> = {},
        categoryFilter: FilterQuery<IJobCategory> = {},
        options?: QueryOptions<IJob>
    ): Promise<IPaginationResponse<IJob>> {
        try {
            const skip = (page - 1) * limit;

            const query = this.repository.find(filter, null, options)
                .populate({
                    path: "skills",
                    match: skillFilter,
                })
                .populate({
                    path: "categories",
                    match: categoryFilter,
                })
                .skip(skip)
                .limit(limit);

            const [jobs, count] = await Promise.all([
                query.exec(),
                this.repository.countDocuments(filter),
            ]);

            return {
                currentPage: page,
                data: jobs,
                limit,
                total: count,
                totalPages: Math.ceil(count / limit),
                hasNextPage: page < Math.ceil(count / limit),
                hasPreviousPage: page > 1,
            };
        } catch (error) {
            throw new InternalError("Failed to fetch job list");
        }
    }

    async getCategoriesForKeyword(keyword: string): Promise<string[]> {
        const pipeline: PipelineStage[] = [
            {
                $match: {
                    $or: [
                        { title: { $regex: keyword, $options: "i" } },
                        { description: { $regex: keyword, $options: "i" } },
                    ],
                    status: JobStatus.LIVE,
                },
            },
            {
                $lookup: {
                    from: "jobcategories",
                    localField: "categories",
                    foreignField: "_id",
                    as: "categoriesInfo",
                },
            },
            {
                $unwind: "$categoriesInfo",
            },
            {
                $group: {
                    _id: "$categoriesInfo.name",
                },
            },
            {
                $project: {
                    _id: 0,
                    name: "$_id",
                },
            },
        ];

        try {
            const result = await this.repository.aggregate(pipeline).exec();
            return result.map((category) => category.name);
        } catch (error) {
            throw new InternalError("Failed to fetch job categories");
        }
    }

    async searchActiveJobs(searchFilter: JobSearchDTO): Promise<IPaginationResponse<IJob>> {
        const { keyword, categories, employmentTypes, salaryRange, companyIds, page, limit } = searchFilter;

        const pipeline: PipelineStage[] = this.getActiveJobSearchPipeline(keyword, categories, employmentTypes, salaryRange, companyIds, page, limit);
        const countPipeline: PipelineStage[] = this.getActiveJobSearchCountPipeline(keyword, categories, employmentTypes, salaryRange, companyIds);

        try {
            const jobs = await this.repository.aggregate(pipeline).exec();
            const countResult = await this.repository.aggregate(countPipeline).exec();
            const count = countResult[0]?.total || 0;

            return {
                currentPage: page,
                data: jobs,
                limit,
                total: count,
                totalPages: Math.ceil(count / limit),
                hasNextPage: page < Math.ceil(count / limit),
                hasPreviousPage: page > 1,
            };
        } catch (error) {
            throw new InternalError("Failed to fetch search results");
        }
    }

    private getActiveJobSearchPipeline(
        keyword: string | undefined,
        categories: string[] | undefined,
        employmentTypes: string[] | undefined,
        salaryRange: { min: number; max: number } | undefined,
        companyIds: string[] | undefined,
        page: number = 1,
        limit: number = 10
    ): PipelineStage[] {
        const pipeline: PipelineStage[] = [
            // Stage 1: Lookup categories
            {
                $lookup: {
                    from: "jobcategories",
                    localField: "categories",
                    foreignField: "_id",
                    as: "categoriesInfo",
                },
            },
            // Stage 2: Lookup skills
            {
                $lookup: {
                    from: "skills",
                    localField: "skills",
                    foreignField: "_id",
                    as: "skillsInfo",
                },
            },
            // Stage 3: Match jobs by title, category name, skill name, company IDs (if provided), and other filters
            ...this.getActiveJobPipeline(keyword, categories, employmentTypes, salaryRange, companyIds),
            // Stage 4: Sort results by creation date
            {
                $sort: {
                    createdAt: -1,
                },
            },
            // Stage 5: Skip and Limit for pagination
            {
                $skip: (page - 1) * limit,
            },
            {
                $limit: limit,
            },
            // Stage 6: Project only the fields needed in the output
            {
                $project: {
                    id: "$_id",
                    title: 1,
                    employmentTypes: 1,
                    salaryRange: 1,
                    categories: {
                        $map: {
                            input: "$categoriesInfo",
                            as: "category",
                            in: { id: "$$category._id", name: "$$category.name" },
                        },
                    },
                    skills: {
                        $map: {
                            input: "$skillsInfo",
                            as: "skill",
                            in: { id: "$$skill._id", name: "$$skill.name" },
                        },
                    },
                    status: 1,
                    description: 1,
                    responsibilities: 1,
                    whoYouAre: 1,
                    niceToHaves: 1,
                    companyProfileId: 1,
                    userId: 1,
                    isClosed: 1,
                    failedReson: 1,
                    createdAt: 1,
                    updatedAt: 1,
                },
            },
        ];

        return pipeline;
    }


    private getActiveJobSearchCountPipeline(
        keyword: string | undefined,
        categories: string[] | undefined,
        employmentTypes: string[] | undefined,
        salaryRange: { min: number; max: number } | undefined,
        companyIds: string[] | undefined
    ): PipelineStage[] {
        const pipeline: PipelineStage[] = [
            ...this.getActiveJobPipeline(keyword, categories, employmentTypes, salaryRange, companyIds),
            {
                $count: "total",
            },
        ];

        return pipeline;
    }

    private getActiveJobPipeline(
        keyword: string | undefined,
        categories: string[] | undefined,
        employmentTypes: string[] | undefined,
        salaryRange: { min: number; max: number } | undefined,
        companyIds: string[] | undefined
    ): PipelineStage[] {
        return [
            // Stage 1: Lookup categories
            {
                $lookup: {
                    from: "jobcategories",
                    localField: "categories",
                    foreignField: "_id",
                    as: "categoriesInfo",
                },
            },
            // Stage 2: Lookup skills
            {
                $lookup: {
                    from: "skills",
                    localField: "skills",
                    foreignField: "_id",
                    as: "skillsInfo",
                },
            },
            // Stage 3: Match jobs by title, category IDs, skill name, and company IDs (if provided)
            {
                $match: {
                    $and: [
                        { status: JobStatus.LIVE },
                        ...(companyIds && companyIds.length > 0 ? [{ companyProfileId: { $in: companyIds } }] : []),
                        {
                            $or: [
                                { title: { $regex: keyword, $options: "i" } },
                                { "categoriesInfo.name": { $regex: keyword, $options: "i" } },
                                { "skillsInfo.name": { $regex: keyword, $options: "i" } },
                            ]
                        },
                        ...(categories && categories.length > 0
                            ? [
                                {
                                    "categoriesInfo.name": {
                                        $in: categories,
                                    },
                                },
                            ]
                            : []),
                        ...(employmentTypes && employmentTypes.length > 0
                            ? [{ employmentTypes: { $in: employmentTypes } }]
                            : []),
                        ...(salaryRange
                            ? [
                                {
                                    $expr: {
                                        $and: [
                                            { $lte: [{ $arrayElemAt: ["$salaryRange", 0] }, salaryRange.max] },
                                            { $gte: [{ $arrayElemAt: ["$salaryRange", 1] }, salaryRange.min] },
                                        ],
                                    },
                                },
                            ]
                            : []),
                    ]
                }
            },
        ];
    }

}