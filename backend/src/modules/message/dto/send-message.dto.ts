import { IsString, IsNotEmpty, IsMongoId, MaxLength } from 'class-validator'

export class SendMessageDto {
  @IsMongoId()
  @IsNotEmpty()
  receiverId: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content: string
}
