import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';
import { CreateRecipientDto } from './dto/create-recipient.dto.js';
import { UpdateRecipientDto } from './dto/update-recipient.dto.js';
import { RecipientsService } from './recipients.service.js';

@Controller('recipients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RecipientsController {
  constructor(private recipients: RecipientsService) {}

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('idCard') idCard?: string,
    @Query('phone') phone?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.recipients.findAll({
      search,
      idCard,
      phone,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recipients.findById(id);
  }

  @Post()
  create(@Body() dto: CreateRecipientDto) {
    return this.recipients.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRecipientDto) {
    return this.recipients.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.recipients.delete(id);
  }
}
