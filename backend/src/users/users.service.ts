import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { DataSource } from 'typeorm'

type UserSuggestion = {
  email: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

@Injectable()
export class UsersService {
  private readonly supabase: SupabaseClient | null

  constructor(
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource
  ) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL')
    const serviceRoleKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY')

    this.supabase =
      supabaseUrl && serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null
  }

  private async findUsersFromAuthSchema(): Promise<UserSuggestion[]> {
    const users = await this.dataSource.query(
      `
        select email
        from auth.users
      `,
    )

    return this.filterAndFormatUsers(users.map((user: { email: string }) => user.email ?? ''))
  }

  private filterAndFormatUsers(candidates: string[]): UserSuggestion[] {
    return Array.from(new Set(candidates.map((value) => value.trim().toLowerCase())))
      .filter((value) => value.length > 0)
      .filter((value) => EMAIL_PATTERN.test(value))
      .map((email) => ({
        email,
      }))
      .sort((left, right) => left.email.localeCompare(right.email))
  }

  async findAll(): Promise<UserSuggestion[]> {
    if (!this.supabase) {
      try {
        const fromAuthSchema = await this.findUsersFromAuthSchema()
        if (fromAuthSchema.length > 0) {
          return fromAuthSchema
        }
      } catch {}
      return []
    }

    const { data, error } = await this.supabase.auth.admin.listUsers()

    if (error) {
      throw new InternalServerErrorException(`Failed to list users: ${error.message}`)
    }

    const fromSupabase = (data.users ?? [])
      .map((user) => ({
        email: user.email,
      }))
      .filter((user): user is UserSuggestion => Boolean(user.email))

    if (fromSupabase.length === 0) {
      return []
    }

    return this.filterAndFormatUsers(fromSupabase.map((user) => user.email))
  }
}