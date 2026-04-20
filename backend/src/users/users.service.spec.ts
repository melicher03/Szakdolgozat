import { InternalServerErrorException } from '@nestjs/common'
import { createClient } from '@supabase/supabase-js'
import { UsersService } from './users.service'

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}))

describe('UsersService', () => {
  const configService = {
    get: jest.fn(),
  }

  const dataSource = {
    query: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('falls back to auth.users when supabase client is not configured', async () => {
    configService.get.mockImplementation((key: string) => {
      if (key === 'SUPABASE_URL') return undefined
      if (key === 'SUPABASE_SERVICE_ROLE_KEY') return undefined
      return undefined
    })

    dataSource.query.mockResolvedValue([
      { email: ' USER@MAIL.COM ' },
      { email: 'invalid' },
      { email: '' },
    ])

    const service = new UsersService(configService as any, dataSource as any)
    await expect(service.findAll()).resolves.toEqual([{ email: 'user@mail.com' }])
  })

  it('returns empty list when fallback query fails', async () => {
    configService.get.mockReturnValue(undefined)
    dataSource.query.mockRejectedValue(new Error('db down'))

    const service = new UsersService(configService as any, dataSource as any)
    await expect(service.findAll()).resolves.toEqual([])
  })

  it('throws InternalServerErrorException when supabase listUsers fails', async () => {
    const listUsers = jest.fn().mockResolvedValue({
      data: { users: [] },
      error: { message: 'boom' },
    })

    ;(createClient as jest.Mock).mockReturnValue({
      auth: {
        admin: { listUsers },
      },
    })

    configService.get.mockImplementation((key: string) => {
      if (key === 'SUPABASE_URL') return 'https://x.supabase.co'
      if (key === 'SUPABASE_SERVICE_ROLE_KEY') return 'secret'
      return undefined
    })

    const service = new UsersService(configService as any, dataSource as any)
    await expect(service.findAll()).rejects.toBeInstanceOf(InternalServerErrorException)
  })

  it('returns normalized users from supabase', async () => {
    const listUsers = jest.fn().mockResolvedValue({
      data: {
        users: [
          { email: ' FIRST@MAIL.COM ' },
          { email: 'second@mail.com' },
          { email: undefined },
        ],
      },
      error: null,
    })

    ;(createClient as jest.Mock).mockReturnValue({
      auth: {
        admin: { listUsers },
      },
    })

    configService.get.mockImplementation((key: string) => {
      if (key === 'SUPABASE_URL') return 'https://x.supabase.co'
      if (key === 'SUPABASE_SERVICE_ROLE_KEY') return 'secret'
      return undefined
    })

    const service = new UsersService(configService as any, dataSource as any)

    await expect(service.findAll()).resolves.toEqual([
      { email: 'first@mail.com' },
      { email: 'second@mail.com' },
    ])
  })
})
