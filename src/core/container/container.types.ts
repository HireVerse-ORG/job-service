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
    
    // kafka
    KafkaProducer: Symbol('KafkaProducer'),
    KafkaConsumer: Symbol('KafkaConsumer'),
    EventController: Symbol('EventController'),
    EventService: Symbol('EventService'),
};
