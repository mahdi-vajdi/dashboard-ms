import { IsArray, IsMongoId } from 'class-validator';

export class UpdateChannelAgentsDto {
  requesterAccountId: string;

  channelId: string;

  @IsArray()
  @IsMongoId({ each: true })
  agents: string[];
}
