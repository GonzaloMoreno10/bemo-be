import { Injectable } from '@nestjs/common';
import { UpdateUserDTO, UserDTO, UserQueryDTO } from 'src/users/dtos/user.dto';
import { User } from 'src/users/entities/user.model';
import { IUser } from '../entities/users.entity';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class UsersSevice {
  constructor(@InjectModel(User) private userModel: typeof User) {}

  findAll(filters: UserQueryDTO): Promise<User[]> {
    return this.userModel.findAll<User>({ where: { ...filters } });
  }

  findById(id: number): Promise<IUser> {
    return this.userModel.findOne({ where: { id } });
  }

  create(user: UserDTO): Promise<User> {
    user['createdUser'] = 1;
    return this.userModel.create(user);
  }

  async updateUser(id: number, user: UpdateUserDTO): Promise<IUser> {
    const updated = await this.userModel.update(user, { where: { id } });
    if (updated[0] > 0) {
      return this.findById(id);
    }
  }

  findByEmail(mail: string): Promise<IUser> {
    return this.userModel.findOne({
      where: { mail, enabled: true },
      raw: true,
    });
  }
}
