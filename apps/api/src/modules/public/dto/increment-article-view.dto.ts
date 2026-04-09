import { IsOptional, IsString, MinLength } from "class-validator";

export class IncrementArticleViewBodyDto {
  @IsOptional()
  @IsString()
  @MinLength(8)
  clientKey?: string;
}
