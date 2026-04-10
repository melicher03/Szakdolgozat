import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Repository } from 'typeorm'
import { FamilyGroup } from '../entities/family-group.entity'
import { Message } from '../entities/message.entity'
import { SharedAsset } from '../entities/shared-asset.entity'

type UserSuggestion = {
  id: string
  email: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

@Injectable()
export class UsersService {
  private readonly supabase: SupabaseClient | null

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(FamilyGroup)
    private readonly familyGroupsRepository: Repository<FamilyGroup>,
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
    @InjectRepository(SharedAsset)
    private readonly assetsRepository: Repository<SharedAsset>,
  ) {
    const supabaseUrl =
      this.configService.get<string>('SUPABASE_URL') ??
      this.configService.get<string>('VITE_SUPABASE_URL')
    const serviceRoleKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY')

    this.supabase =
      supabaseUrl && serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null
  }

  private filterAndFormatUsers(candidates: string[], query?: string): UserSuggestion[] {
    const normalizedQuery = query?.trim().toLowerCase() ?? ''

    return Array.from(new Set(candidates.map((value) => value.trim().toLowerCase())))
      .filter((value) => value.length > 0)
      .filter((value) => EMAIL_PATTERN.test(value))
      .filter((value) =>
        normalizedQuery.length > 0 ? value.includes(normalizedQuery) : true,
      )
      .map((email) => ({
        id: email,
        email,
      }))
      .sort((left, right) => left.email.localeCompare(right.email))
  }

  private async findFallbackUsers(query?: string): Promise<UserSuggestion[]> {
    const [familyGroups, messages, assets] = await Promise.all([
      this.familyGroupsRepository.find({ select: { members: true, ownerId: true } }),
      this.messagesRepository.find({ select: { senderId: true, senderName: true } }),
      this.assetsRepository.find({ select: { uploadedBy: true } }),
    ])

    const membersFromGroups = familyGroups.flatMap((group) => group.members ?? [])
    const owners = familyGroups.map((group) => group.ownerId)
    const senders = messages.flatMap((message) => [message.senderId, message.senderName])
    const uploaders = assets.map((asset) => asset.uploadedBy)

    return this.filterAndFormatUsers(
      [...membersFromGroups, ...owners, ...senders, ...uploaders],
      query,
    )
  }

  async findAll(query?: string): Promise<UserSuggestion[]> {
    if (!this.supabase) {
      return this.findFallbackUsers(query)
    }

    const { data, error } = await this.supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    })

    if (error) {
      if (error.status === 401 || error.status === 403) {
        return this.findFallbackUsers(query)
      }

      throw new InternalServerErrorException(`Failed to list users: ${error.message}`)
    }

    const fromSupabase = (data.users ?? [])
      .map((user) => ({
        id: user.id,
        email: user.email,
      }))
      .filter((user): user is UserSuggestion => Boolean(user.email))

    if (fromSupabase.length === 0) {
      return this.findFallbackUsers(query)
    }

    return this.filterAndFormatUsers(fromSupabase.map((user) => user.email), query)
  }
}