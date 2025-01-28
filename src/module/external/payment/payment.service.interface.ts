import { RPCServiceResponseDto } from "../dto/rpc.response.dto";

export interface IPaymentService {
    canAccessApplication: (userId: string, applicationId: string) => Promise<RPCServiceResponseDto>;
}