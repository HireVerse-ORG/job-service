import {CompanyProfileClient} from '@hireverse/service-protos/dist/clients/profile-client';

export const companyProfileClient = CompanyProfileClient(process.env.PROFILE_SERVICE_URL!);