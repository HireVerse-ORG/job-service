import { Container } from "inversify";
import { IProfileService } from "./profile/profile.service.interface";
import TYPES from "../../core/container/container.types";
import { ProfileService } from "./profile/profile.service";
import { IPaymentService } from "./payment/payment.service.interface";
import { PaymentService } from "./payment/payment.service";

export function loadExternalContainer(container: Container) {
    container.bind<IProfileService>(TYPES.ProfileService).to(ProfileService);
    container.bind<IPaymentService>(TYPES.PaymentService).to(PaymentService);
}
