import { injectable, inject } from "inversify";
import TYPES from "../core/container/container.types";
import { kafka } from "@hireverse/kafka-communication"; 

@injectable()
export class EventService {
  @inject(TYPES.KafkaProducer) private jobProducer!: kafka.KafkaProducer; 

}
