import { describe, it, expect, vi, beforeEach } from "vitest";
import { FFmpegAudioExtractorService } from "../ffmpeg-audio-extractor.service";
import fluentFfmpeg from "fluent-ffmpeg";

vi.mock("fluent-ffmpeg");
vi.mock("child_process", () => ({
  exec: vi.fn((cmd, cb) => {
    if (cmd.includes("invalid")) {
      cb(new Error("Invalid file"), { stdout: "", stderr: "Invalid data found when processing input" });
    } else {
      cb(null, { stdout: "", stderr: "Duration: 00:02:30.00, start: 0.000000" });
    }
  }),
}));

describe("FFmpegAudioExtractorService", () => {
  let service: FFmpegAudioExtractorService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new FFmpegAudioExtractorService();
  });

  it("should attempt to extract audio with correct options when video is valid", async () => {
    const mockCommand = {
      seekInput: vi.fn().mockReturnThis(),
      duration: vi.fn().mockReturnThis(),
      noVideo: vi.fn().mockReturnThis(),
      audioCodec: vi.fn().mockReturnThis(),
      audioQuality: vi.fn().mockReturnThis(),
      output: vi.fn().mockReturnThis(),
      on: vi.fn().mockImplementation(function (this: any, event, callback) {
        if (event === "end") {
          setTimeout(() => callback(), 10);
        }
        return this;
      }),
      run: vi.fn(),
    };

    vi.mocked(fluentFfmpeg).mockReturnValue(mockCommand as unknown as fluentFfmpeg.FfmpegCommand);

    const result = await service.extract({
      videoPath: "/tmp/input.mp4",
      outputPath: "/tmp/output.mp3",
    });

    expect(result.success).toBe(true);
    expect(result.outputPath).toBe("/tmp/output.mp3");
    expect(mockCommand.noVideo).toHaveBeenCalled();
    expect(mockCommand.audioCodec).toHaveBeenCalledWith("libmp3lame");
    expect(mockCommand.audioQuality).toHaveBeenCalledWith(2);
    expect(mockCommand.output).toHaveBeenCalledWith("/tmp/output.mp3");
  });

  it("should fail gracefully when video file is corrupt or invalid", async () => {
    const mockCommand = {
      seekInput: vi.fn().mockReturnThis(),
      duration: vi.fn().mockReturnThis(),
      noVideo: vi.fn().mockReturnThis(),
      audioCodec: vi.fn().mockReturnThis(),
      audioQuality: vi.fn().mockReturnThis(),
      output: vi.fn().mockReturnThis(),
      on: vi.fn().mockImplementation(function (this: any, event, callback) {
        if (event === "error") {
          setTimeout(() => callback(new Error("FFmpeg error: corrupt input")), 10);
        }
        return this;
      }),
      run: vi.fn(),
    };

    vi.mocked(fluentFfmpeg).mockReturnValue(mockCommand as unknown as fluentFfmpeg.FfmpegCommand);

    const result = await service.extract({
      videoPath: "/tmp/invalid.mp4",
      outputPath: "/tmp/output.mp3",
    });

    expect(result.success).toBe(false);
    expect(result.outputPath).toBe("");
  });
});
