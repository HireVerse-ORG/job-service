/**
 * InversifyJS need to use the type as identifiers at runtime.
 * We use symbols as identifiers but you can also use classes and or string literals.
 */
export default  {
    // skill
    SkillController: Symbol('SkillController'),
    SkillGrpcController: Symbol('SkillGrpcController'),
    SkillService: Symbol('SkillService'),
    SkillRepository: Symbol('SkillRepository'),
    // jobcategory
    JobCategoryController: Symbol('JobCategoryController'),
    JobCategoryGrpcController: Symbol('JobCategoryGrpcController'),
    JobCategoryService: Symbol('JobCategoryService'),
    JobCategoryRepository: Symbol('JobCategoryRepository'),
    // job
    JobController: Symbol('JobController'),
    JobGrpcController: Symbol('JobGrpcController'),
    JobService: Symbol('JobService'),
    JobRepository: Symbol('JobRepository'),

    // job application
    JobApplicationController: Symbol('JobApplicationController'),
    JobApplicationGrpcController: Symbol('JobApplicationGrpcController'),
    JobApplicationService: Symbol('JobApplicationService'),
    JobApplicationRepository: Symbol('JobApplicationRepository'),

    // interview
    InterviewController: Symbol('InterviewController'),
    InterviewJobs: Symbol('InterviewJobs'),
    InterviewGrpcController: Symbol('InterviewGrpcController'),
    InterviewService: Symbol('InterviewService'),
    InterviewRepository: Symbol('InterviewRepository'),
    
    //statitics
    StatisticsController: Symbol('StatisticsController'),

    // external
    ProfileService: Symbol('ProfileService'),
    PaymentService: Symbol('PaymentService'),
    
    // kafka
    KafkaProducer: Symbol('KafkaProducer'),
    KafkaConsumer: Symbol('KafkaConsumer'),
    EventController: Symbol('EventController'),
    EventService: Symbol('EventService'),
};
