import {
  AgentRole,
  NATS_CHANNEL,
  ChannelServiceClient,
  ChannelsMessageResponse,
  GRPC_CHANNEL,
  JwtPayloadDto,
  ParseMongoIdPipe,
  Roles,
  ChannelSubjects,
} from '@app/common';
import {
  Controller,
  Get,
  Inject,
  OnModuleInit,
  Param,
  Req,
  UseGuards,
  Post,
  Body,
  Patch,
} from '@nestjs/common';
import { ClientGrpc, ClientProxy } from '@nestjs/microservices';
import { Request } from 'express';
import { Observable } from 'rxjs/internal/Observable';
import { CreateChannelDto } from '../dto/channel/create-channel.dto';
import { lastValueFrom } from 'rxjs';
import { UpdateChannelAgentsDto } from '../dto/channel/update-channel-agents.dto';
import { AccessTokenGuard } from '../guards/access-token.guard';

@Controller('channel')
export class ChannelHttpController implements OnModuleInit {
  queryService: ChannelServiceClient;

  constructor(
    @Inject(GRPC_CHANNEL) private readonly grpcClient: ClientGrpc,
    @Inject(NATS_CHANNEL) private readonly commandService: ClientProxy,
  ) {}

  onModuleInit() {
    this.queryService =
      this.grpcClient.getService<ChannelServiceClient>('ChannelService');
  }

  @UseGuards(AccessTokenGuard)
  @Roles(AgentRole.OWNER, AgentRole.ADMIN)
  @Get()
  getAccountChannels(@Req() req: Request): Observable<ChannelsMessageResponse> {
    const jwtPayload = req['user'] as JwtPayloadDto;

    return this.queryService.getAccountChannels({
      accountId: jwtPayload.account,
    });
  }

  @UseGuards(AccessTokenGuard)
  @Roles(AgentRole.OWNER, AgentRole.ADMIN)
  @Get(':id')
  async getChannelById(@Req() req: Request, @Param('id') channelId: string) {
    const jwtPayload = req['user'] as JwtPayloadDto;

    return this.queryService.getChannelById({
      accountId: jwtPayload.account,
      channelId: channelId,
    });
  }

  @UseGuards(AccessTokenGuard)
  @Roles(AgentRole.OWNER)
  @Post()
  async create(
    @Req() req: Request,
    @Body() dto: CreateChannelDto,
  ): Promise<void> {
    const jwtPaylaod = req['user'] as JwtPayloadDto;
    await lastValueFrom(
      this.commandService.emit<void>(ChannelSubjects.CREATE_CHANNEL, {
        accountId: jwtPaylaod.account,
        ...dto,
      }),
    );
  }

  @UseGuards(AccessTokenGuard)
  @Roles(AgentRole.OWNER, AgentRole.ADMIN)
  @Patch(':id/agents')
  async updateChannelAgents(
    @Req() req: Request,
    @Param('id', ParseMongoIdPipe) channelId: string,
    @Body() dto: UpdateChannelAgentsDto,
  ) {
    const jwtPaylaod = req['user'] as JwtPayloadDto;
    await lastValueFrom(
      this.commandService.emit<void>(ChannelSubjects.UPDATE_CHANNEL_AGENTS, {
        requesterAccountId: jwtPaylaod.account,
        channelId,
        ...dto,
      }),
    );
  }
}
