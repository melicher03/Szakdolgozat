import { MessagesGateway } from './messages.gateway'

describe('MessagesGateway', () => {
  const messagesService = {
    create: jest.fn(),
  }

  let gateway: MessagesGateway

  beforeEach(() => {
    jest.clearAllMocks()
    gateway = new MessagesGateway(messagesService as any)
    gateway.server = {
      to: jest.fn().mockReturnValue({ emit: jest.fn() }),
    } as any
  })

  it('joins group room', () => {
    const client = { join: jest.fn() }
    gateway.handleJoinGroup({ familyGroupId: '4' }, client as any)
    expect(client.join).toHaveBeenCalledWith('4')
  })

  it('leaves group room', () => {
    const client = { leave: jest.fn() }
    gateway.handleLeaveGroup({ familyGroupId: '4' }, client as any)
    expect(client.leave).toHaveBeenCalledWith('4')
  })

  it('saves and emits sent message', async () => {
    const dto = { text: 'hello', senderId: 'u1', senderName: 'U', familyGroupId: 7 }
    const saved = { id: 10, ...dto }
    const emit = jest.fn()

    ;(gateway.server.to as jest.Mock).mockReturnValue({ emit })
    messagesService.create.mockResolvedValue(saved)

    await gateway.handleSendMessage(dto as any)

    expect(messagesService.create).toHaveBeenCalledWith(dto)
    expect(gateway.server.to).toHaveBeenCalledWith('7')
    expect(emit).toHaveBeenCalledWith('receive-message', saved)
  })
})
