import {CompanyProfileClient, SeekerProfileClient} from '@hireverse/service-protos/dist/clients/profile-client';
import {CompanyPaymentClient} from '@hireverse/service-protos/dist/clients/payment-client';

export const companyProfileClient = CompanyProfileClient(process.env.PROFILE_SERVICE_URL!);
export const seekerProfileClient = SeekerProfileClient(process.env.PROFILE_SERVICE_URL!);
export const companyPaymentClient = CompanyPaymentClient(process.env.PAYMENT_SERVICE_URL!);