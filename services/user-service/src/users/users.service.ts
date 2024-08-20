import {Injectable} from '@nestjs/common';
import {UserRepository} from './repsitories/user.repository';
import {User} from './entities/user.entity';
import {SignUpDto} from './dto/signup.dto';
import {RpcException} from "@nestjs/microservices";

@Injectable()
export class UserService {
    constructor(private readonly userRepository: UserRepository) {
    }

    async signUp(data: SignUpDto): Promise<User> {
        const { email, password, role } = data;
        const user = this.userRepository.create({ email, password, role });
        return this.userRepository.createEntity(user);

    }

    async getUsers(): Promise<User[]> {
        return this.userRepository.findAll();
    }

    async getUserById(id: string): Promise<User> {
        return this.userRepository.findById(id);
    }

    async updateUser(
        id: string,
        email: string,
        password: string,
        role: string,
    ): Promise<void> {
        await this.userRepository.updateEntity(id, {email, password, role});
    }

    async deleteUser(id: string): Promise<void> {
        await this.userRepository.deleteEntity(id);
    }

    async findUsersByQuery(query: any): Promise<User[]> {
        return this.userRepository.findByQuery(query);
    }
}
