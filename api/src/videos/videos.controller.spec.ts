import { Test, TestingModule } from "@nestjs/testing";
import { VideosController } from "./videos.controller";
import { VideoEventsService } from "./video-events.service";
import { StorageService } from "../storage/storage.service";
import { getQueueToken } from "@nestjs/bullmq";

describe("VideosController", () => {
  let controller: VideosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VideosController],
      providers: [
        {
          provide: getQueueToken("video-processing"),
          useValue: {
            add: jest.fn(),
          },
        },
        {
          provide: VideoEventsService,
          useValue: {
            getJobStream: jest.fn(),
          },
        },
        {
          provide: StorageService,
          useValue: {
            deleteMany: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<VideosController>(VideosController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
