// models/QueueTag.ts

import {
    Table,
    Column,
    Model,
    ForeignKey,
    BelongsTo,
    PrimaryKey,
    AutoIncrement
  } from "sequelize-typescript";
  import Queue from "./Queue";
  import Tag from "./Tag";
  
  @Table
  class QueueTag extends Model<QueueTag> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;
  
    @ForeignKey(() => Queue)
    @Column
    queueId: number;
  
    @ForeignKey(() => Tag)
    @Column
    tagId: number;
  
    @BelongsTo(() => Queue)
    queue: Queue;
  
    @BelongsTo(() => Tag)
    tag: Tag;
  }
  
  export default QueueTag;