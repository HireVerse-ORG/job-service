import { injectable } from "inversify";
import { IPaymentService } from "./payment.service.interface";
import { RPCServiceResponseDto } from "../dto/rpc.response.dto";
import { companyPaymentClient } from "../../../core/rpc/clients";
import { mapGrpcErrorToHttpStatus } from "@hireverse/service-common/dist/utils";

@injectable()
export class PaymentService implements IPaymentService {

    async canAccessApplication(userId: string, applicationId: string): Promise<RPCServiceResponseDto> {
        return new Promise((resolve, reject) => {
            companyPaymentClient.CanAccessApplication({ userId, applicationId }, (error: any | null, response: any) => {
                if (error) {
                    const status = mapGrpcErrorToHttpStatus(error);
                    const message = error.details;
                    return reject({ status, message, response });
                }

                return resolve({ status: 200, message: "Payment access fetched", response });
            })
        })
    }
}