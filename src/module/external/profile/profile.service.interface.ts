import { RPCServiceResponseDto } from "../dto/rpc.response.dto";

export interface IProfileService {
    getCompanyProfilesByLocation: (location: {city: string, country: string}, place?: string) => Promise<RPCServiceResponseDto>;
}