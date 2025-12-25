import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "./ApiError";

export abstract class BaseHandler {
  async run(req: NextRequest): Promise<NextResponse> {
    try {
      return await this.handle(req);
    } catch (error) {
      return this.fail(error);
    }
  }

  protected abstract handle(req: NextRequest): Promise<NextResponse>;

  protected ok(data: unknown, status = 200) {
    return NextResponse.json({ success: true, data }, { status });
  }

  protected fail(error: unknown) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { success: false, message: error.message, details: error.details },
        { status: error.statusCode }
      );
    }

    console.error("Unexpected error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
