import { injectable } from "inversify";
import { IProfileService } from "./profile.service.interface";
import { RPCServiceResponseDto } from "../dto/rpc.response.dto";
import { companyProfileClient } from "../../../core/rpc/clients";
import { mapGrpcErrorToHttpStatus } from "@hireverse/service-common/dist/utils";

@injectable()
export class ProfileService implements IProfileService {

    async getCompanyProfilesByLocation(location: {city: string, country: string}, place?: string): Promise<RPCServiceResponseDto> {
        
        return new Promise((resolve, reject) => {
            companyProfileClient.GetCompanyProfilesByLocation({ location, place }, (error: any | null, response: any) => {
                if (error) {
                    const status = mapGrpcErrorToHttpStatus(error);
                    const message = error.details;
                    return reject({ status, message, response });
                }

                return resolve({ status: 200, message: "Profiles Feteched", response });
            })
        })
    }

    async getCompanyProfilesByidList(ids: string[]): Promise<RPCServiceResponseDto> {
        return new Promise((resolve, reject) => {
            companyProfileClient.GetCompanyProfilesByIdList({ ids }, (error: any | null, response: any) => {
                if (error) {
                    const status = mapGrpcErrorToHttpStatus(error);
                    const message = error.details;
                    return reject({ status, message, response });
                }

                return resolve({ status: 200, message: "Profiles Feteched", response });
            })
        })
    }
}