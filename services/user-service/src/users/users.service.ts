import { Injectable, BadRequestException } from '@nestjs/common';
import { UserRepository } from './repsitories/user.repository';
import { User } from './entities/user.entity';
import { SignUpDto } from './dto/signup.dto';
import { JwtService } from '@nestjs/jwt';
import { constants } from '../constants';
import changeConstantValue from '../helpers/replaceConstantValue';
import { jwtPayload, signupReturn } from './interfaces/auth';
import { ConfigService } from '@nestjs/config';
import hash from '../helpers/hash';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signUp(data: SignUpDto): Promise<signupReturn> {
    const {
      services: { userExistsByEmail },
    } = constants;
    const { email, password, role } = data;
    const existsUser = await this.userRepository.findByQuery({ email });

    if (!!existsUser.length) {
      throw new BadRequestException(
        changeConstantValue(userExistsByEmail, { email }),
      );
    }

    const hashedPassword = await hash(password);

    const user = await this.userRepository.createEntity({
      email,
      password: hashedPassword,
      role,
    });

    console.log('ttt');
    const accessToken = this.generateAccessToken({
      userId: user.id,
      role,
    });
    const refreshToken = this.generateRefreshToken({
      userId: user.id,
      role,
    });

    await this.userRepository.updateEntity(user.id, { refreshToken });

    delete user.password;
    return {
      accessToken,
      refreshToken,
      user,
    };
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
    await this.userRepository.updateEntity(id, { email, password, role });
  }

  async deleteUser(id: string): Promise<void> {
    await this.userRepository.deleteEntity(id);
  }

  generateAccessToken(payload: jwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('accessTokenSecret'),
      expiresIn: this.configService.get<string>('accessTokenExpiresIn'),
    });
  }

  generateRefreshToken(payload: jwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('refreshTokenSecret'),
      expiresIn: this.configService.get<string>('refreshTokenExpiresIn'),
    });
  }
}
