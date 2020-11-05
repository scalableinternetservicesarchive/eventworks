import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { ChatMessage } from './ChatMessage'
import { Event } from './Event'
import { User } from './User'

@Entity()
export class EventTable extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string

  @Column('int')
  userCapacity: number

  @OneToMany(() => ChatMessage, msg => msg.event, { eager: true })
  chatMessages: ChatMessage[]

  @ManyToOne(() => User, user => user.tables, { nullable: false, eager: true })
  head: User

  @ManyToOne(() => Event, evt => evt.eventTables)
  event: Event
}