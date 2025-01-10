/**
 * InversifyJS need to use the type as identifiers at runtime.
 * We use symbols as identifiers but you can also use classes and or string literals.
 */
export default  {
    SkillController: Symbol('SkillController'),
    SkillGrpcController: Symbol('SkillGrpcController'),
    SkillService: Symbol('SkillService'),
    SkillRepository: Symbol('SkillRepository'),
};
