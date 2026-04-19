import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CalendarEventsModule } from './calendar-events/calendar-events.module'
import { FamilyGroupsModule } from './family-groups/family-groups.module'
import { MessagesModule } from './messages/messages.module'
import { AssetsModule } from './assets/assets.module'
import { CategoriesModule } from './categories/categories.module'
import { LinksModule } from './links/links.module'
import { UsersModule } from './users/users.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('SUPABASE_DB_URL'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        ssl: {
          rejectUnauthorized: false,
        },
      }),
    }),
    FamilyGroupsModule,
    CalendarEventsModule,
    MessagesModule,
    AssetsModule,
    CategoriesModule,
    LinksModule,
    UsersModule,
  ],
})
export class AppModule {}
