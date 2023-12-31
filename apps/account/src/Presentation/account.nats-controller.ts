import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateAccountDto } from '../Application/dto/create-account.dto';
import { CreateAccountCommand } from '../Application/commands/impl/create-account.command';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class AccountNatsController {
  constructor(private readonly commandBus: CommandBus) {}

  @EventPattern('createAccount')
  async createAccount(@Payload() { email }: CreateAccountDto): Promise<void> {
    await this.commandBus.execute<CreateAccountCommand, void>(
      new CreateAccountCommand(email),
    );
  }
}
