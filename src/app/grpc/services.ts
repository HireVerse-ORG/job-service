import { loadProto } from '@hireverse/service-protos';
import { container } from '../../core/container';
import containerTypes from '../../core/container/container.types';
import { SkillGrpcController } from '../../module/skills/controllers/skill.grpc.controller';

const jonProto = loadProto('job/job.proto');

const skillGrpcController = container.get<SkillGrpcController>(containerTypes.SkillGrpcController)

export const jobSkillService = {
    name: "JobSkill Service",
    serviceDefinition: jonProto.job.SkillService.service,
    implementation: skillGrpcController.getProcedures(),
}