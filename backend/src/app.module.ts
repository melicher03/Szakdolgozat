import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { CalendarEventsModule } from './calendar-events/calendar-events.module'
import { FamilyGroupsModule } from './family-groups/family-groups.module'
import { TasksModule } from './tasks/tasks.module'
import { MessagesModule } from './messages/messages.module'
import { AssetsModule } from './assets/assets.module'
import { LinksModule } from './links/links.module'

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
    TasksModule,
    FamilyGroupsModule,
    CalendarEventsModule,
    MessagesModule,
    AssetsModule,
    LinksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
