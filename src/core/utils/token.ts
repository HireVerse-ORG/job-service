import {TokenService} from "@hireverse/service-common/dist/token/TokenService";
import {UserPayload} from "@hireverse/service-common/dist/token/user/userPayload";

export const tokenService = new TokenService<UserPayload>({secretKey:process.env.JWT_SECRET_KEY!});