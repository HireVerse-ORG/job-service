import { RPCServiceResponseDto } from "../dto/rpc.response.dto";

export interface IProfileService {
    getCompanyProfilesByLocation: (location: {city: string, country: string}, place?: string) => Promise<RPCServiceResponseDto>;
    getCompanyProfilesByidList: (ids: string[]) => Promise<RPCServiceResponseDto>;
    getSeekerProfilesByUserId: (userId: string) => Promise<RPCServiceResponseDto>;
}