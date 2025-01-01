import { IPaginationResponse } from "@hireverse/service-common/dist/repository";

export interface CreateSkillDTO {
    name: string;
    isActive: boolean;
}

export interface UpdateSkillDTO {
    id: string;
    name?: string;
    isActive?: boolean;
}

export interface SkillDTO {
    id: string;
    name: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface SkillListDTO extends IPaginationResponse<SkillDTO> {
}





