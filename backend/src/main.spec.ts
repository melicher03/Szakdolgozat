import { NestFactory } from '@nestjs/core'

jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn(),
  },
}))

describe('main bootstrap', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('creates app and applies global setup', async () => {
    const app = {
      enableCors: jest.fn(),
      useGlobalPipes: jest.fn(),
      listen: jest.fn().mockResolvedValue(undefined),
    }

    ;(NestFactory.create as jest.Mock).mockResolvedValue(app)
    process.env.PORT = '4321'

    require('./main')
    await Promise.resolve()

    expect(NestFactory.create).toHaveBeenCalledTimes(1)
    expect(app.enableCors).toHaveBeenCalledTimes(1)
    expect(app.useGlobalPipes).toHaveBeenCalledTimes(1)
    expect(app.listen).toHaveBeenCalledWith('4321')
  })
})
