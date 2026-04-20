import { AssetsModule } from './assets/assets.module'
import { CalendarEventsModule } from './calendar-events/calendar-events.module'
import { CategoriesModule } from './categories/categories.module'
import { FamilyGroupsModule } from './family-groups/family-groups.module'
import { LinksModule } from './links/links.module'
import { MessagesModule } from './messages/messages.module'
import { UsersModule } from './users/users.module'

describe('Feature modules', () => {
  it('AssetsModule is defined', () => {
    expect(AssetsModule).toBeDefined()
  })

  it('CalendarEventsModule is defined', () => {
    expect(CalendarEventsModule).toBeDefined()
  })

  it('CategoriesModule is defined', () => {
    expect(CategoriesModule).toBeDefined()
  })

  it('FamilyGroupsModule is defined', () => {
    expect(FamilyGroupsModule).toBeDefined()
  })

  it('LinksModule is defined', () => {
    expect(LinksModule).toBeDefined()
  })

  it('MessagesModule is defined', () => {
    expect(MessagesModule).toBeDefined()
  })

  it('UsersModule is defined', () => {
    expect(UsersModule).toBeDefined()
  })
})
