import { Container } from "inversify";
import { IProfileService } from "./profile/profile.service.interface";
import TYPES from "../../core/container/container.types";
import { ProfileService } from "./profile/profile.service";

export function loadExternalContainer(container: Container) {
    container.bind<IProfileService>(TYPES.ProfileService).to(ProfileService);
}
