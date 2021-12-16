import { Request } from 'express';
import { UserEntity } from '../../user/user.entity';

export interface RequestWithUserInterface extends Request {
	user: UserEntity;
}
