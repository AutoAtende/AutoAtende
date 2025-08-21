import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  DataType,
  Model,
  PrimaryKey,
  AutoIncrement,
  BelongsTo,
  ForeignKey
} from "sequelize-typescript";
import User from "./User";
import Chat from "./Chat";

@Table({ tableName: "ChatMessages" })
class ChatMessage extends Model<ChatMessage> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Chat)
  @Column
  chatId: number;

  @ForeignKey(() => User)
  @Column
  senderId: number;

  @Column({ defaultValue: "" })
  message: string;

  @Column({ defaultValue: "text" })
  messageType: string; // text, image, video, audio

  @Column({ defaultValue: "text" })
  type: string;

  @Column({ defaultValue: "" })
  mediaPath: string;

  @Column({ defaultValue: "" })
  mediaUrl: string;

  @Column({ defaultValue: "" })
  mediaType: string;

  @Column({ defaultValue: "" })
  mediaName: string;

  @Column({ defaultValue: false })
  read: boolean;

  @Column({ defaultValue: 0 })
  mediaDuration: number; // para áudios e vídeos

  @Column({ defaultValue: null })
  mediaSize: number;

  @Column({ defaultValue: null })
  url: string;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt: Date;

  @BelongsTo(() => Chat)
  chat: Chat;

  @BelongsTo(() => User)
  sender: User;
}

export default ChatMessage;